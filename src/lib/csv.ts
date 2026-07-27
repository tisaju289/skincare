/** Tiny CSV helpers used by the admin table toolbars. */

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  const cols =
    columns && columns.length
      ? columns
      : Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const head = cols.map(escapeCell).join(",");
  const body = rows.map((r) => cols.map((c) => escapeCell(r[c])).join(",")).join("\n");
  return rows.length ? `${head}\n${body}` : head;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Parses a CSV string (handles quoted cells and embedded newlines) into objects. */
export function parseCsv(text: string): Record<string, string>[] {
  const clean = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ",") { row.push(cell); cell = ""; continue; }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }

  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (!nonEmpty.length) return [];
  const header = nonEmpty[0].map((h) => h.trim());
  return nonEmpty.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, i) => { obj[h] = (r[i] ?? "").trim(); });
    return obj;
  });
}

/** Turns a CSV cell string into a value PostgREST accepts. */
export function coerceCell(value: string): string | number | boolean | null {
  if (value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

/** Case-insensitive "does this row contain the query" check. */
export function matchesQuery(row: unknown, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const seen = new Set<unknown>();
  const walk = (v: unknown): boolean => {
    if (v === null || v === undefined) return false;
    if (typeof v === "object") {
      if (seen.has(v)) return false;
      seen.add(v);
      return Object.values(v as Record<string, unknown>).some(walk);
    }
    return String(v).toLowerCase().includes(q);
  };
  return walk(row);
}
