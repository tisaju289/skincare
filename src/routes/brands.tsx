import { createFileRoute, Link } from "@tanstack/react-router";
import { getBrandsPage } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { SiteTheme } from "@/components/storefront/SiteTheme";
import { imgProps } from "@/lib/image";
import { siteHead, DEFAULT_SETTINGS } from "@/lib/site-settings";

export const Route = createFileRoute("/brands")({
  loader: () => getBrandsPage(),
  head: ({ loaderData }) =>
    siteHead(loaderData?.settings ?? DEFAULT_SETTINGS, {
      title: `All Brands — ${(loaderData?.settings ?? DEFAULT_SETTINGS).store_name}`,
      description: "Browse all authentic brands available in our store, with cash on delivery across Bangladesh.",
      path: "/brands",
    }),
  component: BrandsPage,
});

function BrandsPage() {
  const { brands, categories, settings } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteTheme settings={settings} />
      <SiteHeader categories={categories} settings={settings} />

      <section className="max-w-7xl mx-auto px-4 pt-8 pb-14">
        <div className="text-center">
          <p className="eyebrow">Labels we love</p>
          <h1 className="font-display text-3xl sm:text-5xl uppercase mt-2">All Brands</h1>
          <p className="text-sm text-muted-foreground mt-2">{brands.length} brands available</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-8">
          {brands.map((b) => (
            <Link
              key={b.slug}
              to="/brand/$slug"
              params={{ slug: b.slug }}
              className="group rounded-2xl border border-border bg-card p-4 text-center hover:border-transparent hover:bg-gradient-soft transition-colors"
            >
              <div className="aspect-[4/3] grid place-items-center rounded-xl bg-muted/40 overflow-hidden">
                {b.logo ? (
                  <img
                    {...imgProps(b.logo, { width: 360, widths: [180, 360, 540], sizes: "200px" })}
                    alt={`${b.name} logo`}
                    className="h-full w-full object-contain p-3 transition group-hover:scale-105"
                  />
                ) : (
                  <span className="font-display text-2xl uppercase text-muted-foreground">{b.name.slice(0, 2)}</span>
                )}
              </div>
              <p className="font-display text-sm sm:text-base uppercase mt-3 line-clamp-1">{b.name}</p>
              <p className="text-[11px] text-muted-foreground">{b.count} products</p>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter categories={categories} settings={settings} />
    </div>
  );
}
