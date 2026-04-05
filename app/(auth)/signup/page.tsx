"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllVerticals } from "@/lib/verticals/registry"
import type { VerticalKey } from "@/lib/verticals/types"
import { cn } from "@/lib/utils"

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedVertical, setSelectedVertical] = useState<VerticalKey | null>(null)
  const [form, setForm] = useState({ name: "", email: "", password: "", orgName: "" })
  const verticals = getAllVerticals()

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setLoading(true)
    // TODO: replace with Supabase signUp + org creation
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    window.location.href = "/dashboard/onboarding"
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2].map((s) => (
            <div key={s} className={cn(
              "h-2 rounded-full transition-all duration-300",
              s === step ? "w-8 bg-[var(--accent)]" : s < step ? "w-8 bg-emerald-400" : "w-4 bg-[var(--muted-2)]"
            )} />
          ))}
        </div>
        <CardTitle className="text-2xl font-black">
          {step === 1 ? "Create your account" : "Choose your industry"}
        </CardTitle>
        <CardDescription>
          {step === 1 ? "14-day free trial. No credit card required." : "AutoReserv will configure the AI for your specific business type."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgName">Business Name</Label>
                  <Input id="orgName" placeholder="Your Business" value={form.orgName} onChange={(e) => update("orgName", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" value={form.email} onChange={(e) => update("email", e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">Continue</Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {verticals.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setSelectedVertical(v.key)}
                    className={cn(
                      "relative text-left rounded-xl border p-4 transition-all duration-200",
                      selectedVertical === v.key
                        ? "border-transparent ring-2"
                        : "border-[var(--border)] hover:border-[var(--muted-2)] bg-[var(--surface-2)]"
                    )}
                    style={selectedVertical === v.key ? {
                      borderColor: v.accentColor,
                      background: v.accentColor + "10",
                      ["--tw-ring-color" as string]: v.accentColor,
                    } : {}}
                  >
                    {selectedVertical === v.key && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: v.accentColor }}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="text-xl mb-2">{v.icon}</div>
                    <div className="font-semibold text-sm text-[var(--foreground)]">{v.label}</div>
                    <div className="text-xs text-[var(--muted)] mt-0.5 leading-snug line-clamp-2">{v.description}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={!selectedVertical || loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Creating account..." : "Create account →"}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)] font-medium hover:underline">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
