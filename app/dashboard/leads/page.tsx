import type { Metadata } from "next"
import { Users, Search, Filter, Plus, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getSessionData } from "@/lib/data/session"
import { createClient } from "@/lib/supabase/server"
import { getVertical } from "@/lib/verticals/registry"
import { formatRelativeTime, initials } from "@/lib/utils"
import type { LeadStatus, Lead } from "@/lib/types"

export const metadata: Metadata = { title: "Leads" }

const statusVariants: Record<LeadStatus, "success" | "warning" | "info" | "secondary" | "danger"> = {
  new: "info",
  contacted: "secondary",
  qualified: "success",
  converted: "success",
  lost: "danger",
}

export default async function LeadsPage() {
  const { org } = await getSessionData()
  const vertical = getVertical(org?.vertical ?? "custom")
  const ac = vertical.accentColor

  let leads: Lead[] = []
  if (org) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false })
    leads = (data ?? []) as Lead[]
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">{vertical.terminology.leads}</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {leads.length} total Â· {leads.filter(l => l.status === "new").length} new
          </p>
        </div>
        <Button style={{ background: ac }}>
          <Plus className="h-4 w-4" />
          Add {vertical.terminology.lead}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
          <Input placeholder={`Search ${vertical.terminology.leads.toLowerCase()}...`} className="pl-10" />
        </div>
        <Button variant="outline" size="default">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" size="default">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All {vertical.terminology.leads}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {leads.length ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["Name", "Contact", "Source", "Status", "Score", "Created"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[var(--surface-2)] transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs" style={{ background: ac + "20", color: ac }}>
                              {initials(lead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-[var(--foreground)]">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm text-[var(--muted)]">{lead.email ?? lead.phone ?? "â€”"}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-[var(--muted)] capitalize bg-[var(--surface-2)] rounded-full px-2 py-0.5 border border-[var(--border)]">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={statusVariants[lead.status]} className="capitalize">
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        {lead.qualification_score !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-[var(--surface-2)]">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${lead.qualification_score}%`, background: ac }}
                              />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: ac }}>
                              {lead.qualification_score}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">â€”</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--muted)]">
                        {formatRelativeTime(lead.created_at)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-[var(--muted)]" />
              <p className="font-semibold text-[var(--foreground)]">No {vertical.terminology.leads.toLowerCase()} yet</p>
              <p className="text-sm text-[var(--muted)] mt-1">
                {vertical.terminology.leads} will appear here once your AI assistant starts capturing them via WhatsApp or the web widget.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Qualification Summaries */}
      {leads.some(l => l.qualification_summary) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Qualification Summaries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leads.filter(l => l.qualification_summary).map((lead) => (
              <div key={lead.id} className="flex items-start gap-3 rounded-lg bg-[var(--surface-2)] p-4 border border-[var(--border)]">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs" style={{ background: ac + "20", color: ac }}>
                    {initials(lead.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[var(--foreground)]">{lead.name}</span>
                    {lead.qualification_score !== undefined && (
                      <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ background: ac + "20", color: ac }}>
                        Score: {lead.qualification_score}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{lead.qualification_summary}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
