import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { resolveSettings, type SiteSettings } from "@/lib/site-settings";

/** True when the store's database credentials are configured. */
export function hasSupabaseEnv() {
  return Boolean(
    (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL) &&
      (process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY),
  );
}

/** Publishable-key Supabase client for public (anon) reads inside server functions. */
export function getPublicClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;


  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Reads the single store_settings row, falling back to defaults. */
export async function fetchSettings(
  supabase: ReturnType<typeof getPublicClient>,
): Promise<SiteSettings> {
  const { data } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
  return resolveSettings(data);
}
