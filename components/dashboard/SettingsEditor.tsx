"use client"

import { useState } from "react"
import { Building2, Globe, Bell, Shield, Puzzle, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getVertical } from "@/lib/verticals/registry"
import { createClient } from "@/lib/supabase/client"
import type { Organization, Profile } from "@/lib/types"
import type { VerticalKey } from "@/lib/verticals/types"

const NAV_ITEMS = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "channels", label: "Channels", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "team", label: "Team", icon: Users },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Puzzle },
]

export default function SettingsEditor({
  org,
  user,
}: {
  org: Organization | null
  user: Profile | null
}) {
  const vertical = getVertical(org?.vertical ?? "custom")
  const ac = vertical.accentColor
  const [activeSection, setActiveSection] = useState("company")

  const [orgName, setOrgName] = useState(org?.name ?? "")
  const [website, setWebsite] = useState(org?.website ?? "")
  const [phone, setPhone] = useState(org?.phone ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!org) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from("organizations")
      .update({ name: orgName, website, phone })
      .eq("id", org.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Manage your account and workspace preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-44 shrink-0">
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left"
                style={{
                  background: activeSection === id ? ac + "15" : "transparent",
                  color: activeSection === id ? ac : "var(--muted)",
                  fontWeight: activeSection === id ? 600 : 400,
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "company" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Company Information</CardTitle>
                <CardDescription>Update your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Organization Name</Label>
                  <Input value={orgName} onChange={e => setOrgName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone / WhatsApp</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-sm text-[var(--foreground)] capitalize flex-1">
                      {(org?.vertical ?? "custom").replace(/_/g, " ")}
                    </span>
                    <Badge style={{ background: ac + "20", color: ac }}>{vertical.terminology.entity}</Badge>
                  </div>
                  <p className="text-xs text-[var(--muted)]">Contact support to change your industry vertical</p>
                </div>
                <Button onClick={handleSave} disabled={saving} style={{ background: ac }}>
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "channels" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Communication Channels</CardTitle>
                <CardDescription>Enable and configure where your AI responds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "WhatsApp", status: org?.whatsapp_number ? "connected" : "disconnected", desc: org?.whatsapp_number ? `Connected: ${org.whatsapp_number}` : "Connect via Meta Business API" },
                  { name: "Website Chat Widget", status: "connected", desc: "Embed on your website" },
                  { name: "Instagram DM", status: "disconnected", desc: "Coming soon" },
                  { name: "Facebook Messenger", status: "disconnected", desc: "Connect your Facebook page" },
                ].map(channel => (
                  <div key={channel.name} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{channel.name}</p>
                      <p className="text-xs text-[var(--muted)]">{channel.desc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={channel.status === "connected" ? "success" : "secondary"} className="capitalize">
                        {channel.status}
                      </Badge>
                      <Switch defaultChecked={channel.status === "connected"} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "New lead captured", desc: "When the AI qualifies a new lead", on: true },
                  { label: "Handoff request", desc: "When a visitor asks for a human agent", on: true },
                  { label: "Daily summary", desc: "Daily digest of leads and conversations", on: false },
                  { label: "Weekly report", desc: "Weekly performance analytics", on: true },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{n.label}</p>
                      <p className="text-xs text-[var(--muted)]">{n.desc}</p>
                    </div>
                    <Switch defaultChecked={n.on} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === "team" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Team Members</CardTitle>
                    <CardDescription>Manage who has access to your workspace</CardDescription>
                  </div>
                  <Button size="sm" style={{ background: ac }}>Invite</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {user && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: ac + "20", color: ac }}>
                        {(user.full_name ?? user.email ?? "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{user.full_name ?? "You"}</p>
                        <p className="text-xs text-[var(--muted)]">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Owner</Badge>
                  </div>
                )}
                <p className="text-xs text-[var(--muted)] pt-2">Invite team members to collaborate.</p>
              </CardContent>
            </Card>
          )}

          {activeSection === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security</CardTitle>
                <CardDescription>Protect your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">Two-Factor Authentication</p>
                    <p className="text-xs text-[var(--muted)]">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">Change Password</p>
                    <p className="text-xs text-[var(--muted)]">Update your login credentials</p>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "integrations" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Integrations</CardTitle>
                <CardDescription>Connect your tools and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Zapier", desc: "Automate workflows", connected: false },
                  { name: "Google Sheets", desc: "Sync leads to spreadsheets", connected: false },
                  { name: "HubSpot CRM", desc: "Push leads to HubSpot", connected: false },
                  { name: "Slack", desc: "Get notifications in Slack", connected: false },
                ].map(int => (
                  <div key={int.name} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{int.name}</p>
                      <p className="text-xs text-[var(--muted)]">{int.desc}</p>
                    </div>
                    <Button size="sm" variant="ghost" style={{ color: ac }}>Connect</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
