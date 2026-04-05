// scripts/setup-stripe.mjs
// Run once to create Stripe products and prices, then updates .env.local automatically
// Usage: node scripts/setup-stripe.mjs

import Stripe from "stripe"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local")
const envContent = fs.readFileSync(envPath, "utf-8")

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=(.+)$`, "m"))
  return match ? match[1].trim() : null
}

const secretKey = getEnvVar("STRIPE_SECRET_KEY")
if (!secretKey || secretKey.startsWith("sk_test_YOUR")) {
  console.error("❌ STRIPE_SECRET_KEY not set in .env.local")
  process.exit(1)
}

const stripe = new Stripe(secretKey, { apiVersion: "2025-01-27.acacia" })

const PLANS = [
  {
    id: "starter",
    name: "AutoReserv Starter",
    description: "Perfect for solo agents getting started",
    monthly_usd: 4900,   // $49.00
    yearly_usd: 39200,   // $392.00 (20% off)
  },
  {
    id: "pro",
    name: "AutoReserv Pro",
    description: "For growing agencies and teams",
    monthly_usd: 9900,   // $99.00
    yearly_usd: 79200,   // $792.00 (20% off)
  },
  {
    id: "enterprise",
    name: "AutoReserv Enterprise",
    description: "For large agencies and franchises",
    monthly_usd: 29900,  // $299.00
    yearly_usd: 239200,  // $2,392.00 (20% off)
  },
]

console.log("🚀 Creating Stripe products and prices...\n")

const priceIds = {}

for (const plan of PLANS) {
  process.stdout.write(`  Creating ${plan.name}... `)

  // Create product
  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: { plan_id: plan.id },
  })

  // Monthly price
  const monthly = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: plan.monthly_usd,
    recurring: { interval: "month" },
    nickname: `${plan.name} Monthly`,
    metadata: { plan_id: plan.id, period: "monthly" },
  })

  // Yearly price
  const yearly = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: plan.yearly_usd,
    recurring: { interval: "year" },
    nickname: `${plan.name} Yearly`,
    metadata: { plan_id: plan.id, period: "yearly" },
  })

  priceIds[plan.id] = { monthly: monthly.id, yearly: yearly.id }
  console.log(`✅`)
}

console.log("\n📝 Updating .env.local with price IDs...")

let updatedEnv = envContent
for (const [planId, ids] of Object.entries(priceIds)) {
  const upper = planId.toUpperCase()
  updatedEnv = updatedEnv.replace(
    new RegExp(`STRIPE_PRICE_${upper}_MONTHLY=.*`),
    `STRIPE_PRICE_${upper}_MONTHLY=${ids.monthly}`
  )
  updatedEnv = updatedEnv.replace(
    new RegExp(`STRIPE_PRICE_${upper}_YEARLY=.*`),
    `STRIPE_PRICE_${upper}_YEARLY=${ids.yearly}`
  )
}

fs.writeFileSync(envPath, updatedEnv)

console.log("\n✅ Done! Price IDs written to .env.local:\n")
for (const [planId, ids] of Object.entries(priceIds)) {
  console.log(`  ${planId}:`)
  console.log(`    monthly: ${ids.monthly}`)
  console.log(`    yearly:  ${ids.yearly}`)
}
console.log("\n🎉 Stripe setup complete!")
