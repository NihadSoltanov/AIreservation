import type { VerticalConfig, VerticalKey } from "./types"

// ─── Vertical Registry ─────────────────────────────────────────────────────
const VERTICALS: Record<VerticalKey, VerticalConfig> = {
  real_estate: {
    key: "real_estate",
    label: "Real Estate",
    description: "For agencies, agents & property managers",
    icon: "🏠",
    accentColor: "#7c3aed",
    accentGlow: "rgba(124,58,237,0.25)",
    terminology: {
      entity: "Property",
      entities: "Properties",
      entityVerb: "List",
      lead: "Lead",
      leads: "Leads",
      conversation: "Inquiry",
      agent: "Property AI Agent",
      organization: "Agency",
    },
    features: {
      listings: true, bookings: false, patients: false, cases: false,
      appointments: true, orders: false, inventory: false, whatsapp: true,
    },
    assistantDefaultTone: "professional",
    assistantDefaultLanguage: "en",
    sampleSystemPrompt: (org) =>
      `You are a helpful AI agent for ${org}, a real estate agency. Help prospects find the right property, answer questions about listings, and qualify leads for the team.`,
    entityFields: [
      { key: "title", label: "Property Title", type: "text", required: true, placeholder: "e.g. Modern 3BR in Downtown" },
      { key: "price", label: "Price", type: "currency", required: true, placeholder: "500000" },
      { key: "location", label: "Location", type: "text", required: true, placeholder: "Istanbul, Besiktas" },
      { key: "type", label: "Type", type: "select", required: true, options: ["Apartment", "Villa", "Office", "Land", "Commercial"] },
      { key: "bedrooms", label: "Bedrooms", type: "number", placeholder: "3" },
      { key: "bathrooms", label: "Bathrooms", type: "number", placeholder: "2" },
      { key: "area_m2", label: "Area (m²)", type: "number", placeholder: "120" },
      { key: "status", label: "Status", type: "select", options: ["Available", "Under Offer", "Sold", "Rented"] },
      { key: "description", label: "Description", type: "textarea", placeholder: "Describe the property..." },
    ],
    onboardingSteps: [
      {
        id: "company", title: "Your Agency", description: "Tell us about your real estate agency",
        fields: [
          { key: "name", label: "Agency Name", type: "text", required: true },
          { key: "phone", label: "Phone / WhatsApp", type: "text", required: true },
          { key: "areas", label: "Service Areas", type: "text", placeholder: "e.g. Istanbul, Ankara" },
          { key: "license", label: "License Number", type: "text" },
        ],
      },
      {
        id: "assistant", title: "Your AI Agent", description: "Configure how your AI property agent behaves",
        fields: [
          { key: "agent_name", label: "Agent Name", type: "text", placeholder: "e.g. Alex" },
          { key: "tone", label: "Tone", type: "select", options: ["Professional", "Friendly", "Formal"] },
          { key: "languages", label: "Languages", type: "text", placeholder: "English, Turkish" },
          { key: "handoff_msg", label: "Handoff Message", type: "textarea", placeholder: "Message when escalating to human..." },
        ],
      },
    ],
  },

  hotel: {
    key: "hotel",
    label: "Hotel & Hospitality",
    description: "Hotels, resorts, boutique stays & Airbnbs",
    icon: "🏨",
    accentColor: "#0ea5e9",
    accentGlow: "rgba(14,165,233,0.25)",
    terminology: {
      entity: "Room",
      entities: "Rooms",
      entityVerb: "Book",
      lead: "Guest",
      leads: "Guests",
      conversation: "Inquiry",
      agent: "Virtual Concierge",
      organization: "Hotel",
    },
    features: {
      listings: true, bookings: true, patients: false, cases: false,
      appointments: true, orders: true, inventory: false, whatsapp: true,
    },
    assistantDefaultTone: "friendly",
    assistantDefaultLanguage: "en",
    sampleSystemPrompt: (org) =>
      `You are the virtual concierge for ${org}. Help guests with reservations, room queries, amenities, check-in/out info, and local recommendations.`,
    entityFields: [
      { key: "room_name", label: "Room Name", type: "text", required: true, placeholder: "e.g. Deluxe Ocean View Suite" },
      { key: "room_type", label: "Room Type", type: "select", required: true, options: ["Standard", "Deluxe", "Suite", "Family", "Presidential"] },
      { key: "price_per_night", label: "Price / Night", type: "currency", required: true },
      { key: "capacity", label: "Max Guests", type: "number", placeholder: "2" },
      { key: "floor", label: "Floor", type: "number" },
      { key: "view", label: "View", type: "select", options: ["Ocean", "Garden", "City", "Pool", "None"] },
      { key: "amenities", label: "Amenities", type: "text", placeholder: "WiFi, AC, Minibar..." },
      { key: "status", label: "Status", type: "select", options: ["Available", "Occupied", "Maintenance", "Reserved"] },
    ],
    onboardingSteps: [
      {
        id: "property", title: "Your Hotel", description: "Tell us about your property",
        fields: [
          { key: "name", label: "Hotel Name", type: "text", required: true },
          { key: "phone", label: "Front Desk Phone", type: "text", required: true },
          { key: "address", label: "Address", type: "text", required: true },
          { key: "stars", label: "Star Rating", type: "select", options: ["1", "2", "3", "4", "5"] },
        ],
      },
      {
        id: "assistant", title: "Virtual Concierge", description: "Configure your AI concierge",
        fields: [
          { key: "agent_name", label: "Concierge Name", type: "text", placeholder: "e.g. Sofia" },
          { key: "tone", label: "Tone", type: "select", options: ["Friendly", "Luxury", "Formal"] },
          { key: "checkin_time", label: "Check-in Time", type: "text", placeholder: "15:00" },
          { key: "checkout_time", label: "Check-out Time", type: "text", placeholder: "11:00" },
        ],
      },
    ],
  },

  clinic: {
    key: "clinic",
    label: "Clinic & Healthcare",
    description: "Medical clinics, dental, therapy & wellness",
    icon: "🏥",
    accentColor: "#10b981",
    accentGlow: "rgba(16,185,129,0.25)",
    terminology: {
      entity: "Service",
      entities: "Services",
      entityVerb: "Book",
      lead: "Patient",
      leads: "Patients",
      conversation: "Consultation",
      agent: "Health Assistant",
      organization: "Clinic",
    },
    features: {
      listings: true, bookings: false, patients: true, cases: false,
      appointments: true, orders: false, inventory: false, whatsapp: true,
    },
    assistantDefaultTone: "empathetic",
    assistantDefaultLanguage: "en",
    sampleSystemPrompt: (org) =>
      `You are a compassionate health assistant for ${org}. Help patients book appointments, understand available services, and answer general health questions. Never provide medical diagnoses.`,
    entityFields: [
      { key: "service_name", label: "Service Name", type: "text", required: true, placeholder: "e.g. General Consultation" },
      { key: "category", label: "Category", type: "select", options: ["Consultation", "Procedure", "Test", "Therapy", "Cosmetic"] },
      { key: "duration_min", label: "Duration (min)", type: "number", placeholder: "30" },
      { key: "price", label: "Price", type: "currency" },
      { key: "doctor", label: "Doctor / Specialist", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    onboardingSteps: [
      {
        id: "clinic", title: "Your Clinic", description: "Tell us about your practice",
        fields: [
          { key: "name", label: "Clinic Name", type: "text", required: true },
          { key: "phone", label: "Phone / WhatsApp", type: "text", required: true },
          { key: "specialty", label: "Specialty", type: "text", placeholder: "e.g. General Practice, Dental" },
          { key: "address", label: "Address", type: "text" },
        ],
      },
      {
        id: "assistant", title: "Health Assistant", description: "Configure your AI health assistant",
        fields: [
          { key: "agent_name", label: "Assistant Name", type: "text", placeholder: "e.g. Mia" },
          { key: "disclaimer", label: "Disclaimer Message", type: "textarea", placeholder: "e.g. This assistant does not provide medical advice..." },
          { key: "working_hours", label: "Working Hours", type: "text", placeholder: "Mon-Fri 09:00-18:00" },
        ],
      },
    ],
  },

  law_firm: {
    key: "law_firm",
    label: "Law Firm",
    description: "Legal offices & individual practitioners",
    icon: "⚖️",
    accentColor: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.25)",
    terminology: {
      entity: "Practice Area",
      entities: "Practice Areas",
      entityVerb: "Consult",
      lead: "Client",
      leads: "Clients",
      conversation: "Intake",
      agent: "Legal Intake Bot",
      organization: "Law Firm",
    },
    features: {
      listings: true, bookings: false, patients: false, cases: true,
      appointments: true, orders: false, inventory: false, whatsapp: true,
    },
    assistantDefaultTone: "formal",
    assistantDefaultLanguage: "en",
    sampleSystemPrompt: (org) =>
      `You are a professional intake assistant for ${org}. Help potential clients understand services, collect basic case information, and schedule consultations. Never provide legal advice.`,
    entityFields: [
      { key: "area", label: "Practice Area", type: "text", required: true, placeholder: "e.g. Real Estate Law" },
      { key: "category", label: "Category", type: "select", options: ["Corporate", "Family", "Criminal", "Civil", "Property", "Immigration", "Tax", "Labor"] },
      { key: "lawyers", label: "Lead Attorney", type: "text" },
      { key: "consultation_fee", label: "Consultation Fee", type: "currency" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    onboardingSteps: [
      {
        id: "firm", title: "Your Firm", description: "Tell us about your law practice",
        fields: [
          { key: "name", label: "Firm Name", type: "text", required: true },
          { key: "phone", label: "Phone / WhatsApp", type: "text", required: true },
          { key: "bar_number", label: "Bar Number", type: "text" },
          { key: "jurisdiction", label: "Jurisdiction", type: "text", placeholder: "e.g. Istanbul Bar" },
        ],
      },
      {
        id: "assistant", title: "Intake Assistant", description: "Configure your AI intake bot",
        fields: [
          { key: "agent_name", label: "Assistant Name", type: "text", placeholder: "e.g. Lex" },
          { key: "disclaimer", label: "Legal Disclaimer", type: "textarea" },
          { key: "intake_questions", label: "Intake Questions", type: "textarea", placeholder: "Questions to ask new clients..." },
        ],
      },
    ],
  },

  restaurant: {
    key: "restaurant",
    label: "Restaurant & Cafe",
    description: "Restaurants, cafes, bars & food delivery",
    icon: "🍽️",
    accentColor: "#ef4444",
    accentGlow: "rgba(239,68,68,0.25)",
    terminology: {
      entity: "Menu Item",
      entities: "Menu",
      entityVerb: "Order",
      lead: "Customer",
      leads: "Customers",
      conversation: "Order / Inquiry",
      agent: "Waiter Bot",
      organization: "Restaurant",
    },
    features: {
      listings: true, bookings: true, patients: false, cases: false,
      appointments: false, orders: true, inventory: true, whatsapp: true,
    },
    assistantDefaultTone: "friendly",
    assistantDefaultLanguage: "en",
    sampleSystemPrompt: (org) =>
      `You are the friendly waiter bot for ${org}. Help customers browse the menu, take orders, answer questions about ingredients and allergens, and manage reservations.`,
    entityFields: [
      { key: "name", label: "Item Name", type: "text", required: true, placeholder: "e.g. Truffle Pasta" },
      { key: "category", label: "Category", type: "select", options: ["Appetizer", "Main", "Dessert", "Drink", "Special"] },
      { key: "price", label: "Price", type: "currency", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "allergens", label: "Allergens", type: "text", placeholder: "Gluten, Nuts..." },
      { key: "available", label: "Available", type: "boolean" },
    ],
    onboardingSteps: [
      {
        id: "restaurant", title: "Your Restaurant", description: "Tell us about your venue",
        fields: [
          { key: "name", label: "Restaurant Name", type: "text", required: true },
          { key: "phone", label: "Phone / WhatsApp", type: "text", required: true },
          { key: "cuisine", label: "Cuisine Type", type: "text", placeholder: "e.g. Turkish, Italian" },
          { key: "delivery", label: "Delivery Available", type: "boolean" },
        ],
      },
      {
        id: "assistant", title: "Waiter Bot", description: "Configure your AI waiter",
        fields: [
          { key: "agent_name", label: "Bot Name", type: "text", placeholder: "e.g. Carlo" },
          { key: "welcome_message", label: "Welcome Message", type: "textarea" },
          { key: "opening_hours", label: "Opening Hours", type: "text", placeholder: "Daily 12:00-24:00" },
        ],
      },
    ],
  },

  beauty_salon: {
    key: "beauty_salon",
    label: "Beauty & Wellness",
    description: "Hair salons, spas, nail studios & barbershops",
    icon: "💅",
    accentColor: "#ec4899",
    accentGlow: "rgba(236,72,153,0.25)",
    terminology: {
      entity: "Service",
      entities: "Services",
      entityVerb: "Book",
      lead: "Client",
      leads: "Clients",
      conversation: "Booking Inquiry",
      agent: "Beauty Assistant",
      organization: "Salon",
    },
    features: {
      listings: true, bookings: false, patients: false, cases: false,
      appointments: true, orders: false, inventory: true, whatsapp: true,
    },
    assistantDefaultTone: "friendly",
    assistantDefaultLanguage: "en",
    sampleSystemPrompt: (org) =>
      `You are a warm and helpful booking assistant for ${org}. Help clients browse services, book appointments, and answer questions about treatments and staff availability.`,
    entityFields: [
      { key: "service_name", label: "Service Name", type: "text", required: true, placeholder: "e.g. Balayage Highlights" },
      { key: "category", label: "Category", type: "select", options: ["Hair", "Nails", "Skin", "Makeup", "Massage", "Waxing", "Brows"] },
      { key: "duration_min", label: "Duration (min)", type: "number" },
      { key: "price", label: "Price", type: "currency", required: true },
      { key: "stylist", label: "Stylist / Therapist", type: "text" },
    ],
    onboardingSteps: [
      {
        id: "salon", title: "Your Salon", description: "Tell us about your venue",
        fields: [
          { key: "name", label: "Salon Name", type: "text", required: true },
          { key: "phone", label: "Phone / WhatsApp", type: "text", required: true },
          { key: "specialties", label: "Specialties", type: "text", placeholder: "Hair, Nails, Skincare..." },
        ],
      },
      {
        id: "assistant", title: "Beauty Assistant", description: "Configure your AI booking assistant",
        fields: [
          { key: "agent_name", label: "Assistant Name", type: "text", placeholder: "e.g. Luna" },
          { key: "welcome_message", label: "Welcome Message", type: "textarea" },
        ],
      },
    ],
  },

  education: {
    key: "education",
    label: "Education & Training",
    description: "Tutoring centers, online courses & academies",
    icon: "🎓",
    accentColor: "#3b82f6",
    accentGlow: "rgba(59,130,246,0.25)",
    terminology: {
      entity: "Course",
      entities: "Courses",
      entityVerb: "Enroll",
      lead: "Student",
      leads: "Students",
      conversation: "Enrollment Inquiry",
      agent: "Academic Advisor Bot",
      organization: "Academy",
    },
    features: {
      listings: true, bookings: false, patients: false, cases: false,
      appointments: true, orders: false, inventory: false, whatsapp: true,
    },
    assistantDefaultTone: "friendly",
    assistantDefaultLanguage: "en",
    sampleSystemPrompt: (org) =>
      `You are a helpful academic advisor for ${org}. Guide prospective students through available courses, enrollment requirements, pricing, and schedules.`,
    entityFields: [
      { key: "course_name", label: "Course Name", type: "text", required: true },
      { key: "level", label: "Level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "All Levels"] },
      { key: "duration", label: "Duration", type: "text", placeholder: "8 weeks" },
      { key: "price", label: "Price", type: "currency", required: true },
      { key: "instructor", label: "Instructor", type: "text" },
      { key: "schedule", label: "Schedule", type: "text", placeholder: "Mon/Wed 18:00-20:00" },
      { key: "format", label: "Format", type: "select", options: ["In-Person", "Online", "Hybrid"] },
    ],
    onboardingSteps: [
      {
        id: "academy", title: "Your Academy", description: "Tell us about your institution",
        fields: [
          { key: "name", label: "Academy Name", type: "text", required: true },
          { key: "phone", label: "Phone / WhatsApp", type: "text", required: true },
          { key: "subjects", label: "Subject Areas", type: "text", placeholder: "Math, Science, Languages..." },
          { key: "age_range", label: "Target Age Range", type: "text", placeholder: "16-25" },
        ],
      },
      {
        id: "assistant", title: "Academic Advisor", description: "Configure your AI advisor",
        fields: [
          { key: "agent_name", label: "Advisor Name", type: "text", placeholder: "e.g. Max" },
          { key: "welcome_message", label: "Welcome Message", type: "textarea" },
          { key: "enrollment_question", label: "Key Enrollment Question", type: "textarea", placeholder: "What should the AI ask first?" },
        ],
      },
    ],
  },

  custom: {
    key: "custom",
    label: "Custom Business",
    description: "Any other business type — fully configurable",
    icon: "⚡",
    accentColor: "#8b5cf6",
    accentGlow: "rgba(139,92,246,0.25)",
    terminology: {
      entity: "Item",
      entities: "Items",
      entityVerb: "Add",
      lead: "Lead",
      leads: "Leads",
      conversation: "Conversation",
      agent: "AI Assistant",
      organization: "Business",
    },
    features: {
      listings: true, bookings: false, patients: false, cases: false,
      appointments: true, orders: false, inventory: false, whatsapp: true,
    },
    assistantDefaultTone: "professional",
    assistantDefaultLanguage: "en",
    sampleSystemPrompt: (org) =>
      `You are a helpful AI assistant for ${org}. Assist visitors with their questions, collect information, and connect them with the team.`,
    entityFields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "price", label: "Price", type: "currency" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
    ],
    onboardingSteps: [
      {
        id: "business", title: "Your Business", description: "Tell us about your organization",
        fields: [
          { key: "name", label: "Business Name", type: "text", required: true },
          { key: "phone", label: "Phone / WhatsApp", type: "text", required: true },
          { key: "industry", label: "Industry", type: "text", placeholder: "e.g. Logistics, Tech, Retail..." },
          { key: "website", label: "Website", type: "text" },
        ],
      },
      {
        id: "assistant", title: "AI Assistant", description: "Configure your AI assistant",
        fields: [
          { key: "agent_name", label: "Assistant Name", type: "text", placeholder: "e.g. Aria" },
          { key: "welcome_message", label: "Welcome Message", type: "textarea" },
          { key: "goal", label: "Primary Goal", type: "textarea", placeholder: "What should the AI do for visitors?" },
        ],
      },
    ],
  },
}

export function getVertical(key: VerticalKey): VerticalConfig {
  return VERTICALS[key]
}

export function getAllVerticals(): VerticalConfig[] {
  return Object.values(VERTICALS)
}

export const DEFAULT_VERTICAL: VerticalKey = "real_estate"
