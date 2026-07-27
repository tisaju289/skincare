import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  return (
    <aside className="space-y-3">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="lg:hidden w-full flex items-center justify-between gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-black"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[color:var(--brand-pink)]" />
          Filters &amp; categories
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>




      <div className={`${open ? "block" : "hidden"} lg:block space-y-4`}>
      {/* Price range */}
      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[color:var(--brand-pink)]" />
          <h2 className="text-sm font-black">Price range</h2>
        </div>

        <div className="relative mt-6 h-5">
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[color:var(--brand-pink)]"
            style={{
              left: `${((lo - min) / Math.max(1, max - min)) * 100}%`,
              right: `${100 - ((hi - min) / Math.max(1, max - min)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={lo}
            aria-label="Minimum price"
            onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
            className="range-thumb absolute inset-0 w-full"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={hi}
            aria-label="Maximum price"
            onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
            className="range-thumb absolute inset-0 w-full"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-muted-foreground">
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
          {categories.filter((c) => !c.parent).map((c) => {
            const kids = categories.filter((k) => k.parent === c.slug);
            return (
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
                {kids.length > 0 && (
                  <ul className="ml-3 mt-1 space-y-0.5 border-l border-border pl-2">
                    {kids.map((k) => (
                      <li key={k.slug}>
                        <Link
                          to="/category/$slug"
                          params={{ slug: k.slug }}
                          className={`block rounded-lg px-3 py-1.5 text-[13px] ${
                            activeSlug === k.slug
                              ? "bg-[color:var(--brand-pink)]/10 text-[color:var(--brand-pink)] font-bold"
                              : "hover:bg-muted text-foreground/70"
                          }`}
                        >
                          {k.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      </div>
    </aside>
  );
}
