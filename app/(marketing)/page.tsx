"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Bot,
  TrendingUp,
  MessageSquare,
  Star,
  Check,
  ChevronDown,
  Zap,
  Shield,
  Globe,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllVerticals } from "@/lib/verticals/registry"
import { PRICING_PLANS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

// ─── Hero Section ─────────────────────────────────────────────────────────
function Hero() {
  const [activeVertical, setActiveVertical] = useState(0)
  const verticals = getAllVerticals().filter(v => v.key !== "custom")

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="mesh-orb absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)" }}
        />
        <div
          className="mesh-orb-2 absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[1px] opacity-10"
          style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.8), transparent)" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[var(--muted)]">Now live — 8 industry verticals</span>
            <ArrowRight className="h-3.5 w-3.5 text-[var(--accent)]" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
          <span className="text-[var(--foreground)]">Your AI assistant,</span>
          <br />
          <span className="gradient-text">built for your business.</span>
        </h1>

        {/* Sub */}
        <p className="animate-fade-up animation-delay-200 mx-auto max-w-2xl text-lg md:text-xl text-[var(--muted)] leading-relaxed mb-10">
          AutoReserv deploys a fully branded AI agent for any industry in minutes.
          Handle leads, answer questions, and book appointments — 24/7, automatically.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up animation-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="xl" asChild className="group">
            <Link href="/signup">
              Start for free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/#demo">See live demo</Link>
          </Button>
        </div>

        {/* Industry switcher */}
        <div className="animate-fade-up animation-delay-400">
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest mb-4">Works for any industry</p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {verticals.map((v, i) => (
              <button
                key={v.key}
                onClick={() => setActiveVertical(i)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 border",
                  activeVertical === i
                    ? "border-transparent text-white shadow-lg"
                    : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted-2)] bg-[var(--surface)]"
                )}
                style={
                  activeVertical === i
                    ? { background: v.accentColor, boxShadow: `0 4px 20px ${v.accentGlow}` }
                    : {}
                }
              >
                <span>{v.icon}</span>
                {v.label}
              </button>
            ))}
          </div>

          {/* Active vertical preview card */}
          <div className="mt-8 mx-auto max-w-sm">
            <div
              className="rounded-2xl p-5 border text-left transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${verticals[activeVertical].accentGlow.replace("0.25", "0.08")} 0%, transparent 100%)`,
                borderColor: verticals[activeVertical].accentColor + "40",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: verticals[activeVertical].accentColor + "20" }}
                >
                  {verticals[activeVertical].icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--foreground)]">
                    {verticals[activeVertical].terminology.agent}
                  </div>
                  <div className="text-xs text-[var(--muted)]">{verticals[activeVertical].label}</div>
                </div>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] p-3 text-xs text-[var(--muted)] leading-relaxed">
                <span className="text-[var(--foreground)] font-medium">User:</span> Hi, I have a question about your{" "}
                {verticals[activeVertical].terminology.entities.toLowerCase()}.<br />
                <span className="mt-1 block">
                  <span style={{ color: verticals[activeVertical].accentColor }} className="font-medium">
                    {verticals[activeVertical].terminology.agent}:
                  </span>{" "}
                  Of course! I can help you with that. What would you like to know?
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">AI responding in 2.1s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats Section ─────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { label: "Businesses powered", value: "2,400+" },
    { label: "AI conversations / month", value: "1.2M+" },
    { label: "Avg. response time", value: "< 3s" },
    { label: "Industries supported", value: "8+" },
  ]
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black gradient-text">{s.value}</div>
              <div className="text-sm text-[var(--muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features Section ──────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Bot,
      title: "Vertical-Aware AI",
      description:
        "Your AI agent knows whether it's selling properties, booking hotel rooms, or registering patients — and adapts its language, questions, and flow accordingly.",
      color: "#7c3aed",
    },
    {
      icon: MessageSquare,
      title: "Omnichannel Inbox",
      description:
        "Handle conversations from WhatsApp, your website widget, and API channels in one unified dashboard. Never miss a lead.",
      color: "#0ea5e9",
    },
    {
      icon: TrendingUp,
      title: "AI Lead Scoring",
      description:
        "Each conversation is automatically analyzed and scores leads by intent, budget, and timeline. Your team only contacts the hottest prospects.",
      color: "#10b981",
    },
    {
      icon: Sparkles,
      title: "Instant Onboarding",
      description:
        "Input your business info, upload FAQs, connect WhatsApp, and go live — in under 10 minutes. No coding, no setup calls.",
      color: "#f59e0b",
    },
    {
      icon: Shield,
      title: "Multi-Tenant Isolation",
      description:
        "Built on Supabase RLS from day one. Every client's data is fully isolated. GDPR-ready architecture by default.",
      color: "#ec4899",
    },
    {
      icon: Globe,
      title: "Multilingual",
      description:
        "Your AI agent can respond in any language. Configure once, serve globally. Perfect for international agencies and chains.",
      color: "#ef4444",
    },
  ]

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] mb-4">
            Everything you need,
            <br />
            <span className="gradient-text">nothing you don't.</span>
          </h2>
          <p className="max-w-xl mx-auto text-[var(--muted)] text-lg">
            Purpose-built for service businesses. No bloat, no feature graveyard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card
              key={f.title}
              className="p-6 hover:border-[var(--muted-2)] transition-all duration-300 group"
            >
              <div
                className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ background: f.color + "15" }}
              >
                <f.icon className="h-6 w-6" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-[var(--foreground)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{f.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Verticals Showcase ────────────────────────────────────────────────────
function VerticalsShowcase() {
  const verticals = getAllVerticals()

  return (
    <section id="verticals" className="py-24 bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Industries</Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] mb-4">
            One platform.
            <br />
            <span className="gradient-text">Every industry.</span>
          </h2>
          <p className="max-w-xl mx-auto text-[var(--muted)] text-lg">
            Select your vertical and AutoReserv configures the entire experience — from AI prompts to dashboard terminology.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {verticals.map((v) => (
            <div
              key={v.key}
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 hover:border-transparent transition-all duration-300 cursor-pointer"
              style={{ ["--hover-color" as string]: v.accentColor }}
            >
              <div
                className="text-2xl w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300"
                style={{ background: v.accentColor + "15" }}
              >
                {v.icon}
              </div>
              <h3 className="font-bold text-[var(--foreground)] mb-1 group-hover:text-white transition-colors">
                {v.label}
              </h3>
              <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">{v.description}</p>
              <div className="flex flex-wrap gap-1">
                {[v.terminology.agent, v.terminology.entities, v.terminology.leads].map((term) => (
                  <span
                    key={term}
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: v.accentColor + "15", color: v.accentColor }}
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing Section ──────────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] mb-4">
            Simple, honest pricing.
            <br />
            <span className="gradient-text">Cancel anytime.</span>
          </h2>
          <p className="max-w-xl mx-auto text-[var(--muted)] text-lg">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border p-8 transition-all duration-300",
                plan.highlighted
                  ? "border-[var(--accent)] bg-[var(--surface)] shadow-2xl shadow-[var(--accent-glow)] scale-[1.02]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--muted-2)]"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white shadow-lg shadow-[var(--accent-glow)]">
                    <Star className="h-3 w-3" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-black text-[var(--foreground)]">{plan.name}</h3>
                <p className="text-sm text-[var(--muted)] mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[var(--foreground)]">${plan.price}</span>
                  <span className="text-[var(--muted)] text-sm">/ {plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-[var(--muted)]">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
                className="w-full"
                asChild
              >
                <Link href={plan.id === "enterprise" ? "/contact" : "/signup"}>
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-8">
          All prices in USD. Taxes may apply. Enterprise plans available with custom volume pricing.
        </p>
      </div>
    </section>
  )
}

// ─── FAQ Section ──────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Does it work for my industry?",
    a: "Yes. AutoReserv supports Real Estate, Hotels, Clinics, Law Firms, Restaurants, Beauty Salons, Education, and any custom business type. Each vertical comes pre-configured with the right terminology, AI prompts, and features.",
  },
  {
    q: "How do I connect WhatsApp?",
    a: "We support the Meta WhatsApp Business API and Twilio. After onboarding, follow the WhatsApp integration guide in Settings → Channels. Takes about 5 minutes.",
  },
  {
    q: "Can I use my own AI model?",
    a: "AutoReserv uses NVIDIA NIM AI by default (Llama 3.1 70B). You can switch to OpenAI, Anthropic, or any OpenAI-compatible provider via environment variables.",
  },
  {
    q: "Is my data isolated from other clients?",
    a: "Yes. We use Supabase Row Level Security (RLS) to ensure strict multi-tenant data isolation. Your data never touches other tenants' workspaces.",
  },
  {
    q: "Can I white-label this?",
    a: "Yes, with the Enterprise plan. You can use your own domain, logo, and completely remove AutoReserv branding.",
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 bg-[var(--surface)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h2 className="text-4xl font-black tracking-tight text-[var(--foreground)]">
            Common questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-[var(--foreground)]">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-[var(--muted)] transition-transform duration-200 shrink-0 ml-4",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-[var(--muted)] leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ──────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-12 md:p-20 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] opacity-20"
              style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.8), transparent)" }}
            />
          </div>

          <Badge variant="secondary" className="mb-6">Get started today</Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] mb-4">
            Ready to automate your
            <br />
            <span className="gradient-text">customer conversations?</span>
          </h2>
          <p className="text-[var(--muted)] text-lg mb-10 max-w-lg mx-auto">
            Join 2,400+ businesses using AutoReserv to convert more leads with AI.
            14-day free trial. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" asChild className="group">
              <Link href="/signup">
                Start your free trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <VerticalsShowcase />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  )
}
