import type { Metadata } from "next"
import { MessageSquare, AlertTriangle, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSessionData } from "@/lib/data/session"
import { createClient } from "@/lib/supabase/server"
import { formatRelativeTime } from "@/lib/utils"
import type { ConversationStatus, Conversation } from "@/lib/types"

export const metadata: Metadata = { title: "Conversations" }

const statusVariants: Record<ConversationStatus, "success" | "warning" | "info" | "secondary" | "danger"> = {
  open: "info",
  resolved: "success",
  handoff_requested: "warning",
  closed: "secondary",
}

const statusLabels: Record<ConversationStatus, string> = {
  open: "Open",
  resolved: "Resolved",
  handoff_requested: "Needs Agent",
  closed: "Closed",
}

export default async function ConversationsPage() {
  const { org } = await getSessionData()

  let conversations: Conversation[] = []
  let leadNames: Record<string, string> = {}

  if (org) {
    const supabase = await createClient()
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .eq("organization_id", org.id)
      .order("updated_at", { ascending: false })

    conversations = (convs ?? []) as Conversation[]

    const leadIds = conversations.map(c => c.lead_id).filter(Boolean) as string[]
    if (leadIds.length) {
      const { data: leads } = await supabase
        .from("leads")
        .select("id, name")
        .in("id", leadIds)
      leadNames = Object.fromEntries((leads ?? []).map(l => [l.id, l.name]))
    }
  }

  const handoffCount = conversations.filter(c => c.status === "handoff_requested").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">Conversations</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {conversations.length} total Â·{" "}
            {handoffCount > 0 && (
              <span className="text-amber-400 font-medium">{handoffCount} need attention</span>
            )}
          </p>
        </div>
      </div>

      {/* Handoff Alert */}
      {handoffCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-amber-400">Agent handoff requested</div>
            <p className="text-sm text-[var(--muted)] mt-1">
              {handoffCount} conversation(s) require a human agent.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
          <Input placeholder="Search conversations..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Conversation List */}
      {conversations.length ? (
        <div className="grid gap-4">
          {conversations.map((conv) => {
            const leadName = conv.lead_id ? (leadNames[conv.lead_id] ?? "Unknown") : "Anonymous"
            return (
              <Card
                key={conv.id}
                className="hover:border-[var(--muted-2)] transition-all duration-200 cursor-pointer group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                        <MessageSquare className="h-5 w-5 text-[var(--muted)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm text-[var(--foreground)]">{leadName}</span>
                          <span className="text-[10px] rounded-full px-2 py-0.5 bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)] capitalize">
                            {conv.channel}
                          </span>
                          {conv.status === "handoff_requested" && (
                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </div>
                        {conv.summary && (
                          <p className="text-sm text-[var(--muted)] truncate">{conv.summary}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant={statusVariants[conv.status]}>
                        {statusLabels[conv.status]}
                      </Badge>
                      <span className="text-xs text-[var(--muted)]">
                        {formatRelativeTime(conv.updated_at)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 text-[var(--muted)]" />
          <p className="font-semibold text-[var(--foreground)]">No conversations yet</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            Conversations will appear here once visitors start chatting with your AI assistant.
          </p>
        </div>
      )}
    </div>
  )
}
