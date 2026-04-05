import Link from "next/link"
import { Zap, Mail, ExternalLink } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const FOOTER_LINKS = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#verticals", label: "Industries" },
    { href: "/changelog", label: "Changelog" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/security", label: "Security" },
  ],
}

export default function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-[var(--foreground)]">
                Auto<span className="text-[var(--accent)]">Reserv</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--muted)] max-w-xs leading-relaxed">
              Deploy a branded AI assistant for your business in minutes. Works for any industry.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://x.com/autoreserv" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm flex items-center gap-1" aria-label="X (Twitter)">
                <ExternalLink className="h-4 w-4" />
                <span>X</span>
              </a>
              <a href="https://github.com/autoreserv" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm flex items-center gap-1" aria-label="GitHub">
                <ExternalLink className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              <a href="mailto:hello@autoreserv.com" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">{group}</h3>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} AutoReserv. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Built for real businesses. Powered by AI.
          </p>
        </div>
      </div>
    </footer>
  )
}
