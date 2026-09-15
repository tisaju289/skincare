import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ShoppingBag, Menu, X } from "lucide-react";
import type { Category } from "@/lib/shop-data";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { CartDrawer } from "./CartDrawer";
import { MobileBottomNav } from "./MobileBottomNav";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { WhatsAppButton } from "./WhatsAppButton";
import { ChevronDown } from "lucide-react";
import {
  DEFAULT_SETTINGS,
  type SiteSettings,
} from "@/lib/site-settings";

const NAV_LINK =
  "text-[13px] font-medium whitespace-nowrap px-2.5 py-1.5 rounded-full text-foreground/75 hover:text-foreground hover:bg-muted transition-colors";


const MENU_PILL: Record<string, string> = {
  none: "",
  pink: "bg-[color:var(--brand-pink)] text-white px-3 py-1.5 rounded-full",
  magenta: "bg-[color:var(--brand-magenta)] text-white px-3 py-1.5 rounded-full",
  purple: "bg-[color:var(--brand-purple)] text-white px-3 py-1.5 rounded-full",
  teal: "bg-[color:var(--brand-teal)] text-white px-3 py-1.5 rounded-full",
  green: "bg-[color:var(--brand-green)] text-white px-3 py-1.5 rounded-full",
};

export function SiteHeader({
  categories = [],
  settings = DEFAULT_SETTINGS,
}: {
  categories?: Category[];
  settings?: SiteSettings;
}) {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const [cartOpen, setCartOpen] = useState(false);
  const topCats = categories.filter((c) => !c.parent);








  return (
    <>
      {settings.announcement_enabled !== false && settings.announcement_text && (
        <div
          className="text-xs sm:text-sm text-center py-2 px-4"
          style={{
            backgroundColor: settings.announcement_bg || "var(--brand-pink)",
            color: settings.announcement_text_color || "#ffffff",
          }}
        >
          {settings.announcement_link ? (
            <a href={settings.announcement_link} className="underline-offset-2 hover:underline">
              {settings.announcement_text}
            </a>
          ) : (
            settings.announcement_text
          )}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-border/70 bg-[color-mix(in_oklab,var(--color-background)_82%,transparent)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden h-9 w-9 shrink-0 grid place-items-center rounded-full border border-border/70 hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            {settings.logo_url && (
              <img
                src={settings.logo_url}
                alt={`${settings.store_name} logo`}
                decoding="async"
                fetchPriority="high"
                className="h-8 sm:h-10 w-auto object-contain shrink-0"
              />
            )}
            <span className="font-display text-xl sm:text-2xl tracking-tight text-foreground truncate">
              {settings.store_name}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-2">
            <Link to="/" className={NAV_LINK} activeOptions={{ exact: true }} activeProps={{ className: `${NAV_LINK} !text-[color:var(--brand-gold)] font-semibold` }}>
              Home
            </Link>
            <div className="relative group">
              <button type="button" className={`${NAV_LINK} flex items-center gap-1`}>
                Category
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute left-0 top-full z-50 pt-2">
                <div className="min-w-52 rounded-xl border border-border bg-background shadow-lg p-2">
                  {topCats.length === 0 && (
                    <span className="block px-3 py-2 text-sm text-muted-foreground">No categories yet</span>
                  )}
                  {topCats.map((c) => {
                    const kids = categories.filter((k) => k.parent === c.slug);
                    if (!kids.length) {
                      return (
                        <Link
                          key={c.slug}
                          to="/category/$slug"
                          params={{ slug: c.slug }}
                          className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted"
                        >
                          {c.name}
                        </Link>
                      );
                    }
                    return (
                      <div key={c.slug} className="relative group/sub">
                        <Link
                          to="/category/$slug"
                          params={{ slug: c.slug }}
                          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted"
                        >
                          {c.name}
                          <ChevronDown className="h-3 w-3 -rotate-90 text-muted-foreground" />
                        </Link>
                        <div className="invisible opacity-0 group-hover/sub:visible group-hover/sub:opacity-100 transition absolute left-full top-0 z-50 pl-2">
                          <div className="min-w-44 rounded-xl border border-border bg-background shadow-lg p-2">
                            {kids.map((k) => (
                              <Link
                                key={k.slug}
                                to="/category/$slug"
                                params={{ slug: k.slug }}
                                className="block rounded-lg px-3 py-2 text-[13px] text-foreground/70 hover:bg-muted"
                              >
                                {k.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <Link to="/search" search={{ q: "" }} className={NAV_LINK}>
              Shop
            </Link>
            <Link to="/brands" className={NAV_LINK}>
              Brand
            </Link>
          </nav>

          <SearchAutocomplete className="hidden md:block flex-1 min-w-0 ml-4" />
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative h-9 w-9 grid place-items-center rounded-full border border-border/70 hover:bg-muted"
            >
              <Heart className="h-4 w-4" />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-4 min-w-4 px-1 grid place-items-center text-[10px] font-semibold">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              to="/search"
              search={{ q: "" }}
              className="hidden lg:flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] hover:bg-foreground hover:text-background transition-colors"
            >
              All products
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 rounded-full bg-foreground text-background px-3 sm:px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
            >
              <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">Bag</span>
              <span className="bg-background text-foreground rounded-full h-5 min-w-5 px-1 grid place-items-center text-[10px] font-semibold">
                {count}
              </span>
            </button>

          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <SearchAutocomplete placeholder="Search products…" />
        </div>


        {menus.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pb-3 hidden lg:flex flex-wrap items-center gap-x-5 gap-y-2">
            {menus.map((m, i) => {
              const kids = m.type === "category" ? categories.filter((k) => k.parent === m.slug) : [];
              const pill = MENU_PILL[m.color] ?? "";
              const base = `text-[13px] font-medium whitespace-nowrap py-1 tracking-wide ${
                pill ? `${pill} text-[11px] font-semibold` : "text-foreground/75 hover:text-primary transition-colors"
              }`;
              const inner =
                m.type === "category" ? (
                  <Link to="/category/$slug" params={{ slug: m.slug }} className={base}>
                    {m.label}
                  </Link>
                ) : m.url.startsWith("/") ? (
                  <Link to={m.url} className={base}>
                    {m.label}
                  </Link>
                ) : (
                  <a href={m.url} className={base}>
                    {m.label}
                  </a>
                );

              if (!kids.length) return <div key={`${m.label}-${i}`}>{inner}</div>;

              return (
                <div key={`${m.label}-${i}`} className="relative group">
                  <div className="flex items-center gap-1">
                    {inner}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute left-0 top-full z-50 pt-2">
                    <div className="min-w-52 rounded-xl border border-border bg-background shadow-lg p-2">
                      {kids.map((k) => (
                        <Link
                          key={k.slug}
                          to="/category/$slug"
                          params={{ slug: k.slug }}
                          className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-[color:var(--brand-pink)]"
                        >
                          {k.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile menu drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 ${menuOpen ? "" : "pointer-events-none"}`} aria-hidden={!menuOpen}>
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[82%] max-w-80 bg-background flex flex-col transition-transform duration-200 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <span className="text-sm font-black uppercase truncate">{settings.store_name}</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="h-8 w-8 shrink-0 grid place-items-center rounded-lg hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <Link to="/search" search={{ q: "" }} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-muted">
              All products
            </Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-muted">
              <Heart className="h-4 w-4" /> Wishlist {wishCount > 0 && `(${wishCount})`}
            </Link>

            {menus.map((m, i) => {
              const kids = m.type === "category" ? categories.filter((k) => k.parent === m.slug) : [];
              return (
                <div key={`${m.label}-${i}`}>
                  {m.type === "category" ? (
                    <Link
                      to="/category/$slug"
                      params={{ slug: m.slug }}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-muted"
                    >
                      {m.label}
                    </Link>
                  ) : m.url.startsWith("/") ? (
                    <Link
                      to={m.url}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-muted"
                    >
                      {m.label}
                    </Link>
                  ) : (
                    <a
                      href={m.url}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-muted"
                    >
                      {m.label}
                    </a>
                  )}
                  {kids.length > 0 && (
                    <div className="ml-3 border-l border-border pl-2">
                      {kids.map((k) => (
                        <Link
                          key={k.slug}
                          to="/category/$slug"
                          params={{ slug: k.slug }}
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 text-[13px] text-foreground/70 hover:bg-muted"
                        >
                          {k.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <MobileBottomNav onOpenMenu={() => setMenuOpen(true)} onOpenCart={() => setCartOpen(true)} />

      <WhatsAppButton settings={settings} />
    </>
  );
}

