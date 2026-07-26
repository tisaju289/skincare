import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminModal, Field, inputCls } from "@/components/admin/AdminModal";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

type Product = {
  id: string;
  slug: string;
  name: string;
  brand_id: string | null;
  category_id: string | null;
  price: number;
  old_price: number | null;
  image: string | null;
  description: string | null;
  stock: number;
  status: "active" | "draft" | "out_of_stock" | "low_stock";
};

type FormState = Partial<Product>;

const empty: FormState = { name: "", slug: "", price: 0, stock: 0, status: "active" };

function ProductsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const productsQ = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, brands(name), categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categoriesQ = useQuery({
    queryKey: ["admin", "categories-select"],
    queryFn: async () => (await supabase.from("categories").select("id,name").order("name")).data ?? [],
  });
  const brandsQ = useQuery({
    queryKey: ["admin", "brands-select"],
    queryFn: async () => (await supabase.from("brands").select("id,name").order("name")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async (payload: FormState) => {
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setForm(p);
    setOpen(true);
  }

  const products = productsQ.data ?? [];

  return (
    <>
      <AdminTopbar
        title="Products"
        subtitle={`${products.length} products in your catalog`}
        action={
          <button onClick={openNew} className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
            <Plus className="h-4 w-4" /> Add product
          </button>
        }
      />
      <div className="p-4 sm:p-6">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Product</th>
                  <th className="px-5 py-3 text-left font-semibold">Category</th>
                  <th className="px-5 py-3 text-left font-semibold">Price</th>
                  <th className="px-5 py-3 text-left font-semibold">Stock</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {productsQ.isLoading && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin inline" />
                  </td></tr>
                )}
                {!productsQ.isLoading && products.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No products yet. Click "Add product".</td></tr>
                )}
                {products.map((p: any) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted" />
                        )}
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brands?.name ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{p.categories?.name ?? "—"}</td>
                    <td className="px-5 py-3 font-semibold">৳{Number(p.price).toLocaleString()}</td>
                    <td className="px-5 py-3">{p.stock}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-muted">{p.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => confirm(`Delete "${p.name}"?`) && del.mutate(p.id)}
                          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit product" : "New product"} size="lg">
        <form
          onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name"><input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Slug"><input required className={inputCls} value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Category">
              <select className={inputCls} value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}>
                <option value="">— None —</option>
                {(categoriesQ.data ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Brand">
              <select className={inputCls} value={form.brand_id ?? ""} onChange={(e) => setForm({ ...form, brand_id: e.target.value || null })}>
                <option value="">— None —</option>
                {(brandsQ.data ?? []).map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Price (৳)"><input required type="number" step="0.01" className={inputCls} value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></Field>
            <Field label="Old price (৳)"><input type="number" step="0.01" className={inputCls} value={form.old_price ?? ""} onChange={(e) => setForm({ ...form, old_price: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Stock"><input required type="number" className={inputCls} value={form.stock ?? 0} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></Field>
            <Field label="Status">
              <select className={inputCls} value={form.status ?? "active"} onChange={(e) => setForm({ ...form, status: e.target.value as Product["status"] })}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </Field>
          </div>
          <Field label="Image URL"><input className={inputCls} value={form.image ?? ""} onChange={(e) => setForm({ ...form, image: e.target.value })} /></Field>
          <Field label="Description"><textarea rows={3} className={inputCls} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button disabled={save.isPending} type="submit" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90 disabled:opacity-60">
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
