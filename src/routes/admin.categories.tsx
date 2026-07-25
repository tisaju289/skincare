import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminModal, Field, inputCls } from "@/components/admin/AdminModal";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

type Category = { id: string; name: string; slug: string; color: string | null; image: string | null; sort_order: number };
type FormState = Partial<Category>;
const empty: FormState = { name: "", slug: "", color: "from-pink-400 to-rose-500", sort_order: 0 };

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
          <Plus className="h-4 w-4" /> New category
        </button>
      }/>
      <div className="p-6">
        {q.isLoading && <div className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></div>}
        {!q.isLoading && cats.length === 0 && <p className="text-center text-muted-foreground py-10">No categories yet.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cats.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-2xl overflow-hidden group">
              <div className={`h-28 bg-gradient-to-br ${c.color ?? "from-pink-400 to-rose-500"} relative`}>
                <div className="absolute inset-0 flex items-end p-4">
                  <p className="text-white text-xl font-black drop-shadow">{c.name}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(c); setForm(c); setOpen(true); }} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"><Edit2 className="h-3.5 w-3.5"/></button>
                  <button onClick={() => confirm(`Delete "${c.name}"?`) && del.mutate(c.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-rose-600"><Trash2 className="h-3.5 w-3.5"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit category" : "New category"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <Field label="Name"><input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Slug"><input required className={inputCls} value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
          <Field label="Color gradient (Tailwind, e.g. from-pink-400 to-rose-500)"><input className={inputCls} value={form.color ?? ""} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
          <Field label="Image URL"><input className={inputCls} value={form.image ?? ""} onChange={(e) => setForm({ ...form, image: e.target.value })} /></Field>
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
