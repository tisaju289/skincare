/** Strip values Supabase can't write: joined relation objects/arrays and read-only columns. */
const READ_ONLY = ["id", "created_at", "updated_at"];

export function sanitizeRow<T extends Record<string, any>>(
  row: T,
  extraOmit: string[] = [],
  keepJson: string[] = [],
) {
  const omit = new Set([...READ_ONLY, ...extraOmit]);
  const keep = new Set(keepJson);
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row ?? {})) {
    if (omit.has(k)) continue;
    if (!keep.has(k) && v !== null && typeof v === "object" && !(v instanceof Date)) continue; // joined relations
    out[k] = v;
  }
  return out;
}
