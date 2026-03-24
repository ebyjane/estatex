import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

/** True when public env vars are set (build-time inlined in Next). */
export function isSupabaseBrowserConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/**
 * Browser Supabase client (anon key). Use only with Storage RLS/policies that allow your users to upload
 * to the `properties` bucket — never put the service role key in the frontend.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseBrowserClient() must run in the browser');
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for listing media uploads.',
    );
  }
  if (!browserClient) {
    browserClient = createClient(url, anonKey);
  }
  return browserClient;
}
