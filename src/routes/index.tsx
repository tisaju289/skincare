import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
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

function SectionTitle({ title, subtitle, href = "/search" }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      <Link to={href} search={href === "/search" ? { q: "" } : undefined} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline">
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
    <section className={`mt-8 grid gap-4 ${hasPromo ? "lg:grid-cols-[1fr_17rem]" : ""}`}>
      <div className="min-w-0">
        <SectionTitle title={title} subtitle={subtitle} />
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3 xl:grid-cols-5">
          {products.slice(0, 5).map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
      </div>
      <PromoBanner promo={promo} />
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

  return (
    <div className="min-h-screen bg-background">
      <SiteTheme settings={data.settings} />
      <SiteHeader categories={data.categories} settings={data.settings} />

      <main className="mx-auto max-w-7xl px-4 pb-12">
        <section className="flex gap-0 pt-3">
          <CategorySidebar categories={categories} />
          <div className="min-w-0 flex-1"><HeroSlider slides={slides} /></div>
        </section>

        <section className="grid grid-cols-2 border-x border-b border-border bg-card md:grid-cols-5">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex min-h-20 items-center gap-3 border-r border-t border-border px-4 first:border-t-0 md:border-t-0 last:border-r-0">
              <Icon className="h-6 w-6 shrink-0 text-foreground" />
              <div><p className="text-xs font-bold">{title}</p><p className="text-[10px] text-muted-foreground">{text}</p></div>
            </div>
          ))}
        </section>

        <ProductShelf title="New Arrivals" subtitle="Fresh beauty picks, just for you." products={firstShelf} promo={promos[0]} />
        <ProductShelf title="Best Sellers" subtitle="Loved by thousands. Beauty that delivers." products={secondShelf} promo={promos[1]} />

        <section className="mt-8">
          <SectionTitle title="Featured Collections" subtitle="Everything for your daily beauty ritual." href="/categories" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_20rem]">
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
          <section className="mt-8 border-y border-border py-6">
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