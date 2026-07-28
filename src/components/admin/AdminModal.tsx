import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function AdminModal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = size === "sm" ? "sm:max-w-md" : size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl";
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-foreground/40 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`admin-sheet-in w-full ${width} bg-background border border-border shadow-2xl rounded-t-3xl sm:rounded-2xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden pt-2.5 pb-1 grid place-items-center">
          <span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/70">
          <h2 className="font-bold text-base sm:text-lg truncate">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 shrink-0 grid place-items-center rounded-xl admin-tap hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div
          className="p-4 sm:p-6 overflow-y-auto admin-scroll"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none transition focus:border-[color:var(--brand-pink)] focus:ring-2 focus:ring-[color:var(--brand-pink)]/20";
