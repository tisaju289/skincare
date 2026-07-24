import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart3, Settings, Percent, MessageSquare, LogOut } from "lucide-react";

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

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card min-h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-[color:var(--brand-pink)] grid place-items-center text-white font-black">S</div>
          <div>
            <p className="text-sm font-black leading-tight">SHAJGOJ</p>
            <p className="text-[10px] text-muted-foreground">Admin Console</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = isActive(item.url, "exact" in item ? item.exact : false);
          const Icon = item.icon;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-[color:var(--brand-pink)] text-white shadow-sm"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              {"badge" in item && item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${active ? "bg-white/20" : "bg-[color:var(--brand-pink)]/10 text-[color:var(--brand-pink)]"}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 grid place-items-center text-white font-bold text-sm">A</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">admin@shajgoj.com</p>
          </div>
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
