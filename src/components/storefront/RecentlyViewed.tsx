import { Link } from "@tanstack/react-router";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import type { MiniProduct } from "@/lib/mini-product";
import { imgProps } from "@/lib/image";

export function RecentlyViewed({ current, title = "Recently viewed" }: { current?: MiniProduct; title?: string }) {
  const items = useRecentlyViewed(current);
  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-16">
      <h2 className="font-display text-3xl sm:text-4xl mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.slice(0, 6).map((p) => (
          <Link
            key={p.slug}
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="bg-card rounded-md border border-border overflow-hidden hover:border-primary/40 hover:shadow-md transition"
          >
            <img
              {...imgProps(p.image, { width: 360, widths: [200, 360], sizes: "(max-width: 640px) 45vw, 200px" })}
              alt={p.name}
              className="aspect-square w-full object-cover"
            />
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.brand}</p>
              <p className="text-sm font-medium line-clamp-2 min-h-[2.5rem] mt-1">{p.name}</p>
              <p className="mt-1 text-sm font-semibold text-primary">৳{p.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
