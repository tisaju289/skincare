import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminModal, Field, inputCls } from "@/components/admin/AdminModal";
import { supabase } from "@/integrations/supabase/client";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { matchesQuery } from "@/lib/csv";
import { Star, CheckCircle2, X, Loader2, Trash2, Plus, Edit2 } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

type ReviewStatus = "pending" | "approved" | "rejected";
type Review = {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  created_at: string;
  products?: { name: string } | null;
};

type FormState = {
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
};

const empty: FormState = { product_id: "", user_name: "", rating: 5, comment: "", status: "approved" };

function ReviewsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const q = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const productsQ = useQuery({
    queryKey: ["admin", "reviews", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id,name").order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: FormState) => {
      const payload = {
        product_id: p.product_id,
        user_name: p.user_name.trim(),
        rating: Number(p.rating),
        comment: p.comment.trim() ? p.comment.trim() : null,
        status: p.status,
      };
      const { error } = editing
        ? await supabase.from("reviews").update(payload).eq("id", editing.id)
        : await supabase.from("reviews").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editing ? "Updated" : "Created");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReviewStatus }) => {
      const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("reviews").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "reviews"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const allReviews = q.data ?? [];
  const reviews = allReviews.filter(
    (r) =>
      matchesQuery(r, search) &&
      (statusFilter === "all" || r.status === statusFilter) &&
      (ratingFilter === "all" || r.rating === Number(ratingFilter)),
  );

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, product_id: productsQ.data?.[0]?.id ?? "" });
    setOpen(true);
  };

  const openEdit = (r: Review) => {
    setEditing(r);
    setForm({
      product_id: r.product_id,
      user_name: r.user_name,
      rating: r.rating,
      comment: r.comment ?? "",
      status: r.status,
    });
    setOpen(true);
  };

  return (
    <>
      <AdminTopbar
        title="Reviews"
        subtitle={`${allReviews.length} customer reviews`}
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New review</span>
          </button>
        }
      />
      <div className="p-3 sm:p-6 space-y-4">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search reviews by name, product, comment…"
          filters={[
            {
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [{ label: "All statuses", value: "all" }, ...["pending", "approved", "rejected"].map((s) => ({ label: s, value: s }))],
            },
            {
              label: "Rating",
              value: ratingFilter,
              onChange: setRatingFilter,
              options: [{ label: "All ratings", value: "all" }, ...[5, 4, 3, 2, 1].map((n) => ({ label: `${n} star`, value: String(n) }))],
            },
          ]}
          exportRows={reviews.map(({ products, ...r }: any) => ({ ...r, product: products?.name ?? "" }))}
          exportName="reviews"
          resultCount={reviews.length}
        />
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Reviewer</th>
                  <th className="px-5 py-3 text-left font-semibold">Product</th>
                  <th className="px-5 py-3 text-left font-semibold">Rating</th>
                  <th className="px-5 py-3 text-left font-semibold">Comment</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {q.isLoading && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                )}
                {!q.isLoading && reviews.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">{allReviews.length ? "No reviews match your search." : 'No reviews yet. Click "New review".'}</td></tr>
                )}
                {reviews.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 grid place-items-center text-white font-bold text-sm">
                          {r.user_name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{r.user_name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{r.products?.name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 max-w-[280px]">
                      <p className="text-muted-foreground line-clamp-2">{r.comment || "—"}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${r.status === "approved" ? "bg-emerald-100 text-emerald-700" : r.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== "approved" && (
                          <button onClick={() => setStatus.mutate({ id: r.id, status: "approved" })} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                        )}
                        {r.status !== "rejected" && (
                          <button onClick={() => setStatus.mutate({ id: r.id, status: "rejected" })} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap text-amber-700"><X className="h-3.5 w-3.5" /></button>
                        )}
                        <button onClick={() => openEdit(r)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => confirm("Delete review?") && del.mutate(r.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit review" : "New review"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <Field label="Product">
            <select required className={inputCls} value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
              <option value="" disabled>Select a product</option>
              {(productsQ.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Reviewer name">
            <input required className={inputCls} value={form.user_name} onChange={(e) => setForm({ ...form, user_name: e.target.value })} />
          </Field>
          <Field label="Rating">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className="p-1 admin-tap">
                  <Star className={`h-5 w-5 ${n <= form.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Comment">
            <textarea rows={4} className={inputCls} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </Field>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ReviewStatus })}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button disabled={save.isPending} type="submit" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90 admin-tap">{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
