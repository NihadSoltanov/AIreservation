import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { planId, period = "monthly", organizationId } = body as {
      planId: string
      period?: "monthly" | "yearly"
      organizationId: string
    }

    if (!planId || !organizationId) {
      return NextResponse.json({ error: "planId and organizationId are required" }, { status: 400 })
    }

    const PRICE_IDS: Record<string, Record<string, string>> = {
      starter: {
        monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
        yearly: process.env.STRIPE_PRICE_STARTER_YEARLY ?? "",
      },
      pro: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
        yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
      },
      enterprise: {
        monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "",
        yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY ?? "",
      },
    }

    const priceId = PRICE_IDS[planId]?.[period]
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan or period" }, { status: 400 })
    }

    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { organizationId },
      success_url: `${baseUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[Stripe] Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
