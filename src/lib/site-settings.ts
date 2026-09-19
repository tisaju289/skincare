export type BuiltinSectionId =
  | "hero"
  | "categories"
  | "deals"
  | "hot"
  | "trending"
  | "brands"
  | "reviews"
  | "trust";
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
  /** Optional background color (hex) for sections that support it. */
  bg?: string;
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
  hot: "Hot products (marquee)",
  trending: "Trending products",
  brands: "Shop by brand",
  reviews: "Customer reviews",
  trust: "Trust badges",
};

/** Which editable fields each built-in section supports, plus its default copy. */
export const BUILTIN_SECTION_CONFIG: Record<
  BuiltinSectionId,
  {
    fields: Array<"title" | "subtitle" | "limit" | "link" | "bg">;
    title: string;
    subtitle: string;
    limit: number;
    link: string;
    bg?: string;
  }
> = {
  hero: { fields: [], title: "", subtitle: "", limit: 0, link: "" },
  categories: { fields: ["title", "subtitle", "limit"], title: "", subtitle: "", limit: 12, link: "" },
  deals: { fields: ["title", "subtitle"], title: "DEALS YOU CANNOT MISS", subtitle: "", limit: 0, link: "" },
  hot: {
    fields: ["title", "subtitle", "limit", "bg"],
    title: "Hot Products",
    subtitle: "Flying off the shelves",
    limit: 12,
    link: "",
    bg: "#2B2320",
  },
  trending: {
    fields: ["title", "subtitle", "limit", "link"],
    title: "Trending Now",
    subtitle: "Bestsellers this week",
    limit: 10,
    link: "/search",
  },
  brands: { fields: ["title", "subtitle", "limit", "link"], title: "Shop by Brand", subtitle: "", limit: 12, link: "" },
  reviews: {
    fields: ["title", "subtitle", "limit", "bg"],
    title: "Customer Reviews",
    subtitle: "What our customers say",
    limit: 6,
    link: "",
    bg: "#F6EFEA",
  },
  trust: { fields: ["title", "subtitle"], title: "", subtitle: "", limit: 0, link: "" },
};

export function sectionLabel(s: HomeSection): string {
  if (s.kind === "products") return s.title?.trim() || PRODUCT_SOURCE_LABELS[s.source ?? "latest"];
  return HOME_SECTION_LABELS[s.id as BuiltinSectionId] ?? s.id;
}

/** Resolved copy for a built-in section: admin override or the built-in default. */
export function builtinText(s: HomeSection, key: "title" | "subtitle"): string {
  const cfg = BUILTIN_SECTION_CONFIG[s.id as BuiltinSectionId];
  const v = (s[key] ?? "").toString().trim();
  return v || (cfg ? cfg[key] : "");
}

export function builtinLimit(s: HomeSection): number {
  const cfg = BUILTIN_SECTION_CONFIG[s.id as BuiltinSectionId];
  const n = Number(s.limit);
  return n > 0 ? n : (cfg?.limit ?? 12);
}

/** Resolved background color for a section that supports one. */
export function builtinBg(s: HomeSection): string {
  const cfg = BUILTIN_SECTION_CONFIG[s.id as BuiltinSectionId];
  const v = (s.bg ?? "").toString().trim();
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : (cfg?.bg ?? "#2B2320");
}

/** Readable foreground (near-white or near-black) for a hex background. */
export function readableOn(hex: string): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return "#FFFFFF";
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.45 ? "#1A1A1A" : "#FFFFFF";
}

export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  { id: "hero", kind: "builtin", enabled: true },
  { id: "categories", kind: "builtin", enabled: true },
  { id: "deals", kind: "builtin", enabled: true },
  { id: "hot", kind: "builtin", enabled: true },
  { id: "trending", kind: "builtin", enabled: true },
  { id: "brands", kind: "builtin", enabled: true },
  { id: "reviews", kind: "builtin", enabled: true },
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
      out.push({
        id: s.id,
        kind: "builtin",
        enabled: s.enabled !== false,
        title: s.title ?? "",
        subtitle: s.subtitle ?? "",
        limit: Number(s.limit) > 0 ? Number(s.limit) : undefined,
        link: s.link ?? "",
        bg: typeof s.bg === "string" ? s.bg : undefined,
      });
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

export const HEADER_MENU_COLORS = {
  none: "Plain text",
  pink: "Pink pill",
  magenta: "Magenta pill",
  purple: "Purple pill",
  teal: "Teal pill",
  green: "Green pill",
} as const;

export type HeaderMenuColor = keyof typeof HEADER_MENU_COLORS;

export type HeaderMenu = {
  label: string;
  /** "category" uses slug, "link" uses url */
  type: "category" | "link";
  slug: string;
  url: string;
  color: HeaderMenuColor;
  enabled: boolean;
};

export const DEFAULT_HEADER_MENUS: HeaderMenu[] = [
  { label: "Home", type: "link", slug: "", url: "/", color: "none", enabled: true },
  { label: "Category", type: "link", slug: "", url: "/categories", color: "none", enabled: true },
  { label: "Shop", type: "link", slug: "", url: "/search", color: "none", enabled: true },
  { label: "Brand", type: "link", slug: "", url: "/brands", color: "none", enabled: true },
];

export function normalizeHeaderMenus(value: unknown): HeaderMenu[] {
  const stored = Array.isArray(value) ? value : [];
  return stored
    .filter((m) => m && typeof m === "object")
    .map((m: any) => ({
      label: String(m.label ?? ""),
      type: m.type === "link" ? "link" : "category",
      slug: String(m.slug ?? ""),
      url: String(m.url ?? ""),
      color: (m.color in HEADER_MENU_COLORS ? m.color : "none") as HeaderMenuColor,
      enabled: m.enabled !== false,
    }));
}

export type FooterLink = { label: string; url: string };
export type FooterColumn = { title: string; enabled: boolean; links: FooterLink[] };

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Help",
    enabled: true,
    links: [
      { label: "All products", url: "/search" },
      { label: "Shipping", url: "#" },
      { label: "Returns", url: "#" },
      { label: "FAQ", url: "#" },
    ],
  },
  {
    title: "Company",
    enabled: true,
    links: [
      { label: "About", url: "#" },
      { label: "Blog", url: "#" },
      { label: "Careers", url: "#" },
      { label: "Privacy", url: "#" },
    ],
  },
];

export function normalizeFooterColumns(value: unknown): FooterColumn[] {
  const stored = Array.isArray(value) ? value : [];
  const clean = stored
    .filter((c) => c && typeof c === "object")
    .map((c: any) => ({
      title: String(c.title ?? ""),
      enabled: c.enabled !== false,
      links: (Array.isArray(c.links) ? c.links : [])
        .filter((l: any) => l && typeof l === "object")
        .map((l: any) => ({ label: String(l.label ?? ""), url: String(l.url ?? "#") })),
    }));
  return clean.length ? clean : DEFAULT_FOOTER_COLUMNS.map((c) => ({ ...c, links: c.links.map((l) => ({ ...l })) }));
}

export type SiteSettings = {
  id?: string;
  home_sections: HomeSection[];
  hero_slides: HeroSlide[];
  product_badges: ProductBadge[];
  header_menus: HeaderMenu[];
  footer_columns: FooterColumn[];

  footer_about: string | null;
  footer_copyright: string | null;
  
  newsletter_enabled: boolean;
  newsletter_title: string | null;
  newsletter_subtitle: string | null;
  newsletter_button: string | null;


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
  announcement_enabled: boolean;
  announcement_link: string | null;
  announcement_bg: string;
  announcement_text_color: string;
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
  whatsapp_enabled: boolean;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
  whatsapp_label: string | null;
};


export const DEFAULT_SETTINGS: SiteSettings = {
  home_sections: DEFAULT_HOME_SECTIONS,
  hero_slides: DEFAULT_HERO_SLIDES,
  product_badges: DEFAULT_PRODUCT_BADGES,
  header_menus: [],
  footer_columns: DEFAULT_FOOTER_COLUMNS,
  footer_about: null,
  footer_copyright: null,
  newsletter_enabled: true,
  newsletter_title: null,
  newsletter_subtitle: "Get 10% off your first order + weekly beauty tips.",
  newsletter_button: "Subscribe",
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
  announcement_enabled: true,
  announcement_link: null,
  announcement_bg: "#e6007e",
  announcement_text_color: "#ffffff",
  facebook_url: null,
  instagram_url: null,
  youtube_url: null,
  seo_title: "Shajgoj — Beauty, Skincare & Cosmetics Store in Bangladesh",
  seo_description:
    "Shop 100% authentic makeup, skincare, haircare, fragrance and personal care. Cash on delivery all over Bangladesh.",
  seo_keywords: "beauty, skincare, makeup, cosmetics, bangladesh",
  theme_pink: "#6B3FA0",
  theme_magenta: "#9d6bc8",
  theme_purple: "#2b2320",
  theme_teal: "#4f8c86",
  theme_green: "#6b8f5e",
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
  whatsapp_enabled: false,
  whatsapp_number: null,
  whatsapp_message: "Hello! I want to order from Shajgoj.",
  whatsapp_label: "WhatsApp",
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
  out.product_badges = normalizeProductBadges(r.product_badges);
  out.header_menus = normalizeHeaderMenus(r.header_menus);
  out.footer_columns = normalizeFooterColumns(r.footer_columns);
  out.newsletter_enabled = r.newsletter_enabled !== false;
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
