import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Heart, ShoppingBag, LayoutDashboard, Menu, X } from "lucide-react";
import type { Category } from "@/lib/shop-data";
import { useCart } from "@/lib/cart";
import { CartDrawer } from "./CartDrawer";
import { MobileBottomNav } from "./MobileBottomNav";
import { ChevronDown } from "lucide-react";
import {
  DEFAULT_SETTINGS,
  normalizeHeaderMenus,
  type HeaderMenu,
  type SiteSettings,
} from "@/lib/site-settings";

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
  const navigate = useNavigate();
  const { count } = useCart();
  const [q, setQ] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const configured = normalizeHeaderMenus(settings.header_menus).filter((m) => m.enabled);
  const menus: HeaderMenu[] = configured.length
    ? configured
    : categories
        .filter((c) => !c.parent)
        .map((c) => ({
          label: c.name,
          type: "category" as const,
          slug: c.slug,
          url: "",
          color: "none" as const,
          enabled: true,
        }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/search", search: { q } });
  }

  return (
    <>
      <div className="bg-[color:var(--brand-pink)] text-white text-xs sm:text-sm text-center py-2 px-4">
        {settings.announcement_text}
      </div>

      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden h-9 w-9 shrink-0 grid place-items-center rounded-lg hover:bg-muted"
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
            <span className="text-lg sm:text-3xl font-black tracking-tight text-foreground uppercase truncate">
              {settings.store_name}
            </span>
          </Link>

          <form onSubmit={submit} className="hidden md:block flex-1 relative min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--brand-pink)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search for products, brands and more…"
              aria-label="Search products"
              className="w-full rounded-full border-2 border-[color:var(--brand-pink)]/30 focus:border-[color:var(--brand-pink)] outline-none pl-11 pr-4 py-2.5 text-sm bg-white"
            />
          </form>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Link
              to="/search"
              search={{ q: "" }}
              className="hidden lg:flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs font-semibold"
            >
              <Heart className="h-4 w-4" /> ALL PRODUCTS
            </Link>
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" /> ADMIN
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[color:var(--brand-pink)] text-white px-3 sm:px-4 py-2 text-xs font-semibold"
            >
              <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">BAG</span>
              <span className="bg-white text-[color:var(--brand-pink)] rounded-full h-5 w-5 grid place-items-center text-[10px] font-bold">
                {count}
              </span>
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="md:hidden px-4 pb-3 relative">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--brand-pink)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full rounded-full border-2 border-[color:var(--brand-pink)]/30 focus:border-[color:var(--brand-pink)] outline-none pl-11 pr-4 py-2.5 text-sm bg-white"
          />
        </form>

        {menus.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pb-3 hidden lg:flex flex-wrap items-center gap-x-5 gap-y-2">
            {menus.map((m, i) => {
              const kids = m.type === "category" ? categories.filter((k) => k.parent === m.slug) : [];
              const pill = MENU_PILL[m.color] ?? "";
              const base = `text-sm font-semibold whitespace-nowrap py-1 ${
                pill ? `${pill} text-[11px] font-bold` : "text-foreground/80 hover:text-[color:var(--brand-pink)]"
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
            <Link to="/search" search={{ q: "" }} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-muted">
              <Heart className="h-4 w-4" /> All products
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
          <div className="border-t border-border p-3">
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" /> Admin
            </Link>
          </div>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <MobileBottomNav onOpenMenu={() => setMenuOpen(true)} onOpenCart={() => setCartOpen(true)} />
    </>
  );
}
