import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getSiteSettings } from "@/lib/storefront.functions";
import { SiteTheme } from "@/components/storefront/SiteTheme";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { DEFAULT_SETTINGS, siteHead, type SiteSettings } from "@/lib/site-settings";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { imgProps } from "@/lib/image";

export const Route = createFileRoute("/wishlist")({
  loader: () => getSiteSettings(),
  head: ({ loaderData }) => {
    const settings = (loaderData as SiteSettings) ?? DEFAULT_SETTINGS;
    return siteHead(settings, {
      title: `Wishlist — ${settings.store_name}`,
      description: `Your saved beauty and skincare products at ${settings.store_name}.`,
      path: "/wishlist",
    });
  },
  component: WishlistPage,
});

function WishlistPage() {
  const settings = (Route.useLoaderData() as SiteSettings) ?? DEFAULT_SETTINGS;
  const { items, remove, ready } = useWishlist();
  const { add } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <SiteTheme settings={settings} />
      <SiteHeader categories={[]} settings={settings} />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
          <Heart className="h-6 w-6 text-[color:var(--brand-pink)]" /> Wishlist
        </h1>

        {ready && items.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">You haven't saved anything yet.</p>
            <Link to="/search" search={{ q: "" }} className="mt-4 inline-block font-bold text-[color:var(--brand-pink)]">
              Browse products →
            </Link>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((p) => (
            <div key={p.slug} className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col">
              <Link to="/product/$slug" params={{ slug: p.slug }}>
                <img
                  {...imgProps(p.image, { width: 480, widths: [240, 360, 480], sizes: "(max-width: 640px) 45vw, 260px" })}
                  alt={p.name}
                  className="aspect-square w-full object-cover"
                />
              </Link>
              <div className="p-3 flex flex-col flex-1">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.brand}</p>
                <Link to="/product/$slug" params={{ slug: p.slug }}>
                  <h2 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] mt-1 hover:text-[color:var(--brand-pink)]">
                    {p.name}
                  </h2>
                </Link>
                <p className="mt-2 text-base font-black text-[color:var(--brand-pink)]">৳{p.price}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      add({ slug: p.slug, name: p.name, price: p.price, image: p.image });
                      toast.success("Added to bag");
                    }}
                    className="flex-1 rounded-full bg-[color:var(--brand-pink)] text-white text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Add to bag
                  </button>
                  <button
                    onClick={() => remove(p.slug)}
                    aria-label={`Remove ${p.name} from wishlist`}
                    className="h-8 w-8 shrink-0 grid place-items-center rounded-full border border-border text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SiteFooter categories={[]} settings={settings} />
    </div>
  );
}
