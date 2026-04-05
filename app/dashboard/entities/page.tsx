import type { Metadata } from "next"
import { Plus, Search, Filter, MoreHorizontal, Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSessionData } from "@/lib/data/session"
import { createClient } from "@/lib/supabase/server"
import { getVertical } from "@/lib/verticals/registry"
import { formatDate } from "@/lib/utils"
import type { Entity } from "@/lib/types"

export const metadata: Metadata = { title: "Entities" }

export default async function EntitiesPage() {
  const { org } = await getSessionData()
  const vertical = getVertical(org?.vertical ?? "custom")
  const ac = vertical.accentColor

  let entities: Entity[] = []
  if (org) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("entities")
      .select("*")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false })
    entities = (data ?? []) as Entity[]
  }

  const active = entities.filter(e => e.status === "active").length
  const inactive = entities.filter(e => e.status === "inactive").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">{vertical.terminology.entities}</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {active} active Â· {inactive} inactive
          </p>
        </div>
        <Button style={{ background: ac }}>
          <Plus className="h-4 w-4" />
          Add {vertical.terminology.entity}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
          <Input placeholder={`Search ${vertical.terminology.entities.toLowerCase()}...`} className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Grid */}
      {entities.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {entities.map((entity) => {
            const fields = entity.fields as Record<string, unknown>
            return (
              <Card
                key={entity.id}
                className="group hover:border-[var(--muted-2)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="font-bold text-[var(--foreground)] text-sm leading-snug">{entity.title}</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        Updated {formatDate(entity.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={entity.status === "active" ? "success" : "secondary"} className="capitalize">
                        {entity.status}
                      </Badge>
                      <button className="text-[var(--muted)] hover:text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(fields).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-[var(--muted)] capitalize">{key.replace(/_/g, " ")}</span>
                        <span className="font-medium text-[var(--foreground)] max-w-[55%] truncate text-right">
                          {key === "price" || key === "price_per_night" || key === "consultation_fee"
                            ? `$${Number(value).toLocaleString()}`
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                    <Button variant="ghost" size="sm" className="flex-1 text-xs">Edit</Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-xs" style={{ color: ac }}>View</Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Add new */}
          <button className="rounded-xl border-2 border-dashed border-[var(--border)] p-5 flex flex-col items-center justify-center gap-2 hover:border-[var(--accent)] hover:bg-[var(--surface-2)] transition-all duration-200 group min-h-[180px]">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110" style={{ background: ac + "15" }}>
              <Plus className="h-5 w-5" style={{ color: ac }} />
            </div>
            <div className="text-sm font-medium text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
              Add {vertical.terminology.entity}
            </div>
          </button>
        </div>
      ) : (
        <div className="py-16 text-center">
          <Package className="h-10 w-10 mx-auto mb-3 text-[var(--muted)]" />
          <p className="font-semibold text-[var(--foreground)]">No {vertical.terminology.entities.toLowerCase()} yet</p>
          <p className="text-sm text-[var(--muted)] mt-1 mb-4">
            Add your {vertical.terminology.entities.toLowerCase()} so the AI can reference them in conversations.
          </p>
          <Button style={{ background: ac }}>
            <Plus className="h-4 w-4" />
            Add {vertical.terminology.entity}
          </Button>
        </div>
      )}
    </div>
  )
}
