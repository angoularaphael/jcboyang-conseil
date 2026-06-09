import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/** Lit une variable serveur (runtime Vercel via process.env, sinon build Astro). */
export function readServerEnv(name: string): string | undefined {
  const fromProcess =
    typeof process !== "undefined" ? process.env[name] : undefined;
  const raw = (fromProcess || (import.meta.env as Record<string, string | undefined>)[name]) ?? "";
  const trimmed = String(raw).trim();
  return trimmed || undefined;
}

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = readServerEnv("SUPABASE_URL");
  const key = readServerEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("Variables Supabase manquantes (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return !!(readServerEnv("SUPABASE_URL") && readServerEnv("SUPABASE_SERVICE_ROLE_KEY"));
}
