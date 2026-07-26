import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCategoryPage } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
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

      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-muted-foreground">Showing {products.length} results</p>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
