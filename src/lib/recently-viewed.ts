import { useEffect, useState } from "react";
import { RECENT_KEY, readList, writeList, type MiniProduct } from "@/lib/mini-product";

const MAX = 12;

/** Records a product view and returns the other recently viewed products. */
export function useRecentlyViewed(current?: MiniProduct) {
  const [items, setItems] = useState<MiniProduct[]>([]);

  useEffect(() => {
    const existing = readList(RECENT_KEY);
    if (!current) {
      setItems(existing);
      return;
    }
    const next = [current, ...existing.filter((i) => i.slug !== current.slug)].slice(0, MAX);
    writeList(RECENT_KEY, next);
    setItems(next.filter((i) => i.slug !== current.slug));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.slug]);

  return items;
}
