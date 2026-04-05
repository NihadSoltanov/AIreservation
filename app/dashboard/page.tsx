import { Users, MessageSquare, Package, TrendingUp, ArrowRight, Clock } from "lucide-react"
import StatsCard from "@/components/dashboard/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSessionData } from "@/lib/data/session"
import { createClient } from "@/lib/supabase/server"
import { getVertical } from "@/lib/verticals/registry"
import { formatRelativeTime, initials } from "@/lib/utils"
import type { LeadStatus, ConversationStatus } from "@/lib/types"

const LEAD_STATUS_MAP: Record<LeadStatus, { label: string; variant: "success" | "warning" | "info" | "secondary" | "danger" }> = {
  new: { label: "New", variant: "info" },
  contacted: { label: "Contacted", variant: "secondary" },
  qualified: { label: "Qualified", variant: "success" },
  converted: { label: "Converted", variant: "success" },
  lost: { label: "Lost", variant: "danger" },
}

const CONV_STATUS_MAP: Record<ConversationStatus, { label: string; variant: "success" | "warning" | "info" | "secondary" | "danger" }> = {
  open: { label: "Open", variant: "info" },
  resolved: { label: "Resolved", variant: "success" },
  handoff_requested: { label: "Needs Agent", variant: "warning" },
  closed: { label: "Closed", variant: "secondary" },
}

export default async function DashboardOverview() {
  const { org } = await getSessionData()
  const vertical = getVertical(org?.vertical ?? "custom")
  const ac = vertical.accentColor
  const ag = vertical.accentGlow

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="text-4xl">{vertical.icon}</div>
        <h1 className="text-2xl font-black text-[var(--foreground)]">Welcome to AutoReserv</h1>
        <p className="text-[var(--muted)] max-w-sm">
          Complete your setup to start capturing leads and automating conversations.
        </p>
        <Button asChild style={{ background: ac }}>
          <Link href="/dashboard/onboarding">Complete Setup <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    )
  }

  const supabase = await createClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalLeads },
    { count: totalConvs },
    { count: leadsThisMonth },
    { count: convsThisMonth },
    { count: activeEntities },
    { data: recentLeads },
    { data: recentConvs },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("organization_id", org.id),
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("organization_id", org.id),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("organization_id", org.id).gte("created_at", monthStart),
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("organization_id", org.id).gte("created_at", monthStart),
    supabase.from("entities").select("*", { count: "exact", head: true }).eq("organization_id", org.id).eq("status", "active"),
    supabase.from("leads").select("id, name, source, status, created_at").eq("organization_id", org.id).order("created_at", { ascending: false }).limit(4),
    supabase.from("conversations").select("id, lead_id, status, channel, summary, updated_at").eq("organization_id", org.id).order("updated_at", { ascending: false }).limit(5),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">Overview</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Welcome back â€”{" "}
            <span className="font-medium text-[var(--foreground)]">{org.name}</span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={`${vertical.terminology.leads} this month`}
          value={leadsThisMonth ?? 0}
          icon={Users}
          accentColor={ac}
          accentGlow={ag}
        />
        <StatsCard
          title="Conversations this month"
          value={convsThisMonth ?? 0}
          icon={MessageSquare}
          accentColor="#0ea5e9"
          accentGlow="rgba(14,165,233,0.25)"
        />
        <StatsCard
          title={`Total ${vertical.terminology.leads}`}
          value={totalLeads ?? 0}
          icon={TrendingUp}
          accentColor="#10b981"
          accentGlow="rgba(16,185,129,0.25)"
        />
        <StatsCard
          title={`Active ${vertical.terminology.entities}`}
          value={activeEntities ?? 0}
          icon={Package}
          accentColor="#f59e0b"
          accentGlow="rgba(245,158,11,0.25)"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent {vertical.terminology.leads}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/leads" className="text-xs text-[var(--accent)]">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentLeads?.length ? (
              <div className="divide-y divide-[var(--border)]">
                {(recentLeads as any[]).map((lead) => {
                  const status = LEAD_STATUS_MAP[lead.status as LeadStatus]
                  return (
                    <div key={lead.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-[var(--surface-2)] transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs" style={{ background: ac + "20", color: ac }}>
                            {initials(lead.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-[var(--foreground)]">{lead.name}</div>
                          <div className="text-xs text-[var(--muted)]">{lead.source} Â· {formatRelativeTime(lead.created_at)}</div>
                        </div>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-[var(--muted)]" />
                <p className="text-sm text-[var(--muted)]">No {vertical.terminology.leads.toLowerCase()} yet.</p>
                <p className="text-xs text-[var(--muted)] mt-1">They will appear here once your AI starts capturing them.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Conversations</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/conversations" className="text-xs text-[var(--accent)]">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentConvs?.length ? (
              <div className="divide-y divide-[var(--border)]">
                {(recentConvs as any[]).map((conv) => {
                  const status = CONV_STATUS_MAP[conv.status as ConversationStatus]
                  return (
                    <div key={conv.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-[var(--surface-2)] transition-colors">
                      <div className="min-w-0 flex-1 mr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-[var(--surface-2)] text-[var(--muted)]">
                            {conv.channel}
                          </span>
                          {conv.status === "handoff_requested" && (
                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-[var(--muted)] truncate">{conv.summary ?? "No summary yet"}</p>
                      </div>
                      <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[var(--muted)]" />
                <p className="text-sm text-[var(--muted)]">No conversations yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Entities */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Active {vertical.terminology.entities}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/entities" className="text-xs text-[var(--accent)]">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl text-3xl"
              style={{ background: ac + "15" }}
            >
              {vertical.icon}
            </div>
            <div>
              <div className="text-3xl font-black text-[var(--foreground)]">{activeEntities ?? 0}</div>
              <div className="text-sm text-[var(--muted)]">Active {vertical.terminology.entities}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
