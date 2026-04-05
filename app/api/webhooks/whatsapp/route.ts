import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

// Meta WhatsApp Cloud API webhook handler
export async function GET(req: NextRequest) {
  // Webhook verification challenge
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

    // Basic structure validation
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

          // Find org by WhatsApp phone number ID
          const { data: org } = await supabase
            .from("organizations")
            .select("id")
            .eq("whatsapp_phone_number_id", phoneNumberId)
            .single()

          if (!org) continue // No org configured for this phone number

          // Find or create open conversation for this contact
          let convId: string
          let orgId: string = org.id

          const { data: existing } = await supabase
            .from("conversations")
            .select("id, organization_id")
            .eq("contact_phone", fromPhone)
            .eq("channel", "whatsapp")
            .eq("status", "open")
            .eq("organization_id", orgId)
            .single()

          if (existing) {
            convId = existing.id
          } else {
            // Auto-create lead + conversation for new contact
            const { data: lead } = await supabase
              .from("leads")
              .insert({
                organization_id: orgId,
                name: fromPhone,
                phone: fromPhone,
                source: "whatsapp",
                status: "new",
              })
              .select("id")
              .single()

            const { data: newConv } = await supabase
              .from("conversations")
              .insert({
                organization_id: orgId,
                lead_id: lead?.id ?? null,
                channel: "whatsapp",
                status: "open",
                contact_phone: fromPhone,
              })
              .select("id")
              .single()

            if (!newConv) continue
            convId = newConv.id
          }

          // Save incoming message
          await supabase.from("messages").insert({
            conversation_id: convId,
            organization_id: orgId,
            role: "user",
            content: text,
            external_id: waId,
          })

          // Call AI to generate response (non-streaming for webhooks)
          const aiRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ role: "user", content: text }],
              organizationId: orgId,
              conversationId: convId,
            }),
          })

          if (aiRes.ok) {
            const reader = aiRes.body?.getReader()
            let aiText = ""
            if (reader) {
              const decoder = new TextDecoder()
              let done = false
              while (!done) {
                const { value: chunk, done: d } = await reader.read()
                done = d
                if (chunk) {
                  const raw = decoder.decode(chunk)
                  for (const line of raw.split("\n")) {
                    if (line.startsWith("data: ") && line !== "data: [DONE]") {
                      try {
                        const data = JSON.parse(line.slice(6))
                        const delta = data.choices?.[0]?.delta?.content
                        if (delta) aiText += delta
                      } catch {}
                    }
                  }
                }
              }
            }

            if (aiText) {
              await supabase.from("messages").insert({
                conversation_id: convId,
                organization_id: orgId,
                role: "assistant",
                content: aiText,
              })
              await sendWhatsAppMessage(fromPhone, aiText, phoneNumberId)
            }
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

async function sendWhatsAppMessage(to: string, text: string, phoneNumberId: string) {
  const token = process.env.META_WHATSAPP_TOKEN
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
