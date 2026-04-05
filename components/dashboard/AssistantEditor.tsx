"use client"

import { useState } from "react"
import { Bot, Save, RefreshCw, Sliders, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { getVertical } from "@/lib/verticals/registry"
import { createClient } from "@/lib/supabase/client"
import type { AssistantConfig } from "@/lib/types"
import type { VerticalKey } from "@/lib/verticals/types"

const TONE_OPTIONS: Array<"professional" | "friendly" | "empathetic" | "formal"> = ["professional", "friendly", "empathetic", "formal"]
const LANG_OPTIONS = ["en", "tr", "es", "fr", "ar", "de", "pt"]
const LANG_LABELS: Record<string, string> = { en: "English", tr: "Turkish", es: "Spanish", fr: "French", ar: "Arabic", de: "German", pt: "Portuguese" }

export default function AssistantEditor({
  initialConfig,
  orgId,
  verticalKey,
  orgName,
}: {
  initialConfig: AssistantConfig | null
  orgId: string | null
  verticalKey: VerticalKey
  orgName: string
}) {
  const vertical = getVertical(verticalKey)
  const ac = vertical.accentColor

  const [name, setName] = useState(initialConfig?.name ?? "AI Assistant")
  const [tone, setTone] = useState<string>(initialConfig?.tone ?? "professional")
  const [language, setLanguage] = useState(initialConfig?.language ?? "en")
  const [welcome, setWelcome] = useState(initialConfig?.welcome_message ?? "")
  const [systemPrompt, setSystemPrompt] = useState(
    initialConfig?.system_prompt ?? vertical.sampleSystemPrompt(orgName)
  )
  const [handoffEnabled, setHandoffEnabled] = useState(initialConfig?.handoff_enabled ?? true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!orgId) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from("assistant_configs")
      .upsert({
        organization_id: orgId,
        name,
        tone,
        language,
        welcome_message: welcome,
        system_prompt: systemPrompt,
        handoff_enabled: handoffEnabled,
        updated_at: new Date().toISOString(),
      })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">AI Assistant</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Configure how your assistant behaves and responds</p>
        </div>
        <Button onClick={handleSave} disabled={saving} style={{ background: ac }}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Identity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ac + "20" }}>
              <Bot className="h-4 w-4" style={{ color: ac }} />
            </div>
            <div>
              <CardTitle className="text-base">Assistant Identity</CardTitle>
              <CardDescription>Name and persona settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Assistant Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aria, Max, Alex" />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize"
                  style={{
                    background: tone === t ? ac + "20" : "transparent",
                    borderColor: tone === t ? ac : "var(--border)",
                    color: tone === t ? ac : "var(--muted)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Primary Language</Label>
            <div className="flex flex-wrap gap-2">
              {LANG_OPTIONS.map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={{
                    background: language === l ? ac + "20" : "transparent",
                    borderColor: language === l ? ac : "var(--border)",
                    color: language === l ? ac : "var(--muted)",
                  }}
                >
                  {LANG_LABELS[l] ?? l}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ac + "20" }}>
              <MessageSquare className="h-4 w-4" style={{ color: ac }} />
            </div>
            <div>
              <CardTitle className="text-base">Messages</CardTitle>
              <CardDescription>Welcome message and system prompt</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Welcome Message</Label>
            <Textarea
              value={welcome}
              onChange={e => setWelcome(e.target.value)}
              rows={3}
              placeholder="Hello! How can I help you today?"
            />
            <p className="text-xs text-[var(--muted)]">Shown when a new conversation starts</p>
          </div>
          <Separator />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>System Prompt</Label>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => setSystemPrompt(vertical.sampleSystemPrompt(orgName))}
              >
                <RefreshCw className="h-3 w-3" />
                Reset to default
              </Button>
            </div>
            <Textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={8}
              className="font-mono text-xs"
              placeholder="You are a helpful AI assistant..."
            />
            <p className="text-xs text-[var(--muted)]">Advanced: customize the AI&apos;s core instructions</p>
          </div>
        </CardContent>
      </Card>

      {/* Behavior */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ac + "20" }}>
              <Sliders className="h-4 w-4" style={{ color: ac }} />
            </div>
            <div>
              <CardTitle className="text-base">Behavior</CardTitle>
              <CardDescription>Control how the assistant handles conversations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Human Handoff</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Allow AI to transfer conversations to your team</p>
            </div>
            <Switch checked={handoffEnabled} onCheckedChange={setHandoffEnabled} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Lead Qualification</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Automatically score and qualify {vertical.terminology.leads.toLowerCase()}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Qualification questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Qualification Questions</CardTitle>
          <CardDescription>
            Questions the AI will ask to qualify {vertical.terminology.leads.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {vertical.entityFields.slice(0, 4).map((field, i) => (
            <div
              key={field.key}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: ac + "20", color: ac }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] capitalize">{field.label}</p>
                <p className="text-xs text-[var(--muted)] capitalize">{field.type} · {field.required ? "Required" : "Optional"}</p>
              </div>
              <Badge variant={field.required ? "default" : "secondary"} className="shrink-0">
                {field.required ? "Required" : "Optional"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
