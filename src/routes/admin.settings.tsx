import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeRow } from "@/lib/db";
import {
  Store,
  CreditCard,
  Truck,
  Bell,
  Image as ImageIcon,
  Search,
  Palette,
  Loader2,
  LayoutList,
  GalleryHorizontal,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  BadgeCheck,
  Menu as MenuIcon,
  ChevronDown,
  PanelBottom,
} from "lucide-react";
import { ImageInput } from "@/components/admin/ImageInput";
import {
  DEFAULT_SETTINGS,
  HOME_SECTION_LABELS,
  BUILTIN_SECTION_CONFIG,
  PRODUCT_SOURCE_LABELS,
  sectionLabel,
  normalizeHeroSlides,
  normalizeHomeSections,
  normalizeProductBadges,
  normalizeHeaderMenus,
  normalizeFooterColumns,
  type FooterColumn,
  HEADER_MENU_COLORS,
  type HeaderMenu,
  type HeaderMenuColor,
  PRODUCT_BADGE_ICONS,
  type ProductBadge,
  type ProductBadgeIcon,
  type HeroSlide,
  type HomeSection,
  type ProductSource,
  type SiteSettings,
} from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const sections = [
  { id: "store", group: "settings", icon: Store, title: "Store details", desc: "Name, contact info, currency" },
  { id: "homepage", group: "design", icon: LayoutList, title: "Homepage layout", desc: "Reorder & show/hide home sections" },
  { id: "hero", group: "design", icon: GalleryHorizontal, title: "Hero slider", desc: "Slides shown at the top of the homepage" },
  { id: "headermenu", group: "design", icon: MenuIcon, title: "Header menu", desc: "Top navigation links & dropdowns" },
  { id: "productpage", group: "design", icon: BadgeCheck, title: "Product page", desc: "Delivery / authentic / return badges" },
  { id: "branding", group: "design", icon: ImageIcon, title: "Branding", desc: "Logo, favicon, announcement, socials" },
  { id: "footer", group: "design", icon: PanelBottom, title: "Footer", desc: "Newsletter box, about text, link columns" },
  { id: "theme", group: "design", icon: Palette, title: "Theme", desc: "Brand colours used across the site" },
  { id: "seo", group: "settings", icon: Search, title: "SEO & sharing", desc: "Title, description, keywords, OG image" },
  { id: "payments", group: "settings", icon: CreditCard, title: "Payments", desc: "bKash, Nagad, cards, cash on delivery" },
  { id: "shipping", group: "settings", icon: Truck, title: "Shipping", desc: "Delivery charge, free delivery, partner" },
  { id: "notifications", group: "settings", icon: Bell, title: "Notifications", desc: "Order & low stock alerts" },
] as const;

type Tab = (typeof sections)[number]["id"];
export type SettingsScope = "settings" | "design";

export function SettingsPage({ scope = "settings" }: { scope?: SettingsScope } = {}) {
  const qc = useQueryClient();
  const visibleSections = sections.filter((s) => s.group === scope);
  const [tab, setTab] = useState<Tab>(scope === "design" ? "homepage" : "store");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SiteSettings>>({});

  const q = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      if (data) return data as unknown as SiteSettings;
      const { data: created, error: insErr } = await supabase
        .from("store_settings")
        .insert({ store_name: DEFAULT_SETTINGS.store_name })
        .select("*")
        .single();
      if (insErr) throw insErr;
      return created as unknown as SiteSettings;
    },
  });

  const catQ = useQuery({
    queryKey: ["admin", "settings", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id,name,slug,parent_id").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (q.data)
      setForm({
        ...q.data,
        home_sections: normalizeHomeSections((q.data as SiteSettings).home_sections),
        hero_slides: normalizeHeroSlides((q.data as SiteSettings).hero_slides),
        product_badges: normalizeProductBadges((q.data as SiteSettings).product_badges),
        header_menus: normalizeHeaderMenus((q.data as SiteSettings).header_menus),
        footer_columns: normalizeFooterColumns((q.data as SiteSettings).footer_columns),
      });
  }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!q.data?.id) throw new Error("No settings row found");
      const payload = sanitizeRow(form as Record<string, any>, [], ["home_sections", "hero_slides", "product_badges", "header_menus", "footer_columns"]);
      const { error } = await supabase.from("store_settings").update(payload as never).eq("id", q.data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const str = (k: keyof SiteSettings) => (form[k] as string | null) ?? "";
  const num = (k: keyof SiteSettings) => Number(form[k] ?? 0);
  const bool = (k: keyof SiteSettings) => Boolean(form[k]);

  const homeSections = normalizeHomeSections(form.home_sections);
  const heroSlides = normalizeHeroSlides(form.hero_slides);
  const productBadges = normalizeProductBadges(form.product_badges);
  const headerMenus = normalizeHeaderMenus(form.header_menus);
  const footerColumns = normalizeFooterColumns(form.footer_columns);

  const setColumn = (i: number, patch: Partial<FooterColumn>) =>
    set("footer_columns", footerColumns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const moveColumn = (i: number, dir: -1 | 1) => {
    const next = [...footerColumns];
    const t = i + dir;
    if (t < 0 || t >= next.length) return;
    [next[i], next[t]] = [next[t], next[i]];
    set("footer_columns", next);
  };
  const removeColumn = (i: number) => set("footer_columns", footerColumns.filter((_, idx) => idx !== i));
  const addColumn = () => set("footer_columns", [...footerColumns, { title: "New column", enabled: true, links: [] }]);
  const setLink = (ci: number, li: number, patch: Partial<{ label: string; url: string }>) =>
    setColumn(ci, { links: footerColumns[ci].links.map((l, idx) => (idx === li ? { ...l, ...patch } : l)) });
  const addLink = (ci: number) => setColumn(ci, { links: [...footerColumns[ci].links, { label: "", url: "#" }] });
  const removeLink = (ci: number, li: number) =>
    setColumn(ci, { links: footerColumns[ci].links.filter((_, idx) => idx !== li) });


  const setMenu = (index: number, patch: Partial<HeaderMenu>) =>
    set("header_menus", headerMenus.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  const moveMenu = (index: number, dir: -1 | 1) => {
    const next = [...headerMenus];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set("header_menus", next);
  };
  const removeMenu = (index: number) =>
    set("header_menus", headerMenus.filter((_, i) => i !== index));
  const addMenu = () =>
    set("header_menus", [
      ...headerMenus,
      { label: "New menu", type: "category", slug: "", url: "", color: "none", enabled: true } as HeaderMenu,
    ]);

  const setBadge = (index: number, patch: Partial<ProductBadge>) =>
    set("product_badges", productBadges.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  const moveBadge = (index: number, dir: -1 | 1) => {
    const next = [...productBadges];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set("product_badges", next);
  };
  const removeBadge = (index: number) =>
    set("product_badges", productBadges.filter((_, i) => i !== index));
  const addBadge = () =>
    set("product_badges", [
      ...productBadges,
      { icon: "truck" as ProductBadgeIcon, title: "New badge", subtitle: "", enabled: true },
    ]);

  const moveSection = (index: number, dir: -1 | 1) => {
    const next = [...homeSections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set("home_sections", next);
  };
  const setSectionAt = (index: number, patch: Partial<HomeSection>) => {
    const next = homeSections.map((s, i) => (i === index ? { ...s, ...patch } : s));
    set("home_sections", next);
  };

  const addProductSection = () =>
    set("home_sections", [
      ...homeSections,
      {
        id: `custom-${Date.now()}`,
        kind: "products",
        enabled: true,
        title: "Best Selling",
        subtitle: "",
        source: "best_seller",
        limit: 10,
        link: "/search",
      } satisfies HomeSection,
    ]);
  const removeSection = (index: number) =>
    set("home_sections", homeSections.filter((_, i) => i !== index));

  const setSlide = (index: number, patch: Partial<HeroSlide>) =>
    set(
      "hero_slides",
      heroSlides.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  const moveSlide = (index: number, dir: -1 | 1) => {
    const next = [...heroSlides];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set("hero_slides", next);
  };
  const removeSlide = (index: number) =>
    set(
      "hero_slides",
      heroSlides.filter((_, i) => i !== index),
    );
  const addSlide = () =>
    set("hero_slides", [
      ...heroSlides,
      { kicker: "", badge: "", title: "New slide", subtitle: "", image: "", cta_label: "SHOP NOW", cta_link: "/search" },
    ]);


  const active = sections.find((s) => s.id === tab)!;

  return (
    <>
      <AdminTopbar
        title={scope === "design" ? "Design" : "Settings"}
        subtitle={scope === "design" ? "Customize how your store looks" : "Configure your store"}
      />
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <nav className="flex gap-2 overflow-x-auto admin-scroll -mx-3 px-3 sm:mx-0 sm:px-0 snap-x">
          {visibleSections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setTab(s.id)}
                className={`shrink-0 snap-start text-left flex items-center gap-2 px-3 py-2.5 rounded-xl admin-tap ${
                  tab === s.id
                    ? "bg-card border border-border shadow-sm"
                    : "border border-transparent hover:bg-muted"
                }`}
              >
                <div className="h-8 w-8 rounded-lg bg-[color:var(--brand-pink)]/10 text-[color:var(--brand-pink)] grid place-items-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold whitespace-nowrap">{s.title}</p>
              </button>
            );
          })}
        </nav>

        <section className="admin-card p-4 sm:p-6">

          <h3 className="font-bold">{active.title}</h3>
          <p className="text-xs text-muted-foreground">{active.desc}</p>

          {q.isLoading ? (
            <div className="py-10 text-center">
              <Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" />
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
              className="mt-6 space-y-4"
            >
              {tab === "store" && (
                <>
                  <Field label="Store name" value={str("store_name")} onChange={(v) => set("store_name", v)} />
                  <Field label="Support email" value={str("support_email")} onChange={(v) => set("support_email", v)} />
                  <Field label="Phone" value={str("phone")} onChange={(v) => set("phone", v)} />
                  <Field
                    label="Business address"
                    value={str("business_address")}
                    onChange={(v) => set("business_address", v)}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Currency" value={str("currency")} onChange={(v) => set("currency", v)} />
                    <Field label="Timezone" value={str("timezone")} onChange={(v) => set("timezone", v)} />
                  </div>
                </>
              )}

              {tab === "homepage" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Use the dropdown or the arrows to change the order of the homepage sections. Turn a section off to
                    hide it, or press Edit to change its title, subtitle and how many items it shows.
                  </p>
                  {homeSections.map((s, i) => {
                    const builtinCfg = BUILTIN_SECTION_CONFIG[s.id as keyof typeof BUILTIN_SECTION_CONFIG];
                    const fields =
                      s.kind === "products"
                        ? (["title", "subtitle", "limit"] as const)
                        : ((builtinCfg?.fields ?? []) as readonly ("title" | "subtitle" | "limit" | "link")[]);
                    const editable = fields.length > 0 || s.kind === "products";
                    const open = openSection === s.id;
                    return (
                    <div key={s.id} className="rounded-xl border border-border px-3 py-2.5 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                      <span className="h-7 w-7 shrink-0 rounded-lg bg-muted grid place-items-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold flex-1 min-w-[120px]">{sectionLabel(s)}</span>
                      <select
                        value={i}
                        onChange={(e) => {
                          const to = Number(e.target.value);
                          const next = [...homeSections];
                          const [item] = next.splice(i, 1);
                          next.splice(to, 0, item);
                          set("home_sections", next);
                        }}
                        className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs"
                        aria-label={`Position of ${sectionLabel(s)}`}
                      >
                        {homeSections.map((_, pos) => (
                          <option key={pos} value={pos}>
                            Position {pos + 1}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => moveSection(i, -1)}
                        disabled={i === 0}
                        aria-label="Move up"
                        className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(i, 1)}
                        disabled={i === homeSections.length - 1}
                        aria-label="Move down"
                        className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      {editable && (
                        <button
                          type="button"
                          onClick={() => setOpenSection(open ? null : s.id)}
                          aria-expanded={open}
                          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted admin-tap"
                        >
                          {open ? "Hide" : "Edit"}
                          <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
                        </button>
                      )}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={s.enabled}
                        aria-label={`Show ${sectionLabel(s)}`}
                        onClick={() => setSectionAt(i, { enabled: !s.enabled })}
                        className={`h-6 w-11 rounded-full transition-colors relative ${
                          s.enabled ? "bg-[color:var(--brand-pink)]" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                            s.enabled ? "left-5.5" : "left-0.5"
                          }`}
                        />
                      </button>
                      {s.kind === "products" && (
                        <button
                          type="button"
                          onClick={() => removeSection(i)}
                          aria-label="Delete section"
                          className="h-8 w-8 grid place-items-center rounded-lg border border-border text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      </div>

                      {editable && open && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-3">
                          {fields.includes("title") && (
                            <Field
                              label="Section title"
                              value={s.title ?? ""}
                              placeholder={s.kind === "products" ? "" : builtinCfg?.title}
                              onChange={(v) => setSectionAt(i, { title: v })}
                            />
                          )}
                          {fields.includes("subtitle") && (
                            <Field
                              label="Subtitle"
                              value={s.subtitle ?? ""}
                              placeholder={s.kind === "products" ? "" : builtinCfg?.subtitle}
                              onChange={(v) => setSectionAt(i, { subtitle: v })}
                            />
                          )}
                          {s.kind === "products" && (
                            <label className="block">
                              <span className="text-xs font-semibold text-muted-foreground">Show products</span>
                              <select
                                value={s.source ?? "latest"}
                                onChange={(e) => setSectionAt(i, { source: e.target.value as ProductSource })}
                                className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                              >
                                {Object.entries(PRODUCT_SOURCE_LABELS).map(([v, label]) => (
                                  <option key={v} value={v}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                          {fields.includes("limit") && (
                            <Field
                              label={s.kind === "products" ? "Max products" : "Max items"}
                              type="number"
                              value={String(s.limit ?? (s.kind === "products" ? 10 : (builtinCfg?.limit ?? 12)))}
                              onChange={(v) =>
                                setSectionAt(i, { limit: Math.max(1, Number(v) || (builtinCfg?.limit ?? 10)) })
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={addProductSection}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-border hover:bg-muted admin-tap"
                  >
                    <Plus className="h-4 w-4" /> Add product section
                  </button>

                </div>
              )}


              {tab === "hero" && (
                <div className="space-y-4">
                  {heroSlides.map((s, i) => (
                    <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold">Slide {i + 1}</p>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveSlide(i, -1)}
                            disabled={i === 0}
                            aria-label="Move slide up"
                            className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSlide(i, 1)}
                            disabled={i === heroSlides.length - 1}
                            aria-label="Move slide down"
                            className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSlide(i)}
                            aria-label="Delete slide"
                            className="h-8 w-8 grid place-items-center rounded-lg border border-border text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <ImageInput
                        label="Slide image"
                        folder="hero"
                        value={s.image ?? ""}
                        onChange={(v) => setSlide(i, { image: v })}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Kicker" value={s.kicker ?? ""} onChange={(v) => setSlide(i, { kicker: v })} />
                        <Field label="Badge" value={s.badge ?? ""} onChange={(v) => setSlide(i, { badge: v })} />
                        <Field label="Title" value={s.title ?? ""} onChange={(v) => setSlide(i, { title: v })} />
                        <Field
                          label="Subtitle"
                          value={s.subtitle ?? ""}
                          onChange={(v) => setSlide(i, { subtitle: v })}
                        />
                        <Field
                          label="Button label"
                          value={s.cta_label ?? ""}
                          onChange={(v) => setSlide(i, { cta_label: v })}
                        />
                        <Field
                          label="Button link"
                          value={s.cta_link ?? ""}
                          onChange={(v) => setSlide(i, { cta_link: v })}
                          hint="e.g. /search or /category/skincare"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSlide}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-border hover:bg-muted admin-tap"
                  >
                    <Plus className="h-4 w-4" /> Add slide
                  </button>
                </div>
              )}


              {tab === "headermenu" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    These links show in the storefront header. Leave the list empty to fall back to all top-level
                    categories. Category menus automatically show their subcategories on hover.
                  </p>
                  {headerMenus.map((m, i) => (
                    <div key={i} className="rounded-xl border border-border px-3 py-2.5 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="h-7 w-7 shrink-0 rounded-lg bg-muted grid place-items-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <select
                          value={m.type}
                          onChange={(e) => setMenu(i, { type: e.target.value as HeaderMenu["type"] })}
                          className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs"
                        >
                          <option value="category">Category</option>
                          <option value="link">Custom link</option>
                        </select>
                        <select
                          value={m.color}
                          onChange={(e) => setMenu(i, { color: e.target.value as HeaderMenuColor })}
                          className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs"
                        >
                          {Object.entries(HEADER_MENU_COLORS).map(([k, label]) => (
                            <option key={k} value={k}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <div className="ml-auto flex items-center gap-1">
                          <button type="button" onClick={() => moveMenu(i, -1)} className="p-1.5 rounded-lg hover:bg-muted" aria-label="Move up">
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => moveMenu(i, 1)} className="p-1.5 rounded-lg hover:bg-muted" aria-label="Move down">
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => removeMenu(i)} className="p-1.5 rounded-lg hover:bg-muted text-destructive" aria-label="Remove menu">
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <Toggle label="" checked={m.enabled} onChange={(v) => setMenu(i, { enabled: v })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Label" value={m.label} onChange={(v) => setMenu(i, { label: v })} />
                        {m.type === "category" ? (
                          <label className="block">
                            <span className="text-xs font-medium text-muted-foreground">Category</span>
                            <select
                              value={m.slug}
                              onChange={(e) => {
                                const cat = catQ.data?.find((c: any) => c.slug === e.target.value);
                                setMenu(i, { slug: e.target.value, label: m.label && m.label !== "New menu" ? m.label : (cat?.name ?? m.label) });
                              }}
                              className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            >
                              <option value="">Select category…</option>
                              {(catQ.data ?? []).filter((c: any) => !c.parent_id).map((c: any) => (
                                <option key={c.id} value={c.slug}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <Field label="Link URL" value={m.url} onChange={(v) => setMenu(i, { url: v })} />
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMenu}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-semibold hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" /> Add menu item
                  </button>
                </div>
              )}

              {tab === "productpage" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    These badges show under the Add to Bag button on every product page. Turn one off to hide it.
                  </p>
                  {productBadges.map((b, i) => (
                    <div key={i} className="rounded-xl border border-border px-3 py-2.5 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="h-7 w-7 shrink-0 rounded-lg bg-muted grid place-items-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <select
                          value={b.icon}
                          onChange={(e) => setBadge(i, { icon: e.target.value as ProductBadgeIcon })}
                          className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs"
                        >
                          {Object.entries(PRODUCT_BADGE_ICONS).map(([k, label]) => (
                            <option key={k} value={k}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <div className="ml-auto flex items-center gap-1">
                          <button type="button" onClick={() => moveBadge(i, -1)} className="p-1.5 rounded-lg hover:bg-muted" aria-label="Move up">
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => moveBadge(i, 1)} className="p-1.5 rounded-lg hover:bg-muted" aria-label="Move down">
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => removeBadge(i)} className="p-1.5 rounded-lg hover:bg-muted text-destructive" aria-label="Remove badge">
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <Toggle label="" checked={b.enabled} onChange={(v) => setBadge(i, { enabled: v })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Title" value={b.title} onChange={(v) => setBadge(i, { title: v })} />
                        <Field label="Subtitle" value={b.subtitle} onChange={(v) => setBadge(i, { subtitle: v })} />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBadge}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-semibold hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" /> Add badge
                  </button>
                </div>
              )}

              {tab === "branding" && (
                <>
                  <ImageInput
                    label="Logo"
                    folder="branding"
                    value={str("logo_url")}
                    onChange={(v) => set("logo_url", v)}
                    hint="Shown in the header and footer. Leave empty to show the store name as text."
                  />
                  <ImageInput
                    label="Favicon"
                    folder="branding"
                    value={str("favicon_url")}
                    onChange={(v) => set("favicon_url", v)}
                    hint="Small icon shown in the browser tab (PNG / ICO / SVG)."
                  />
                  <div className="rounded-2xl border border-border p-3 sm:p-4 space-y-3">
                    <Toggle
                      label="Show announcement bar"
                      checked={form.announcement_enabled !== false}
                      onChange={(v) => set("announcement_enabled", v)}
                    />
                    <Field
                      label="Announcement bar text"
                      value={str("announcement_text")}
                      onChange={(v) => set("announcement_text", v)}
                    />
                    <Field
                      label="Announcement link (optional)"
                      value={str("announcement_link")}
                      onChange={(v) => set("announcement_link", v)}
                      placeholder="/category/skincare"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ColorField
                        label="Bar background"
                        value={str("announcement_bg") || "#e6007e"}
                        onChange={(v) => set("announcement_bg", v)}
                      />
                      <ColorField
                        label="Bar text color"
                        value={str("announcement_text_color") || "#ffffff"}
                        onChange={(v) => set("announcement_text_color", v)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Facebook URL" value={str("facebook_url")} onChange={(v) => set("facebook_url", v)} />
                    <Field
                      label="Instagram URL"
                      value={str("instagram_url")}
                      onChange={(v) => set("instagram_url", v)}
                    />
                    <Field label="YouTube URL" value={str("youtube_url")} onChange={(v) => set("youtube_url", v)} />
                  </div>
                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={!!(form as any).whatsapp_enabled}
                        onChange={(e) => set("whatsapp_enabled" as any, e.target.checked as any)}
                        className="h-4 w-4 accent-[color:var(--brand-pink)]"
                      />
                      Enable WhatsApp order / support button
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="WhatsApp number (with country code)" value={str("whatsapp_number" as any)} onChange={(v) => set("whatsapp_number" as any, v)} />
                      <Field label="Button label" value={str("whatsapp_label" as any)} onChange={(v) => set("whatsapp_label" as any, v)} />
                      <Field label="Default message" value={str("whatsapp_message" as any)} onChange={(v) => set("whatsapp_message" as any, v)} />
                    </div>
                  </div>

                </>
              )}

              {tab === "footer" && (
                <div className="space-y-4">
                  <Toggle
                    label="Show newsletter box"
                    checked={form.newsletter_enabled !== false}
                    onChange={(v) => set("newsletter_enabled", v)}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Newsletter title"
                      value={str("newsletter_title")}
                      onChange={(v) => set("newsletter_title", v)}
                      placeholder="Join the beauty club"
                    />
                    <Field
                      label="Newsletter button text"
                      value={str("newsletter_button")}
                      onChange={(v) => set("newsletter_button", v)}
                      placeholder="Subscribe"
                    />
                  </div>
                  <Field
                    label="Newsletter subtitle"
                    value={str("newsletter_subtitle")}
                    onChange={(v) => set("newsletter_subtitle", v)}
                  />
                  <Field
                    label="Footer about text"
                    value={str("footer_about")}
                    onChange={(v) => set("footer_about", v)}
                    hint="Short paragraph shown under the logo."
                  />
                  <Field
                    label="Copyright line"
                    value={str("footer_copyright")}
                    onChange={(v) => set("footer_copyright", v)}
                    placeholder={`© ${new Date().getFullYear()} ${str("store_name") || "Store"}. All rights reserved.`}
                  />

                  <div className="pt-2 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Footer link columns. The first column always shows your categories automatically.
                    </p>
                    {footerColumns.map((col, i) => (
                      <div key={i} className="rounded-xl border border-border p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={col.title}
                            onChange={(e) => setColumn(i, { title: e.target.value })}
                            placeholder="Column title"
                            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-sm font-semibold outline-none focus:border-[color:var(--brand-pink)]"
                          />
                          <button type="button" onClick={() => moveColumn(i, -1)} className="p-2 rounded-lg hover:bg-muted" aria-label="Move up">
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => moveColumn(i, 1)} className="p-2 rounded-lg hover:bg-muted" aria-label="Move down">
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => removeColumn(i)} className="p-2 rounded-lg hover:bg-muted text-red-500" aria-label="Remove column">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <Toggle label="Show this column" checked={col.enabled} onChange={(v) => setColumn(i, { enabled: v })} />
                        <div className="space-y-2">
                          {col.links.map((l, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <input
                                value={l.label}
                                onChange={(e) => setLink(i, j, { label: e.target.value })}
                                placeholder="Label"
                                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--brand-pink)]"
                              />
                              <input
                                value={l.url}
                                onChange={(e) => setLink(i, j, { url: e.target.value })}
                                placeholder="/search or https://…"
                                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--brand-pink)]"
                              />
                              <button type="button" onClick={() => removeLink(i, j)} className="p-2 rounded-lg hover:bg-muted text-red-500" aria-label="Remove link">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addLink(i)}
                            className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-xs font-semibold hover:bg-muted"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add link
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addColumn}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-semibold hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" /> Add column
                    </button>
                  </div>
                </div>
              )}

              {tab === "seo" && (
                <>
                  <Field
                    label="SEO title"
                    value={str("seo_title")}
                    onChange={(v) => set("seo_title", v)}
                    hint="Under 60 characters works best."
                  />
                  <Field
                    label="Meta description"
                    value={str("seo_description")}
                    onChange={(v) => set("seo_description", v)}
                    hint="Under 160 characters."
                  />
                  <Field
                    label="Keywords"
                    value={str("seo_keywords")}
                    onChange={(v) => set("seo_keywords", v)}
                    hint="Comma separated."
                  />
                  <ImageInput
                    label="Social share image (OG image)"
                    folder="branding"
                    value={str("og_image_url")}
                    onChange={(v) => set("og_image_url", v)}
                    hint="1200×630 recommended."
                  />
                </>
              )}

              {tab === "theme" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorField label="Primary (pink)" value={str("theme_pink")} onChange={(v) => set("theme_pink", v)} />
                  <ColorField
                    label="Magenta"
                    value={str("theme_magenta")}
                    onChange={(v) => set("theme_magenta", v)}
                  />
                  <ColorField label="Purple" value={str("theme_purple")} onChange={(v) => set("theme_purple", v)} />
                  <ColorField label="Teal" value={str("theme_teal")} onChange={(v) => set("theme_teal", v)} />
                  <ColorField label="Green" value={str("theme_green")} onChange={(v) => set("theme_green", v)} />
                </div>
              )}

              {tab === "payments" && (
                <>
                  <Toggle label="bKash" checked={bool("pay_bkash")} onChange={(v) => set("pay_bkash", v)} />
                  <Toggle label="Nagad" checked={bool("pay_nagad")} onChange={(v) => set("pay_nagad", v)} />
                  <Toggle label="Card" checked={bool("pay_card")} onChange={(v) => set("pay_card", v)} />
                  <Toggle label="Cash on delivery" checked={bool("pay_cod")} onChange={(v) => set("pay_cod", v)} />
                </>
              )}

              {tab === "shipping" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Inside Dhaka delivery (৳)"
                      type="number"
                      value={String(num("shipping_inside_dhaka"))}
                      onChange={(v) => set("shipping_inside_dhaka", Number(v))}
                    />
                    <Field
                      label="Outside Dhaka delivery (৳)"
                      type="number"
                      value={String(num("shipping_outside_dhaka"))}
                      onChange={(v) => set("shipping_outside_dhaka", Number(v))}
                    />
                  </div>
                  <Field
                    label="Delivery partner"
                    value={str("delivery_partner")}
                    onChange={(v) => set("delivery_partner", v)}
                  />
                </>
              )}

              {tab === "notifications" && (
                <>
                  <Toggle
                    label="Email me on new orders"
                    checked={bool("notify_order_email")}
                    onChange={(v) => set("notify_order_email", v)}
                  />
                  <Toggle
                    label="SMS on new orders"
                    checked={bool("notify_order_sms")}
                    onChange={(v) => set("notify_order_sms", v)}
                  />
                  <Toggle
                    label="Email me on low stock"
                    checked={bool("notify_low_stock_email")}
                    onChange={(v) => set("notify_low_stock_email", v)}
                  />
                  <Field
                    label="Low stock threshold"
                    type="number"
                    value={String(num("low_stock_threshold"))}
                    onChange={(v) => set("low_stock_threshold", Number(v))}
                  />
                </>
              )}

              <div className="mt-6 sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/85 backdrop-blur border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => q.data && setForm(q.data)}
                  className="text-sm font-semibold px-4 py-2.5 rounded-xl border border-border hover:bg-muted admin-tap"
                >
                  Reset
                </button>
                <button
                  disabled={save.isPending}
                  type="submit"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-[color:var(--brand-pink)] text-white hover:opacity-90 admin-tap"
                >
                  {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save changes
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--brand-pink)]"
      />
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#e6007e"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded border border-border bg-background"
          aria-label={`${label} colour picker`}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none transition focus:border-[color:var(--brand-pink)] focus:ring-2 focus:ring-[color:var(--brand-pink)]/20"
        />
      </div>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-full transition-colors relative ${
          checked ? "bg-[color:var(--brand-pink)]" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-5.5" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}
