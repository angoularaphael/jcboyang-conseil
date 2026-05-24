import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Variables Supabase manquantes (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return !!(import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_SERVICE_ROLE_KEY);
}
