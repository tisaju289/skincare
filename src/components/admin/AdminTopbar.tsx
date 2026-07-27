import { Bell, Search, Plus, Menu } from "lucide-react";
import { setAdminNavOpen } from "./admin-nav";

export function AdminTopbar({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
      <div className="px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <button
          onClick={() => setAdminNavOpen(true)}
          aria-label="Open menu"
          className="lg:hidden h-9 w-9 shrink-0 rounded-lg border border-border grid place-items-center hover:bg-muted"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="hidden lg:block" />

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-black truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden xl:flex relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input placeholder="Search…" className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-muted/50 outline-none focus:bg-background focus:border-[color:var(--brand-pink)]" />
          </div>
          {action}

        </div>
      </div>
    </header>
  );
}
