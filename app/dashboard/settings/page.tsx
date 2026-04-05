import type { Metadata } from "next"
import { getSessionData } from "@/lib/data/session"
import SettingsEditor from "@/components/dashboard/SettingsEditor"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const { org, profile } = await getSessionData()

  return <SettingsEditor org={org} user={profile} />
}
