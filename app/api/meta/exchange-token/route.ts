import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code, phoneNumberId } = (await req.json()) as {
    code: string
    phoneNumberId: string
  }

  const appId = process.env.NEXT_PUBLIC_META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: "Meta App ID / Secret ortam değişkenleri eksik." },
      { status: 500 }
    )
  }

  // 1. Exchange OAuth code for access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${encodeURIComponent(code)}`
  )
  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: { message: string } }

  if (!tokenData.access_token) {
    console.error("[meta/exchange-token] token exchange failed:", tokenData)
    return NextResponse.json(
      { error: tokenData.error?.message ?? "Token alınamadı" },
      { status: 400 }
    )
  }

  const accessToken = tokenData.access_token

  // 2. Get phone number display name if we received phone_number_id
  let displayPhone = ""
  let finalPhoneId = phoneNumberId

  if (phoneNumberId) {
    const phoneRes = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}?fields=id,display_phone_number&access_token=${accessToken}`
    )
    const phoneData = (await phoneRes.json()) as {
      id?: string
      display_phone_number?: string
    }
    displayPhone = phoneData.display_phone_number ?? ""
    finalPhoneId = phoneData.id ?? phoneNumberId
  }

  // 3. Save token + phone number to the user's org
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ error: "Organization bulunamadı" }, { status: 404 })
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
      whatsapp_phone_number_id: finalPhoneId,
      whatsapp_number: displayPhone,
      config: newConfig,
    })
    .eq("id", profile.organization_id)

  return NextResponse.json({ ok: true, phoneNumberId: finalPhoneId, phoneNumber: displayPhone })
}
