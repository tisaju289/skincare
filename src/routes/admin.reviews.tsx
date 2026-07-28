import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { supabase } from "@/integrations/supabase/client";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { matchesQuery } from "@/lib/csv";
import { Star, CheckCircle2, X, Loader2, Trash2 } from "lucide-react";

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

function ReviewsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const q = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
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

  return (
    <>
      <AdminTopbar title="Reviews" subtitle={`${allReviews.length} customer reviews`} />
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
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">{allReviews.length ? "No reviews match your search." : "No reviews yet."}</td></tr>
                )}
                {reviews.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30">
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
                          <button onClick={() => setStatus.mutate({ id: r.id, status: "approved" })} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                        )}
                        {r.status !== "rejected" && (
                          <button onClick={() => setStatus.mutate({ id: r.id, status: "rejected" })} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-amber-700"><X className="h-3.5 w-3.5" /></button>
                        )}
                        <button onClick={() => confirm("Delete review?") && del.mutate(r.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
