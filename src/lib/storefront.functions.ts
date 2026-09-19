import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mapCategories, mapProduct, pickProducts, CATEGORY_SELECT, PRODUCT_SELECT, type Category, type Product, type Review } from "@/lib/shop-data";

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
  return fetchSettings(getPublicClient());
});

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
  const supabase = getPublicClient();

  const [cats, prods, brands, revs, settings] = await Promise.all([
    supabase.from("categories").select(CATEGORY_SELECT).order("sort_order"),
    supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false }).limit(80),
    supabase.from("brands").select("slug,name,logo").order("name"),
    supabase
      .from("reviews")
      .select("id,user_name,rating,comment,created_at,products(name,slug,image)")
      .order("created_at", { ascending: false })
      .limit(24),
    fetchSettings(supabase),
  ]);

  const pool = (prods.data ?? []).map((p) => mapProduct(p as never)) as Product[];

  return {
    categories: mapCategories(cats.data as never),
    products: pool,
    trending: pickProducts(pool, "trending", 10),
    brands: (brands.data ?? []) as { slug: string; name: string; logo: string | null }[],
    settings,
  };
});

export const getCategoryPage = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
    const supabase = getPublicClient();

    const [{ data: category }, { data: cats }, settings] = await Promise.all([
      supabase.from("categories").select(CATEGORY_SELECT).eq("slug", data.slug).maybeSingle(),
      supabase.from("categories").select(CATEGORY_SELECT).order("sort_order"),
      fetchSettings(supabase),
    ]);
    if (!category) return null;

    const all = mapCategories(cats as never);
    const children = all.filter((c) => c.parent === category.slug);
    const scope = new Set<string>([category.slug, ...children.map((c) => c.slug)]);

    const { data: prods } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("rating", { ascending: false });

    return {
      category: (all.find((c) => c.slug === category.slug) ?? {
        slug: category.slug,
        name: category.name,
        color: category.color ?? "from-pink-400 to-rose-500",
        image: category.image ?? "",
        parent: null,
      }) as Category,
      subcategories: children,
      categories: all,
      products: (prods ?? [])
        .filter((p) => scope.has((p as never as { categories: { slug: string } | null }).categories?.slug ?? ""))
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
      supabase.from("categories").select(CATEGORY_SELECT).order("sort_order"),
      fetchSettings(supabase),
    ]);
    if (!row) return null;

    const product = mapProduct(row as never);

    const [{ data: related }, { data: images }, { data: reviews }, { data: variants }] = await Promise.all([
      supabase.from("products").select(PRODUCT_SELECT).neq("slug", product.slug).limit(40),
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
      supabase
        .from("product_variants")
        .select("id,name,value,price,stock,image,sort_order,products!inner(slug)")
        .eq("products.slug", data.slug)
        .order("sort_order"),
    ]);

    const relatedPool = (related ?? []).map((p) => mapProduct(p as never)) as Product[];
    const sameCategory = relatedPool.filter((p) => p.category === product.category);
    const sameBrand = relatedPool.filter((p) => p.category !== product.category && p.brand === product.brand);
    const relatedList = [...sameCategory, ...sameBrand, ...relatedPool]
      .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
      .slice(0, 5);

    return {
      product,
      gallery: ((images?.product_images ?? []) as { url: string; sort_order: number }[])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => i.url),
      variants: (variants ?? []).map((v) => ({
        id: v.id as string,
        name: (v.name as string) ?? "Option",
        value: v.value as string,
        price: v.price == null ? null : Number(v.price),
        stock: Number(v.stock ?? 0),
        image: (v.image as string | null) ?? null,
      })),
      related: relatedList,
      reviews: (reviews ?? []).map((r) => ({
        id: r.id,
        user_name: r.user_name,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
      })) as Review[],
      categories: mapCategories(cats as never),
      settings,
    };
  });

export const searchSuggestions = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ q: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const term = data.q.trim();
    if (term.length < 2) return { products: [], categories: [], brands: [] };

    const { getPublicClient } = await import("@/lib/supabase-public.server");
    const supabase = getPublicClient();

    const [prods, cats, brands] = await Promise.all([
      supabase
        .from("products")
        .select("slug,name,image,price,brands(name)")
        .ilike("name", `%${term}%`)
        .limit(6),
      supabase.from("categories").select("slug,name").ilike("name", `%${term}%`).limit(4),
      supabase.from("brands").select("slug,name").ilike("name", `%${term}%`).limit(4),
    ]);

    return {
      products: (prods.data ?? []).map((p) => ({
        slug: p.slug as string,
        name: p.name as string,
        image: (p.image as string | null) ?? "",
        price: Number(p.price ?? 0),
        brand: ((p as unknown as { brands: { name: string } | null }).brands?.name) ?? "",
      })),
      categories: (cats.data ?? []).map((c) => ({ slug: c.slug as string, name: c.name as string })),
      brands: (brands.data ?? []).map((b) => ({ slug: b.slug as string, name: b.name as string })),
    };
  });


export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ q: z.string().default("") }).parse(d))
  .handler(async ({ data }) => {
    const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
    const supabase = getPublicClient();

    const [{ data: cats }, res, settings] = await Promise.all([
      supabase.from("categories").select(CATEGORY_SELECT).order("sort_order"),
      data.q.trim()
        ? supabase.from("products").select(PRODUCT_SELECT).ilike("name", `%${data.q.trim()}%`).limit(40)
        : supabase.from("products").select(PRODUCT_SELECT).limit(40),
      fetchSettings(supabase),
    ]);

    return {
      q: data.q,
      products: (res.data ?? []).map((p) => mapProduct(p as never)) as Product[],
      categories: mapCategories(cats as never),
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
        deliveryZone: z.enum(["inside", "outside"]).optional(),
        items: z
          .array(
            z.object({
              slug: z.string(),
              quantity: z.number().int().min(1).max(20),
              variantId: z.string().nullable().optional(),
            }),
          )
          .min(1),

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
      p_delivery_zone: data.deliveryZone ?? "inside",
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

export const getBrandsPage = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
  const supabase = getPublicClient();

  const [brands, cats, prods, settings] = await Promise.all([
    supabase.from("brands").select("slug,name,logo").order("name"),
    supabase.from("categories").select(CATEGORY_SELECT).order("sort_order"),
    supabase.from("products").select("brands(name)"),
    fetchSettings(supabase),
  ]);

  const counts = new Map<string, number>();
  for (const p of (prods.data ?? []) as unknown as { brands: { name: string } | null }[]) {
    const n = p.brands?.name;
    if (n) counts.set(n, (counts.get(n) ?? 0) + 1);
  }

  return {
    brands: ((brands.data ?? []) as { slug: string; name: string; logo: string | null }[]).map((b) => ({
      ...b,
      count: counts.get(b.name) ?? 0,
    })),
    categories: mapCategories(cats.data as never),
    settings,
  };
});

export const getBrandPage = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
    const supabase = getPublicClient();

    const [{ data: brand }, { data: cats }, settings] = await Promise.all([
      supabase.from("brands").select("slug,name,logo").eq("slug", data.slug).maybeSingle(),
      supabase.from("categories").select(CATEGORY_SELECT).order("sort_order"),
      fetchSettings(supabase),
    ]);
    if (!brand) return null;

    const { data: prods } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("rating", { ascending: false });

    return {
      brand: brand as { slug: string; name: string; logo: string | null },
      categories: mapCategories(cats as never),
      products: (prods ?? [])
        .map((p) => mapProduct(p as never))
        .filter((p) => p.brand === brand.name) as Product[],
      settings,
    };
  });

export const getCategoriesPage = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient, fetchSettings } = await import("@/lib/supabase-public.server");
  const supabase = getPublicClient();

  const [cats, prods, settings] = await Promise.all([
    supabase.from("categories").select(CATEGORY_SELECT).order("sort_order"),
    supabase.from("products").select("categories(slug)"),
    fetchSettings(supabase),
  ]);

  const counts = new Map<string, number>();
  for (const p of (prods.data ?? []) as unknown as { categories: { slug: string } | null }[]) {
    const s = p.categories?.slug;
    if (s) counts.set(s, (counts.get(s) ?? 0) + 1);
  }

  const list = mapCategories(cats.data as never).map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }));
  return { categories: list, settings };
});
