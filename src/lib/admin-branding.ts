import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdminBranding = {
  storeName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
};

/** Reads store branding (name, logo, favicon) and keeps the admin tab icon/title in sync. */
export function useAdminBranding(): AdminBranding {
  const { data } = useQuery({
    queryKey: ["admin", "branding"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AdminBranding> => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("store_name, logo_url, favicon_url")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      const row = (data ?? {}) as Record<string, unknown>;
      return {
        storeName: (row["store_name"] as string) || "Store",
        logoUrl: (row["logo_url"] as string) || null,
        faviconUrl: (row["favicon_url"] as string) || null,
      };
    },
  });

  const branding: AdminBranding = data ?? { storeName: "Store", logoUrl: null, faviconUrl: null };

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = `${branding.storeName} — Admin Console`;
    if (!branding.faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = branding.faviconUrl;
  }, [branding.storeName, branding.faviconUrl]);

  return branding;
}
