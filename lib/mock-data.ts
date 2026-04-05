import type { Organization, Lead, Conversation, Message, Entity, KnowledgeItem, AssistantConfig, Subscription } from "./types"

// ─── Mock Organization ─────────────────────────────────────────────────────
export const MOCK_ORG: Organization = {
  id: "org_demo_01",
  name: "Metropolis Properties",
  slug: "metropolis-properties",
  vertical: "real_estate",
  logo_url: undefined,
  phone: "+90 555 123 45 67",
  whatsapp_number: "+905551234567",
  address: "Levent, Istanbul",
  website: "metropolisproperties.com",
  timezone: "Europe/Istanbul",
  language: "en",
  accent_color: "#7c3aed",
  created_at: "2025-11-01T10:00:00Z",
  owner_id: "user_01",
  plan: "pro",
  plan_status: "active",
  config: {
    agent_name: "Alex",
    tone: "professional",
    working_hours: "Mon-Fri 09:00-18:00",
  },
}

// ─── Mock Leads ────────────────────────────────────────────────────────────
export const MOCK_LEADS: Lead[] = [
  {
    id: "lead_01",
    organization_id: "org_demo_01",
    name: "Emre Demir",
    email: "emre@email.com",
    phone: "+90 532 111 22 33",
    source: "whatsapp",
    status: "qualified",
    qualification_score: 82,
    qualification_summary: "Looking for 3BR apartment in Besiktas under $500K. Ready to visit this week.",
    created_at: "2026-04-04T09:15:00Z",
    updated_at: "2026-04-04T14:30:00Z",
  },
  {
    id: "lead_02",
    organization_id: "org_demo_01",
    name: "Sarah Mitchell",
    email: "sarah.m@example.com",
    phone: "+1 415 555 9988",
    source: "website",
    status: "contacted",
    qualification_score: 55,
    qualification_summary: "Interested in investment properties. Budget open. Not urgent.",
    created_at: "2026-04-03T11:20:00Z",
    updated_at: "2026-04-03T11:20:00Z",
  },
  {
    id: "lead_03",
    organization_id: "org_demo_01",
    name: "Murat Yılmaz",
    phone: "+90 543 777 88 99",
    source: "whatsapp",
    status: "new",
    created_at: "2026-04-05T07:05:00Z",
    updated_at: "2026-04-05T07:05:00Z",
  },
  {
    id: "lead_04",
    organization_id: "org_demo_01",
    name: "Julia Hoffman",
    email: "julia.h@corp.com",
    source: "manual",
    status: "converted",
    qualification_score: 95,
    qualification_summary: "Corporate relocation. Needed 5BR villa in Ulus. Deal closed.",
    created_at: "2026-03-20T10:00:00Z",
    updated_at: "2026-04-01T16:00:00Z",
  },
  {
    id: "lead_05",
    organization_id: "org_demo_01",
    name: "Ayşe Kaya",
    phone: "+90 501 333 44 55",
    source: "whatsapp",
    status: "lost",
    qualification_summary: "Wanted property outside budget range. Did not follow up.",
    created_at: "2026-03-15T13:00:00Z",
    updated_at: "2026-03-18T09:00:00Z",
  },
]

// ─── Mock Conversations ────────────────────────────────────────────────────
const MOCK_MESSAGES_1: Message[] = [
  { id: "m01", conversation_id: "conv_01", role: "user", content: "Merhaba, Besiktas'ta 3+1 daire arıyorum.", created_at: "2026-04-04T09:15:00Z" },
  { id: "m02", conversation_id: "conv_01", role: "assistant", content: "Merhaba! Besiktas'ta harika 3+1 seçeneklerimiz var. Bütçenizi ve tercih ettiğiniz fiyat aralığını paylaşabilir misiniz?", created_at: "2026-04-04T09:15:10Z" },
  { id: "m03", conversation_id: "conv_01", role: "user", content: "500,000 dolar civarı düşünüyorum.", created_at: "2026-04-04T09:16:00Z" },
  { id: "m04", conversation_id: "conv_01", role: "assistant", content: "Mükemmel! Bu bütçeyle Besiktas'ta birkaç güzel seçenek sunabilirim. Bu hafta bir ziyaret ayarlamamı ister misiniz?", created_at: "2026-04-04T09:16:15Z" },
]

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_01",
    organization_id: "org_demo_01",
    lead_id: "lead_01",
    status: "open",
    channel: "whatsapp",
    messages: MOCK_MESSAGES_1,
    summary: "Lead looking for 3BR in Besiktas ~$500K. Strong intent.",
    created_at: "2026-04-04T09:15:00Z",
    updated_at: "2026-04-04T14:30:00Z",
  },
  {
    id: "conv_02",
    organization_id: "org_demo_01",
    lead_id: "lead_02",
    status: "resolved",
    channel: "web",
    messages: [],
    summary: "Investment inquiry. Sent portfolio PDF.",
    created_at: "2026-04-03T11:20:00Z",
    updated_at: "2026-04-03T12:00:00Z",
  },
  {
    id: "conv_03",
    organization_id: "org_demo_01",
    lead_id: "lead_03",
    status: "handoff_requested",
    channel: "whatsapp",
    messages: [],
    summary: "Needs human agent. Complex request.",
    handoff_requested_at: "2026-04-05T07:30:00Z",
    created_at: "2026-04-05T07:05:00Z",
    updated_at: "2026-04-05T07:30:00Z",
  },
]

// ─── Mock Entities ─────────────────────────────────────────────────────────
export const MOCK_ENTITIES: Entity[] = [
  {
    id: "ent_01",
    organization_id: "org_demo_01",
    title: "Modern 3BR in Besiktas",
    status: "active",
    fields: { price: 485000, location: "Besiktas, Istanbul", type: "Apartment", bedrooms: 3, bathrooms: 2, area_m2: 145 },
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "ent_02",
    organization_id: "org_demo_01",
    title: "Luxury Villa in Ulus",
    status: "active",
    fields: { price: 1200000, location: "Ulus, Istanbul", type: "Villa", bedrooms: 5, bathrooms: 4, area_m2: 320 },
    created_at: "2026-02-05T10:00:00Z",
    updated_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "ent_03",
    organization_id: "org_demo_01",
    title: "Sea View Studio Karaköy",
    status: "inactive",
    fields: { price: 195000, location: "Karaköy, Istanbul", type: "Apartment", bedrooms: 0, bathrooms: 1, area_m2: 45 },
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2026-03-15T10:00:00Z",
  },
]

// ─── Mock FAQ/Knowledge ────────────────────────────────────────────────────
export const MOCK_KNOWLEDGE: KnowledgeItem[] = [
  { id: "kb_01", organization_id: "org_demo_01", type: "faq", question: "What documents are needed to buy a property?", answer: "You need a valid ID/passport, a Turkish tax number, and proof of funds.", created_at: "2026-01-15T10:00:00Z" },
  { id: "kb_02", organization_id: "org_demo_01", type: "faq", question: "Can foreigners buy property in Turkey?", answer: "Yes, foreign nationals can purchase property in Turkey with some restrictions. We can guide you through the process.", created_at: "2026-01-15T10:00:00Z" },
  { id: "kb_03", organization_id: "org_demo_01", type: "snippet", content: "Our agency specializes in luxury and mid-range residential properties in Istanbul's European side.", created_at: "2026-02-01T10:00:00Z" },
]

// ─── Mock Assistant Config ─────────────────────────────────────────────────
export const MOCK_ASSISTANT: AssistantConfig = {
  organization_id: "org_demo_01",
  name: "Alex",
  tone: "professional",
  language: "en",
  welcome_message: "Hi! I'm Alex, your property assistant at Metropolis Properties. How can I help you today?",
  system_prompt: "You are a professional real estate AI agent for Metropolis Properties. Help clients find properties, answer questions, and qualify leads.",
  handoff_enabled: true,
  handoff_message: "Let me connect you with one of our agents right away.",
  qualification_fields: ["budget", "location", "property_type", "timeline"],
  lead_score_enabled: true,
  updated_at: "2026-03-01T10:00:00Z",
}

// ─── Mock Subscription ─────────────────────────────────────────────────────
export const MOCK_SUBSCRIPTION: Subscription = {
  id: "sub_01",
  organization_id: "org_demo_01",
  plan: "pro",
  status: "active",
  current_period_start: "2026-04-01T00:00:00Z",
  current_period_end: "2026-05-01T00:00:00Z",
  usage_conversations: 143,
  usage_leads: 28,
  limit_conversations: 500,
  limit_leads: 100,
}

// ─── Dashboard KPI Stats ───────────────────────────────────────────────────
export const MOCK_STATS = {
  total_leads: 127,
  leads_this_month: 28,
  leads_growth: 14.3,
  total_conversations: 384,
  conversations_this_month: 143,
  conversations_growth: 22.1,
  conversion_rate: 18.5,
  avg_response_time_sec: 4.2,
  active_entities: 12,
}

// ─── Pricing Plans ─────────────────────────────────────────────────────────
export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    period: "month",
    description: "Perfect for solo agents getting started",
    features: [
      "1 AI Assistant",
      "Up to 50 leads / month",
      "200 conversations / month",
      "WhatsApp integration",
      "Basic analytics",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    period: "month",
    description: "For growing agencies and teams",
    features: [
      "3 AI Assistants",
      "Up to 500 leads / month",
      "Unlimited conversations",
      "WhatsApp + Web widget",
      "Advanced analytics",
      "Lead qualification AI",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    period: "month",
    description: "For large agencies and franchises",
    features: [
      "Unlimited AI Assistants",
      "Unlimited leads",
      "Unlimited conversations",
      "All channels",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "White-label option",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]
