import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  accentColor?: string
  accentGlow?: string
  className?: string
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  accentColor = "var(--accent)",
  accentGlow = "var(--accent-glow)",
  className,
}: StatsCardProps) {
  const positive = change !== undefined && change > 0
  const negative = change !== undefined && change < 0
  const neutral = change !== undefined && change === 0

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-[var(--muted-2)] transition-all duration-300 group",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
          style={{ background: accentColor + "15" }}
        >
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              positive && "bg-emerald-500/15 text-emerald-400",
              negative && "bg-red-500/15 text-red-400",
              neutral && "bg-[var(--surface-2)] text-[var(--muted)]"
            )}
          >
            {positive && <TrendingUp className="h-3 w-3" />}
            {negative && <TrendingDown className="h-3 w-3" />}
            {neutral && <Minus className="h-3 w-3" />}
            {change > 0 ? "+" : ""}
            {change}%
          </div>
        )}
      </div>

      <div
        className="text-3xl font-black text-[var(--foreground)] mb-1"
        style={{ textShadow: `0 0 20px ${accentColor}30` }}
      >
        {value}
      </div>
      <div className="text-sm text-[var(--muted)]">{title}</div>
      {changeLabel && (
        <div className="text-xs text-[var(--muted)] mt-1 opacity-70">{changeLabel}</div>
      )}
    </div>
  )
}
