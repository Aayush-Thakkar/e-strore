import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Clean and normalize the Supabase URL (strip trailing /rest/v1 or trailing slashes)
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseUrl = rawUrl
  .trim()
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");

export const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("https://") &&
  supabaseAnonKey.length > 20
);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn("Failed to initialize Supabase client:", err);
    client = null;
  }
}

export const supabase = client;

export function getSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(
      "Supabase client is not configured. Please verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return client;
}
