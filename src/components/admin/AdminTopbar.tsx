import { Bell, Search, Plus } from "lucide-react";

export function AdminTopbar({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
      <div className="px-6 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <div className="hidden md:flex relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search…" className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-muted/50 outline-none focus:bg-background focus:border-[color:var(--brand-pink)]" />
        </div>
        <button className="relative h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-muted">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[color:var(--brand-pink)] rounded-full" />
        </button>
        {action ?? (
          <button className="hidden sm:inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
            <Plus className="h-4 w-4" /> New
          </button>
        )}
      </div>
    </header>
  );
}
