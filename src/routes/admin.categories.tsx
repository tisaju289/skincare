import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ImageInput } from "@/components/admin/ImageInput";
import { AdminModal, Field, inputCls } from "@/components/admin/AdminModal";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

type Category = { id: string; name: string; slug: string; color: string | null; image: string | null; sort_order: number; parent_id: string | null };
type FormState = Partial<Category>;
const empty: FormState = { name: "", slug: "", color: "from-pink-400 to-rose-500", sort_order: 0, parent_id: null };

function CategoriesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const q = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: FormState) => {
      const { error } = editing
        ? await supabase.from("categories").update(p).eq("id", editing.id)
        : await supabase.from("categories").insert(p as any);
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

  const cats = q.data ?? [];

  return (
    <>
      <AdminTopbar title="Categories" subtitle="Organize products into browseable categories" action={
        <button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New category</span>
        </button>
      }/>
      <div className="p-4 sm:p-6">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Category</th>
                  <th className="px-5 py-3 text-left font-semibold">Slug</th>
                  <th className="px-5 py-3 text-left font-semibold">Parent</th>
                  <th className="px-5 py-3 text-left font-semibold">Color</th>
                  <th className="px-5 py-3 text-left font-semibold">Sort order</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {q.isLoading && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                )}
                {!q.isLoading && cats.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No categories yet. Click "New category".</td></tr>
                )}
                {cats.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          <img src={c.image} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                        ) : (
                          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${c.color ?? "from-pink-400 to-rose-500"}`} />
                        )}
                        <p className="font-medium">{c.parent_id ? <span className="text-muted-foreground">↳ </span> : null}{c.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">/{c.slug}</td>
                    <td className="px-5 py-3 text-muted-foreground">{cats.find((p) => p.id === c.parent_id)?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{c.color ?? "—"}</td>
                    <td className="px-5 py-3">{c.sort_order}</td>
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

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit category" : "New category"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate({ ...form, parent_id: form.parent_id || null }); }} className="space-y-4">
          <Field label="Name"><input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Slug"><input required className={inputCls} value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
          <Field label="Parent category (optional — leave empty for a top-level category)">
            <select
              className={inputCls}
              value={form.parent_id ?? ""}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
            >
              <option value="">None (top level)</option>
              {cats
                .filter((c) => !editing || (c.id !== editing.id && c.parent_id !== editing.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </Field>
          <Field label="Color gradient (Tailwind, e.g. from-pink-400 to-rose-500)"><input className={inputCls} value={form.color ?? ""} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
          <ImageInput label="Category image" folder="categories" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
          <Field label="Sort order"><input type="number" className={inputCls} value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></Field>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button disabled={save.isPending} type="submit" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90">{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
