import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ImageInput } from "@/components/admin/ImageInput";
import { AdminModal, Field, inputCls } from "@/components/admin/AdminModal";
import { supabase } from "@/integrations/supabase/client";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { matchesQuery } from "@/lib/csv";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/subcategories")({
  component: SubcategoriesPage,
});

type Category = { id: string; name: string; slug: string; image: string | null; parent_id: string | null; sort_order: number };
type FormState = Partial<Category>;
const empty: FormState = { name: "", slug: "", image: null, parent_id: null };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function SubcategoriesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [search, setSearch] = useState("");
  const [parentFilter, setParentFilter] = useState("all");

  const q = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const all = q.data ?? [];
  const parents = all.filter((c) => !c.parent_id);
  const allSubs = all.filter((c) => c.parent_id);
  const subs = allSubs.filter(
    (c) =>
      matchesQuery({ name: c.name, slug: c.slug }, search) &&
      (parentFilter === "all" || c.parent_id === parentFilter),
  );

  const save = useMutation({
    mutationFn: async (p: FormState) => {
      const payload = { name: p.name, slug: p.slug, image: p.image ?? null, parent_id: p.parent_id };
      const { error } = editing
        ? await supabase.from("categories").update(payload).eq("id", editing.id)
        : await supabase.from("categories").insert(payload as any);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(editing ? "Updated" : "Created"); qc.invalidateQueries({ queryKey: ["admin", "categories"] }); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("categories").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "categories"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <AdminTopbar title="Subcategories" subtitle="Group products under a parent category" action={
        <button onClick={() => { setEditing(null); setForm({ ...empty, parent_id: parents[0]?.id ?? null }); setOpen(true); }} className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New subcategory</span>
        </button>
      }/>
      <div className="p-3 sm:p-6 space-y-4">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search subcategories…"
          filters={[{
            label: "Parent category",
            value: parentFilter,
            onChange: setParentFilter,
            options: [{ label: "All categories", value: "all" }, ...parents.map((p) => ({ label: p.name, value: p.id }))],
          }]}
          exportRows={subs}
          exportName="subcategories"
          importTable="categories"
          importColumns={["name", "slug", "image", "parent_id", "sort_order"]}
          onImported={() => qc.invalidateQueries({ queryKey: ["admin", "categories"] })}
          resultCount={subs.length}
        />
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Subcategory</th>
                  <th className="px-5 py-3 text-left font-semibold">Slug</th>
                  <th className="px-5 py-3 text-left font-semibold">Category</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {q.isLoading && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                )}
                {!q.isLoading && subs.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">{allSubs.length ? "No subcategories match your search." : 'No subcategories yet. Click "New subcategory".'}</td></tr>
                )}
                {subs.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          <img src={c.image} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted" />
                        )}
                        <p className="font-medium">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">/{c.slug}</td>
                    <td className="px-5 py-3 text-muted-foreground">{parents.find((p) => p.id === c.parent_id)?.name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(c); setForm(c); setOpen(true); }} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"><Edit2 className="h-3.5 w-3.5"/></button>
                        <button onClick={() => confirm(`Delete "${c.name}"?`) && del.mutate(c.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-rose-600"><Trash2 className="h-3.5 w-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit subcategory" : "New subcategory"}>
        <form onSubmit={(e) => { e.preventDefault(); if (!form.parent_id) { toast.error("Select a category"); return; } save.mutate(form); }} className="space-y-4">
          <Field label="Name">
            <input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} />
          </Field>
          <Field label="Slug"><input required className={inputCls} value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
          <ImageInput label="Subcategory image" folder="categories" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
          <Field label="Category">
            <select required className={inputCls} value={form.parent_id ?? ""} onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}>
              <option value="">Select a category</option>
              {parents.filter((p) => !editing || p.id !== editing.id).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button disabled={save.isPending} type="submit" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90">{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
