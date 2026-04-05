import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Server-side only: bypasses RLS, for internal operations like webhooks
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
