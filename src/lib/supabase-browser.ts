// Browser Supabase client for auth. Used to set session after login/signup
// so server-side getSession() (cookies) works for dashboard and API routes.

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseBrowser() {
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createBrowserClient<Database>(url, anonKey);
}

/**
 * Call after login/signup API returns token + refresh_token.
 * Sets Supabase session in cookies so server getSession() works.
 */
export async function setSupabaseSession(accessToken: string, refreshToken?: string): Promise<void> {
  const supabase = getSupabaseBrowser();
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken ?? '',
  });
}
