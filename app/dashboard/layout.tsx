import type { Metadata } from "next"
import { redirect } from "next/navigation"
import DashboardSidebar from "@/components/dashboard/Sidebar"
import DashboardTopbar from "@/components/dashboard/Topbar"
import { getSessionData } from "@/lib/data/session"
import { getVertical } from "@/lib/verticals/registry"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, org } = await getSessionData()

  if (!user) redirect("/login")

  const vertical = getVertical(org?.vertical ?? "custom")

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        "--vertical-accent": vertical.accentColor,
        "--vertical-accent-glow": vertical.accentGlow,
      } as React.CSSProperties}
    >
      <DashboardSidebar org={org} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar org={org} user={profile} />
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
