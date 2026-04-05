import type { Metadata } from "next"
import MarketingNav from "@/components/marketing/Nav"
import MarketingFooter from "@/components/marketing/Footer"

export const metadata: Metadata = {
  title: "AutoReserv — AI Assistant Platform for Every Business",
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
