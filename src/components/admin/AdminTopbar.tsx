import { Menu } from "lucide-react";
import { setAdminNavOpen } from "./admin-nav";

export function AdminTopbar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 bg-background/75 backdrop-blur-xl border-b border-border/70">
      <div className="px-3 sm:px-6 py-3 grid grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <button
          onClick={() => setAdminNavOpen(true)}
          aria-label="Open menu"
          className="lg:hidden h-10 w-10 shrink-0 rounded-xl border border-border grid place-items-center admin-tap hover:bg-muted"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
        <div className="hidden lg:block" />

        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-black tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>

        {action && (
          <div className="col-span-2 sm:col-span-1 flex items-center gap-2 shrink-0 [&_button]:admin-tap">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
