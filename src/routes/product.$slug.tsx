import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star, Truck, ShieldCheck, RefreshCw, ChevronRight, Minus, Plus } from "lucide-react";
import { getProduct, products } from "@/lib/shop-data";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Shajgoj` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:type", content: "product" },
          { property: "og:image", content: loaderData.product.image },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <p className="text-2xl font-black">Product not found</p>
        <Link to="/" className="text-[color:var(--brand-pink)] mt-2 inline-block">← Back to home</Link>
      </div>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[color:var(--brand-pink)] text-white text-xs text-center py-2 px-4">
        Free delivery on orders over ৳999 · Cash on delivery available
      </div>
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-2xl font-black tracking-tight">SHAJGOJ</Link>
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-full bg-[color:var(--brand-pink)] text-white px-4 py-2 text-xs font-semibold">
              <ShoppingBag className="h-4 w-4" /> BAG
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-muted-foreground flex items-center gap-1">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/category/$slug" params={{ slug: product.category }} className="hover:text-foreground capitalize">{product.category}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-3">
          <div className={`aspect-square rounded-3xl overflow-hidden ${product.color}`}>
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[0,1,2,3].map(i => (
              <div key={i} className={`aspect-square rounded-xl overflow-hidden ${product.color} border-2 ${i===0 ? "border-[color:var(--brand-pink)]" : "border-transparent"}`}>
                <img src={product.image} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{product.brand}</p>
          <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            {[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}
            <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
          </div>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <span className="text-3xl sm:text-4xl font-black text-[color:var(--brand-pink)]">৳{product.price}</span>
            <span className="text-base sm:text-lg text-muted-foreground line-through">৳{product.old}</span>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">{product.tag}</span>
          </div>
          <p className="mt-6 text-sm text-foreground/80 leading-relaxed">{product.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-border rounded-full shrink-0">
              <button className="h-10 w-10 grid place-items-center"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-bold">1</span>
              <button className="h-10 w-10 grid place-items-center"><Plus className="h-4 w-4" /></button>
            </div>
            <button className="flex-1 min-w-[10rem] rounded-full bg-[color:var(--brand-pink)] text-white font-bold py-3 flex items-center justify-center gap-2 hover:opacity-90">
              <ShoppingBag className="h-4 w-4" /> Add to Bag
            </button>
            <button className="h-12 w-12 shrink-0 rounded-full border border-border grid place-items-center hover:bg-muted">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border pt-6">
            {[
              { icon: Truck, title: "Free Delivery", sub: "Over ৳999" },
              { icon: ShieldCheck, title: "Authentic", sub: "Guaranteed" },
              { icon: RefreshCw, title: "7-day Return", sub: "No hassle" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-[color:var(--brand-pink)]" />
                <div>
                  <p className="text-xs font-bold">{title}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-16">
          <h2 className="text-xl sm:text-2xl font-black mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map((p) => (
              <Link to="/product/$slug" params={{ slug: p.slug }} key={p.slug} className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition">
                <div className={`aspect-square ${p.color} overflow-hidden`}>
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition" loading="lazy" />
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.brand}</p>
                  <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] mt-1">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-black text-[color:var(--brand-pink)]">৳{p.price}</span>
                    <span className="text-xs text-muted-foreground line-through">৳{p.old}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="h-16" />
    </div>
  );
}
