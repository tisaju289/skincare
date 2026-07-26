import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Heart, User, ShoppingBag, ChevronRight, Truck, ShieldCheck, RefreshCw, Headphones, Star } from "lucide-react";
import { categories, products, brands } from "@/lib/shop-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shajgoj — Beauty, Skincare & Cosmetics Store" },
      { name: "description", content: "Shop authentic makeup, skincare, haircare, fragrance and personal care products at unbeatable prices." },
      { property: "og:title", content: "Shajgoj — Beauty, Skincare & Cosmetics Store" },
      { property: "og:description", content: "Shop authentic makeup, skincare, haircare, fragrance and personal care products at unbeatable prices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const pillNav = [
  { name: "UNDERGARMENTS", bg: "bg-[color:var(--brand-pink)]" },
  { name: "COMBO", bg: "bg-[color:var(--brand-magenta)]" },
  { name: "JEWELLERY", bg: "bg-[color:var(--brand-purple)]" },
  { name: "CLEARANCE SALE", bg: "bg-[color:var(--brand-teal)]" },
  { name: "MEN", bg: "bg-[color:var(--brand-green)]" },
];

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
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[color:var(--brand-pink)] text-white text-xs sm:text-sm text-center py-2 px-4">
        Free delivery on orders over ৳999 · Cash on delivery available all over Bangladesh
      </div>

      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4">
          <Link to="/" className="text-xl sm:text-3xl font-black tracking-tight text-foreground shrink-0">SHAJGOJ</Link>
          <button className="hidden lg:block text-sm font-semibold text-foreground/70 hover:text-foreground shrink-0">BRANDS</button>
          <div className="hidden md:block flex-1 relative min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--brand-pink)]" />
            <input type="text" placeholder="Search for products, brands and more…" className="w-full rounded-full border-2 border-[color:var(--brand-pink)]/30 focus:border-[color:var(--brand-pink)] outline-none pl-11 pr-4 py-2.5 text-sm bg-white" />
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button className="hidden lg:flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs font-semibold">
              <Heart className="h-4 w-4" /> WISHLIST
            </button>
            <button className="hidden sm:flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold">
              <User className="h-4 w-4" /> LOGIN
            </button>
            <button className="flex items-center gap-2 rounded-full bg-[color:var(--brand-pink)] text-white px-3 sm:px-4 py-2 text-xs font-semibold">
              <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">BAG</span>
              <span className="bg-white text-[color:var(--brand-pink)] rounded-full h-5 w-5 grid place-items-center text-[10px] font-bold">0</span>
            </button>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3 relative">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--brand-pink)]" />
          <input type="text" placeholder="Search products…" className="w-full rounded-full border-2 border-[color:var(--brand-pink)]/30 focus:border-[color:var(--brand-pink)] outline-none pl-11 pr-4 py-2.5 text-sm bg-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="text-sm font-semibold text-foreground/80 hover:text-[color:var(--brand-pink)] whitespace-nowrap py-1">
              {c.name}
            </Link>
          ))}
          <div className="flex items-center gap-2 lg:ml-auto">
            {pillNav.map((p) => (
              <button key={p.name} className={`${p.bg} text-white text-[11px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap`}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </header>


      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-[color:var(--brand-lilac)]">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: "repeating-conic-gradient(from 0deg, oklch(0.95 0.05 300) 0deg 10deg, transparent 10deg 20deg)",
          }} />
          <div className="relative grid md:grid-cols-2 gap-6 p-6 sm:p-8 md:p-14 items-center">
            <div>
              <p className="text-xs sm:text-sm font-bold tracking-widest text-blue-700">UNILEVER <span className="text-foreground/70">PRESENTS</span></p>
              <div className="mt-3 sm:mt-4 inline-block bg-pink-500 text-white text-2xl sm:text-4xl font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded">JULY</div>
              <h1 className="mt-3 text-4xl sm:text-6xl lg:text-7xl font-black leading-none text-blue-900 -rotate-2">JAW<br />DROPPERS</h1>
              <button className="mt-6 sm:mt-8 inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base">
                SHOP NOW <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="relative flex flex-col md:block items-center md:justify-end md:pb-0">
              <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80" alt="Beauty products" className="rounded-2xl shadow-2xl max-h-56 sm:max-h-72 w-full object-cover" />
              <div className="mt-3 md:mt-0 text-center md:text-right md:absolute md:-bottom-6 md:right-0">
                <p className="text-base sm:text-xl font-bold text-blue-900">UP TO</p>
                <p className="text-5xl sm:text-7xl lg:text-8xl font-black text-blue-900 leading-none drop-shadow">45%<span className="text-2xl sm:text-4xl"> OFF</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category circles */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((c) => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="flex flex-col items-center gap-2 group">
              <div className={`h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br ${c.color} shadow-lg group-hover:scale-105 transition overflow-hidden ring-4 ring-white`}>
                <img src={c.image} alt={c.name} className="h-full w-full object-cover mix-blend-multiply opacity-90" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Beauty must haves banner */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-sky-100 via-white to-pink-100 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="text-2xl sm:text-3xl md:text-5xl font-black text-blue-900">BEAUTY MUST HAVES</p>
            <div className="mt-3 inline-block bg-blue-900 text-white font-bold px-4 py-1.5 rounded text-sm">EXCLUSIVE SAVINGS</div>
          </div>
          <img src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80" alt="" className="h-24 sm:h-32 rounded-xl object-cover" />
          <button className="rounded-full bg-blue-900 text-white font-bold px-6 py-3 whitespace-nowrap">Explore →</button>
        </div>
      </section>

      {/* Deals */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-center text-lg font-black tracking-widest text-foreground">DEALS YOU CANNOT MISS</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {dealBanners.map((d) => (
            <div key={d.title} className={`aspect-square rounded-2xl bg-gradient-to-br ${d.from} ${d.to} p-4 sm:p-6 flex flex-col justify-between shadow-sm`}>
              <p className="text-xs sm:text-sm font-bold text-foreground/80">{d.title}</p>
              <p className="text-xl sm:text-3xl font-black text-foreground">{d.sub}</p>
              <button className="self-start text-xs font-bold bg-white/80 rounded-full px-3 py-1.5">Shop now</button>
            </div>
          ))}
        </div>
      </section>

      {/* Trending products */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black">Trending Now</h2>
            <p className="text-sm text-muted-foreground">Bestsellers this week</p>
          </div>
          <button className="text-sm font-semibold text-[color:var(--brand-pink)] hover:underline">View all →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.slice(0, 10).map((p) => (
            <Link to="/product/$slug" params={{ slug: p.slug }} key={p.slug} className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition">
              <div className={`relative aspect-square ${p.color} flex items-center justify-center overflow-hidden`}>
                <span className="absolute top-2 left-2 z-10 bg-[color:var(--brand-pink)] text-white text-[10px] font-bold px-2 py-1 rounded">{p.tag}</span>
                <button className="absolute top-2 right-2 z-10 h-8 w-8 bg-white/90 rounded-full grid place-items-center hover:bg-white">
                  <Heart className="h-4 w-4" />
                </button>
                <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition" loading="lazy" />
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.brand}</p>
                <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] mt-1">{p.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i <= Math.round(p.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}
                  <span className="text-[10px] text-muted-foreground ml-1">({p.reviews})</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-black text-[color:var(--brand-pink)]">৳{p.price}</span>
                  <span className="text-xs text-muted-foreground line-through">৳{p.old}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by brand */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black">Shop by Brand</h2>
          <button className="text-sm font-semibold text-[color:var(--brand-pink)] hover:underline">All brands →</button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {brands.map((b, i) => (
            <div key={b} className={`${brandColors[i % brandColors.length]} aspect-video rounded-xl grid place-items-center font-bold text-foreground/80 hover:scale-[1.02] transition cursor-pointer`}>
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* Wide promo strip */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white overflow-hidden">
            <div className="relative z-10 max-w-[65%] sm:max-w-[60%]">
              <p className="text-xs font-bold tracking-widest opacity-80">NEW ARRIVALS</p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-black">Korean Skincare Edit</h3>
              <p className="mt-1 text-sm opacity-90">Glass-skin favourites, freshly landed.</p>
              <button className="mt-6 bg-white text-fuchsia-600 font-bold rounded-full px-6 py-2.5 text-sm">Discover</button>
            </div>
            <img src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=400&q=80" alt="" className="absolute right-0 bottom-0 h-full w-1/2 object-cover opacity-60" />
          </div>
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-violet-500 to-purple-700 text-white overflow-hidden">
            <div className="relative z-10 max-w-[65%] sm:max-w-[60%]">
              <p className="text-xs font-bold tracking-widest opacity-80">FRAGRANCE</p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-black">Signature Scents Under ৳1500</h3>
              <p className="mt-1 text-sm opacity-90">Find your everyday perfume.</p>
              <button className="mt-6 bg-white text-purple-700 font-bold rounded-full px-6 py-2.5 text-sm">Shop now</button>
            </div>
            <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80" alt="" className="absolute right-0 bottom-0 h-full w-1/2 object-cover opacity-60" />
          </div>
        </div>
      </section>

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

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="rounded-3xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white p-6 sm:p-8 md:p-12 text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">Join the Shajgoj beauty club</h3>
          <p className="mt-2 opacity-90 text-sm">Get 10% off your first order + weekly beauty tips.</p>
          <form className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input type="email" placeholder="Enter your email" className="flex-1 min-w-0 rounded-full px-5 py-3 text-foreground outline-none" />
            <button className="rounded-full bg-foreground text-background font-bold px-6 py-3 text-sm whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-2xl font-black">SHAJGOJ</p>
            <p className="mt-3 text-sm opacity-70">Bangladesh's beauty destination for authentic makeup, skincare & fragrance.</p>
          </div>
          <div>
            <p className="font-bold mb-3">Shop</p>
            <ul className="space-y-2 text-sm opacity-80">
              {categories.slice(0, 4).map(c => (
                <li key={c.slug}><Link to="/category/$slug" params={{ slug: c.slug }}>{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold mb-3">Help</p>
            <ul className="space-y-2 text-sm opacity-80"><li>Contact us</li><li>Shipping</li><li>Returns</li><li>FAQ</li></ul>
          </div>
          <div>
            <p className="font-bold mb-3">Company</p>
            <ul className="space-y-2 text-sm opacity-80"><li>About</li><li>Blog</li><li>Careers</li><li>Privacy</li></ul>
          </div>
        </div>
        <div className="border-t border-white/10 text-center text-xs opacity-60 py-4">
          © {new Date().getFullYear()} Shajgoj. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
