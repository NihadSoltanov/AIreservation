// scripts/setup-vercel-env.mjs
// Uploads all .env.local variables to Vercel project
// Usage: VERCEL_TOKEN=xxx node scripts/setup-vercel-env.mjs
// Get your token at: https://vercel.com/account/tokens

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Get token from arg or env
const token = process.env.VERCEL_TOKEN
if (!token) {
  console.error("❌ Set VERCEL_TOKEN env var. Get it from: https://vercel.com/account/tokens")
  console.error("   Usage: VERCEL_TOKEN=your_token node scripts/setup-vercel-env.mjs")
  process.exit(1)
}

// Read .env.local
const envPath = path.join(__dirname, "..", ".env.local")
const envContent = fs.readFileSync(envPath, "utf-8")

// Parse key=value pairs (skip comments and empty lines)
const vars = []
for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  const value = trimmed.slice(eqIdx + 1).trim()
  if (key && value) vars.push({ key, value })
}

// Get project info from .vercel/project.json (set after `vercel link`)
const projectInfoPath = path.join(__dirname, "..", ".vercel", "project.json")
if (!fs.existsSync(projectInfoPath)) {
  console.error("❌ Project not linked to Vercel yet.")
  console.error("   Run this first: npx vercel link")
  process.exit(1)
}
const { projectId, orgId } = JSON.parse(fs.readFileSync(projectInfoPath, "utf-8"))

console.log(`🚀 Uploading ${vars.length} env vars to Vercel project...\n`)

let ok = 0
let skip = 0

for (const { key, value } of vars) {
  // Skip placeholder values
  if (value.includes("YOUR_") || value === "whsec_YOUR_WEBHOOK_SECRET") {
    console.log(`  ⏭  ${key} (skipped — placeholder value)`)
    skip++
    continue
  }

  const targets = key.startsWith("NEXT_PUBLIC_")
    ? ["production", "preview", "development"]
    : ["production", "preview"]

  const res = await fetch(
    `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${orgId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, value, type: "encrypted", target: targets }),
    }
  )

  if (res.ok) {
    console.log(`  ✅ ${key}`)
    ok++
  } else {
    const err = await res.json()
    // If var already exists (409), skip
    if (err.error?.code === "ENV_ALREADY_EXISTS") {
      console.log(`  ♻️  ${key} (already exists, skipped)`)
      skip++
    } else {
      console.log(`  ❌ ${key}: ${err.error?.message ?? JSON.stringify(err)}`)
    }
  }
}

console.log(`\n✅ Done: ${ok} added, ${skip} skipped`)
console.log("\n🎉 Vercel env vars synced! Trigger a redeploy for them to take effect.")
