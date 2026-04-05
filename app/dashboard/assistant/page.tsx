import type { Metadata } from "next"
import { getSessionData } from "@/lib/data/session"
import { createClient } from "@/lib/supabase/server"
import AssistantEditor from "@/components/dashboard/AssistantEditor"
import type { AssistantConfig } from "@/lib/types"

export const metadata: Metadata = { title: "AI Assistant" }

export default async function AssistantPage() {
  const { org } = await getSessionData()

  let config: AssistantConfig | null = null
  if (org) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("assistant_configs")
      .select("*")
      .eq("organization_id", org.id)
      .single()
    config = data as AssistantConfig | null
  }

  return (
    <AssistantEditor
      initialConfig={config}
      orgId={org?.id ?? null}
      verticalKey={org?.vertical ?? "custom"}
      orgName={org?.name ?? "Your Organization"}
    />
  )
}
