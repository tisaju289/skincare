import { createFileRoute } from "@tanstack/react-router";
import { searchProducts } from "@/lib/storefront.functions";
import type { Category, Product } from "@/lib/shop-data";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { ProductCard } from "@/components/storefront/ProductCard";

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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader categories={categories} />

      <section className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-black">{q ? `Results for “${q}”` : "All products"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{products.length} products</p>

        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground py-16 text-center">
            No products matched your search. Try a different keyword.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter categories={categories} />
    </div>
  );
}
