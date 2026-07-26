import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminModal, Field, inputCls } from "@/components/admin/AdminModal";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/brands")({
  component: BrandsPage,
});

type Brand = { id: string; name: string; slug: string; logo: string | null; created_at: string };
type FormState = Partial<Brand>;
const empty: FormState = { name: "", slug: "", logo: "" };

function BrandsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const q = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("*").order("name");
      if (error) throw error;
      return data as Brand[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: FormState) => {
      const payload = {
        name: (p.name ?? "").trim(),
        slug: (p.slug ?? "").trim(),
        logo: p.logo?.trim() ? p.logo.trim() : null,
      };
      const { error } = editing
        ? await supabase.from("brands").update(payload).eq("id", editing.id)
        : await supabase.from("brands").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editing ? "Updated" : "Created");
      qc.invalidateQueries({ queryKey: ["admin", "brands"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "brands"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const brands = q.data ?? [];

  return (
    <>
      <AdminTopbar
        title="Brands"
        subtitle="Manage the brands your products belong to"
        action={
          <button
            onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}
            className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New brand</span>
          </button>
        }
      />
      <div className="p-4 sm:p-6">
        {q.isLoading && (
          <div className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></div>
        )}
        {!q.isLoading && brands.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No brands yet.</p>
        )}
        {brands.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Brand</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Logo</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold">{b.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">/{b.slug}</td>
                    <td className="px-4 py-3">
                      {b.logo ? (
                        <img src={b.logo} alt={b.name} className="h-8 w-8 rounded-lg object-cover" loading="lazy" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(b); setForm(b); setOpen(true); }} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => confirm(`Delete "${b.name}"?`) && del.mutate(b.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit brand" : "New brand"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <Field label="Name">
            <input
              required
              className={inputCls}
              value={form.name ?? ""}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: editing ? f.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                }));
              }}
            />
          </Field>
          <Field label="Slug"><input required className={inputCls} value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
          <Field label="Logo URL"><input className={inputCls} value={form.logo ?? ""} onChange={(e) => setForm({ ...form, logo: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button disabled={save.isPending} type="submit" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90">{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
