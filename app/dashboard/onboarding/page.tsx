"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { getVertical } from "@/lib/verticals/registry"
import { createClient } from "@/lib/supabase/client"
import type { VerticalKey } from "@/lib/verticals/types"

export default function OnboardingPage() {
  const router = useRouter()
  const [orgId, setOrgId] = useState<string | null>(null)
  const [verticalKey, setVerticalKey] = useState<VerticalKey>("custom")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single()

      const orgIdVal = profile?.organization_id
      if (orgIdVal) {
        setOrgId(orgIdVal)
        const { data: orgData } = await supabase
          .from("organizations")
          .select("vertical")
          .eq("id", orgIdVal)
          .single()
        if (orgData?.vertical) setVerticalKey(orgData.vertical as VerticalKey)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const vertical = getVertical(verticalKey)
  const ac = vertical.accentColor
  const steps = vertical.onboardingSteps

  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})

  const step = steps[currentStep]
  const progress = Math.round(((currentStep + 1) / steps.length) * 100)
  const isLast = currentStep === steps.length - 1

  const handleChange = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    if (isLast) {
      if (!orgId) {
        console.error("[onboarding] orgId is null, cannot complete setup")
        return
      }
      setSaving(true)
      const supabase = createClient()

      // Extract well-known fields and store the rest in config
      const { phone, whatsapp_number, address, website, ...rest } = values as Record<string, string>
      await supabase
        .from("organizations")
        .update({
          ...(phone ? { phone } : {}),
          ...(whatsapp_number ? { whatsapp_number } : {}),
          ...(address ? { address } : {}),
          ...(website ? { website } : {}),
          config: rest,
        })
        .eq("id", orgId)

      router.push("/dashboard")
    } else {
      setCurrentStep(s => s + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="text-2xl font-black tracking-tight mb-2" style={{ color: ac }}>AutoReserv</div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            Set up your {vertical.terminology.entity.toLowerCase()} assistant
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">Step {currentStep + 1} of {steps.length}</p>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between mt-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center gap-1" style={{ width: `${100 / steps.length}%` }}>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: i < currentStep ? ac : i === currentStep ? ac + "30" : "var(--surface-2)",
                    color: i <= currentStep ? (i < currentStep ? "#fff" : ac) : "var(--muted)",
                    border: `2px solid ${i <= currentStep ? ac : "var(--border)"}`,
                  }}
                >
                  {i < currentStep ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-7">
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">{step.title}</h2>
            <p className="text-sm text-[var(--muted)] mb-6">{step.description}</p>

            <div className="space-y-4">
              {step.fields.map(field => (
                <div key={field.key} className="space-y-1.5">
                  <Label>
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-400">*</span>}
                  </Label>

                  {field.type === "textarea" ? (
                    <Textarea
                      value={values[field.key] ?? ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : field.type === "select" && field.options ? (
                    <div className="flex flex-wrap gap-2">
                      {field.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleChange(field.key, opt)}
                          className="px-3 py-1.5 rounded-lg text-sm border transition-all"
                          style={{
                            background: values[field.key] === opt ? ac + "20" : "transparent",
                            borderColor: values[field.key] === opt ? ac : "var(--border)",
                            color: values[field.key] === opt ? ac : "var(--muted)",
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      value={values[field.key] ?? ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={saving}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <Button className="flex-1" onClick={handleNext} disabled={saving} style={{ background: ac }}>
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Setting up...</>
                ) : isLast ? (
                  <><CheckCircle2 className="h-4 w-4" /> Complete Setup</>
                ) : (
                  <>Next <ChevronRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[var(--muted)] mt-4">
          You can always update these settings later in the dashboard
        </p>
      </div>
    </div>
  )
}
