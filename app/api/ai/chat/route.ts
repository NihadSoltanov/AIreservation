import { NextRequest } from "next/server"
import { streamChat, buildSystemPrompt, type ChatMessage } from "@/lib/ai/provider"
import { createClient } from "@/lib/supabase/server"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, organizationId } = body as {
      messages: Array<{ role: string; content: string }>
      organizationId?: string
      conversationId?: string
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const VALID_ROLES = new Set(["user", "assistant", "system"])
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return new Response(JSON.stringify({ error: "Invalid message format" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      if (!VALID_ROLES.has(msg.role)) {
        return new Response(JSON.stringify({ error: "Invalid message role" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    // Build system prompt — optionally fetch org config from DB
    let systemPrompt = buildSystemPrompt({
      agentName: "Assistant",
      orgName: "Your Organization",
      tone: "professional",
      language: "en",
    })

    if (organizationId) {
      try {
        const supabase = await createClient()
        const { data: assistantConfig } = await supabase
          .from("assistant_configs")
          .select("*, organizations(name, vertical)")
          .eq("organization_id", organizationId)
          .single()

        if (assistantConfig) {
          const org = assistantConfig.organizations as { name: string; vertical: string } | null
          systemPrompt = buildSystemPrompt({
            agentName: assistantConfig.name ?? "Assistant",
            orgName: org?.name ?? "Your Organization",
            tone: assistantConfig.tone ?? "professional",
            language: assistantConfig.language ?? "en",
          })
        }
      } catch {
        // Fall through to default system prompt
      }
    }

    const allMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...(messages as ChatMessage[]),
    ]

    const generator = streamChat(allMessages)

    // Convert async generator to ReadableStream for the Response
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of generator) {
          if (chunk.done) {
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"))
            controller.close()
          } else {
            const payload = JSON.stringify({ choices: [{ delta: { content: chunk.delta } }] })
            controller.enqueue(new TextEncoder().encode(`data: ${payload}\n\n`))
          }
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[AI Chat] Error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
