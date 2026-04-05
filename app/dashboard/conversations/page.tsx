import type { Metadata } from "next"
import { MessageSquare, AlertTriangle, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_CONVERSATIONS, MOCK_LEADS } from "@/lib/mock-data"
import { formatRelativeTime } from "@/lib/utils"
import type { ConversationStatus } from "@/lib/types"

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

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">Conversations</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {MOCK_CONVERSATIONS.length} total ·{" "}
            <span className="text-amber-400 font-medium">
              {MOCK_CONVERSATIONS.filter(c => c.status === "handoff_requested").length} need attention
            </span>
          </p>
        </div>
      </div>

      {/* Handoff Alert */}
      {MOCK_CONVERSATIONS.some(c => c.status === "handoff_requested") && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-amber-400">Agent handoff requested</div>
            <p className="text-sm text-[var(--muted)] mt-1">
              {MOCK_CONVERSATIONS.filter(c => c.status === "handoff_requested").length} conversation(s) require a human agent.
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
      <div className="grid gap-4">
        {MOCK_CONVERSATIONS.map((conv) => {
          const lead = MOCK_LEADS.find(l => l.id === conv.lead_id)
          const lastMsg = conv.messages[conv.messages.length - 1]

          return (
            <Card
              key={conv.id}
              className="hover:border-[var(--muted-2)] transition-all duration-200 cursor-pointer group"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Channel icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                      <MessageSquare className="h-5 w-5 text-[var(--muted)]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-[var(--foreground)]">
                          {lead?.name ?? "Anonymous"}
                        </span>
                        <span className="text-[10px] rounded-full px-2 py-0.5 bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)] capitalize">
                          {conv.channel}
                        </span>
                        {conv.status === "handoff_requested" && (
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>

                      {conv.summary && (
                        <p className="text-sm text-[var(--muted)] truncate mb-1">{conv.summary}</p>
                      )}

                      {lastMsg && (
                        <div className="text-xs text-[var(--muted)] bg-[var(--surface-2)] rounded-lg p-2 truncate border border-[var(--border)]">
                          <span className="font-medium capitalize">{lastMsg.role}:</span> {lastMsg.content}
                        </div>
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
                    <span className="text-xs text-[var(--muted)]">
                      {conv.messages.length} msg
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
