import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag, Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/shop-data";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { imgProps } from "@/lib/image";
import { Button } from "@/components/ui/button";

export function ProductCard({ product: p }: { product: Product }) {
  const { add } = useCart();
  const wishlist = useWishlist();
  const soldOut = p.stock <= 0;
  const saved = wishlist.has(p.slug);

  return (
    <div className="group relative flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-brand">
      <div className="relative">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            <img
              {...imgProps(p.image, { width: 480, widths: [240, 360, 480, 720], sizes: "(max-width: 640px) 45vw, 260px" })}
              alt={p.name}
               className="h-full w-full object-contain p-2 transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </div>
        </Link>

        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {p.tag && (
            <span className="rounded-full bg-foreground/85 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-background backdrop-blur">
              {p.tag}
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
              Sold out
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          type="button"
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          onClick={() => {
            const added = wishlist.toggle({ slug: p.slug, name: p.name, price: p.price, image: p.image, brand: p.brand });
            toast.success(added ? "Saved to wishlist" : "Removed from wishlist");
          }}
          className="absolute right-3 top-3 z-10 rounded-full bg-background/90 backdrop-blur"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : "text-foreground/55"}`} />
        </Button>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
         <p className="text-[10px] font-semibold uppercase text-primary">{p.brand}</p>
        <Link to="/product/$slug" params={{ slug: p.slug }}>
          <h3 className="font-display mt-1.5 line-clamp-2 min-h-[2.6rem] text-[15px] leading-snug transition-colors group-hover:text-primary">
            {p.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i <= Math.round(p.rating) ? "fill-primary text-primary" : "text-muted-foreground/25"}`}
            />
          ))}
          <span className="ml-1 text-[10px] text-muted-foreground">({p.reviews})</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
             <p className="font-display text-lg text-primary">৳{p.price}</p>
            {p.old != null && <p className="text-[11px] text-muted-foreground line-through">৳{p.old}</p>}
          </div>
           <Button
             variant="outline"
            disabled={soldOut}
            aria-label="Add to bag"
            onClick={() => {
              add({ slug: p.slug, name: p.name, price: p.price, image: p.image });
              toast.success("Added to bag");
            }}
             className="h-9 rounded-none border-primary px-3.5 text-[11px] font-semibold uppercase text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{soldOut ? "Sold" : "Add"}</span>
           </Button>
        </div>
      </div>
    </div>
  );
}
