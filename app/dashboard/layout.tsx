import type { Metadata } from "next"
import DashboardSidebar from "@/components/dashboard/Sidebar"
import DashboardTopbar from "@/components/dashboard/Topbar"
import { MOCK_ORG } from "@/lib/mock-data"
import { getVertical } from "@/lib/verticals/registry"

export const metadata: Metadata = { title: "Dashboard" }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const vertical = getVertical(MOCK_ORG.vertical)

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        "--vertical-accent": vertical.accentColor,
        "--vertical-accent-glow": vertical.accentGlow,
      } as React.CSSProperties}
    >
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
