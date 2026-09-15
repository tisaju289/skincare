import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { ArrowUpRight, ChevronRight, Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import { getHomeData } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import { pickProducts, type Category, type Product } from "@/lib/shop-data";
import { SiteTheme } from "@/components/storefront/SiteTheme";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import { imgProps } from "@/lib/image";
import {
  siteHead,
  DEFAULT_SETTINGS,
  normalizeHomeSections,
  normalizeHeroSlides,
  builtinText,
  builtinLimit,
  builtinBg,
  readableOn,
  PRODUCT_SOURCE_LABELS,
  type HomeSection,
  type SiteSettings,
} from "@/lib/site-settings";


export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: ({ loaderData }) => siteHead(loaderData?.settings ?? DEFAULT_SETTINGS, { path: "/" }),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <p className="text-xl font-black">Store didn't load</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Nothing here.</div>,
  component: Index,
});

const dealBanners = [
  { title: "Mega offers", sub: "Up to 50% off", note: "Beauty + Fashion edit" },
  { title: "Starting from", sub: "৳99 only", note: "Everyday steals" },
  { title: "Buy 2 get", sub: "৳101 off", note: "Mix & match" },
  { title: "Season sale", sub: "১৬% ছাড়", note: "Limited stock" },
];

/** Editorial section heading: eyebrow label, display headline — centered. */
function SectionHead({
  index,
  eyebrow,
  title,
  subtitle,
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-7 flex flex-col items-center text-center border-b border-border pb-5">
      <div className="flex items-center justify-center gap-3">
        {index ? (
          <span className="font-display text-sm text-gradient-brand tracking-[0.2em]">{index}</span>
        ) : null}
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      </div>
      <h2 className="font-display mt-2 text-3xl sm:text-5xl uppercase">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground max-w-xl">{subtitle}</p> : null}
    </div>
  );
}

/** Bottom-of-section action row (e.g. View all). */
function SectionFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex justify-center">{children}</div>;
}

/** Compact single-row card used inside the hot-products marquee band. */
function HotCard({ p }: { p: Product }) {
  const off = p.old && p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : null;
  return (
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className="group mr-3 block w-40 shrink-0 sm:mr-4 sm:w-48"
    >
      <div className="rounded-2xl border border-background/15 bg-background/10 p-3 text-background backdrop-blur transition-colors hover:bg-background/15">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-background/10">
          <img
            {...imgProps(p.image, { width: 320, widths: [160, 240, 320], sizes: "192px" })}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {off && (
            <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              −{off}%
            </span>
          )}
        </div>
        <p className="mt-2.5 line-clamp-2 min-h-[2.4rem] text-[13px] leading-snug">{p.name}</p>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-display text-base" style={{ color: "var(--brand-magenta)" }}>
            ৳{p.price}
          </span>
          {p.old != null && p.old > p.price && (
            <span className="text-[11px] text-background/50 line-through">৳{p.old}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ViewAll() {
  return (
    <Link
      to="/search"
      search={{ q: "" }}
      className="group inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-foreground hover:text-background transition-colors"
    >
      View all
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

function Index() {
  const data = Route.useLoaderData() as {
    categories: Category[];
    trending: Product[];
    products: Product[];
    brands: { slug: string; name: string; logo?: string | null }[];
    settings: SiteSettings;
  };
  const { categories, trending, brands, settings } = data;
  const pool = data.products ?? trending;
  const topCategories = categories.filter((c) => !c.parent);
  const [showAllCats, setShowAllCats] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const order = normalizeHomeSections(settings.home_sections).filter((s) => s.enabled);
  const slides = normalizeHeroSlides(settings.hero_slides);

  const blocks: Record<string, (s: HomeSection) => React.ReactNode> = {
    hero: () => <HeroSlider slides={slides} />,

    categories: (s) => {
      const heading = builtinText(s, "title");
      const sub = builtinText(s, "subtitle");
      const cats = topCategories.slice(0, builtinLimit(s));
      return (
        <section className="max-w-7xl mx-auto px-4 mt-12 md:mt-16">
          <SectionHead index="01" eyebrow="Shop by" title={heading || "Categories"} subtitle={sub} />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-5">
            {cats.map((c, i) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className={`${i >= 6 && !showAllCats ? "hidden" : "flex"} group flex-col gap-2`}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                  <img
                    {...imgProps(c.image, { width: 400, widths: [200, 320, 480], sizes: "(max-width: 640px) 33vw, 180px" })}
                    alt={c.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(0_0_0/0.55),transparent_55%)]" />
                  <span className="absolute left-2.5 bottom-2 right-2 font-display text-sm sm:text-lg uppercase text-primary-foreground leading-tight line-clamp-2">
                    {c.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {cats.length > 6 && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setShowAllCats((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-muted"
              >
                {showAllCats ? "Show less" : "All categories"}
                <ChevronRight className={`h-3.5 w-3.5 transition ${showAllCats ? "-rotate-90" : "rotate-90"}`} />
              </button>
            </div>
          )}
        </section>
      );
    },

    deals: (s) => (
      <section className="max-w-7xl mx-auto px-4 mt-14 md:mt-20">
        <SectionHead
          index="02"
          eyebrow="Offers"
          title={builtinText(s, "title") || "Deals of the week"}
          subtitle={builtinText(s, "subtitle")}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {dealBanners.map((d, i) => (
            <Link
              key={d.title}
              to="/search"
              search={{ q: "" }}
              className={`group relative overflow-hidden rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-40 sm:min-h-56 ${
                i === 0
                  ? "bg-gradient-brand text-primary-foreground md:col-span-2"
                  : "bg-gradient-soft text-foreground border border-border"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">{d.title}</p>
              <div>
                <p className="font-display text-3xl sm:text-5xl uppercase">{d.sub}</p>
                <p className="mt-1 text-xs opacity-75">{d.note}</p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em]">
                Shop now
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    ),

    hot: (s) => {
      const limit = builtinLimit(s);
      const picked = pickProducts(pool, "flash_sale", limit);
      const items = picked.length ? picked : trending.slice(0, limit);
      if (items.length === 0) return null;
      const row = [...items, ...items];
      const bg = builtinBg(s);
      const fg = readableOn(bg);
      return (
        <section className="mx-auto mt-14 max-w-7xl px-4 md:mt-20">
          <div
            className="overflow-hidden rounded-3xl py-12 md:py-16"
            style={{ backgroundColor: bg, color: fg }}
          >
            <div className="mb-8 flex flex-col items-center px-4 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">
                Bestsellers
              </span>
              <h2 className="font-display mt-2 text-3xl uppercase sm:text-5xl">
                {builtinText(s, "title") || "Hot Products"}
              </h2>
              {builtinText(s, "subtitle") && (
                <p className="mt-1 text-sm opacity-75">{builtinText(s, "subtitle")}</p>
              )}
            </div>
            <div
              className="relative"
              style={{
                maskImage: "linear-gradient(90deg, transparent, black 7%, black 93%, transparent)",
                WebkitMaskImage: "linear-gradient(90deg, transparent, black 7%, black 93%, transparent)",
              }}
            >
              <div className="marquee-track flex w-max px-4">
                {row.map((p, i) => (
                  <HotCard key={`${p.slug}-${i}`} p={p} />
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    },

    trending: (s) => {
      const items = trending.slice(0, builtinLimit(s));
      return (
        <section className="max-w-7xl mx-auto px-4 mt-14 md:mt-20">
          <SectionHead
            index="03"
            eyebrow="Editors' pick"
            title={builtinText(s, "title") || "Trending now"}
            subtitle={builtinText(s, "subtitle")}
          />
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet. Add some from the admin panel.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
          <SectionFooter>
            <ViewAll />
          </SectionFooter>
        </section>
      );
    },

    brands: (s) => {
      const list = brands.slice(0, builtinLimit(s));
      return list.length > 0 ? (
        <section id="brands" className="max-w-7xl mx-auto px-4 mt-14 md:mt-20 scroll-mt-24">
          <SectionHead
            index="04"
            eyebrow="Labels we love"
            title={builtinText(s, "title") || "Brands"}
            subtitle={builtinText(s, "subtitle")}
          />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
            {(showAllBrands ? list : list.slice(0, 6)).map((b) => (
              <Link
                key={b.slug}
                to="/search"
                search={{ q: b.name }}
                className="group aspect-[4/3] rounded-2xl border border-border bg-card hover:border-transparent hover:bg-gradient-soft transition-colors flex flex-col items-center justify-center gap-1.5 px-3 text-center"
              >
                {b.logo ? (
                  <img
                    {...imgProps(b.logo, { width: 240, widths: [120, 240, 360], sizes: "160px" })}
                    alt={`${b.name} logo`}
                    className="h-8 sm:h-10 w-auto max-w-full object-contain grayscale group-hover:grayscale-0 transition"
                  />
                ) : null}
                <span className="font-display text-sm sm:text-base uppercase line-clamp-1">{b.name}</span>
              </Link>
            ))}
          </div>
          {list.length > 6 && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setShowAllBrands((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-muted"
              >
                {showAllBrands ? "Show less" : "All brands"}
                <ChevronRight className={`h-3.5 w-3.5 transition ${showAllBrands ? "-rotate-90" : "rotate-90"}`} />
              </button>
            </div>
          )}
        </section>
      ) : null;
    },

    trust: (s) => (
      <section className="max-w-7xl mx-auto px-4 mt-16 md:mt-24">
        <div className="rounded-[1.75rem] bg-gradient-brand text-primary-foreground p-6 md:p-10 shadow-brand">
          {(builtinText(s, "title") || builtinText(s, "subtitle")) && (
            <div className="mb-7 max-w-2xl">
              {builtinText(s, "title") && (
                <h2 className="font-display text-3xl sm:text-5xl uppercase">{builtinText(s, "title")}</h2>
              )}
              {builtinText(s, "subtitle") && (
                <p className="mt-1 text-sm opacity-85">{builtinText(s, "subtitle")}</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: Truck, title: "Fast Delivery", sub: "All over Bangladesh" },
              { icon: ShieldCheck, title: "100% Authentic", sub: "Sourced directly" },
              { icon: RefreshCw, title: "Easy Returns", sub: "7-day return policy" },
              { icon: Headphones, title: "24/7 Support", sub: "Talk to our team" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-background/20 grid place-items-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg uppercase leading-none">{title}</p>
                  <p className="text-xs opacity-80 mt-1">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
  };


  return (
    <div className="min-h-screen bg-background">
      <SiteTheme settings={settings} />
      <SiteHeader categories={categories} settings={settings} />

      {order.map((s, idx) =>
        s.kind === "products" ? (
          <section key={s.id} className="max-w-7xl mx-auto px-4 mt-14 md:mt-20">
            <SectionHead
              index={String(idx + 1).padStart(2, "0")}
              eyebrow="Curated"
              title={s.title?.trim() || PRODUCT_SOURCE_LABELS[s.source ?? "latest"]}
              subtitle={s.subtitle || undefined}
            />
            {(() => {
              const items = pickProducts(pool, s.source, s.limit ?? 10);
              return items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products in this section yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {items.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                  ))}
                </div>
              );
            })()}
            <SectionFooter>
              <ViewAll />
            </SectionFooter>
          </section>
        ) : (
          <div key={s.id}>{blocks[s.id]?.(s)}</div>
        ),
      )}

      <div className="mt-16 md:mt-24">
        <SiteFooter categories={categories} settings={settings} />
      </div>
    </div>
  );
}
