import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Organization, Profile } from "@/lib/types"

/**
 * Cached per-request: fetches authenticated user, profile, and organization.
 * Calling this multiple times in the same request returns the same promise (React cache).
 */
export const getSessionData = cache(async (): Promise<{
  user: { id: string; email?: string } | null
  profile: Profile | null
  org: Organization | null
}> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null, org: null }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  let org: Organization | null = null
  if (profile?.organization_id) {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.organization_id)
      .single()
    org = data as Organization | null
  }

  return {
    user: { id: user.id, email: user.email },
    profile: profile as Profile | null,
    org,
  }
})
