import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;
let didInit = false;

/** Use when you can handle a missing service key (e.g. auth helpers). */
export function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  if (!didInit) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    didInit = true;
  }
  return cached;
}

/**
 * Same client as getAdminClient(), but throws if env is missing.
 * Prefer calling missingSupabaseServerEnvResponse() in route handlers first.
 */
export const adminClient: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getAdminClient();
    if (!client) {
      throw new Error(
        'Supabase admin client unavailable: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.'
      );
    }
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(client) : value;
  },
});
