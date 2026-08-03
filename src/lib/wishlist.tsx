import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { WISHLIST_KEY, readList, writeList, type MiniProduct } from "@/lib/mini-product";

type WishlistCtx = {
  items: MiniProduct[];
  count: number;
  ready: boolean;
  has: (slug: string) => boolean;
  toggle: (item: MiniProduct) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
};

const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MiniProduct[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readList(WISHLIST_KEY));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeList(WISHLIST_KEY, items);
  }, [items, ready]);

  const value = useMemo<WishlistCtx>(
    () => ({
      items,
      ready,
      count: items.length,
      has: (slug) => items.some((i) => i.slug === slug),
      toggle: (item) => {
        const exists = items.some((i) => i.slug === item.slug);
        setItems((prev) => (exists ? prev.filter((i) => i.slug !== item.slug) : [item, ...prev].slice(0, 100)));
        return !exists;
      },
      remove: (slug) => setItems((prev) => prev.filter((i) => i.slug !== slug)),
      clear: () => setItems([]),
    }),
    [items, ready],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
