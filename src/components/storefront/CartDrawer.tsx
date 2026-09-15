import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { imgProps } from "@/lib/image";
import { useCart } from "@/lib/cart";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, setQty, remove } = useCart();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative w-full max-w-md bg-background h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <p className="font-black text-lg">Your Bag ({items.length})</p>
          <button onClick={onClose} aria-label="Close bag" className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-16">Your bag is empty.</p>
          )}
          {items.map((i) => (
            <div key={i.key} className="flex gap-3">
              <img {...imgProps(i.image, { width: 160, widths: [96, 160, 240], sizes: "80px" })} alt={i.name} className="h-20 w-20 rounded-xl object-cover border border-border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{i.name}</p>
                {i.variantLabel && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{i.variantLabel}</p>
                )}
                <p className="text-sm font-black text-[color:var(--brand-pink)] mt-1">৳{i.price}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center border border-border rounded-full">
                    <button onClick={() => setQty(i.key, i.quantity - 1)} aria-label="Decrease" className="h-8 w-8 grid place-items-center">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{i.quantity}</span>
                    <button onClick={() => setQty(i.key, i.quantity + 1)} aria-label="Increase" className="h-8 w-8 grid place-items-center">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button onClick={() => remove(i.key)} aria-label="Remove" className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4 space-y-3">
          <div className="flex items-center justify-between font-bold">
            <span>Subtotal</span>
            <span>৳{subtotal}</span>
          </div>
          <p className="text-xs text-muted-foreground">Delivery charge is added at checkout.</p>
          <Link
            to="/checkout"
            onClick={onClose}
            aria-disabled={items.length === 0}
            className={`block text-center rounded-full py-3 font-bold text-white ${
              items.length === 0 ? "bg-muted-foreground/40 pointer-events-none" : "bg-[color:var(--brand-pink)]"
            }`}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
