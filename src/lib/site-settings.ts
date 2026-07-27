export type SiteSettings = {
  id?: string;
  store_name: string;
  support_email: string | null;
  phone: string | null;
  business_address: string | null;
  currency: string;
  timezone: string;
  logo_url: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  announcement_text: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  theme_pink: string;
  theme_magenta: string;
  theme_purple: string;
  theme_teal: string;
  theme_green: string;
  pay_bkash: boolean;
  pay_nagad: boolean;
  pay_card: boolean;
  pay_cod: boolean;
  shipping_flat_rate: number;
  free_shipping_threshold: number;
  delivery_partner: string | null;
  notify_order_email: boolean;
  notify_order_sms: boolean;
  notify_low_stock_email: boolean;
  low_stock_threshold: number;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  store_name: "Shajgoj",
  support_email: null,
  phone: null,
  business_address: null,
  currency: "BDT",
  timezone: "Asia/Dhaka",
  logo_url: null,
  favicon_url: null,
  og_image_url: null,
  announcement_text:
    "Free delivery on orders over ৳999 · Cash on delivery available all over Bangladesh",
  facebook_url: null,
  instagram_url: null,
  youtube_url: null,
  seo_title: "Shajgoj — Beauty, Skincare & Cosmetics Store in Bangladesh",
  seo_description:
    "Shop 100% authentic makeup, skincare, haircare, fragrance and personal care. Cash on delivery all over Bangladesh.",
  seo_keywords: "beauty, skincare, makeup, cosmetics, bangladesh",
  theme_pink: "#e6007e",
  theme_magenta: "#c2185b",
  theme_purple: "#7b3fa0",
  theme_teal: "#00897b",
  theme_green: "#43a047",
  pay_bkash: true,
  pay_nagad: true,
  pay_card: true,
  pay_cod: true,
  shipping_flat_rate: 60,
  free_shipping_threshold: 999,
  delivery_partner: null,
  notify_order_email: true,
  notify_order_sms: false,
  notify_low_stock_email: true,
  low_stock_threshold: 10,
};

export function resolveSettings(row: unknown): SiteSettings {
  if (!row || typeof row !== "object") return DEFAULT_SETTINGS;
  const r = row as Record<string, unknown>;
  const out = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    const v = r[key];
    if (v !== undefined && v !== null && v !== "") out[key] = v;
  }
  if (r.id) out.id = r.id;
  return out as SiteSettings;
}

export function themeVars(s: SiteSettings) {
  return `:root{--brand-pink:${s.theme_pink};--brand-magenta:${s.theme_magenta};--brand-purple:${s.theme_purple};--brand-teal:${s.theme_teal};--brand-green:${s.theme_green};}`;
}

/** Build head() meta + links for a storefront page using store settings. */
export function siteHead(
  s: SiteSettings,
  opts: { title?: string; description?: string; image?: string; path?: string; type?: string } = {},
) {
  const title = opts.title ?? s.seo_title ?? s.store_name;
  const description = opts.description ?? s.seo_description ?? "";
  const image = opts.image ?? s.og_image_url ?? undefined;

  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:site_name", content: s.store_name },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (s.seo_keywords) meta.push({ name: "keywords", content: s.seo_keywords });
  if (opts.path) meta.push({ property: "og:url", content: opts.path });
  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
  }

  const links: Record<string, string>[] = [];
  if (opts.path) links.push({ rel: "canonical", href: opts.path });
  if (s.favicon_url) links.push({ rel: "icon", href: s.favicon_url });

  return { meta, links };
}
