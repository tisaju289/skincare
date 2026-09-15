import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Tag, Store, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export function MobileBottomNav({
  onOpenMenu,
  onOpenCart,
}: {
  onOpenMenu: () => void;
  onOpenCart: () => void;
}) {
  const { count } = useCart();
  const item = "flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[10px] font-semibold text-foreground/70";

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border flex items-stretch pb-[env(safe-area-inset-bottom)]">
        <button type="button" onClick={onOpenMenu} className={item}>
          <LayoutGrid className="h-5 w-5" />
          Category
        </button>
        <Link to="/" hash="brands" className={item}>
          <Tag className="h-5 w-5" />
          Brand
        </Link>
        <Link to="/" className={item} activeProps={{ className: `${item} !text-primary` }} activeOptions={{ exact: true }}>
          <span className="-mt-6 h-11 w-11 rounded-full bg-foreground text-background grid place-items-center shadow-lg ring-4 ring-background">
            <Home className="h-5 w-5" />
          </span>
          Home
        </Link>
        <Link to="/search" search={{ q: "" }} className={item} activeProps={{ className: `${item} !text-primary` }}>
          <Store className="h-5 w-5" />
          Shop
        </Link>

        <button type="button" onClick={onOpenCart} className={`${item} relative`}>
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground rounded-full h-4 min-w-4 px-1 grid place-items-center text-[9px] font-bold">
                {count}
              </span>
            )}
          </span>
          Cart
        </button>
      </nav>
    </>
  );
}
