import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getBrandPage } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { SiteTheme } from "@/components/storefront/SiteTheme";
import { ProductCard } from "@/components/storefront/ProductCard";
import { imgProps } from "@/lib/image";
import { siteHead, DEFAULT_SETTINGS } from "@/lib/site-settings";

export const Route = createFileRoute("/brand/$slug")({
  loader: async ({ params }) => {
    const data = await getBrandPage({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) =>
    siteHead(loaderData?.settings ?? DEFAULT_SETTINGS, {
      title: loaderData
        ? `${loaderData.brand.name} — ${(loaderData.settings ?? DEFAULT_SETTINGS).store_name}`
        : undefined,
      description: loaderData
        ? `Shop authentic ${loaderData.brand.name} products with cash on delivery.`
        : undefined,
      image: loaderData?.brand.logo || undefined,
      path: `/brand/${params.slug}`,
    }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <p className="text-2xl font-black">Brand not found</p>
        <Link to="/brands" className="text-primary mt-2 inline-block">
          ← All brands
        </Link>
      </div>
    </div>
  ),
  component: BrandPage,
});

function BrandPage() {
  const { brand, products, categories, settings } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteTheme settings={settings} />
      <SiteHeader categories={categories} settings={settings} />

      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="rounded-3xl border border-border bg-gradient-soft p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="h-24 w-32 sm:h-28 sm:w-40 shrink-0 grid place-items-center rounded-2xl bg-card overflow-hidden">
            {brand.logo ? (
              <img
                {...imgProps(brand.logo, { width: 480, widths: [240, 480], sizes: "200px", eager: true })}
                alt={`${brand.name} logo`}
                className="h-full w-full object-contain p-3"
              />
            ) : (
              <span className="font-display text-3xl uppercase text-muted-foreground">{brand.name.slice(0, 2)}</span>
            )}
          </div>
          <div>
            <p className="eyebrow">Brand</p>
            <h1 className="font-display text-3xl sm:text-5xl uppercase mt-1">{brand.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{products.length} products</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-8 pb-14">
        {products.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">No products from this brand yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Link
            to="/brands"
            className="inline-flex items-center rounded-full border border-border px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-muted"
          >
            All brands
          </Link>
        </div>
      </section>

      <SiteFooter categories={categories} settings={settings} />
    </div>
  );
}
