import type { Metadata } from "next"
import { getSessionData } from "@/lib/data/session"
import { createClient } from "@/lib/supabase/server"
import KnowledgeEditor from "@/components/dashboard/KnowledgeEditor"
import type { KnowledgeItem } from "@/lib/types"

export const metadata: Metadata = { title: "Knowledge Base" }

export default async function KnowledgePage() {
  const { org } = await getSessionData()

  let items: KnowledgeItem[] = []
  if (org) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false })
    items = (data ?? []) as KnowledgeItem[]
  }

  return (
    <KnowledgeEditor
      initialItems={items}
      orgId={org?.id ?? null}
      verticalKey={org?.vertical ?? "custom"}
    />
  )
}


type Tab = "faqs" | "docs"
