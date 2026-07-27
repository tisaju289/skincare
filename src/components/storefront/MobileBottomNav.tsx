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
      {/* spacer so content isn't hidden behind the bar */}
      <div className="h-16 lg:hidden" aria-hidden />
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border flex items-stretch pb-[env(safe-area-inset-bottom)]">
        <Link to="/" className={item} activeProps={{ className: `${item} !text-[color:var(--brand-pink)]` }} activeOptions={{ exact: true }}>
          <Home className="h-5 w-5" />
          Home
        </Link>
        <button type="button" onClick={onOpenMenu} className={item}>
          <LayoutGrid className="h-5 w-5" />
          Category
        </button>
        <Link to="/" hash="brands" className={item}>
          <Tag className="h-5 w-5" />
          Brand
        </Link>
        <Link to="/search" search={{ q: "" }} className={item} activeProps={{ className: `${item} !text-[color:var(--brand-pink)]` }}>
          <Store className="h-5 w-5" />
          Shop
        </Link>
        <button type="button" onClick={onOpenCart} className={`${item} relative`}>
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[color:var(--brand-pink)] text-white rounded-full h-4 min-w-4 px-1 grid place-items-center text-[9px] font-bold">
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
