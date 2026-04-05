import type { VerticalKey } from "./verticals/types"

// ─── Core SaaS Types ───────────────────────────────────────────────────────

export type SubscriptionPlan = "free" | "starter" | "pro" | "enterprise"
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled"
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost"
export type ConversationStatus = "open" | "resolved" | "handoff_requested" | "closed"
export type EntityStatus = "active" | "inactive" | "archived"

export interface Organization {
  id: string
  name: string
  slug: string
  vertical: VerticalKey
  logo_url?: string
  phone?: string
  whatsapp_number?: string
  address?: string
  website?: string
  timezone: string
  language: string
  accent_color: string
  created_at: string
  owner_id: string
  plan: SubscriptionPlan
  plan_status: SubscriptionStatus
  stripe_customer_id?: string
  config: Record<string, unknown>
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  organization_id?: string
  role: "owner" | "admin" | "member"
  created_at: string
}

export interface Entity {
  id: string
  organization_id: string
  title: string
  status: EntityStatus
  fields: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  source: "whatsapp" | "website" | "manual" | "api"
  status: LeadStatus
  qualification_score?: number
  qualification_summary?: string
  notes?: string
  assigned_to?: string
  entity_id?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  organization_id: string
  lead_id?: string
  status: ConversationStatus
  channel: "whatsapp" | "web" | "api"
  messages: Message[]
  summary?: string
  handoff_requested_at?: string
  created_at: string
  updated_at: string
}

export interface KnowledgeItem {
  id: string
  organization_id: string
  type: "faq" | "document" | "snippet"
  question?: string
  answer?: string
  content?: string
  file_name?: string
  created_at: string
}

export interface AssistantConfig {
  organization_id: string
  name: string
  tone: "professional" | "friendly" | "empathetic" | "formal"
  language: string
  welcome_message: string
  system_prompt: string
  handoff_enabled: boolean
  handoff_message: string
  qualification_fields: string[]
  lead_score_enabled: boolean
  updated_at: string
}

export interface Subscription {
  id: string
  organization_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripe_subscription_id?: string
  current_period_start: string
  current_period_end: string
  usage_conversations: number
  usage_leads: number
  limit_conversations: number
  limit_leads: number
}
