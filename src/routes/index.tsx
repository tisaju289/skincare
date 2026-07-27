import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import { getHomeData } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { Category, Product } from "@/lib/shop-data";
import { SiteTheme } from "@/components/storefront/SiteTheme";
import { siteHead, DEFAULT_SETTINGS, type SiteSettings } from "@/lib/site-settings";

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
    brands: { slug: string; name: string }[];
    settings: SiteSettings;
  };
  const { categories, trending, brands, settings } = data;


  return (
    <div className="min-h-screen bg-background">
      <>
      <SiteTheme settings={settings} />
      <SiteHeader categories={categories} settings={settings} />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="relative aspect-[16/9] md:aspect-auto rounded-2xl md:rounded-3xl overflow-hidden bg-[color:var(--brand-lilac)]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-conic-gradient(from 0deg, oklch(0.95 0.05 300) 0deg 10deg, transparent 10deg 20deg)",
            }}
          />
          {/* Mobile background image */}
          <img
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80"
            alt=""
            aria-hidden="true"
            className="md:hidden absolute right-0 top-0 h-full w-1/2 object-cover opacity-90"
          />
          <div className="relative h-full md:h-auto grid md:grid-cols-2 gap-6 p-4 sm:p-8 md:p-14 items-center">
            <div className="max-w-[60%] md:max-w-none">
              <p className="text-[10px] sm:text-sm font-bold tracking-widest text-blue-700">
                UNILEVER <span className="text-foreground/70">PRESENTS</span>
              </p>
              <div className="mt-1.5 sm:mt-4 inline-block bg-pink-500 text-white text-base sm:text-4xl font-black px-2 sm:px-4 py-0.5 sm:py-2 rounded">
                JULY
              </div>
              <h1 className="mt-1.5 sm:mt-3 text-2xl sm:text-6xl lg:text-7xl font-black leading-none text-blue-900 -rotate-2">
                JAW
                <br />
                DROPPERS
              </h1>
              <Link
                to="/search"
                search={{ q: "" }}
                className="mt-2.5 sm:mt-8 inline-flex items-center gap-1.5 sm:gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-3.5 sm:px-8 py-1.5 sm:py-3 rounded-full text-[11px] sm:text-base"
              >
                SHOP NOW <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </div>
            <div className="relative hidden md:flex flex-col md:block items-center md:justify-end md:pb-0">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80"
                alt="Beauty products collection"
                className="rounded-2xl shadow-2xl max-h-56 sm:max-h-72 w-full object-cover"
              />
              <div className="mt-3 md:mt-0 text-center md:text-right md:absolute md:-bottom-6 md:right-0">
                <p className="text-base sm:text-xl font-bold text-blue-900">UP TO</p>
                <p className="text-5xl sm:text-7xl lg:text-8xl font-black text-blue-900 leading-none drop-shadow">
                  45%<span className="text-2xl sm:text-4xl"> OFF</span>
                </p>
              </div>
            </div>
          </div>
          {/* Mobile discount badge */}
          <div className="md:hidden absolute bottom-2 right-2 text-right">
            <p className="text-[10px] font-bold text-blue-900">UP TO</p>
            <p className="text-3xl font-black text-blue-900 leading-none drop-shadow">
              45%<span className="text-sm"> OFF</span>
            </p>
          </div>
        </div>

      </section>

      {/* Category circles */}
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


      {/* Deals */}
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

      {/* Trending */}
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

      {/* Brands */}
      {brands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <h2 className="text-2xl md:text-3xl font-black">Shop by Brand</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {brands.map((b, i) => (
              <Link
                key={b.slug}
                to="/search"
                search={{ q: b.name }}
                className={`${brandColors[i % brandColors.length]} aspect-video rounded-xl grid place-items-center font-bold text-foreground/80 hover:scale-[1.02] transition text-center px-2 text-sm`}
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust badges */}
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

      <SiteFooter categories={categories} settings={settings} />
      </>
    </div>
  );
}
