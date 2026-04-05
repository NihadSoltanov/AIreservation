import type { Metadata } from "next"
import Link from "next/link"
import { Zap } from "lucide-react"

export const metadata: Metadata = { title: "Sign In" }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-[var(--foreground)]">
          Auto<span className="text-[var(--accent)]">Reserv</span>
        </span>
      </Link>
      {children}
    </div>
  )
}
