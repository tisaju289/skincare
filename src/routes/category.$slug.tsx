import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getCategoryPage } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopFilters } from "@/components/storefront/ShopFilters";
import { ProductSearchBar } from "@/components/storefront/ProductSearchBar";
import type { Category, Product } from "@/lib/shop-data";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const data = await getCategoryPage({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — Shajgoj` },
          {
            name: "description",
            content: `Shop ${loaderData.products.length}+ authentic ${loaderData.category.name} products at Shajgoj with cash on delivery.`,
          },
          { property: "og:title", content: `${loaderData.category.name} — Shajgoj` },
          { property: "og:description", content: `Authentic ${loaderData.category.name} products at Shajgoj.` },
          { property: "og:type", content: "website" },
          ...(loaderData.category.image
            ? [
                { property: "og:image", content: loaderData.category.image },
                { name: "twitter:image", content: loaderData.category.image },
              ]
            : []),
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [],
  }),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <p className="text-2xl font-black">Category not found</p>
        <Link to="/" className="text-[color:var(--brand-pink)] mt-2 inline-block">
          ← Back to home
        </Link>
      </div>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const data = Route.useLoaderData() as { category: Category; products: Product[]; categories: Category[] };
  const { category, products, categories } = data;

  const bounds = useMemo<[number, number]>(() => {
    if (!products.length) return [0, 5000];
    const prices = products.map((p) => p.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  const [range, setRange] = useState<[number, number]>(bounds);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.price >= range[0] &&
        p.price <= range[1] &&
        (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)),
    );
  }, [products, range, query]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader categories={categories} />

      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${category.color} p-6 sm:p-8 md:p-12 text-white`}>
          <div className="relative z-10 max-w-xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black">{category.name}</h1>
            <p className="mt-2 opacity-90 text-sm sm:text-base">{products.length} products · Curated for you</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ShopFilters
          categories={categories}
          activeSlug={category.slug}
          min={bounds[0]}
          max={bounds[1]}
          value={range}
          onChange={setRange}
        />

        <div className="min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <ProductSearchBar value={query} onChange={setQuery} placeholder={`Search in ${category.name}…`} />
            <p className="text-sm text-muted-foreground shrink-0">{filtered.length} results</p>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter categories={categories} />
    </div>
  );
}

