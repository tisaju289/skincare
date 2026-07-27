export type BuiltinSectionId = "hero" | "categories" | "deals" | "trending" | "brands" | "trust";
export type HomeSectionId = BuiltinSectionId;

/** Where a custom product section pulls its products from. */
export type ProductSource =
  | "trending"
  | "best_seller"
  | "flash_sale"
  | "new_arrival"
  | "discount"
  | "latest";

export const PRODUCT_SOURCE_LABELS: Record<ProductSource, string> = {
  trending: "Trending products",
  best_seller: "Best selling products",
  flash_sale: "Flash sale products",
  new_arrival: "New arrivals",
  discount: "Discounted products",
  latest: "Latest products",
};

export type HomeSection = {
  id: string;
  /** "builtin" = fixed block, "products" = custom product grid built in Settings. */
  kind?: "builtin" | "products";
  enabled: boolean;
  title?: string;
  subtitle?: string;
  source?: ProductSource;
  limit?: number;
  link?: string;
};

export type HeroSlide = {
  kicker?: string | null;
  badge?: string | null;
  title?: string | null;
  subtitle?: string | null;
  image?: string | null;
  cta_label?: string | null;
  cta_link?: string | null;
};

export const HOME_SECTION_LABELS: Record<BuiltinSectionId, string> = {
  hero: "Hero slider",
  categories: "Category circles",
  deals: "Deal banners",
  trending: "Trending products",
  brands: "Shop by brand",
  trust: "Trust badges",
};

export function sectionLabel(s: HomeSection): string {
  if (s.kind === "products") return s.title?.trim() || PRODUCT_SOURCE_LABELS[s.source ?? "latest"];
  return HOME_SECTION_LABELS[s.id as BuiltinSectionId] ?? s.id;
}

export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  { id: "hero", kind: "builtin", enabled: true },
  { id: "categories", kind: "builtin", enabled: true },
  { id: "deals", kind: "builtin", enabled: true },
  { id: "trending", kind: "builtin", enabled: true },
  { id: "brands", kind: "builtin", enabled: true },
  { id: "trust", kind: "builtin", enabled: true },
];


export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    kicker: "UNILEVER PRESENTS",
    badge: "JULY",
    title: "JAW DROPPERS",
    subtitle: "UP TO 45% OFF",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
    cta_label: "SHOP NOW",
    cta_link: "/search",
  },
  {
    kicker: "NEW ARRIVALS",
    badge: "FRESH",
    title: "GLOW UP",
    subtitle: "SKINCARE FROM ৳299",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
    cta_label: "EXPLORE",
    cta_link: "/search",
  },
  {
    kicker: "BEAUTY WEEK",
    badge: "MEGA",
    title: "MAKEUP FEST",
    subtitle: "BUY 2 GET 1 FREE",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    cta_label: "SHOP NOW",
    cta_link: "/search",
  },
];

/** Merge a stored section list with the canonical list so new sections still appear. */
export function normalizeHomeSections(value: unknown): HomeSection[] {
  const stored = Array.isArray(value) ? (value as HomeSection[]) : [];
  const out: HomeSection[] = [];
  for (const s of stored) {
    if (!s || typeof s.id !== "string" || out.some((o) => o.id === s.id)) continue;
    const isBuiltin = s.id in HOME_SECTION_LABELS;
    if (isBuiltin) {
      out.push({ id: s.id, kind: "builtin", enabled: s.enabled !== false });
    } else if (s.kind === "products") {
      out.push({
        id: s.id,
        kind: "products",
        enabled: s.enabled !== false,
        title: s.title ?? "",
        subtitle: s.subtitle ?? "",
        source: (s.source && s.source in PRODUCT_SOURCE_LABELS ? s.source : "latest") as ProductSource,
        limit: Number(s.limit) > 0 ? Number(s.limit) : 10,
        link: s.link ?? "/search",
      });
    }
  }
  for (const d of DEFAULT_HOME_SECTIONS) if (!out.some((o) => o.id === d.id)) out.push({ ...d });
  return out;
}


export function normalizeHeroSlides(value: unknown): HeroSlide[] {
  const stored = Array.isArray(value) ? (value as HeroSlide[]) : [];
  const clean = stored.filter((s) => s && typeof s === "object");
  return clean.length ? clean : DEFAULT_HERO_SLIDES;
}

export const PRODUCT_BADGE_ICONS = {
  truck: "Delivery truck",
  shield: "Shield / authentic",
  refresh: "Return / refresh",
  headphones: "Support",
  gift: "Gift",
  tag: "Price tag",
  wallet: "Cash on delivery",
  clock: "Fast / time",
} as const;

export type ProductBadgeIcon = keyof typeof PRODUCT_BADGE_ICONS;

export type ProductBadge = {
  icon: ProductBadgeIcon;
  title: string;
  subtitle: string;
  enabled: boolean;
};

export const DEFAULT_PRODUCT_BADGES: ProductBadge[] = [
  { icon: "truck", title: "Free Delivery", subtitle: "Over ৳999", enabled: true },
  { icon: "shield", title: "Authentic", subtitle: "Guaranteed", enabled: true },
  { icon: "refresh", title: "7-day Return", subtitle: "No hassle", enabled: true },
];

export function normalizeProductBadges(value: unknown): ProductBadge[] {
  const stored = Array.isArray(value) ? value : [];
  const clean = stored
    .filter((b) => b && typeof b === "object")
    .map((b: any) => ({
      icon: (b.icon in PRODUCT_BADGE_ICONS ? b.icon : "truck") as ProductBadgeIcon,
      title: String(b.title ?? ""),
      subtitle: String(b.subtitle ?? ""),
      enabled: b.enabled !== false,
    }));
  return clean.length ? clean : DEFAULT_PRODUCT_BADGES.map((b) => ({ ...b }));
}

export type SiteSettings = {
  id?: string;
  home_sections: HomeSection[];
  hero_slides: HeroSlide[];
  product_badges: ProductBadge[];

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
  shipping_inside_dhaka: number;
  shipping_outside_dhaka: number;
  free_shipping_threshold: number;
  delivery_partner: string | null;
  notify_order_email: boolean;
  notify_order_sms: boolean;
  notify_low_stock_email: boolean;
  low_stock_threshold: number;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  home_sections: DEFAULT_HOME_SECTIONS,
  hero_slides: DEFAULT_HERO_SLIDES,
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
  shipping_inside_dhaka: 60,
  shipping_outside_dhaka: 120,
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
  out.home_sections = normalizeHomeSections(r.home_sections);
  out.hero_slides = normalizeHeroSlides(r.hero_slides);
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
