import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { ChevronRight, Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import { getHomeData } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import { pickProducts, type Category, type Product } from "@/lib/shop-data";
import { SiteTheme } from "@/components/storefront/SiteTheme";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import {
  siteHead,
  DEFAULT_SETTINGS,
  normalizeHomeSections,
  normalizeHeroSlides,
  PRODUCT_SOURCE_LABELS,
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
  { title: "MEGA OFFERS", sub: "UP TO 50% OFF", from: "from-emerald-200", to: "to-teal-100" },
  { title: "STARTING FROM", sub: "৳99 ONLY", from: "from-lime-200", to: "to-green-100" },
  { title: "BUY 2 GET", sub: "৳101 OFF", from: "from-pink-200", to: "to-rose-100" },
  { title: "UP TO", sub: "১৬% ছাড়", from: "from-amber-200", to: "to-orange-100" },
];

const brandColors = [
  "bg-rose-100", "bg-pink-100", "bg-fuchsia-100", "bg-violet-100",
  "bg-purple-100", "bg-amber-100", "bg-emerald-100", "bg-sky-100",
];

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

  const blocks: Record<string, React.ReactNode> = {
    hero: <HeroSlider slides={slides} />,


    categories: (
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6">
          {topCategories.map((c, i) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className={`${i >= 6 && !showAllCats ? "hidden sm:flex" : "flex"} flex-col items-center gap-2 group`}
            >
              <div
                className={`h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br ${c.color} shadow-lg group-hover:scale-105 transition overflow-hidden ring-4 ring-white`}
              >
                <img src={c.image} alt={c.name} className="h-full w-full object-cover mix-blend-multiply opacity-90" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">{c.name}</span>
            </Link>
          ))}
        </div>
        {topCategories.length > 6 && (
          <div className="sm:hidden mt-4 flex justify-center">
            <button
              onClick={() => setShowAllCats((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-xs font-bold uppercase hover:bg-muted"
            >
              {showAllCats ? "Show less" : "All categories"}
              <ChevronRight className={`h-3.5 w-3.5 transition ${showAllCats ? "-rotate-90" : "rotate-90"}`} />
            </button>
          </div>
        )}
      </section>
    ),

    deals: (
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-center text-lg font-black tracking-widest text-foreground">DEALS YOU CANNOT MISS</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {dealBanners.map((d) => (
            <div
              key={d.title}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${d.from} ${d.to} p-4 sm:p-6 flex flex-col justify-between shadow-sm`}
            >
              <p className="text-xs sm:text-sm font-bold text-foreground/80">{d.title}</p>
              <p className="text-xl sm:text-3xl font-black text-foreground">{d.sub}</p>
              <Link to="/search" search={{ q: "" }} className="self-start text-xs font-bold bg-white/80 rounded-full px-3 py-1.5">
                Shop now
              </Link>
            </div>
          ))}
        </div>
      </section>
    ),

    trending: (
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black">Trending Now</h2>
            <p className="text-sm text-muted-foreground">Bestsellers this week</p>
          </div>
          <Link to="/search" search={{ q: "" }} className="text-sm font-semibold text-[color:var(--brand-pink)] hover:underline">
            View all →
          </Link>
        </div>
        {trending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet. Add some from the admin panel.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trending.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>
    ),

    brands:
      brands.length > 0 ? (
        <section id="brands" className="max-w-7xl mx-auto px-4 mt-14 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <h2 className="text-2xl md:text-3xl font-black">Shop by Brand</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {(showAllBrands ? brands : brands.slice(0, 6)).map((b, i) => (
              <Link
                key={b.slug}
                to="/search"
                search={{ q: b.name }}
                className={`${brandColors[i % brandColors.length]} aspect-video rounded-xl overflow-hidden flex flex-col items-center justify-center gap-1 font-bold text-foreground/80 hover:scale-[1.02] transition text-center px-2 py-2 text-xs sm:text-sm`}
              >
                {b.logo ? (
                  <img
                    src={b.logo}
                    alt={`${b.name} logo`}
                    loading="lazy"
                    className="h-8 sm:h-10 w-auto max-w-full object-contain"
                  />
                ) : null}
                <span className="line-clamp-1">{b.name}</span>
              </Link>
            ))}
          </div>
          {brands.length > 6 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowAllBrands((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-xs font-bold uppercase hover:bg-muted"
              >
                {showAllBrands ? "Show less" : "All brands"}
                <ChevronRight className={`h-3.5 w-3.5 transition ${showAllBrands ? "-rotate-90" : "rotate-90"}`} />
              </button>
            </div>
          )}
        </section>
      ) : null,

    trust: (
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted rounded-3xl p-6 md:p-8">
          {[
            { icon: Truck, title: "Free Delivery", sub: "On orders over ৳999" },
            { icon: ShieldCheck, title: "100% Authentic", sub: "Sourced directly" },
            { icon: RefreshCw, title: "Easy Returns", sub: "7-day return policy" },
            { icon: Headphones, title: "24/7 Support", sub: "Talk to our team" },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-[color:var(--brand-pink)]/10 grid place-items-center text-[color:var(--brand-pink)]">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="font-bold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteTheme settings={settings} />
      <SiteHeader categories={categories} settings={settings} />

      {order.map((s) =>
        s.kind === "products" ? (
          <section key={s.id} className="max-w-7xl mx-auto px-4 mt-14">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black">
                  {s.title?.trim() || PRODUCT_SOURCE_LABELS[s.source ?? "latest"]}
                </h2>
                {s.subtitle ? <p className="text-sm text-muted-foreground">{s.subtitle}</p> : null}
              </div>
              <Link to="/search" search={{ q: "" }} className="text-sm font-semibold text-[color:var(--brand-pink)] hover:underline">
                View all →
              </Link>
            </div>
            {(() => {
              const items = pickProducts(pool, s.source, s.limit ?? 10);
              return items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products in this section yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {items.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                  ))}
                </div>
              );
            })()}
          </section>
        ) : (
          <div key={s.id}>{blocks[s.id]}</div>
        ),
      )}

      <SiteFooter categories={categories} settings={settings} />
    </div>
  );
}

