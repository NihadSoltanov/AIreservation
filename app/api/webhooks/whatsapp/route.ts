import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    const supabase = await createClient()

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

          // Find or create conversation
          const { data: conv } = await supabase
            .from("conversations")
            .select("id, organization_id")
            .eq("contact_phone", fromPhone)
            .eq("channel", "whatsapp")
            .eq("status", "open")
            .single()

          if (conv) {
            // Save incoming message
            await supabase.from("messages").insert({
              conversation_id: conv.id,
              organization_id: conv.organization_id,
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
                organizationId: conv.organization_id,
                conversationId: conv.id,
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
                    const text = decoder.decode(chunk)
                    // Parse SSE lines
                    for (const line of text.split("\n")) {
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
                // Save AI response
                await supabase.from("messages").insert({
                  conversation_id: conv.id,
                  organization_id: conv.organization_id,
                  role: "assistant",
                  content: aiText,
                })

                // Send reply via WhatsApp API
                await sendWhatsAppMessage(fromPhone, aiText, phoneNumberId)
              }
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
