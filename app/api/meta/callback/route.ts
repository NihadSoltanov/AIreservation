import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")
  const origin = req.nextUrl.origin

  // Log all params for debugging
  const allParams: Record<string, string> = {}
  req.nextUrl.searchParams.forEach((v, k) => { allParams[k] = v })
  console.log("[meta/callback] all params:", JSON.stringify(allParams))

  // Meta Embedded Signup sends waba_id + phone_number_id directly in callback URL
  const wabaIdParam = req.nextUrl.searchParams.get("waba_id")
  const phoneNumberIdParam = req.nextUrl.searchParams.get("phone_number_id")

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

  // First: use params Meta sends directly in Embedded Signup callback
  if (phoneNumberIdParam) {
    phoneNumberId = phoneNumberIdParam
    console.log("[meta/callback] phone_number_id from URL param:", phoneNumberId)
    // Fetch display number from Graph API
    try {
      const phoneRes = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}?fields=id,display_phone_number&access_token=${accessToken}`
      )
      const phoneData = (await phoneRes.json()) as { id?: string; display_phone_number?: string }
      console.log("[meta/callback] phone details:", JSON.stringify(phoneData))
      displayPhone = phoneData.display_phone_number ?? ""
    } catch (err) {
      console.error("[meta/callback] failed to fetch phone display:", err)
    }
  } else if (wabaIdParam) {
    // waba_id came but no phone_number_id — query phone numbers for this WABA
    console.log("[meta/callback] waba_id from URL param:", wabaIdParam)
    try {
      const phoneRes = await fetch(
        `https://graph.facebook.com/v18.0/${wabaIdParam}/phone_numbers?fields=id,display_phone_number&access_token=${accessToken}`
      )
      const phoneData = (await phoneRes.json()) as { data?: Array<{ id: string; display_phone_number: string }> }
      console.log("[meta/callback] phones from waba:", JSON.stringify(phoneData))
      const phones = phoneData.data ?? []
      if (phones.length > 0) {
        phoneNumberId = phones[0].id
        displayPhone = phones[0].display_phone_number
      }
    } catch (err) {
      console.error("[meta/callback] failed to fetch phones for waba:", err)
    }
  } else {
    // Fallback: discover via Graph API
    try {
      // Approach 1: Direct user WABA access
      const directWabaRes = await fetch(
        `https://graph.facebook.com/v18.0/me/whatsapp_business_accounts?access_token=${accessToken}`
      )
      const directWabaData = (await directWabaRes.json()) as { data?: Array<{ id: string }> }
      console.log("[meta/callback] direct WABAs:", JSON.stringify(directWabaData))

      const directWabas = directWabaData.data ?? []

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
    }
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
