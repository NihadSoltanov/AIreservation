"use client"

import { useState } from "react"
import { Check, CreditCard, Zap, Shield, Download, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { MOCK_ORG, MOCK_SUBSCRIPTION, PRICING_PLANS } from "@/lib/mock-data"
import { getVertical } from "@/lib/verticals/registry"
import { formatDate } from "@/lib/utils"

const PLAN_ICONS: Record<string, React.ElementType> = {
  starter: Zap,
  pro: Shield,
  enterprise: CreditCard,
}

export default function BillingPage() {
  const vertical = getVertical(MOCK_ORG.vertical)
  const ac = vertical.accentColor
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  const currentPlan = PRICING_PLANS.find(p => p.id === MOCK_ORG.plan)
  const usagePct = Math.round(
    (MOCK_SUBSCRIPTION.usage_conversations / MOCK_SUBSCRIPTION.limit_conversations) * 100
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--foreground)]">Billing</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Manage your plan and payment details</p>
      </div>

      {/* Current plan summary */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full" style={{ background: ac }} />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: ac + "15" }}
              >
                <Shield className="h-6 w-6" style={{ color: ac }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[var(--foreground)] capitalize">
                    {MOCK_ORG.plan} Plan
                  </h2>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Renews on {formatDate(MOCK_SUBSCRIPTION.current_period_end)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" />
                Invoice
              </Button>
              <Button variant="outline" size="sm">
                <CreditCard className="h-3.5 w-3.5" />
                Update Card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">AI Conversations</span>
              <span className="font-semibold text-[var(--foreground)]">
                {MOCK_SUBSCRIPTION.usage_conversations.toLocaleString()} / {MOCK_SUBSCRIPTION.limit_conversations.toLocaleString()}
              </span>
            </div>
            <Progress value={usagePct} className="h-2" />
            <p className="text-xs text-[var(--muted)]">{usagePct}% used · {(MOCK_SUBSCRIPTION.limit_conversations - MOCK_SUBSCRIPTION.usage_conversations).toLocaleString()} remaining</p>
          </div>

          {usagePct > 80 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                You've used {usagePct}% of your monthly conversations. Consider upgrading to avoid interruptions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[var(--foreground)]">Plans</h2>
          <div className="flex gap-1 p-1 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
            {(["monthly", "yearly"] as const).map(p => (
              <button
                key={p}
                onClick={() => setBillingPeriod(p)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all capitalize"
                style={{
                  background: billingPeriod === p ? "var(--surface)" : "transparent",
                  color: billingPeriod === p ? "var(--foreground)" : "var(--muted)",
                }}
              >
                {p}
                {p === "yearly" && (
                  <span className="ml-1 text-emerald-400">-20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {PRICING_PLANS.map(plan => {
            const isCurrent = plan.id === MOCK_ORG.plan
            const Icon = PLAN_ICONS[plan.id] ?? Zap
            const price = billingPeriod === "yearly"
              ? Math.round(plan.price * 0.8)
              : plan.price

            return (
              <div
                key={plan.id}
                className="relative rounded-xl border p-5 transition-all"
                style={{
                  borderColor: isCurrent ? ac : plan.highlighted ? ac + "40" : "var(--border)",
                  background: isCurrent ? ac + "08" : "var(--surface)",
                }}
              >
                {isCurrent && (
                  <div
                    className="absolute -top-2.5 left-4 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: ac, color: "#fff" }}
                  >
                    Current Plan
                  </div>
                )}
                {plan.highlighted && !isCurrent && (
                  <div
                    className="absolute -top-2.5 left-4 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: ac, color: "#fff" }}
                  >
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-5 w-5" style={{ color: ac }} />
                  <span className="font-bold text-[var(--foreground)] capitalize">{plan.name}</span>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-black text-[var(--foreground)]">${price}</span>
                  <span className="text-[var(--muted)] text-sm">/mo</span>
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.slice(0, 4).map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-[var(--muted)]">
                      <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: ac }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  className="w-full"
                  variant={isCurrent ? "outline" : "default"}
                  style={!isCurrent ? { background: ac } : {}}
                  disabled={isCurrent}
                >
                  {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invoice history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "Jan 1, 2025", amount: "$99.00", status: "paid" },
              { date: "Dec 1, 2024", amount: "$99.00", status: "paid" },
              { date: "Nov 1, 2024", amount: "$49.00", status: "paid" },
            ].map(inv => (
              <div key={inv.date} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{inv.date}</p>
                  <p className="text-xs text-[var(--muted)]">AutoReserv Pro Plan</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{inv.amount}</span>
                  <Badge variant="success" className="capitalize">{inv.status}</Badge>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
