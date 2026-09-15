import { createFileRoute, Link } from "@tanstack/react-router";
import { getCategoriesPage } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { SiteTheme } from "@/components/storefront/SiteTheme";
import { imgProps } from "@/lib/image";
import { siteHead, DEFAULT_SETTINGS } from "@/lib/site-settings";

export const Route = createFileRoute("/categories")({
  loader: () => getCategoriesPage(),
  head: ({ loaderData }) =>
    siteHead(loaderData?.settings ?? DEFAULT_SETTINGS, {
      title: `All Categories — ${(loaderData?.settings ?? DEFAULT_SETTINGS).store_name}`,
      description: "Browse every product category in our store, with cash on delivery across Bangladesh.",
      path: "/categories",
    }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, settings } = Route.useLoaderData();
  const tops = categories.filter((c) => !c.parent);

  return (
    <div className="min-h-screen bg-background">
      <SiteTheme settings={settings} />
      <SiteHeader categories={categories} settings={settings} />

      <section className="max-w-7xl mx-auto px-4 pt-8 pb-14">
        <div className="text-center">
          <p className="eyebrow">Shop by need</p>
          <h1 className="font-display text-3xl sm:text-5xl uppercase mt-2">All Categories</h1>
          <p className="text-sm text-muted-foreground mt-2">{tops.length} categories available</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-8">
          {tops.map((c) => {
            const kids = categories.filter((k) => k.parent === c.slug);
            return (
              <div key={c.slug} className="rounded-2xl border border-border bg-card overflow-hidden">
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group block"
                >
                  <div className={`aspect-[4/3] grid place-items-center overflow-hidden bg-gradient-to-br ${c.color}`}>
                    {c.image ? (
                      <img
                        {...imgProps(c.image, { width: 480, widths: [240, 480, 720], sizes: "300px" })}
                        alt={`${c.name} category`}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <span className="font-display text-3xl uppercase text-white/90">{c.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="p-3 text-center">
                    <p className="font-display text-base sm:text-lg uppercase line-clamp-1">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.count} products</p>
                  </div>
                </Link>
                {kids.length > 0 && (
                  <div className="border-t border-border px-3 py-2 flex flex-wrap gap-x-3 gap-y-1 justify-center">
                    {kids.map((k) => (
                      <Link
                        key={k.slug}
                        to="/category/$slug"
                        params={{ slug: k.slug }}
                        className="text-[12px] text-muted-foreground hover:text-primary"
                      >
                        {k.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <SiteFooter categories={categories} settings={settings} />
    </div>
  );
}
