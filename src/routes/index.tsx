import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Heart, User, ShoppingBag, ChevronRight, Truck, ShieldCheck, RefreshCw, Headphones, Star } from "lucide-react";

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

const categories = [
  { name: "Makeup", color: "from-pink-400 to-rose-500" },
  { name: "Skin", color: "from-fuchsia-400 to-pink-500" },
  { name: "Hair", color: "from-purple-400 to-fuchsia-500" },
  { name: "Personal care", color: "from-rose-400 to-pink-500" },
  { name: "Mom & Baby", color: "from-pink-300 to-rose-400" },
  { name: "Fragrance", color: "from-violet-400 to-purple-500" },
];

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

const products = [
  { name: "Lakme Absolute Skin Gloss Foundation", brand: "Lakme", price: 1650, old: 1950, tag: "-15%", color: "bg-rose-50" },
  { name: "Ponds Bright Beauty Serum Cream 50g", brand: "Ponds", price: 545, old: 620, tag: "-12%", color: "bg-pink-50" },
  { name: "Maybelline Fit Me Matte + Poreless Foundation", brand: "Maybelline", price: 1290, old: 1490, tag: "-13%", color: "bg-amber-50" },
  { name: "The Ordinary Niacinamide 10% + Zinc 1%", brand: "The Ordinary", price: 990, old: 1200, tag: "-17%", color: "bg-emerald-50" },
  { name: "LOreal Paris Revitalift Hyaluronic Acid Serum", brand: "L'Oreal", price: 1890, old: 2200, tag: "-14%", color: "bg-fuchsia-50" },
  { name: "Nivea Soft Light Moisturizer 100ml", brand: "Nivea", price: 420, old: 490, tag: "-14%", color: "bg-sky-50" },
  { name: "Garnier Micellar Cleansing Water Pink", brand: "Garnier", price: 720, old: 850, tag: "-15%", color: "bg-rose-50" },
  { name: "Lakme 9 to 5 Primer + Matte Lipstick", brand: "Lakme", price: 640, old: 750, tag: "-14%", color: "bg-pink-50" },
  { name: "Ombre Perfume for Her — Iris Flare 100ml", brand: "Ombre", price: 850, old: 1050, tag: "-19%", color: "bg-amber-50" },
  { name: "Senora Feather Light 08 Pads", brand: "Senora", price: 149, old: 199, tag: "-25%", color: "bg-violet-50" },
];

const brands = ["Lakme", "Maybelline", "L'Oreal", "Ponds", "Nivea", "Garnier", "The Ordinary", "Ombre", "Vaseline", "Dove", "Sunsilk", "Head & Shoulders"];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Announcement bar */}
      <div className="bg-[color:var(--brand-pink)] text-white text-xs sm:text-sm text-center py-2 px-4">
        Free delivery on orders over ৳999 · Cash on delivery available all over Bangladesh
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            SHAJGOJ
          </Link>
          <button className="hidden md:block text-sm font-semibold text-foreground/70 hover:text-foreground">
            BRANDS
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--brand-pink)]" />
            <input
              type="text"
              placeholder="Search for products, brands and more…"
              className="w-full rounded-full border-2 border-[color:var(--brand-pink)]/30 focus:border-[color:var(--brand-pink)] outline-none pl-11 pr-4 py-2.5 text-sm bg-white"
            />
          </div>
          <button className="hidden sm:flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs font-semibold">
            <Heart className="h-4 w-4" /> WISHLIST
          </button>
          <button className="hidden sm:flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold">
            <User className="h-4 w-4" /> LOGIN
          </button>
          <button className="flex items-center gap-2 rounded-full bg-[color:var(--brand-pink)] text-white px-4 py-2 text-xs font-semibold">
            <ShoppingBag className="h-4 w-4" /> BAG
            <span className="bg-white text-[color:var(--brand-pink)] rounded-full h-5 w-5 grid place-items-center text-[10px] font-bold">0</span>
          </button>
        </div>

        {/* Category nav */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button key={c.name} className="text-sm font-semibold text-foreground/80 hover:text-[color:var(--brand-pink)] whitespace-nowrap py-1">
              {c.name}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
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
          <div className="relative grid md:grid-cols-2 gap-6 p-8 md:p-14 items-center">
            <div>
              <p className="text-sm font-bold tracking-widest text-blue-700">UNILEVER <span className="text-foreground/70">PRESENTS</span></p>
              <div className="mt-4 inline-block bg-pink-500 text-white text-3xl sm:text-4xl font-black px-4 py-2 rounded">JULY</div>
              <h1 className="mt-3 text-5xl sm:text-7xl font-black leading-none text-blue-900 -rotate-2">
                JAW<br />DROPPERS
              </h1>
              <button className="mt-8 inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-full">
                SHOP NOW <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-900">UP TO</p>
              <p className="text-7xl sm:text-9xl font-black text-blue-900 leading-none">45%<br /><span className="text-5xl sm:text-7xl">OFF</span></p>
            </div>
          </div>
          <div className="flex justify-center gap-2 pb-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${i === 0 ? "bg-pink-500" : "bg-white/70"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Category circles */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
          {categories.map((c) => (
            <button key={c.name} className="flex flex-col items-center gap-2 group">
              <div className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br ${c.color} shadow-lg group-hover:scale-105 transition`} />
              <span className="text-sm font-semibold">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Beauty must haves banner */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-sky-100 via-white to-pink-100 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-3xl md:text-5xl font-black text-blue-900">BEAUTY MUST HAVES</p>
            <div className="mt-3 inline-block bg-blue-900 text-white font-bold px-4 py-1.5 rounded">EXCLUSIVE SAVINGS</div>
          </div>
          <button className="rounded-full bg-blue-900 text-white font-bold px-6 py-3">Explore →</button>
        </div>
      </section>

      {/* Deals you cannot miss */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-center text-lg font-black tracking-widest text-foreground">DEALS YOU CANNOT MISS</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {dealBanners.map((d) => (
            <div key={d.title} className={`aspect-square rounded-2xl bg-gradient-to-br ${d.from} ${d.to} p-6 flex flex-col justify-between shadow-sm`}>
              <p className="text-sm font-bold text-foreground/80">{d.title}</p>
              <p className="text-3xl font-black text-foreground">{d.sub}</p>
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
            <article key={p.name} className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition">
              <div className={`relative aspect-square ${p.color} flex items-center justify-center`}>
                <span className="absolute top-2 left-2 bg-[color:var(--brand-pink)] text-white text-[10px] font-bold px-2 py-1 rounded">{p.tag}</span>
                <button className="absolute top-2 right-2 h-8 w-8 bg-white/90 rounded-full grid place-items-center hover:bg-white">
                  <Heart className="h-4 w-4" />
                </button>
                <div className="h-32 w-20 bg-white/70 rounded-lg shadow-inner grid place-items-center text-[10px] font-bold text-muted-foreground text-center px-1">
                  {p.brand}
                </div>
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.brand}</p>
                <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] mt-1">{p.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                  <span className="text-[10px] text-muted-foreground ml-1">(120)</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-black text-[color:var(--brand-pink)]">৳{p.price}</span>
                  <span className="text-xs text-muted-foreground line-through">৳{p.old}</span>
                </div>
                <button className="mt-3 w-full text-xs font-bold bg-foreground text-background rounded-full py-2 hover:opacity-90">
                  Add to bag
                </button>
              </div>
            </article>
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
          <div className="rounded-3xl p-8 bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
            <p className="text-xs font-bold tracking-widest opacity-80">NEW ARRIVALS</p>
            <h3 className="mt-2 text-3xl font-black">Korean Skincare Edit</h3>
            <p className="mt-1 text-sm opacity-90">Glass-skin favourites, freshly landed.</p>
            <button className="mt-6 bg-white text-fuchsia-600 font-bold rounded-full px-6 py-2.5 text-sm">Discover</button>
          </div>
          <div className="rounded-3xl p-8 bg-gradient-to-br from-violet-500 to-purple-700 text-white">
            <p className="text-xs font-bold tracking-widest opacity-80">FRAGRANCE</p>
            <h3 className="mt-2 text-3xl font-black">Signature Scents Under ৳1500</h3>
            <p className="mt-1 text-sm opacity-90">Find your everyday perfume.</p>
            <button className="mt-6 bg-white text-purple-700 font-bold rounded-full px-6 py-2.5 text-sm">Shop now</button>
          </div>
        </div>
      </section>

      {/* Best of skincare */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black">Best of Skincare</h2>
          <button className="text-sm font-semibold text-[color:var(--brand-pink)] hover:underline">View all →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.slice(0, 5).reverse().concat(products.slice(5, 10)).map((p, i) => (
            <article key={i} className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition">
              <div className={`relative aspect-square ${p.color} flex items-center justify-center`}>
                <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">NEW</span>
                <div className="h-32 w-20 bg-white/70 rounded-lg grid place-items-center text-[10px] font-bold text-muted-foreground text-center px-1">
                  {p.brand}
                </div>
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.brand}</p>
                <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] mt-1">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-black text-[color:var(--brand-pink)]">৳{p.price}</span>
                  <span className="text-xs text-muted-foreground line-through">৳{p.old}</span>
                </div>
              </div>
            </article>
          ))}
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
              <div className="h-12 w-12 rounded-full bg-[color:var(--brand-pink)]/10 grid place-items-center text-[color:var(--brand-pink)]">
                <Icon className="h-6 w-6" />
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
        <div className="rounded-3xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-black">Join the Shajgoj beauty club</h3>
          <p className="mt-2 opacity-90 text-sm">Get 10% off your first order + weekly beauty tips.</p>
          <form className="mt-6 max-w-md mx-auto flex gap-2">
            <input type="email" placeholder="Enter your email" className="flex-1 rounded-full px-5 py-3 text-foreground outline-none" />
            <button className="rounded-full bg-foreground text-background font-bold px-6 py-3 text-sm">Subscribe</button>
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
              <li>Makeup</li><li>Skincare</li><li>Hair</li><li>Fragrance</li>
            </ul>
          </div>
          <div>
            <p className="font-bold mb-3">Help</p>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Contact us</li><li>Shipping</li><li>Returns</li><li>FAQ</li>
            </ul>
          </div>
          <div>
            <p className="font-bold mb-3">Company</p>
            <ul className="space-y-2 text-sm opacity-80">
              <li>About</li><li>Blog</li><li>Careers</li><li>Privacy</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 text-center text-xs opacity-60 py-4">
          © {new Date().getFullYear()} Shajgoj. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
