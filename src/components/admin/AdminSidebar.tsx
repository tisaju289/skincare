import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Settings,
  Percent, MessageSquare, LogOut, ExternalLink, X, Sparkles, Layers,
} from "lucide-react";
import { setAdminNavOpen, useAdminNavOpen } from "./admin-nav";
import { useAdminBranding } from "@/lib/admin-branding";


const groups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Commerce",
    items: [
      { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
      { title: "Products", url: "/admin/products", icon: Package },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Categories", url: "/admin/categories", icon: Tag },
      { title: "Subcategories", url: "/admin/subcategories", icon: Layers },
      { title: "Brands", url: "/admin/brands", icon: Sparkles },
    ],
  },
  {
    label: "Engagement",
    items: [
      { title: "Promotions", url: "/admin/promotions", icon: Percent },
      { title: "Reviews", url: "/admin/reviews", icon: MessageSquare },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Design", url: "/admin/design", icon: Paintbrush },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
] as const;

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const branding = useAdminBranding();
  const [email, setEmail] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      onNavigate?.();
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      toast.success("Signed out");
      navigate({ to: "/auth", replace: true });
    } catch {
      toast.error("Could not sign out");
    } finally {
      setSigningOut(false);
    }
  };

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <>
      <div className="px-4 sm:px-5 py-4 border-b border-border/70 flex items-center justify-between gap-2">
        <Link to="/admin" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5 group">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.storeName}
              className="h-9 w-9 shrink-0 rounded-xl object-contain bg-muted/50 transition group-hover:scale-105"
            />
          ) : (
            <div className="h-9 w-9 shrink-0 rounded-xl bg-[color:var(--brand-pink)] grid place-items-center text-white font-black shadow-sm transition group-hover:scale-105">
              {branding.storeName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-black leading-tight truncate">{branding.storeName}</p>
            <p className="text-[10px] text-muted-foreground truncate">Admin Console</p>
          </div>
        </Link>
        {onNavigate && (
          <button
            onClick={onNavigate}
            aria-label="Close menu"
            className="lg:hidden h-9 w-9 shrink-0 grid place-items-center rounded-xl border border-border admin-tap hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>


      <nav className="flex-1 overflow-y-auto admin-scroll px-3 py-4 space-y-5">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.url, "exact" in item ? item.exact : false);
              const Icon = item.icon;
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  onClick={onNavigate}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium admin-tap ${
                    active
                      ? "bg-[color:var(--brand-pink)] text-white shadow-[0_8px_20px_-12px_var(--brand-pink)]"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 transition ${active ? "" : "group-hover:scale-110"}`} />
                  <span className="flex-1 min-w-0 truncate">{item.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-3">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-border admin-tap hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" />
          Visit site
        </Link>
      </div>

      <div className="p-3 border-t border-border/70 space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 grid place-items-center text-white font-bold text-sm">
            {(email || "A").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">{email || "—"}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-border admin-tap hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out…" : "Log out"}
        </button>
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
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card/80 backdrop-blur h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setAdminNavOpen(false)}
          className={`absolute inset-0 bg-foreground/40 backdrop-blur-[2px] transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[82%] max-w-72 bg-card border-r border-border flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <NavContent onNavigate={() => setAdminNavOpen(false)} />
        </div>
      </div>
    </>
  );
}
