import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-only. Bypasses Row-Level Security — use ONLY after independently
// verifying the action is legitimate (e.g. a Razorpay signature check).
// Never import this into any client component or expose it to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
