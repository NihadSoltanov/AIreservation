import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, orgName, vertical } = await req.json() as {
      userId: string
      email: string
      fullName: string
      orgName: string
      vertical: string
    }

    if (!userId || !email || !orgName || !vertical) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Generate unique slug
    const base = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const suffix = Math.random().toString(36).slice(2, 7)
    const slug = `${base}-${suffix}`

    // Create organization
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({
        name: orgName,
        slug,
        vertical,
        owner_id: userId,
        plan: "free",
        plan_status: "trialing",
        config: {},
      })
      .select()
      .single()

    if (orgErr) {
      return NextResponse.json({ error: orgErr.message }, { status: 400 })
    }

    // Create profile (upsert in case the trigger already created it)
    await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email,
        full_name: fullName || email.split("@")[0],
        organization_id: org.id,
        role: "owner",
      })

    // Create default subscription
    await supabase.from("subscriptions").insert({
      organization_id: org.id,
      plan: "free",
      status: "trialing",
      usage_conversations: 0,
      usage_leads: 0,
      limit_conversations: 200,
      limit_leads: 50,
    })

    // Create default assistant config
    await supabase.from("assistant_configs").insert({
      organization_id: org.id,
      name: "AI Assistant",
      tone: "professional",
      language: "en",
      welcome_message: `Hi! I'm your AI assistant at ${orgName}. How can I help you today?`,
      handoff_enabled: true,
      handoff_message: "Let me connect you with one of our team members right away.",
      qualification_fields: [],
      lead_score_enabled: true,
    })

    return NextResponse.json({ success: true, orgId: org.id })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
