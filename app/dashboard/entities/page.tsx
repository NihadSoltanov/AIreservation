import type { Metadata } from "next"
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_ENTITIES, MOCK_ORG } from "@/lib/mock-data"
import { getVertical } from "@/lib/verticals/registry"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = { title: "Entities" }

export default function EntitiesPage() {
  const vertical = getVertical(MOCK_ORG.vertical)
  const ac = vertical.accentColor

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">{vertical.terminology.entities}</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {MOCK_ENTITIES.filter(e => e.status === "active").length} active ·{" "}
            {MOCK_ENTITIES.filter(e => e.status === "inactive").length} inactive
          </p>
        </div>
        <Button>
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

      {/* Grid view */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_ENTITIES.map((entity) => {
          const fields = entity.fields as Record<string, unknown>
          return (
            <Card
              key={entity.id}
              className="group hover:border-[var(--muted-2)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <CardContent className="p-5">
                {/* Header */}
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

                {/* Key fields */}
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

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs">Edit</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs"
                    style={{ color: ac }}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Add new card */}
        <button className="rounded-xl border-2 border-dashed border-[var(--border)] p-5 flex flex-col items-center justify-center gap-2 hover:border-[var(--accent)] hover:bg-[var(--surface-2)] transition-all duration-200 group min-h-[180px]">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
            style={{ background: ac + "15" }}
          >
            <Plus className="h-5 w-5" style={{ color: ac }} />
          </div>
          <div className="text-sm font-medium text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
            Add {vertical.terminology.entity}
          </div>
        </button>
      </div>
    </div>
  )
}
