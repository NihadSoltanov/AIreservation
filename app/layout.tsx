import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: {
    default: "AutoReserv — AI Assistant Platform for Every Business",
    template: "%s | AutoReserv",
  },
  description:
    "AutoReserv is a white-label AI assistant SaaS platform for real estate, hotels, clinics, law firms, restaurants, and more. Automate leads, conversations, and bookings with AI.",
  keywords: ["AI assistant", "SaaS", "real estate AI", "hotel bot", "clinic chatbot", "lead automation"],
  openGraph: {
    title: "AutoReserv — AI Assistant Platform",
    description: "Deploy a branded AI assistant for your business in minutes.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}

