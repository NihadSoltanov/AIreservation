# AIreservation — AutoReserv

> AI-powered assistant platform for every business. Deploy a branded conversational AI in minutes — for real estate, hotels, clinics, law firms, restaurants, salons, education, and more.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (Postgres + Auth + RLS)
- **NVIDIA NIM AI** (`qwen/qwen3.5-122b-a10b` with thinking mode)
- **Stripe** (subscription billing)
- **WhatsApp Cloud API** (Meta)
- **Tailwind CSS v4** (dark theme design system)
- **Vercel** (deployment)

## Supported Industries

| Vertical | AI Persona |
|---|---|
| Real Estate | Property Assistant |
| Hotel | Virtual Concierge |
| Clinic | Health Assistant |
| Law Firm | Legal Assistant |
| Restaurant | Reservations Bot |
| Beauty Salon | Booking Assistant |
| Education | Learning Guide |
| Custom | Configurable |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local

# 3. Run Supabase migration
# Open supabase/migrations/001_initial_schema.sql in Supabase SQL Editor and run it

# 4. Create Stripe products (first time only)
node scripts/setup-stripe.mjs

# 5. Start development server
npm run dev
```

## Development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
