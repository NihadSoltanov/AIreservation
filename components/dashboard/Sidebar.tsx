"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Bot,
  BookOpen,
  Settings,
  CreditCard,
  Zap,
  ChevronLeft,
  ChevronRight,
  Package,
  LogOut,
} from "lucide-react"
import { cn, initials } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MOCK_ORG } from "@/lib/mock-data"
import { getVertical } from "@/lib/verticals/registry"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/entities", icon: Package, label: "catalog" },
  { href: "/dashboard/leads", icon: Users, label: "Leads" },
  { href: "/dashboard/conversations", icon: MessageSquare, label: "Conversations" },
  { href: "/dashboard/assistant", icon: Bot, label: "AI Assistant" },
  { href: "/dashboard/knowledge", icon: BookOpen, label: "Knowledge Base" },
]

const BOTTOM_ITEMS = [
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const vertical = getVertical(MOCK_ORG.vertical)

  // Replace dynamic label
  const navWithLabels = NAV_ITEMS.map((item) =>
    item.label === "catalog"
      ? { ...item, label: vertical.terminology.entities }
      : item
  )

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href)

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-[var(--border)] px-4", collapsed ? "justify-center" : "gap-2")}>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-lg"
          style={{ background: vertical.accentColor, boxShadow: `0 2px 12px ${vertical.accentGlow}` }}
        >
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-sm text-[var(--foreground)] truncate">
              Auto<span style={{ color: vertical.accentColor }}>Reserv</span>
            </div>
            <div className="text-[10px] text-[var(--muted)] truncate">{vertical.label}</div>
          </div>
        )}
      </div>

      {/* Org indicator */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-[var(--border)]">
          <div
            className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback style={{ background: vertical.accentColor + "20", color: vertical.accentColor }}>
                {initials(MOCK_ORG.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[var(--foreground)] truncate">{MOCK_ORG.name}</div>
              <div className="text-[10px] text-[var(--muted)] capitalize">{MOCK_ORG.plan} plan</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navWithLabels.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center" : "",
                active
                  ? "sidebar-active text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
              style={active ? { "--vertical-accent": vertical.accentColor, "--vertical-accent-glow": vertical.accentGlow } as React.CSSProperties : {}}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 space-y-1">
        <Separator className="mb-2" />
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center" : "",
                active
                  ? "sidebar-active text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
        <button
          onClick={() => {/* TODO: logout */}}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] shadow-sm transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
  )
}
