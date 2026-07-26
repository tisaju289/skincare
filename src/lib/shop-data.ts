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
  color: string;
  stock: number;
};

export type Category = {
  slug: string;
  name: string;
  color: string;
  image: string;
};

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
  color: string | null;
  stock: number | null;
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
    color: row.color ?? "bg-muted",
    stock: row.stock ?? 0,
  };
}

export const PRODUCT_SELECT =
  "slug,name,price,old_price,tag,rating,reviews_count,image,description,color,stock,brands(name),categories(slug,name)";
