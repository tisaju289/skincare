import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { supabase } from "@/integrations/supabase/client";
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

  const reviews = q.data ?? [];

  return (
    <>
      <AdminTopbar title="Reviews" subtitle="Moderate customer product reviews" />
      <div className="p-6 space-y-4">
        {q.isLoading && <div className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></div>}
        {!q.isLoading && reviews.length === 0 && <p className="text-center text-muted-foreground py-10">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 grid place-items-center text-white font-bold text-sm">
                  {r.user_name[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{r.user_name}</p>
                  <p className="text-xs text-muted-foreground">on <span className="font-medium text-foreground">{r.products?.name ?? "—"}</span> · {new Date(r.created_at).toLocaleDateString()}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  {r.comment && <p className="text-sm mt-3">{r.comment}</p>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${r.status === "approved" ? "bg-emerald-100 text-emerald-700" : r.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                  {r.status}
                </span>
                <div className="flex gap-1">
                  {r.status !== "approved" && (
                    <button onClick={() => setStatus.mutate({ id: r.id, status: "approved" })} className="h-8 w-8 grid place-items-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="h-4 w-4" /></button>
                  )}
                  {r.status !== "rejected" && (
                    <button onClick={() => setStatus.mutate({ id: r.id, status: "rejected" })} className="h-8 w-8 grid place-items-center rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"><X className="h-4 w-4" /></button>
                  )}
                  <button onClick={() => confirm("Delete review?") && del.mutate(r.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
