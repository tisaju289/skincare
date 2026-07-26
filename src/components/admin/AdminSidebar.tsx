import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart3, Settings,
  Percent, MessageSquare, LogOut, ExternalLink, X,
} from "lucide-react";
import { setAdminNavOpen, useAdminNavOpen } from "./admin-nav";

const nav = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart, badge: "12" },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Categories", url: "/admin/categories", icon: Tag },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Promotions", url: "/admin/promotions", icon: Percent },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Reviews", url: "/admin/reviews", icon: MessageSquare },
  { title: "Settings", url: "/admin/settings", icon: Settings },
] as const;

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <>
      <div className="px-5 sm:px-6 py-5 border-b border-border flex items-center justify-between gap-2">
        <Link to="/admin" onClick={onNavigate} className="flex min-w-0 items-center gap-2">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-[color:var(--brand-pink)] grid place-items-center text-white font-black">S</div>
          <div className="min-w-0">
            <p className="text-sm font-black leading-tight truncate">SHAJGOJ</p>
            <p className="text-[10px] text-muted-foreground truncate">Admin Console</p>
          </div>
        </Link>
        {onNavigate && (
          <button
            onClick={onNavigate}
            aria-label="Close menu"
            className="lg:hidden h-8 w-8 shrink-0 grid place-items-center rounded-lg hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = isActive(item.url, "exact" in item ? item.exact : false);
          const Icon = item.icon;
          return (
            <Link
              key={item.url}
              to={item.url}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-[color:var(--brand-pink)] text-white shadow-sm"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 min-w-0 truncate">{item.title}</span>
              {"badge" in item && item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${active ? "bg-white/20" : "bg-[color:var(--brand-pink)]/10 text-[color:var(--brand-pink)]"}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-muted transition"
        >
          <ExternalLink className="h-4 w-4" />
          Visit site
        </Link>
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 grid place-items-center text-white font-bold text-sm">A</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">admin@shajgoj.com</p>
          </div>
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const open = useAdminNavOpen();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setAdminNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAdminNavOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card min-h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setAdminNavOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[80%] max-w-72 bg-card border-r border-border flex flex-col transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <NavContent onNavigate={() => setAdminNavOpen(false)} />
        </div>
      </div>
    </>
  );
}
