import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Heart, ShoppingBag, Star, Truck, ShieldCheck, RefreshCw, ChevronRight, Minus, Plus } from "lucide-react";
import { getProductPage, submitReview } from "@/lib/storefront.functions";
import type { Category, Product, Review } from "@/lib/shop-data";
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
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Shajgoj` },
          { name: "description", content: loaderData.product.description || loaderData.product.name },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.description || loaderData.product.name },
          { property: "og:type", content: "product" },
          { property: "og:image", content: loaderData.product.image },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:image", content: loaderData.product.image },
        ]
      : [],
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

function ProductPage() {
  const data = Route.useLoaderData() as {
    product: Product;
    gallery: string[];
    related: Product[];
    reviews: Review[];
    categories: Category[];
  };
  const { product, gallery, related, reviews, categories } = data;
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);
  const images = gallery.length ? gallery : [product.image];
  const soldOut = product.stock <= 0;

  const postReview = useServerFn(submitReview);
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
      <SiteHeader categories={categories} />

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
          <div className={`aspect-square rounded-3xl overflow-hidden ${product.color}`}>
            <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
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
                <img src={src} alt={`${product.name} view ${i + 1}`} className="h-full w-full object-cover" />
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
            <span className="text-3xl sm:text-4xl font-black text-[color:var(--brand-pink)]">৳{product.price}</span>
            {product.old != null && <span className="text-base sm:text-lg text-muted-foreground line-through">৳{product.old}</span>}
            {product.tag && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">{product.tag}</span>}
          </div>
          <p className={`mt-2 text-xs font-semibold ${soldOut ? "text-destructive" : "text-emerald-600"}`}>
            {soldOut ? "Out of stock" : `In stock · ${product.stock} available`}
          </p>
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
                add({ slug: product.slug, name: product.name, price: product.price, image: product.image }, qty);
                toast.success(`${qty} × ${product.name} added to bag`);
              }}
              className="flex-1 min-w-[10rem] rounded-full bg-[color:var(--brand-pink)] text-white font-bold py-3 flex items-center justify-center gap-2 hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground"
            >
              <ShoppingBag className="h-4 w-4" /> {soldOut ? "Sold out" : "Add to Bag"}
            </button>
            <button aria-label="Save to wishlist" className="h-12 w-12 shrink-0 rounded-full border border-border grid place-items-center hover:bg-muted">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border pt-6">
            {[
              { icon: Truck, title: "Free Delivery", sub: "Over ৳999" },
              { icon: ShieldCheck, title: "Authentic", sub: "Guaranteed" },
              { icon: RefreshCw, title: "7-day Return", sub: "No hassle" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-[color:var(--brand-pink)]" />
                <div>
                  <p className="text-xs font-bold">{title}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4 mt-14 grid lg:grid-cols-2 gap-8">
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

      <SiteFooter categories={categories} />
    </div>
  );
}
