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
  long_description: string | null;
  stock: number;
  status: "active" | "draft" | "out_of_stock" | "low_stock";
  is_trending?: boolean;
  is_best_seller?: boolean;
  is_flash_sale?: boolean;
  is_new_arrival?: boolean;
};

const FLAGS = [
  { key: "is_trending", label: "Trending" },
  { key: "is_best_seller", label: "Best selling" },
  { key: "is_flash_sale", label: "Flash sale" },
  { key: "is_new_arrival", label: "New arrival" },
] as const;

type FormState = Partial<Product>;

type VariantRow = { name: string; value: string; price: string; stock: string; image: string };

const emptyVariant: VariantRow = { name: "Shade", value: "", price: "", stock: "0", image: "" };

const empty: FormState = { name: "", slug: "", price: 0, stock: 0, status: "active" };


const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function ProductsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [parentId, setParentId] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);

  const [slugTouched, setSlugTouched] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
    queryFn: async () => (await supabase.from("categories").select("id,name,parent_id").order("name")).data ?? [],
  });
  const brandsQ = useQuery({
    queryKey: ["admin", "brands-select"],
    queryFn: async () => (await supabase.from("brands").select("id,name").order("name")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async (form: FormState) => {
      // Only send real product columns — joined relations (brands/categories) are not columns.
      const payload = {
        slug: form.slug,
        name: form.name,
        brand_id: form.brand_id ?? null,
        category_id: form.category_id ?? null,
        price: Number(form.price ?? 0),
        old_price: form.old_price ?? null,
        image: form.image ?? null,
        description: form.description ?? null,
        long_description: form.long_description ?? null,
        stock: Number(form.stock ?? 0),
        status: form.status ?? "active",
        is_trending: !!form.is_trending,
        is_best_seller: !!form.is_best_seller,
        is_flash_sale: !!form.is_flash_sale,
        is_new_arrival: !!form.is_new_arrival,
      };
      let productId = editing?.id;
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload as any).select("id").single();
        if (error) throw error;
        productId = data.id;
      }
      if (productId) {
        const urls = gallery.map((u) => u.trim()).filter(Boolean);
        await supabase.from("product_images").delete().eq("product_id", productId);
        if (urls.length) {
          const { error } = await supabase
            .from("product_images")
            .insert(urls.map((url, i) => ({ product_id: productId!, url, sort_order: i })));
          if (error) throw error;
        }
        const rows = variants
          .map((v, i) => ({
            product_id: productId!,
            name: v.name.trim() || "Variant",
            value: v.value.trim(),
            price: v.price.trim() === "" ? null : Number(v.price),
            stock: Number(v.stock || 0),
            image: v.image.trim() || null,
            sort_order: i,
          }))
          .filter((v) => v.value);
        await supabase.from("product_variants" as any).delete().eq("product_id", productId);
        if (rows.length) {
          const { error } = await supabase.from("product_variants" as any).insert(rows as any);
          if (error) throw error;
        }
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
    setParentId("");
    setGallery([]);
    setVariants([]);
    setSlugTouched(false);
    setOpen(true);
  }
  async function openEdit(p: Product) {
    setEditing(p);
    setForm(p);
    setSlugTouched(true);
    const cats = (categoriesQ.data ?? []) as any[];
    const current = cats.find((c) => c.id === p.category_id);
    setParentId(current?.parent_id ?? current?.id ?? "");
    setGallery([]);
    setVariants([]);
    setOpen(true);
    const { data } = await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", p.id)
      .order("sort_order");
    setGallery((data ?? []).map((r) => r.url));
    const { data: vs } = await supabase
      .from("product_variants" as any)
      .select("name,value,price,stock,image")
      .eq("product_id", p.id)
      .order("sort_order");
    setVariants(
      ((vs ?? []) as any[]).map((v) => ({
        name: v.name ?? "",
        value: v.value ?? "",
        price: v.price == null ? "" : String(v.price),
        stock: String(v.stock ?? 0),
        image: v.image ?? "",
      })),
    );
  }


  const products = (productsQ.data ?? []) as any[];
  const filtered = products.filter(
    (p) =>
      matchesQuery(p, search) &&
      (statusFilter === "all" || p.status === statusFilter) &&
      (categoryFilter === "all" || p.category_id === categoryFilter),
  );
  const allCats = (categoriesQ.data ?? []) as any[];
  const parentCats = allCats.filter((c) => !c.parent_id);
  const subCats = allCats.filter((c) => c.parent_id);

  return (
    <>
      <AdminTopbar
        title="Products"
        subtitle={`${products.length} products in your catalog`}
        action={
          <button onClick={openNew} className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add product</span>
          </button>
        }
      />
      <div className="p-3 sm:p-6 space-y-4">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search products by name, slug, brand…"
          filters={[
            {
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: "All statuses", value: "all" },
                { label: "Active", value: "active" },
                { label: "Draft", value: "draft" },
                { label: "Low stock", value: "low_stock" },
                { label: "Out of stock", value: "out_of_stock" },
              ],
            },
            {
              label: "Category",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: "All categories", value: "all" },
                ...((categoriesQ.data ?? []) as any[]).map((c) => ({ label: c.name, value: c.id })),
              ],
            },
          ]}
          exportRows={filtered.map(({ brands, categories, ...r }: any) => r)}
          exportName="products"
          importTable="products"
          importColumns={["slug", "name", "price", "old_price", "tag", "is_trending", "is_best_seller", "is_flash_sale", "is_new_arrival", "image", "description", "long_description", "color", "stock", "status", "brand_id", "category_id"]}
          onImported={() => qc.invalidateQueries({ queryKey: ["admin", "products"] })}
          resultCount={filtered.length}
        />
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0 z-10">
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
                {!productsQ.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">{products.length ? "No products match your search." : 'No products yet. Click "Add product".'}</td></tr>
                )}
                {filtered.map((p: any) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt="" loading="lazy" decoding="async" className="h-10 w-10 rounded-lg object-cover" />
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
                        <button onClick={() => openEdit(p)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => confirm(`Delete "${p.name}"?`) && del.mutate(p.id)}
                          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap text-rose-600"
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
            <Field label="Name">
              <input
                required
                className={inputCls}
                value={form.name ?? ""}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
                }}
              />
            </Field>
            <Field label="Slug">
              <input
                required
                className={inputCls}
                value={form.slug ?? ""}
                onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }}
              />
            </Field>
            <Field label="Category">
              <select
                className={inputCls}
                value={parentId}
                onChange={(e) => {
                  setParentId(e.target.value);
                  setForm({ ...form, category_id: e.target.value || null });
                }}
              >
                <option value="">— None —</option>
                {parentCats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Subcategory">
              <select
                className={inputCls}
                disabled={!parentId}
                value={form.category_id && form.category_id !== parentId ? form.category_id : ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || parentId || null })}
              >
                <option value="">— None —</option>
                {subCats.filter((c: any) => c.parent_id === parentId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Highlights</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FLAGS.map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={!!form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                    className="h-4 w-4 accent-[color:var(--brand-pink)]"
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          <ImageInput label="Product image" folder="products" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Product gallery</span>
              <button type="button" onClick={() => setGallery([...gallery, ""])} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border border-border hover:bg-muted">
                <Plus className="h-3 w-3" /> Add image
              </button>
            </div>
            {gallery.length === 0 && <p className="text-xs text-muted-foreground">No gallery images yet.</p>}
            {gallery.map((url, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <ImageInput
                    label={`Image ${i + 1}`}
                    folder="products"
                    value={url}
                    onChange={(v) => setGallery(gallery.map((g, gi) => (gi === i ? v : g)))}
                  />
                </div>
                <button type="button" aria-label="Remove gallery image" onClick={() => setGallery(gallery.filter((_, gi) => gi !== i))} className="mt-6 h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap text-rose-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Variants (shade / size)</span>
              <button type="button" onClick={() => setVariants([...variants, { ...emptyVariant }])} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border border-border hover:bg-muted">
                <Plus className="h-3 w-3" /> Add variant
              </button>
            </div>
            {variants.length === 0 && <p className="text-xs text-muted-foreground">No variants. Product will be sold as a single option.</p>}
            {variants.map((v, i) => (
              <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Option name"><input className={inputCls} value={v.name} placeholder="Shade" onChange={(e) => setVariants(variants.map((x, xi) => (xi === i ? { ...x, name: e.target.value } : x)))} /></Field>
                  <Field label="Option value"><input className={inputCls} value={v.value} placeholder="Ruby Red" onChange={(e) => setVariants(variants.map((x, xi) => (xi === i ? { ...x, value: e.target.value } : x)))} /></Field>
                  <Field label="Price (blank = base)"><input type="number" className={inputCls} value={v.price} onChange={(e) => setVariants(variants.map((x, xi) => (xi === i ? { ...x, price: e.target.value } : x)))} /></Field>
                  <Field label="Stock"><input type="number" className={inputCls} value={v.stock} onChange={(e) => setVariants(variants.map((x, xi) => (xi === i ? { ...x, stock: e.target.value } : x)))} /></Field>
                </div>
                <ImageInput label="Variant image" folder="products" value={v.image} onChange={(val) => setVariants(variants.map((x, xi) => (xi === i ? { ...x, image: val ?? "" } : x)))} />
                <button type="button" onClick={() => setVariants(variants.filter((_, xi) => xi !== i))} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline">
                  <Trash2 className="h-3.5 w-3.5" /> Remove variant
                </button>
              </div>
            ))}
          </div>

          <Field label="Short description"><textarea rows={2} className={inputCls} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Long description"><textarea rows={6} className={inputCls} value={form.long_description ?? ""} onChange={(e) => setForm({ ...form, long_description: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button disabled={save.isPending} type="submit" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90 admin-tap disabled:opacity-60">
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
