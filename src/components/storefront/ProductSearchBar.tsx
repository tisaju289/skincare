import { Search } from "lucide-react";

export function ProductSearchBar({
  value,
  onChange,
  placeholder = "Search products…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="w-full rounded-full border border-border bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[color:var(--brand-pink)]"
      />
    </div>
  );
}
