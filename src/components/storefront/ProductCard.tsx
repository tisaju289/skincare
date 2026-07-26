import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/shop-data";
import { useCart } from "@/lib/cart";

export function ProductCard({ product: p }: { product: Product }) {
  const { add } = useCart();
  const soldOut = p.stock <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition flex flex-col">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
        <div className={`relative aspect-square ${p.color} overflow-hidden`}>
          {p.tag && (
            <span className="absolute top-2 left-2 z-10 bg-[color:var(--brand-pink)] text-white text-[10px] font-bold px-2 py-1 rounded">
              {p.tag}
            </span>
          )}
          {soldOut && (
            <span className="absolute top-2 right-2 z-10 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded">
              SOLD OUT
            </span>
          )}
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition"
          />
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.brand}</p>
        <Link to="/product/$slug" params={{ slug: p.slug }}>
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] mt-1 hover:text-[color:var(--brand-pink)]">
            {p.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i <= Math.round(p.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">({p.reviews})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-black text-[color:var(--brand-pink)]">৳{p.price}</span>
          {p.old != null && <span className="text-xs text-muted-foreground line-through">৳{p.old}</span>}
        </div>
        <button
          disabled={soldOut}
          onClick={() => {
            add({ slug: p.slug, name: p.name, price: p.price, image: p.image });
            toast.success("Added to bag");
          }}
          className="mt-3 w-full rounded-full bg-[color:var(--brand-pink)] text-white text-xs font-bold py-2 flex items-center justify-center gap-1.5 disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> {soldOut ? "Sold out" : "Add to bag"}
        </button>
      </div>
    </div>
  );
}
