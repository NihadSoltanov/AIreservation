import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { chat, buildSystemPrompt } from "@/lib/ai/provider"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN ?? ""
  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 })
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" })
    }
    const supabase = createServiceClient()
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== "messages") continue
        const value = change.value
        const phoneNumberId = value.metadata?.phone_number_id
        for (const message of value.messages ?? []) {
          if (message.type !== "text") continue
          const fromPhone = message.from
          const text = message.text?.body ?? ""
          const waId = message.id
          const { data: org } = await supabase
            .from("organizations")
            .select("id, config")
            .eq("whatsapp_phone_number_id", phoneNumberId)
            .single()
          if (!org) continue
          const orgId: string = org.id
          const orgConfig = (org.config ?? {}) as Record<string, string>
          let convId: string
          const { data: existing } = await supabase
            .from("conversations")
            .select("id")
            .eq("contact_phone", fromPhone)
            .eq("channel", "whatsapp")
            .eq("status", "open")
            .eq("organization_id", orgId)
            .single()
          if (existing) {
            convId = existing.id
          } else {
            const { data: lead } = await supabase
              .from("leads")
              .insert({ organization_id: orgId, name: fromPhone, phone: fromPhone, source: "whatsapp", status: "new" })
              .select("id")
              .single()
            const { data: newConv } = await supabase
              .from("conversations")
              .insert({ organization_id: orgId, lead_id: lead?.id ?? null, channel: "whatsapp", status: "open", contact_phone: fromPhone })
              .select("id")
              .single()
            if (!newConv) continue
            convId = newConv.id
          }
          await supabase.from("messages").insert({
            conversation_id: convId,
            organization_id: orgId,
            role: "user",
            content: text,
            external_id: waId,
          })
          const { data: history } = await supabase
            .from("messages")
            .select("role, content")
            .eq("conversation_id", convId)
            .order("created_at", { ascending: true })
            .limit(20)
          const { data: assistantConfig } = await supabase
            .from("assistant_configs")
            .select("*, organizations(name, vertical)")
            .eq("organization_id", orgId)
            .single()
          const orgInfo = (assistantConfig?.organizations ?? null) as { name: string; vertical: string } | null
          const systemPrompt = buildSystemPrompt({
            agentName: assistantConfig?.name ?? "Assistant",
            orgName: orgInfo?.name ?? "AutoReserv",
            tone: assistantConfig?.tone ?? "professional",
            language: "auto",
            customInstructions: assistantConfig?.system_prompt ?? undefined,
          })
          const aiMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
            { role: "system", content: systemPrompt },
            ...(history ?? []).map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ]
          const aiText = await chat(aiMessages)
          if (aiText) {
            await supabase.from("messages").insert({
              conversation_id: convId,
              organization_id: orgId,
              role: "assistant",
              content: aiText,
            })
            const metaToken = orgConfig.meta_token ?? process.env.META_WHATSAPP_TOKEN ?? ""
            await sendWhatsAppMessage(fromPhone, aiText, phoneNumberId, metaToken)
          }
        }
      }
    }
    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("[WhatsApp Webhook] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendWhatsAppMessage(to: string, text: string, phoneNumberId: string, token: string) {
  if (!token) return
  await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  })
}