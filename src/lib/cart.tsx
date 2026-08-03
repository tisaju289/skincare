import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  /** Unique line key: slug, or `slug::variantId` when a variant is chosen. */
  key: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string | null;
  variantLabel?: string | null;
};

export type CartInput = Omit<CartItem, "quantity" | "key">;

export function lineKey(slug: string, variantId?: string | null) {
  return variantId ? `${slug}::${variantId}` : slug;
}

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: CartInput, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  ready: boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "shajgoj-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            (parsed as CartItem[]).map((i) => ({
              ...i,
              key: i.key ?? lineKey(i.slug, i.variantId),
            })),
          );
        }
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.quantity * i.price, 0),
      add: (item, qty = 1) =>
        setItems((prev) => {
          const key = lineKey(item.slug, item.variantId);
          const found = prev.find((p) => p.key === key);
          if (found) {
            return prev.map((p) => (p.key === key ? { ...p, quantity: Math.min(20, p.quantity + qty) } : p));
          }
          return [...prev, { ...item, key, quantity: qty }];
        }),
      remove: (key) => setItems((prev) => prev.filter((p) => p.key !== key)),
      setQty: (key, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((p) => p.key !== key)
            : prev.map((p) => (p.key === key ? { ...p, quantity: Math.min(20, qty) } : p)),
        ),
      clear: () => setItems([]),
    }),
    [items, ready],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
