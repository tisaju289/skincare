import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { searchProducts } from "@/lib/storefront.functions";
import type { Category, Product } from "@/lib/shop-data";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopFilters } from "@/components/storefront/ShopFilters";
import { ProductSearchBar } from "@/components/storefront/ProductSearchBar";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({ q: String(search.q ?? "") }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => searchProducts({ data: { q: deps.q } }),
  head: ({ loaderData }) => {
    const q = loaderData?.q?.trim();
    const title = q ? `Search: ${q} — Shajgoj` : "All Products — Shajgoj";
    const desc = q
      ? `Products matching "${q}" at Shajgoj — authentic beauty, skincare and makeup.`
      : "Browse every authentic beauty, skincare, haircare and fragrance product at Shajgoj.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Nothing found.</div>,
  component: SearchPage,
});

function SearchPage() {
  const data = Route.useLoaderData() as { q: string; products: Product[]; categories: Category[] };
  const { q, products, categories } = data;

  const bounds = useMemo<[number, number]>(() => {
    if (!products.length) return [0, 5000];
    const prices = products.map((p) => p.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  const [range, setRange] = useState<[number, number]>(bounds);
  const [query, setQuery] = useState(q);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.price >= range[0] &&
        p.price <= range[1] &&
        (!term || p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)),
    );
  }, [products, range, query]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader categories={categories} />

      <section className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-black">{q ? `Results for “${q}”` : "All products"}</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <ShopFilters
            categories={categories}
            min={bounds[0]}
            max={bounds[1]}
            value={range}
            onChange={setRange}
          />

          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <ProductSearchBar value={query} onChange={setQuery} />
              <p className="text-sm text-muted-foreground shrink-0">{filtered.length} products</p>
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">
                No products matched your search. Try a different keyword.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter categories={categories} />
    </div>
  );
}

