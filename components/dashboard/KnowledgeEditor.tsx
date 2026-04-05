"use client"

import { useState } from "react"
import { BookOpen, Plus, Search, Trash2, Upload, FileText, HelpCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getVertical } from "@/lib/verticals/registry"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeTime } from "@/lib/utils"
import type { KnowledgeItem } from "@/lib/types"
import type { VerticalKey } from "@/lib/verticals/types"

type Tab = "faqs" | "docs"

export default function KnowledgeEditor({
  initialItems,
  orgId,
  verticalKey,
}: {
  initialItems: KnowledgeItem[]
  orgId: string | null
  verticalKey: VerticalKey
}) {
  const vertical = getVertical(verticalKey)
  const ac = vertical.accentColor

  const [tab, setTab] = useState<Tab>("faqs")
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [newQ, setNewQ] = useState("")
  const [newA, setNewA] = useState("")
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<KnowledgeItem[]>(initialItems)

  const faqs = items.filter(k =>
    k.type === "faq" &&
    (search === "" || k.question?.toLowerCase().includes(search.toLowerCase()) || (k.answer ?? "").toLowerCase().includes(search.toLowerCase()))
  )
  const docs = items.filter(k => k.type === "document")

  const handleAddFaq = async () => {
    if (!orgId || !newQ.trim() || !newA.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("knowledge_items")
      .insert({
        organization_id: orgId,
        type: "faq",
        question: newQ.trim(),
        answer: newA.trim(),
      })
      .select()
      .single()

    if (!error && data) {
      setItems(prev => [data as KnowledgeItem, ...prev])
      setNewQ("")
      setNewA("")
      setShowAdd(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!orgId) return
    const supabase = createClient()
    const { error } = await supabase.from("knowledge_items").delete().eq("id", id)
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">Knowledge Base</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Teach your AI assistant about your business</p>
        </div>
        <Button onClick={() => setShowAdd(true)} style={{ background: ac }}>
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--surface-2)] rounded-xl w-fit border border-[var(--border)]">
        {(["faqs", "docs"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
            style={{
              background: tab === t ? "var(--surface)" : "transparent",
              color: tab === t ? "var(--foreground)" : "var(--muted)",
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
            }}
          >
            {t === "faqs" ? "FAQs" : "Documents"}
          </button>
        ))}
      </div>

      {tab === "faqs" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search FAQs..." className="pl-10" />
          </div>

          {showAdd && (
            <Card className="border-dashed" style={{ borderColor: ac + "50" }}>
              <CardContent className="p-5 space-y-3">
                <div className="space-y-1.5">
                  <Label>Question</Label>
                  <Input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="What is your question?" />
                </div>
                <div className="space-y-1.5">
                  <Label>Answer</Label>
                  <Textarea value={newA} onChange={e => setNewA(e.target.value)} rows={3} placeholder="Write the answer here..." />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" style={{ background: ac }} onClick={handleAddFaq} disabled={saving || !newQ.trim() || !newA.trim()}>
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Save FAQ
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowAdd(false); setNewQ(""); setNewA("") }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {faqs.length ? faqs.map(faq => (
              <Card key={faq.id} className="group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: ac + "15" }}>
                        <HelpCircle className="h-3.5 w-3.5" style={{ color: ac }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{faq.question}</p>
                        <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{faq.answer}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[var(--muted)]">Added {formatRelativeTime(faq.created_at)}</span>
                          <Badge variant="secondary" className="text-xs">FAQ</Badge>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-[var(--muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="py-10 text-center">
                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-[var(--muted)]" />
                <p className="text-sm text-[var(--muted)]">No FAQs yet. Add common questions your customers ask.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "docs" && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-10 flex flex-col items-center gap-3 hover:border-[var(--accent)] transition-colors">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: ac + "15" }}>
              <Upload className="h-6 w-6" style={{ color: ac }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[var(--foreground)]">Upload documents</p>
              <p className="text-sm text-[var(--muted)] mt-1">PDF, TXT, DOCX up to 10MB</p>
            </div>
            <Button variant="outline" size="sm">Browse files</Button>
          </div>
          <div className="space-y-3">
            {docs.map(doc => (
              <Card key={doc.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: ac + "15" }}>
                      <FileText className="h-4 w-4" style={{ color: ac }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{doc.file_name ?? doc.content?.slice(0, 40) ?? "Document"}</p>
                      <p className="text-xs text-[var(--muted)]">Added {formatRelativeTime(doc.created_at)}</p>
                    </div>
                    <Badge variant="success">Indexed</Badge>
                    <button onClick={() => handleDelete(doc.id)} className="text-[var(--muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
