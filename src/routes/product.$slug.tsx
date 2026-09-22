import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Heart, ShoppingBag, Star, Truck, ShieldCheck, RefreshCw, ChevronRight, Minus, Plus, Headphones, Gift, Tag, Wallet, Clock, MessageCircle } from "lucide-react";
import { getProductPage, submitReview } from "@/lib/storefront.functions";
import type { Category, Product, Review } from "@/lib/shop-data";
import { SiteTheme } from "@/components/storefront/SiteTheme";
import { siteHead, DEFAULT_SETTINGS, normalizeProductBadges, type SiteSettings } from "@/lib/site-settings";
import { imgProps } from "@/lib/image";
import { useWishlist } from "@/lib/wishlist";
import { RecentlyViewed } from "@/components/storefront/RecentlyViewed";
import { whatsappEnabled, whatsappLink } from "@/lib/whatsapp";


const PRODUCT_BADGE_ICON_MAP = {
  truck: Truck,
  shield: ShieldCheck,
  refresh: RefreshCw,
  headphones: Headphones,
  gift: Gift,
  tag: Tag,
  wallet: Wallet,
  clock: Clock,
} as const;
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const data = await getProductPage({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) =>
    siteHead(loaderData?.settings ?? DEFAULT_SETTINGS, {
      title: loaderData ? `${loaderData.product.name} — ${(loaderData.settings ?? DEFAULT_SETTINGS).store_name}` : undefined,
      description: loaderData?.product.description || loaderData?.product.name,
      image: loaderData?.product.image || undefined,
      type: "product",
      path: `/product/${params.slug}`,
    }),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <p className="text-2xl font-black">Product not found</p>
        <Link to="/" className="text-[color:var(--brand-pink)] mt-2 inline-block">
          ← Back to home
        </Link>
      </div>
    </div>
  ),
  component: ProductPage,
});

type Variant = {
  id: string;
  name: string;
  value: string;
  price: number | null;
  stock: number;
  image: string | null;
};

function ProductPage() {
  const data = Route.useLoaderData() as {
    product: Product;
    gallery: string[];
    variants: Variant[];
    related: Product[];
    reviews: Review[];
    categories: Category[];
    settings: SiteSettings;
  };
  const { product, gallery, variants, related, reviews, categories, settings } = data;
  const { add } = useCart();
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const saved = wishlist.has(product.slug);
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(variants.length ? (variants.find((v) => v.stock > 0)?.id ?? variants[0]!.id) : null);
  const variant = variants.find((v) => v.id === variantId) ?? null;
  const [activeImage, setActiveImage] = useState(product.image);
  const images = gallery.length ? gallery : [product.image];
  const price = variant?.price ?? product.price;
  const stock = variant ? variant.stock : product.stock;
  const soldOut = stock <= 0;

  const mini = useMemo(
    () => ({ slug: product.slug, name: product.name, price: product.price, image: product.image, brand: product.brand }),
    [product.slug, product.name, product.price, product.image, product.brand],
  );

  const postReview = useServerFn(submitReview);
  const [tab, setTab] = useState<"description" | "reviews">("description");
  const [rName, setRName] = useState("");
  const [rRating, setRRating] = useState(5);
  const [rComment, setRComment] = useState("");
  const [rBusy, setRBusy] = useState(false);


  async function sendReview(e: React.FormEvent) {
    e.preventDefault();
    setRBusy(true);
    try {
      await postReview({ data: { slug: product.slug, name: rName, rating: rRating, comment: rComment } });
      toast.success("Thanks! Your review is awaiting approval.");
      setRName("");
      setRComment("");
      setRRating(5);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setRBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <>
      <SiteTheme settings={settings} />
      <SiteHeader categories={categories} settings={settings} />

      <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/category/$slug" params={{ slug: product.category }} className="hover:text-foreground">
          {product.categoryName}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </div>

      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-3">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted">
            <img
              {...imgProps(activeImage, { width: 960, widths: [480, 720, 960, 1200], sizes: "(max-width: 768px) 100vw, 560px", eager: true })}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={saved}
              onClick={() => {
                const added = wishlist.toggle(mini);
                toast.success(added ? "Saved to wishlist" : "Removed from wishlist");
              }}
              className="absolute top-3 right-3 h-11 w-11 rounded-full bg-white/80 backdrop-blur grid place-items-center shadow-sm hover:bg-white"
            >
              <Heart className={`h-5 w-5 ${saved ? "fill-[color:var(--brand-pink)] text-[color:var(--brand-pink)]" : ""}`} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(src)}
                className={`aspect-square rounded-xl overflow-hidden ${product.color} border-2 ${
                  activeImage === src ? "border-[color:var(--brand-pink)]" : "border-transparent"
                }`}
              >
                <img
                  {...imgProps(src, { width: 200, widths: [120, 200, 320], sizes: "120px" })}
                  alt={`${product.name} view ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{product.brand}</p>
          <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
            ))}
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <span className="text-3xl sm:text-4xl font-black text-[color:var(--brand-pink)]">৳{price}</span>
            {product.old != null && <span className="text-base sm:text-lg text-muted-foreground line-through">৳{product.old}</span>}
            {product.tag && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">{product.tag}</span>}
          </div>
          <p className={`mt-2 text-xs font-semibold ${soldOut ? "text-destructive" : "text-emerald-600"}`}>
            {soldOut ? "Out of stock" : `In stock · ${stock} available`}
          </p>

          {variants.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {variants[0]!.name}
                {variant && <span className="ml-2 normal-case text-foreground">{variant.value}</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {variants.map((v) => {
                  const out = v.stock <= 0;
                  const active = v.id === variantId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={out}
                      onClick={() => {
                        setVariantId(v.id);
                        if (v.image) setActiveImage(v.image);
                      }}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-[color:var(--brand-pink)] bg-[color:var(--brand-pink)]/10 text-[color:var(--brand-pink)]"
                          : "border-border hover:border-foreground/40"
                      } ${out ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                    >
                      {v.value}
                      {v.price != null && v.price !== product.price && <span className="ml-1.5 opacity-70">৳{v.price}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="mt-6 text-sm text-foreground/80 leading-relaxed">{product.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-border rounded-full shrink-0">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="h-10 w-10 grid place-items-center">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity" className="h-10 w-10 grid place-items-center">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              disabled={soldOut}
              onClick={() => {
                add(
                  {
                    slug: product.slug,
                    name: product.name,
                    price,
                    image: variant?.image || product.image,
                    variantId: variant?.id ?? null,
                    variantLabel: variant ? `${variant.name}: ${variant.value}` : null,
                  },
                  qty,
                );
                toast.success(`${qty} × ${product.name} added to bag`);
              }}
              className="flex-1 min-w-[10rem] rounded-full bg-[color:var(--brand-pink)] text-white font-bold py-3 flex items-center justify-center gap-2 hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground"
            >
              <ShoppingBag className="h-4 w-4" /> {soldOut ? "Sold out" : "Add to Bag"}
            </button>
          </div>

          {whatsappEnabled(settings) && (
            <a
              href={whatsappLink(
                settings,
                `Hi! I want to order:\n${product.name}${variant ? ` (${variant.value})` : ""}\nQty: ${qty}\nPrice: ৳${price}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full rounded-full bg-[#25D366] text-white font-bold py-3 flex items-center justify-center gap-2 hover:brightness-105"
            >
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>
          )}



        </div>
      </section>

      {/* Tabs: description + reviews */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex gap-2 border-b border-border">
          {([
            { id: "description", label: "Description" },
            { id: "reviews", label: `Reviews (${reviews.length})` },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-bold -mb-px border-b-2 ${
                tab === t.id
                  ? "border-[color:var(--brand-pink)] text-[color:var(--brand-pink)]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "description" ? (
          <div className="pt-6 text-sm leading-relaxed text-foreground/80 whitespace-pre-line max-w-3xl">
            {product.longDescription || product.description || "No description available."}
          </div>
        ) : (
          <div className="pt-6 grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black mb-4">Customer reviews</h2>
              {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>}
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{r.user_name}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={`h-3 w-3 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-foreground/80">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={sendReview} className="bg-muted/50 border border-border rounded-2xl p-5 h-fit">
              <h3 className="font-black">Write a review</h3>
              <input
                required
                value={rName}
                onChange={(e) => setRName(e.target.value)}
                placeholder="Your name"
                aria-label="Your name"
                className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              />
              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} type="button" onClick={() => setRRating(i)} aria-label={`${i} star`}>
                    <Star className={`h-6 w-6 ${i <= rRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={rComment}
                onChange={(e) => setRComment(e.target.value)}
                rows={3}
                placeholder="Share your experience…"
                aria-label="Review comment"
                className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              />
              <button disabled={rBusy} className="mt-3 rounded-full bg-[color:var(--brand-pink)] text-white font-bold px-6 py-2.5 text-sm disabled:opacity-60">
                {rBusy ? "Submitting…" : "Submit review"}
              </button>
            </form>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-16">
          <h2 className="text-xl sm:text-2xl font-black mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed current={mini} />


      <SiteFooter categories={categories} settings={settings} />
      </>
    </div>
  );
}
