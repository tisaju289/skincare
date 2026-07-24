import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Plus, Copy } from "lucide-react";

export const Route = createFileRoute("/admin/promotions")({
  component: PromotionsPage,
});

const promos = [
  { code: "SUMMER45", desc: "45% off on Unilever July Jaw Droppers", type: "Percentage", value: "45%", usage: "1,284 / 5,000", status: "Active" },
  { code: "NEW10", desc: "10% off for first-time customers", type: "Percentage", value: "10%", usage: "3,201 / ∞", status: "Active" },
  { code: "FREESHIP", desc: "Free shipping over ৳999", type: "Shipping", value: "Free", usage: "8,412 / ∞", status: "Active" },
  { code: "BUY2GET101", desc: "৳101 off when buying 2 pads", type: "Fixed", value: "৳101", usage: "428 / 2,000", status: "Active" },
  { code: "EIDBEAUTY", desc: "Eid special beauty combo", type: "Percentage", value: "25%", usage: "5,000 / 5,000", status: "Expired" },
];

const statusStyle: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Expired: "bg-muted text-muted-foreground",
  Scheduled: "bg-sky-100 text-sky-700",
};

function PromotionsPage() {
  return (
    <>
      <AdminTopbar title="Promotions" subtitle="Discount codes and campaigns" action={
        <button className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
          <Plus className="h-4 w-4" /> Create promo
        </button>
      }/>
      <div className="p-6">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Code</th>
                <th className="px-5 py-3 text-left font-semibold">Description</th>
                <th className="px-5 py-3 text-left font-semibold">Type</th>
                <th className="px-5 py-3 text-left font-semibold">Value</th>
                <th className="px-5 py-3 text-left font-semibold">Usage</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.code} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="inline-flex items-center gap-2 font-mono font-bold bg-muted px-2 py-1 rounded">
                      {p.code}
                      <Copy className="h-3 w-3 opacity-60 cursor-pointer" />
                    </div>
                  </td>
                  <td className="px-5 py-3">{p.desc}</td>
                  <td className="px-5 py-3 text-xs">{p.type}</td>
                  <td className="px-5 py-3 font-semibold">{p.value}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{p.usage}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyle[p.status]}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
