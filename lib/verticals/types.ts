// ─── Vertical Config Types ─────────────────────────────────────────────────
export type VerticalKey =
  | "real_estate"
  | "hotel"
  | "clinic"
  | "law_firm"
  | "restaurant"
  | "beauty_salon"
  | "education"
  | "custom"

export interface EntityField {
  key: string
  label: string
  type: "text" | "number" | "currency" | "select" | "textarea" | "date" | "boolean"
  placeholder?: string
  options?: string[]
  required?: boolean
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  fields: EntityField[]
}

export interface VerticalFeatureFlags {
  listings: boolean
  bookings: boolean
  patients: boolean
  cases: boolean
  appointments: boolean
  orders: boolean
  inventory: boolean
  whatsapp: boolean
}

export interface VerticalTerminology {
  entity: string             // e.g. "Property" / "Room" / "Patient"
  entities: string           // plural
  entityVerb: string         // "List" / "Book" / "Register"
  lead: string               // "Lead" / "Guest" / "Patient"
  leads: string
  conversation: string       // "Conversation" / "Inquiry" / "Consultation"
  agent: string              // "AI Agent" / "Virtual Concierge" / "Health Bot"
  organization: string       // "Agency" / "Hotel" / "Clinic"
}

export interface VerticalConfig {
  key: VerticalKey
  label: string
  description: string
  icon: string
  accentColor: string
  accentGlow: string
  entityFields: EntityField[]
  onboardingSteps: OnboardingStep[]
  features: VerticalFeatureFlags
  terminology: VerticalTerminology
  assistantDefaultTone: "professional" | "friendly" | "empathetic" | "formal"
  assistantDefaultLanguage: string
  sampleSystemPrompt: (orgName: string) => string
}
