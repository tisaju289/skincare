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
} from "lucide-react";
import { ImageInput } from "@/components/admin/ImageInput";
import {
  DEFAULT_SETTINGS,
  HOME_SECTION_LABELS,
  normalizeHeroSlides,
  normalizeHomeSections,
  type HeroSlide,
  type HomeSection,
  type SiteSettings,
} from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const sections = [
  { id: "store", icon: Store, title: "Store details", desc: "Name, contact info, currency" },
  { id: "homepage", icon: LayoutList, title: "Homepage layout", desc: "Reorder & show/hide home sections" },
  { id: "hero", icon: GalleryHorizontal, title: "Hero slider", desc: "Slides shown at the top of the homepage" },
  { id: "branding", icon: ImageIcon, title: "Branding", desc: "Logo, favicon, announcement, socials" },
  { id: "seo", icon: Search, title: "SEO & sharing", desc: "Title, description, keywords, OG image" },
  { id: "theme", icon: Palette, title: "Theme", desc: "Brand colours used across the site" },
  { id: "payments", icon: CreditCard, title: "Payments", desc: "bKash, Nagad, cards, cash on delivery" },
  { id: "shipping", icon: Truck, title: "Shipping", desc: "Delivery charge, free delivery, partner" },
  { id: "notifications", icon: Bell, title: "Notifications", desc: "Order & low stock alerts" },
] as const;

type Tab = (typeof sections)[number]["id"];


function SettingsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("store");
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

  useEffect(() => {
    if (q.data)
      setForm({
        ...q.data,
        home_sections: normalizeHomeSections((q.data as SiteSettings).home_sections),
        hero_slides: normalizeHeroSlides((q.data as SiteSettings).hero_slides),
      });
  }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!q.data?.id) throw new Error("No settings row found");
      const payload = sanitizeRow(form as Record<string, any>, [], ["home_sections", "hero_slides"]);
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
      <AdminTopbar title="Settings" subtitle="Configure your store" />
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="space-y-1">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setTab(s.id)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl ${
                  tab === s.id ? "bg-card border border-border" : "hover:bg-muted"
                }`}
              >
                <div className="h-9 w-9 rounded-lg bg-[color:var(--brand-pink)]/10 text-[color:var(--brand-pink)] grid place-items-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </aside>

        <section className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
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
                    hide it from the storefront.
                  </p>
                  {homeSections.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-border px-3 py-2.5"
                    >
                      <span className="h-7 w-7 shrink-0 rounded-lg bg-muted grid place-items-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold flex-1 min-w-[120px]">{HOME_SECTION_LABELS[s.id]}</span>
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
                        aria-label={`Position of ${HOME_SECTION_LABELS[s.id]}`}
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
                      <button
                        type="button"
                        role="switch"
                        aria-checked={s.enabled}
                        aria-label={`Show ${HOME_SECTION_LABELS[s.id]}`}
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
                    </div>
                  ))}
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
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" /> Add slide
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
                  <Field
                    label="Announcement bar text"
                    value={str("announcement_text")}
                    onChange={(v) => set("announcement_text", v)}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Facebook URL" value={str("facebook_url")} onChange={(v) => set("facebook_url", v)} />
                    <Field
                      label="Instagram URL"
                      value={str("instagram_url")}
                      onChange={(v) => set("instagram_url", v)}
                    />
                    <Field label="YouTube URL" value={str("youtube_url")} onChange={(v) => set("youtube_url", v)} />
                  </div>
                </>
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
                      label="Flat delivery charge (৳)"
                      type="number"
                      value={String(num("shipping_flat_rate"))}
                      onChange={(v) => set("shipping_flat_rate", Number(v))}
                    />
                    <Field
                      label="Free delivery above (৳)"
                      type="number"
                      value={String(num("free_shipping_threshold"))}
                      onChange={(v) => set("free_shipping_threshold", Number(v))}
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

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => q.data && setForm(q.data)}
                  className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted"
                >
                  Reset
                </button>
                <button
                  disabled={save.isPending}
                  type="submit"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90"
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
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
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--brand-pink)]"
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
