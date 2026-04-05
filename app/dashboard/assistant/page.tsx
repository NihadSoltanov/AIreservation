"use client"

import { useState } from "react"
import { Bot, Save, RefreshCw, Sliders, MessageSquare, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { MOCK_ASSISTANT, MOCK_ORG } from "@/lib/mock-data"
import { getVertical } from "@/lib/verticals/registry"

const TONE_OPTIONS: Array<"professional" | "friendly" | "empathetic" | "formal"> = ["professional", "friendly", "empathetic", "formal"]
const LANG_OPTIONS = ["English", "Turkish", "Spanish", "French", "Arabic", "German", "Portuguese"]

export default function AssistantPage() {
  const vertical = getVertical(MOCK_ORG.vertical)
  const ac = vertical.accentColor

  const [name, setName] = useState(MOCK_ASSISTANT.name)
  const [tone, setTone] = useState(MOCK_ASSISTANT.tone)
  const [language, setLanguage] = useState(MOCK_ASSISTANT.language)
  const [welcome, setWelcome] = useState(MOCK_ASSISTANT.welcome_message)
  const [systemPrompt, setSystemPrompt] = useState(MOCK_ASSISTANT.system_prompt)
  const [handoffEnabled, setHandoffEnabled] = useState(MOCK_ASSISTANT.handoff_enabled)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">AI Assistant</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Configure how your assistant behaves and responds
          </p>
        </div>
        <Button onClick={handleSave} style={{ background: ac }}>
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
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
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Aria, Max, Alex"
            />
          </div>

          {/* Tone selector */}
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

          {/* Language selector */}
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
                  {l}
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
                onClick={() => setSystemPrompt(vertical.sampleSystemPrompt(MOCK_ORG.name))}
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
            <p className="text-xs text-[var(--muted)]">
              Advanced: customize the AI's core instructions
            </p>
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
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Allow AI to transfer conversations to your team
              </p>
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

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Smart Suggestions</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Show quick reply suggestions to visitors
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
                <p className="text-sm font-medium text-[var(--foreground)] capitalize">
                  {field.label}
                </p>
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
