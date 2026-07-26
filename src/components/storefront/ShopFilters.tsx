import { Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import type { Category } from "@/lib/shop-data";

type Props = {
  categories: Category[];
  activeSlug?: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
};

export function ShopFilters({ categories, activeSlug, min, max, value, onChange }: Props) {
  const [lo, hi] = value;

  return (
    <aside className="space-y-4">
      {/* Price range */}
      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[color:var(--brand-pink)]" />
          <h2 className="text-sm font-black">Price range</h2>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <label className="flex-1 min-w-0">
            <span className="text-[10px] uppercase text-muted-foreground">Min</span>
            <input
              type="number"
              min={min}
              max={hi}
              value={lo}
              onChange={(e) => onChange([Math.min(Number(e.target.value) || 0, hi), hi])}
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm bg-background"
            />
          </label>
          <span className="text-muted-foreground pt-4">–</span>
          <label className="flex-1 min-w-0">
            <span className="text-[10px] uppercase text-muted-foreground">Max</span>
            <input
              type="number"
              min={lo}
              max={max}
              value={hi}
              onChange={(e) => onChange([lo, Math.max(Number(e.target.value) || 0, lo)])}
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm bg-background"
            />
          </label>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          value={hi}
          aria-label="Maximum price"
          onChange={(e) => onChange([Math.min(lo, Number(e.target.value)), Number(e.target.value)])}
          className="mt-4 w-full accent-[color:var(--brand-pink)]"
        />
        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>৳{lo}</span>
          <span>৳{hi}</span>
        </div>
        <button
          onClick={() => onChange([min, max])}
          className="mt-3 text-xs font-bold text-[color:var(--brand-pink)]"
        >
          Reset price
        </button>
      </div>

      {/* Categories */}
      <div className="rounded-2xl border border-border bg-white p-4">
        <h2 className="text-sm font-black">Categories</h2>
        <ul className="mt-3 space-y-1">
          <li>
            <Link
              to="/search"
              search={{ q: "" }}
              className={`block rounded-lg px-3 py-2 text-sm ${
                activeSlug ? "hover:bg-muted text-foreground/80" : "bg-[color:var(--brand-pink)] text-white font-bold"
              }`}
            >
              All products
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                to="/category/$slug"
                params={{ slug: c.slug }}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  activeSlug === c.slug
                    ? "bg-[color:var(--brand-pink)] text-white font-bold"
                    : "hover:bg-muted text-foreground/80"
                }`}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
