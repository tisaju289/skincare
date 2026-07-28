import { useRef, useState } from "react";
import { Search, SlidersHorizontal, Download, Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { toCsv, downloadCsv, parseCsv, coerceCell } from "@/lib/csv";

export type ToolbarFilter = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
};

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: ToolbarFilter[];
  /** Rows currently visible, used for the CSV export. */
  exportRows: Record<string, unknown>[];
  exportColumns?: string[];
  /** File name (without extension) for the exported CSV. */
  exportName: string;
  /** Supabase table CSV rows are imported into. Omit to hide the import button. */
  importTable?: string;
  /** Columns allowed from the CSV file (plus `id` for updates). */
  importColumns?: string[];
  onImported?: () => void;
  resultCount?: number;
};

const btn =
  "inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted whitespace-nowrap disabled:opacity-60 admin-tap";

export function TableToolbar({
  search,
  onSearchChange,
  placeholder = "Search…",
  filters = [],
  exportRows,
  exportColumns,
  exportName,
  importTable,
  importColumns,
  onImported,
  resultCount,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [importing, setImporting] = useState(false);

  const activeFilters = filters.filter((f) => f.value && f.value !== "all").length;

  function handleExport() {
    if (!exportRows.length) {
      toast.error("Nothing to export");
      return;
    }
    downloadCsv(`${exportName}-${new Date().toISOString().slice(0, 10)}`, toCsv(exportRows, exportColumns));
    toast.success(`Exported ${exportRows.length} rows`);
  }

  async function handleImport(file: File) {
    if (!importTable) return;
    setImporting(true);
    try {
      const rows = parseCsv(await file.text());
      if (!rows.length) throw new Error("CSV file is empty");

      const allowed = new Set([...(importColumns ?? []), "id"]);
      const inserts: Record<string, unknown>[] = [];
      const updates: Record<string, unknown>[] = [];

      for (const raw of rows) {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(raw)) {
          if (allowed.has(k)) payload[k] = coerceCell(v);
        }
        if (!Object.keys(payload).length) continue;
        if (payload.id) updates.push(payload);
        else { delete payload.id; inserts.push(payload); }
      }

      if (!inserts.length && !updates.length) throw new Error("No matching columns found in CSV");

      const table = supabase.from(importTable as never);
      if (updates.length) {
        const { error } = await (table as any).upsert(updates, { onConflict: "id" });
        if (error) throw error;
      }
      if (inserts.length) {
        const { error } = await (supabase.from(importTable as never) as any).insert(inserts);
        if (error) throw error;
      }
      toast.success(`Imported ${inserts.length + updates.length} rows`);
      onImported?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="admin-card p-3 sm:p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-border bg-muted/40 outline-none transition focus:bg-background focus:border-[color:var(--brand-pink)] focus:ring-2 focus:ring-[color:var(--brand-pink)]/20"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {filters.length > 0 && (
          <button type="button" onClick={() => setShowFilters((v) => !v)} className={btn}>
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilters > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[color:var(--brand-pink)] text-white">{activeFilters}</span>
            )}
          </button>
        )}

        <button type="button" onClick={handleExport} className={btn}>
          <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
        </button>

        {importTable && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); }}
            />
            <button type="button" disabled={importing} onClick={() => fileRef.current?.click()} className={btn}>
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span className="hidden sm:inline">Import</span>
            </button>
          </>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-end gap-3 pt-3 border-t border-border animate-fade-in">
          {filters.map((f) => (
            <label key={f.label} className="block min-w-0">
              <span className="block text-[11px] font-semibold text-muted-foreground mb-1">{f.label}</span>
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="w-full sm:w-auto text-sm rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-[color:var(--brand-pink)] focus:ring-2 focus:ring-[color:var(--brand-pink)]/20"
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          ))}
          <button
            type="button"
            onClick={() => filters.forEach((f) => f.onChange("all"))}
            className="text-xs font-semibold px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            Reset
          </button>
        </div>
      )}

      {typeof resultCount === "number" && (
        <p className="text-xs text-muted-foreground">{resultCount} result{resultCount === 1 ? "" : "s"}</p>
      )}
    </div>
  );
}
