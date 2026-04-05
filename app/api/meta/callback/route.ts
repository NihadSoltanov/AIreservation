import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")
  const origin = req.nextUrl.origin

  if (error || !code) {
    return NextResponse.redirect(new URL("/dashboard/settings?wa_error=cancelled", origin))
  }

  const appId = process.env.NEXT_PUBLIC_META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    return NextResponse.redirect(new URL("/dashboard/settings?wa_error=config_missing", origin))
  }

  // 1. Exchange code for access token
  // redirect_uri must exactly match what was sent to Facebook
  const redirectUri = `${origin}/api/meta/callback`

  const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token")
  tokenUrl.searchParams.set("client_id", appId)
  tokenUrl.searchParams.set("client_secret", appSecret)
  tokenUrl.searchParams.set("redirect_uri", redirectUri)
  tokenUrl.searchParams.set("code", code)

  const tokenRes = await fetch(tokenUrl.toString())
  const tokenData = (await tokenRes.json()) as {
    access_token?: string
    error?: { message: string }
  }

  if (!tokenData.access_token) {
    console.error("[meta/callback] token exchange failed:", tokenData)
    return NextResponse.redirect(
      new URL(`/dashboard/settings?wa_error=token_failed`, origin)
    )
  }

  const accessToken = tokenData.access_token

  // 2. Discover phone number from this WABA
  let phoneNumberId = ""
  let displayPhone = ""

  try {
    // Approach 1: Direct user WABA access (works with whatsapp_business_management scope)
    const directWabaRes = await fetch(
      `https://graph.facebook.com/v18.0/me/whatsapp_business_accounts?access_token=${accessToken}`
    )
    const directWabaData = (await directWabaRes.json()) as { data?: Array<{ id: string }> }
    const directWabas = directWabaData.data ?? []
    console.log("[meta/callback] direct WABAs:", JSON.stringify(directWabaData))

    for (const waba of directWabas) {
      if (phoneNumberId) break
      const phoneRes = await fetch(
        `https://graph.facebook.com/v18.0/${waba.id}/phone_numbers?fields=id,display_phone_number&access_token=${accessToken}`
      )
      const phoneData = (await phoneRes.json()) as {
        data?: Array<{ id: string; display_phone_number: string }>
      }
      console.log("[meta/callback] phones for waba", waba.id, ":", JSON.stringify(phoneData))
      const phones = phoneData.data ?? []
      if (phones.length > 0) {
        phoneNumberId = phones[0].id
        displayPhone = phones[0].display_phone_number
      }
    }

    // Approach 2: via me/businesses if approach 1 returned nothing
    if (!phoneNumberId) {
      const bizRes = await fetch(
        `https://graph.facebook.com/v18.0/me/businesses?access_token=${accessToken}`
      )
      const bizData = (await bizRes.json()) as { data?: Array<{ id: string }> }
      console.log("[meta/callback] businesses:", JSON.stringify(bizData))
      const businesses = bizData.data ?? []

      for (const biz of businesses) {
        if (phoneNumberId) break
        const wabaRes = await fetch(
          `https://graph.facebook.com/v18.0/${biz.id}/whatsapp_business_accounts?access_token=${accessToken}`
        )
        const wabaData = (await wabaRes.json()) as { data?: Array<{ id: string }> }
        const wabas = wabaData.data ?? []

        for (const waba of wabas) {
          if (phoneNumberId) break
          const phoneRes = await fetch(
            `https://graph.facebook.com/v18.0/${waba.id}/phone_numbers?fields=id,display_phone_number&access_token=${accessToken}`
          )
          const phoneData = (await phoneRes.json()) as {
            data?: Array<{ id: string; display_phone_number: string }>
          }
          const phones = phoneData.data ?? []
          if (phones.length > 0) {
            phoneNumberId = phones[0].id
            displayPhone = phones[0].display_phone_number
          }
        }
      }
    }
  } catch (err) {
    console.error("[meta/callback] phone discovery error:", err)
    // Continue — we still save the token even if phone discovery fails
  }
  console.log("[meta/callback] final phoneNumberId:", phoneNumberId, "displayPhone:", displayPhone)

  // 3. Save token to the org
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", origin))
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.redirect(new URL("/dashboard/settings?wa_error=no_org", origin))
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("config")
    .eq("id", profile.organization_id)
    .single()

  const newConfig = { ...(org?.config ?? {}), meta_token: accessToken }

  await supabase
    .from("organizations")
    .update({
      config: newConfig,
      ...(phoneNumberId ? { whatsapp_phone_number_id: phoneNumberId } : {}),
      ...(displayPhone ? { whatsapp_number: displayPhone } : {}),
    })
    .eq("id", profile.organization_id)

  const successParams = new URLSearchParams({ wa_success: "1" })
  if (phoneNumberId) successParams.set("phone", phoneNumberId)
  if (displayPhone) successParams.set("display", encodeURIComponent(displayPhone))

  return NextResponse.redirect(new URL(`/dashboard/settings?${successParams}`, origin))
}
