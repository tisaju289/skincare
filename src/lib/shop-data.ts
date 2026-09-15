/** Shared storefront DTO types (data itself comes from Supabase). */

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  price: number;
  old: number | null;
  tag: string | null;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  longDescription: string;
  color: string;
  stock: number;
  isTrending: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  isNewArrival: boolean;
};

export type Category = {
  slug: string;
  name: string;
  color: string;
  image: string;
  /** Parent category slug, or null for top-level categories. */
  parent: string | null;
};

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  image: string | null;
  parent_id: string | null;
};

export const CATEGORY_SELECT = "id,slug,name,color,image,parent_id";

/** Maps raw category rows to DTOs, resolving parent_id into a parent slug. */
export function mapCategories(rows: CategoryRow[] | null | undefined): Category[] {
  const list = rows ?? [];
  const bySlug = new Map(list.map((c) => [c.id, c.slug]));
  return list.map((c) => ({
    slug: c.slug,
    name: c.name,
    color: c.color ?? "from-pink-400 to-rose-500",
    image: c.image ?? "",
    parent: c.parent_id ? (bySlug.get(c.parent_id) ?? null) : null,
  }));
}

export type Review = {
  id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80";

type ProductRow = {
  slug: string;
  name: string;
  price: number | string;
  old_price: number | string | null;
  tag: string | null;
  rating: number | string | null;
  reviews_count: number | null;
  image: string | null;
  description: string | null;
  long_description?: string | null;
  color: string | null;
  stock: number | null;
  is_trending?: boolean | null;
  is_best_seller?: boolean | null;
  is_flash_sale?: boolean | null;
  is_new_arrival?: boolean | null;
  brands: { name: string } | null;
  categories: { slug: string; name: string } | null;
};

export function mapProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    brand: row.brands?.name ?? "Shajgoj",
    category: row.categories?.slug ?? "makeup",
    categoryName: row.categories?.name ?? "Beauty",
    price: Number(row.price ?? 0),
    old: row.old_price == null ? null : Number(row.old_price),
    tag: row.tag,
    rating: Number(row.rating ?? 0),
    reviews: row.reviews_count ?? 0,
    image: row.image || FALLBACK_IMAGE,
    description: row.description ?? "",
    longDescription: row.long_description ?? "",
    color: row.color ?? "bg-muted",
    stock: row.stock ?? 0,
    isTrending: !!row.is_trending,
    isBestSeller: !!row.is_best_seller,
    isFlashSale: !!row.is_flash_sale,
    isNewArrival: !!row.is_new_arrival,
  };
}

export const PRODUCT_SELECT =
  "slug,name,price,old_price,tag,rating,reviews_count,image,description,long_description,color,stock,is_trending,is_best_seller,is_flash_sale,is_new_arrival,brands(name),categories(slug,name)";

/** Picks products for a homepage section based on its configured source. */
export function pickProducts(
  pool: Product[],
  source: string | undefined,
  limit = 10,
): Product[] {
  const byRating = (a: Product, b: Product) => b.rating - a.rating || b.reviews - a.reviews;
  let list: Product[];
  switch (source) {
    case "trending":
      list = pool.filter((p) => p.isTrending);
      if (!list.length) list = [...pool].sort(byRating);
      break;
    case "best_seller":
      list = pool.filter((p) => p.isBestSeller);
      if (!list.length) list = [...pool].sort((a, b) => b.reviews - a.reviews);
      break;
    case "flash_sale":
      list = pool.filter((p) => p.isFlashSale);
      break;
    case "new_arrival":
      list = pool.filter((p) => p.isNewArrival);
      if (!list.length) list = pool;
      break;
    case "discount":
      list = pool.filter((p) => p.old != null && p.old > p.price);
      break;
    default:
      list = pool;
  }
  return list.slice(0, limit);
}
