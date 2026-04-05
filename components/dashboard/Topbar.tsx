"use client"

import { Bell, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MOCK_ORG } from "@/lib/mock-data"
import { getVertical } from "@/lib/verticals/registry"
import { initials } from "@/lib/utils"

export default function DashboardTopbar() {
  const vertical = getVertical(MOCK_ORG.vertical)

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6">
      {/* Search */}
      <div className="relative max-w-xs w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
        <Input
          placeholder="Search..."
          className="pl-10 h-9 bg-[var(--surface-2)] border-[var(--border)] text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Vertical badge */}
        <Badge
          className="hidden sm:inline-flex gap-1 text-xs font-semibold"
          style={{ background: vertical.accentColor + "20", color: vertical.accentColor, border: `1px solid ${vertical.accentColor}40` }}
        >
          {vertical.icon} {vertical.label}
        </Badge>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User avatar */}
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback style={{ background: vertical.accentColor + "20", color: vertical.accentColor, fontSize: "11px" }}>
            {initials("John Doe")}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
