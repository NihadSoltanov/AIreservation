import type { Metadata } from "next"
import { getSessionData } from "@/lib/data/session"
import { createClient } from "@/lib/supabase/server"
import BillingPanel from "@/components/dashboard/BillingPanel"
import type { Subscription } from "@/lib/types"

export const metadata: Metadata = { title: "Billing" }

export default async function BillingPage() {
  const { org } = await getSessionData()

  let subscription: Subscription | null = null
  if (org) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("organization_id", org.id)
      .single()
    subscription = data as Subscription | null
  }

  return <BillingPanel org={org} subscription={subscription} />
}
