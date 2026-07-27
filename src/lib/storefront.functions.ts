import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mapProduct, PRODUCT_SELECT, type Category, type Product, type Review } from "@/lib/shop-data";

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
  return fetchSettings(getPublicClient());
});

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
  const supabase = getPublicClient();

  const [cats, prods, brands, settings] = await Promise.all([
    supabase.from("categories").select("slug,name,color,image").order("sort_order"),
    supabase.from("products").select(PRODUCT_SELECT).order("reviews_count", { ascending: false }).limit(10),
    supabase.from("brands").select("slug,name").order("name"),
    fetchSettings(supabase),
  ]);

  return {
    categories: (cats.data ?? []).map((c) => ({
      slug: c.slug,
      name: c.name,
      color: c.color ?? "from-pink-400 to-rose-500",
      image: c.image ?? "",
    })) as Category[],
    trending: (prods.data ?? []).map((p) => mapProduct(p as never)) as Product[],
    brands: (brands.data ?? []) as { slug: string; name: string }[],
    settings,
  };
});

export const getCategoryPage = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
    const supabase = getPublicClient();

    const [{ data: category }, { data: cats }, settings] = await Promise.all([
      supabase.from("categories").select("slug,name,color,image").eq("slug", data.slug).maybeSingle(),
      supabase.from("categories").select("slug,name,color,image").order("sort_order"),
      fetchSettings(supabase),
    ]);
    if (!category) return null;

    const { data: prods } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("categories.slug", data.slug)
      .order("rating", { ascending: false });

    return {
      category: {
        slug: category.slug,
        name: category.name,
        color: category.color ?? "from-pink-400 to-rose-500",
        image: category.image ?? "",
      } as Category,
      categories: (cats ?? []).map((c) => ({
        slug: c.slug,
        name: c.name,
        color: c.color ?? "",
        image: c.image ?? "",
      })) as Category[],
      products: (prods ?? [])
        .filter((p) => (p as never as { categories: { slug: string } | null }).categories?.slug === data.slug)
        .map((p) => mapProduct(p as never)) as Product[],
      settings,
    };
  });

export const getProductPage = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
    const supabase = getPublicClient();

    const [{ data: row }, { data: cats }, settings] = await Promise.all([
      supabase.from("products").select(PRODUCT_SELECT).eq("slug", data.slug).maybeSingle(),
      supabase.from("categories").select("slug,name,color,image").order("sort_order"),
      fetchSettings(supabase),
    ]);
    if (!row) return null;

    const product = mapProduct(row as never);

    const [{ data: related }, { data: images }, { data: reviews }] = await Promise.all([
      supabase.from("products").select(PRODUCT_SELECT).neq("slug", product.slug).limit(20),
      supabase
        .from("products")
        .select("product_images(url,sort_order)")
        .eq("slug", data.slug)
        .maybeSingle(),
      supabase
        .from("reviews")
        .select("id,user_name,rating,comment,created_at,products!inner(slug)")
        .eq("products.slug", data.slug)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      product,
      gallery: ((images?.product_images ?? []) as { url: string; sort_order: number }[])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => i.url),
      related: (related ?? [])
        .map((p) => mapProduct(p as never))
        .filter((p) => p.category === product.category)
        .slice(0, 5) as Product[],
      reviews: (reviews ?? []).map((r) => ({
        id: r.id,
        user_name: r.user_name,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
      })) as Review[],
      categories: (cats ?? []).map((c) => ({
        slug: c.slug,
        name: c.name,
        color: c.color ?? "",
        image: c.image ?? "",
      })) as Category[],
      settings,
    };
  });

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ q: z.string().default("") }).parse(d))
  .handler(async ({ data }) => {
    const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
    const supabase = getPublicClient();

    const [{ data: cats }, res, settings] = await Promise.all([
      supabase.from("categories").select("slug,name,color,image").order("sort_order"),
      data.q.trim()
        ? supabase.from("products").select(PRODUCT_SELECT).ilike("name", `%${data.q.trim()}%`).limit(40)
        : supabase.from("products").select(PRODUCT_SELECT).limit(40),
      fetchSettings(supabase),
    ]);

    return {
      q: data.q,
      products: (res.data ?? []).map((p) => mapProduct(p as never)) as Product[],
      categories: (cats ?? []).map((c) => ({
        slug: c.slug,
        name: c.name,
        color: c.color ?? "",
        image: c.image ?? "",
      })) as Category[],
      settings,
    };
  });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(2),
        email: z.string().email().or(z.literal("")),
        phone: z.string().min(6),
        address: z.string().min(5),
        notes: z.string().optional(),
        promoCode: z.string().optional(),
        paymentMethod: z.enum(["bkash", "nagad", "card", "cod"]),
        items: z.array(z.object({ slug: z.string(), quantity: z.number().int().min(1).max(20) })).min(1),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
    const supabase = getPublicClient();

    const { data: orderNumber, error } = await supabase.rpc("place_order", {
      p_name: data.name,
      p_email: data.email || "",
      p_phone: data.phone,
      p_address: data.address,
      p_items: data.items,
      p_payment_method: data.paymentMethod,
      p_promo_code: data.promoCode || undefined,
      p_notes: data.notes || undefined,
    });

    if (error) throw new Error(error.message);
    return { orderNumber: orderNumber as unknown as string };
  });

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        slug: z.string(),
        name: z.string().min(2),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
    const supabase = getPublicClient();
    const { error } = await supabase.rpc("submit_review", {
      p_product_slug: data.slug,
      p_user_name: data.name,
      p_rating: data.rating,
      p_comment: data.comment ?? "",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
    const supabase = getPublicClient();
    const { error } = await supabase.rpc("subscribe_newsletter", { p_email: data.email });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
