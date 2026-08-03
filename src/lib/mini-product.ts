/** Lightweight product shape stored in localStorage (wishlist / recently viewed). */
export type MiniProduct = {
  slug: string;
  name: string;
  price: number;
  image: string;
  brand: string;
};

export function toMini(p: {
  slug: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
}): MiniProduct {
  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    image: p.image,
    brand: p.brand ?? "",
  };
}

function read(key: string): MiniProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as MiniProduct[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, list: MiniProduct[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export const RECENT_KEY = "shajgoj-recent";
export const WISHLIST_KEY = "shajgoj-wishlist";

export function readList(key: string) {
  return read(key);
}
export function writeList(key: string, list: MiniProduct[]) {
  write(key, list);
}
