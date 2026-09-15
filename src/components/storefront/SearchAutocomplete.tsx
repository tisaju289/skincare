import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { searchSuggestions } from "@/lib/storefront.functions";
import { imgProps } from "@/lib/image";

type Suggestions = Awaited<ReturnType<typeof searchSuggestions>>;

const EMPTY: Suggestions = { products: [], categories: [], brands: [] };

export function SearchAutocomplete({
  placeholder = "Search for products, brands and more…",
  className = "",
}: {
  placeholder?: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const fetchSuggestions = useServerFn(searchSuggestions);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Suggestions>(EMPTY);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setData(EMPTY);
      return;
    }
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetchSuggestions({ data: { q: term } });
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData(EMPTY);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, fetchSuggestions]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const hasResults = data.products.length + data.categories.length + data.brands.length > 0;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          navigate({ to: "/search", search: { q } });
        }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          type="search"
          placeholder={placeholder}
          aria-label="Search products"
          className="w-full rounded border border-border focus:border-primary outline-none pl-11 pr-10 py-2.5 text-sm bg-card"
        />
        {busy && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </form>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-md border border-border bg-background shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          {!hasResults && !busy && (
            <p className="px-4 py-4 text-sm text-muted-foreground">No matches for “{q.trim()}”.</p>
          )}

          {data.products.map((p) => (
            <Link
              key={p.slug}
              to="/product/$slug"
              params={{ slug: p.slug }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted"
            >
              <img
                {...imgProps(p.image, { width: 96, widths: [64, 96], sizes: "40px" })}
                alt={p.name}
                className="h-10 w-10 rounded-lg object-cover border border-border shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium line-clamp-1">{p.name}</span>
                <span className="block text-[11px] text-muted-foreground">{p.brand}</span>
              </span>
              <span className="text-sm font-semibold text-primary">৳{p.price}</span>
            </Link>
          ))}

          {data.categories.length > 0 && (
            <div className="border-t border-border">
              <p className="px-4 pt-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Categories</p>
              {data.categories.map((c) => (
                <Link
                  key={c.slug}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-muted"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {data.brands.length > 0 && (
            <div className="border-t border-border">
              <p className="px-4 pt-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Brands</p>
              {data.brands.map((b) => (
                <Link
                  key={b.slug}
                  to="/search"
                  search={{ q: b.name }}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-muted"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          )}

          {hasResults && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate({ to: "/search", search: { q } });
              }}
              className="w-full border-t border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-muted text-left"
            >
              See all results for “{q.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
