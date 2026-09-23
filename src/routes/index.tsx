import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gift,
  Headphones,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import { SiteTheme } from "@/components/storefront/SiteTheme";
import { getHomeData } from "@/lib/storefront.functions";
import { imgProps } from "@/lib/image";
import { pickProducts, type Category, type Product } from "@/lib/shop-data";
import {
  DEFAULT_SETTINGS,
  normalizeHeroSlides,
  normalizeShelfPromos,
  siteHead,
  type ShelfPromo,
  type SiteSettings,
} from "@/lib/site-settings";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: ({ loaderData }) => siteHead(loaderData?.settings ?? DEFAULT_SETTINGS, { path: "/" }),
  component: Index,
});

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex flex-col items-center text-center">
      <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

function ViewAllLink({ href = "/search" }: { href?: string }) {
  return (
    <div className="mt-4 flex justify-center">
      <Link to={href} search={href === "/search" ? { q: "" } : undefined} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
        View All <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function CategorySidebar({ categories }: { categories: Category[] }) {
  return (
    <aside className="hidden w-48 shrink-0 border border-border bg-card lg:block">
      <div className="flex h-11 items-center gap-2 bg-secondary px-4 text-xs font-bold text-foreground">
        <span className="text-base">☰</span> Shop by Category
      </div>
      <nav>
        {categories.slice(0, 9).map((category) => (
          <Link
            key={category.slug}
            to="/category/$slug"
            params={{ slug: category.slug }}
            className="flex h-10 items-center justify-between border-t border-border px-4 text-xs transition-colors first:border-t-0 hover:bg-secondary hover:text-primary"
          >
            <span>{category.name}</span><ChevronRight className="h-3 w-3 text-muted-foreground" />
          </Link>
        ))}
      </nav>
    </aside>
  );
}

const benefits = [
  { icon: Truck, title: "Free Shipping", text: "On orders over ৳999" },
  { icon: ShieldCheck, title: "100% Authentic", text: "Trusted brands" },
  { icon: PackageCheck, title: "Easy Returns", text: "Hassle-free shopping" },
  { icon: LockKeyhole, title: "Secure Payments", text: "Shop with confidence" },
  { icon: Headphones, title: "24/7 Support", text: "We're here for you" },
];

function PromoBanner({ promo }: { promo: ShelfPromo }) {
  const image = (promo.image ?? "").trim();
  if (!promo.enabled || !image) return null;
  const href = (promo.link ?? "").trim() || "/search";
  const inner = (
    <img
      {...imgProps(image, { width: 560, widths: [320, 560], sizes: "(max-width: 1024px) 100vw, 17rem" })}
      alt=""
      className="h-full w-full object-cover transition duration-500 hover:scale-105"
    />
  );
  const cls = "block h-full min-h-44 overflow-hidden border border-border bg-muted";
  return href.startsWith("/") ? (
    <Link to={href} className={cls}>{inner}</Link>
  ) : (
    <a href={href} className={cls} target="_blank" rel="noreferrer">{inner}</a>
  );
}

function ProductShelf({ title, subtitle, products, promo }: { title: string; subtitle: string; products: Product[]; promo: ShelfPromo }) {
  const hasPromo = promo.enabled && Boolean((promo.image ?? "").trim());
  return (
    <section className={`section-soft mt-8 rounded-xl p-4 grid gap-4 ${hasPromo ? "lg:grid-cols-[1fr_17rem]" : ""}`}>
      <div className="min-w-0">
        <SectionTitle title={title} subtitle={subtitle} />
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3 xl:grid-cols-5">
          {products.slice(0, 5).map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
        <ViewAllLink />
      </div>
      <PromoBanner promo={promo} />
    </section>
  );
}

function HotProducts({ products }: { products: Product[] }) {
  const items = products.length ? products : [];
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-950 via-red-900 to-rose-950 shadow-lg">
      <div className="flex flex-col items-center gap-1 px-5 py-5 text-center">
        <span className="text-2xl">🔥</span>
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-orange-100">Hot Products</h2>
          <p className="text-[11px] text-orange-200/70">Trending now — grab them before they're gone</p>
        </div>
      </div>
      <div className="group relative overflow-hidden py-5">
        <div className="marquee-track flex w-max gap-3 px-4">
          {loop.map((p, i) => (
            <div key={`${p.slug}-${i}`} className="w-48 shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function useCountdown(targetMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, targetMs - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { h, m, s };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function FlashSale({ products }: { products: Product[] }) {
  // Countdown resets every 12 hours from load
  const [target] = useState(() => Date.now() + 12 * 3_600_000);
  const { h, m, s } = useCountdown(target);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || products.length <= 1) return;
    const id = setInterval(() => {
      const card = el.querySelector<HTMLElement>("[data-card]");
      const step = card ? card.offsetWidth + 12 : el.clientWidth * 0.8;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollBy({ left: atEnd ? -el.scrollWidth : step, behavior: "smooth" });
    }, 3500);
    return () => clearInterval(id);
  }, [products.length]);

  if (!products.length) return null;
  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="flex flex-col items-center gap-3 px-5 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-primary">Flash Sale</h2>
            <p className="text-[11px] text-muted-foreground">Limited time deals — hurry up!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Ends in</span>
          <div className="flex items-center gap-1">
            {[
              { v: h, l: "Hrs" },
              { v: m, l: "Min" },
              { v: s, l: "Sec" },
            ].map((unit, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground tabular-nums">
                  {pad(unit.v)}
                </span>
                {i < 2 && <span className="text-primary font-bold">:</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="relative">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollByCard(-1)}
          className="absolute left-1 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-md transition hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.slug} data-card className="w-44 shrink-0 sm:w-48">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollByCard(1)}
          className="absolute right-1 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-md transition hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
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
  const categories = data.categories.filter((category) => !category.parent);
  const pool = data.products.length ? data.products : data.trending;
  const newArrivals = pickProducts(pool, "new_arrival", 5);
  const bestSellers = pickProducts(pool, "best_seller", 5);
  const firstShelf = (newArrivals.length ? newArrivals : pool).slice(0, 5);
  const secondShelf = (bestSellers.length ? bestSellers : [...pool].reverse()).slice(0, 5);
  const slides = normalizeHeroSlides(data.settings.hero_slides);
  const promos = normalizeShelfPromos(data.settings.shelf_promos);

  return (
    <div className="min-h-screen bg-background">
      <SiteTheme settings={data.settings} />
      <SiteHeader categories={data.categories} settings={data.settings} />

      <main className="mx-auto max-w-7xl px-4 pb-12">
        <section className="flex gap-0 pt-3">
          <CategorySidebar categories={categories} />
          <div className="min-w-0 flex-1"><HeroSlider slides={slides} /></div>
        </section>


        <section className="section-soft mt-8 rounded-xl p-4">
          <SectionTitle title="Shop by Category" subtitle="Find your beauty essentials." />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="group relative aspect-square overflow-hidden border border-border bg-muted"
              >
                <img {...imgProps(category.image, { width: 300, widths: [160, 300], sizes: "(max-width: 640px) 50vw, 16vw" })} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-background/40 p-2 transition group-hover:bg-background/25">
                  <span className="font-display text-sm font-semibold text-foreground drop-shadow-sm md:text-base">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
          <ViewAllLink href="/categories" />
        </section>

        <FlashSale products={pickProducts(pool, "flash_sale", 5).length ? pickProducts(pool, "flash_sale", 5) : pickProducts(pool, "discount", 5)} />

        <HotProducts products={pickProducts(pool, "trending", 12)} />

        <ProductShelf title="New Arrivals" subtitle="Fresh beauty picks, just for you." products={firstShelf} promo={promos[0]} />
        <ProductShelf title="Best Sellers" subtitle="Loved by thousands. Beauty that delivers." products={secondShelf} promo={promos[1]} />

        <section className="section-soft mt-8 rounded-xl p-4">
          <SectionTitle title="Featured Collections" subtitle="Everything for your daily beauty ritual." />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category) => (
              <Link key={category.slug} to="/category/$slug" params={{ slug: category.slug }} className="group relative aspect-[1.65/1] overflow-hidden bg-muted">
                <img {...imgProps(category.image, { width: 600, widths: [320, 480, 600], sizes: "(max-width: 640px) 100vw, 25vw" })} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/55 to-transparent p-4">
                  <h3 className="font-display text-lg font-semibold">{category.name}</h3>
                  <p className="mt-1 max-w-32 text-[11px] text-muted-foreground">Discover your everyday essentials.</p>
                  <span className="mt-4 inline-flex items-center gap-1 border border-foreground px-2.5 py-1.5 text-[10px] font-semibold">Shop Now <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
            ))}
          </div>
          <ViewAllLink href="/categories" />
        </section>

        <section className="section-soft mt-8 rounded-xl p-4 lg:grid lg:grid-cols-[1fr_20rem] lg:gap-4">
          <div>
            <SectionTitle title="Beauty Articles" subtitle="Tips, trends and stories for a more beautiful you." />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {categories.slice(0, 4).map((category, index) => (
                <Link key={category.slug} to="/category/$slug" params={{ slug: category.slug }} className="border border-border bg-card">
                  <div className="aspect-[4/3] overflow-hidden bg-muted"><img {...imgProps(category.image, { width: 420, widths: [240, 420], sizes: "25vw" })} alt="" className="h-full w-full object-cover" /></div>
                  <div className="p-3"><h3 className="font-display text-sm font-semibold">{index + 5} {category.name} Habits for Glowing Skin</h3><p className="mt-2 text-[10px] text-muted-foreground">Sep {10 + index}, 2026</p></div>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center bg-secondary p-6">
            <Gift className="mb-3 h-7 w-7 text-primary" />
            <h2 className="font-display text-2xl font-semibold">Join the {data.settings.store_name} Circle</h2>
            <p className="mt-2 text-xs text-muted-foreground">Get exclusive offers, beauty tips and new arrivals directly to your inbox.</p>
          </div>
        </section>

        {data.brands.length > 0 ? (
          <section className="section-soft mt-8 rounded-xl py-6">
            <div className="grid grid-cols-3 items-center gap-5 sm:grid-cols-4 lg:grid-cols-8">
              {data.brands.slice(0, 8).map((brand) => (
                <Link key={brand.slug} to="/brand/$slug" params={{ slug: brand.slug }} className="grid h-12 place-items-center grayscale transition hover:grayscale-0">
                  {brand.logo ? <img {...imgProps(brand.logo, { width: 180, widths: [120, 180], sizes: "150px" })} alt={brand.name} className="max-h-10 max-w-full object-contain" /> : <span className="font-display text-sm font-semibold uppercase">{brand.name}</span>}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter categories={data.categories} settings={data.settings} />
    </div>
  );
}