import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Star, CheckCircle2, X } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

const reviews = [
  { user: "Nadia R.", product: "Lakme Absolute Foundation", rating: 5, comment: "Perfect shade match and amazing coverage! Lasts all day even in summer.", date: "2h ago", status: "Approved" },
  { user: "Tanvir A.", product: "The Ordinary Niacinamide 10%", rating: 4, comment: "Good serum, helped with my oily skin but takes a few weeks to see results.", date: "5h ago", status: "Pending" },
  { user: "Sabrina I.", product: "Ponds Bright Beauty Serum", rating: 5, comment: "Loved it! My skin feels so much brighter and softer.", date: "1d ago", status: "Approved" },
  { user: "Anonymous", product: "Nivea Soft Moisturizer", rating: 2, comment: "Not what I expected. Feels greasy on my skin type.", date: "2d ago", status: "Pending" },
];

function ReviewsPage() {
  return (
    <>
      <AdminTopbar title="Reviews" subtitle="Moderate customer product reviews" />
      <div className="p-6 space-y-4">
        {reviews.map((r, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 grid place-items-center text-white font-bold text-sm">
                  {r.user[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{r.user}</p>
                  <p className="text-xs text-muted-foreground">on <span className="font-medium text-foreground">{r.product}</span> · {r.date}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-sm mt-3">{r.comment}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${r.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {r.status}
                </span>
                {r.status === "Pending" && (
                  <div className="flex gap-1">
                    <button className="h-8 w-8 grid place-items-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button className="h-8 w-8 grid place-items-center rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
