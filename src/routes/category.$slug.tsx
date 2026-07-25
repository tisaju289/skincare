import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star, ChevronRight, SlidersHorizontal } from "lucide-react";
import { getCategory, getProductsByCategory, categories } from "@/lib/shop-data";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category, products: getProductsByCategory(params.slug) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — Shajgoj` },
          { name: "description", content: `Shop authentic ${loaderData.category.name} products at Shajgoj.` },
          { property: "og:title", content: `${loaderData.category.name} — Shajgoj` },
          { property: "og:description", content: `Shop authentic ${loaderData.category.name} products at Shajgoj.` },
          { property: "og:type", content: "website" },
          { property: "og:image", content: loaderData.category.image },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:image", content: loaderData.category.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <p className="text-2xl font-black">Category not found</p>
        <Link to="/" className="text-[color:var(--brand-pink)] mt-2 inline-block">← Back to home</Link>
      </div>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, products } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[color:var(--brand-pink)] text-white text-xs text-center py-2 px-4">
        Free delivery on orders over ৳999
      </div>
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-2xl font-black tracking-tight">SHAJGOJ</Link>
          <nav className="hidden md:flex items-center gap-5 ml-4">
            {categories.map(c => (
              <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className={`text-sm font-semibold ${c.slug === category.slug ? "text-[color:var(--brand-pink)]" : "text-foreground/70 hover:text-foreground"}`}>
                {c.name}
              </Link>
            ))}
          </nav>
          <button className="ml-auto flex items-center gap-2 rounded-full bg-[color:var(--brand-pink)] text-white px-4 py-2 text-xs font-semibold">
            <ShoppingBag className="h-4 w-4" /> BAG
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-muted-foreground flex items-center gap-1">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{category.name}</span>
      </div>

      <section className="max-w-7xl mx-auto px-4">
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${category.color} p-8 md:p-12 text-white`}>
          <div className="relative z-10 max-w-xl">
            <h1 className="text-4xl md:text-6xl font-black">{category.name}</h1>
            <p className="mt-2 opacity-90">{products.length} products · Curated for you</p>
          </div>
          <img src={category.image} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-40" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">Showing {products.length} results</p>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 text-sm font-semibold border border-border rounded-full px-4 py-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <select className="text-sm font-semibold border border-border rounded-full px-4 py-2 bg-background">
              <option>Sort: Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold">No products yet in this category.</p>
            <Link to="/" className="text-[color:var(--brand-pink)] mt-2 inline-block">Browse all →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link to="/product/$slug" params={{ slug: p.slug }} key={p.slug} className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition">
                <div className={`relative aspect-square ${p.color} overflow-hidden`}>
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
        )}
      </section>

      <div className="h-20" />
    </div>
  );
}
