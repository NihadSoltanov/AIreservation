import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { token, phoneNumberId } = (await req.json()) as {
    token: string
    phoneNumberId: string
  }

  if (!token || !phoneNumberId) {
    return NextResponse.json({ error: "token and phoneNumberId required" }, { status: 400 })
  }

  // Get the user's organization
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ error: "No organization found" }, { status: 404 })
  }

  // Fetch existing config so we can merge (not overwrite other keys)
  const { data: org } = await supabase
    .from("organizations")
    .select("config")
    .eq("id", profile.organization_id)
    .single()

  const existingConfig = (org?.config ?? {}) as Record<string, unknown>
  const newConfig = { ...existingConfig, meta_token: token }

  const { error } = await supabase
    .from("organizations")
    .update({
      whatsapp_phone_number_id: phoneNumberId,
      config: newConfig,
    })
    .eq("id", profile.organization_id)

  if (error) {
    console.error("[settings/whatsapp] update error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ error: "No organization found" }, { status: 404 })
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("config")
    .eq("id", profile.organization_id)
    .single()

  const existingConfig = (org?.config ?? {}) as Record<string, unknown>
  delete existingConfig.meta_token

  await supabase
    .from("organizations")
    .update({
      whatsapp_phone_number_id: null,
      whatsapp_number: null,
      config: existingConfig,
    })
    .eq("id", profile.organization_id)

  return NextResponse.json({ ok: true })
}
