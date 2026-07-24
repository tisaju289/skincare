import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Eye, Truck, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

const orders = [
  { id: "#SJ-10284", customer: "Nadia Rahman", items: 3, total: 2340, payment: "bKash", status: "Paid", date: "Jul 24, 2026" },
  { id: "#SJ-10283", customer: "Tanvir Ahmed", items: 1, total: 890, payment: "COD", status: "Pending", date: "Jul 24, 2026" },
  { id: "#SJ-10282", customer: "Sabrina Islam", items: 5, total: 4590, payment: "Card", status: "Shipped", date: "Jul 24, 2026" },
  { id: "#SJ-10281", customer: "Rifat Chowdhury", items: 2, total: 1290, payment: "Nagad", status: "Paid", date: "Jul 24, 2026" },
  { id: "#SJ-10280", customer: "Maliha Sultana", items: 1, total: 730, payment: "COD", status: "Cancelled", date: "Jul 23, 2026" },
  { id: "#SJ-10279", customer: "Ayesha Karim", items: 4, total: 3120, payment: "Card", status: "Delivered", date: "Jul 23, 2026" },
  { id: "#SJ-10278", customer: "Farhan Hossain", items: 2, total: 1580, payment: "bKash", status: "Delivered", date: "Jul 23, 2026" },
  { id: "#SJ-10277", customer: "Tasnim Jahan", items: 6, total: 5230, payment: "Card", status: "Shipped", date: "Jul 22, 2026" },
];

const statusStyle: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Shipped: "bg-sky-100 text-sky-700",
  Delivered: "bg-violet-100 text-violet-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const tabs = [
  { name: "All", count: 1284 },
  { name: "Pending", count: 42 },
  { name: "Paid", count: 318 },
  { name: "Shipped", count: 156 },
  { name: "Delivered", count: 720 },
  { name: "Cancelled", count: 48 },
];

function OrdersPage() {
  return (
    <>
      <AdminTopbar title="Orders" subtitle="Track and manage all customer orders" action={
        <button className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
          <Truck className="h-4 w-4" /> Bulk ship
        </button>
      }/>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          {tabs.map((t, i) => (
            <button key={t.name} className={`text-xs font-semibold px-3 py-1.5 rounded-full border inline-flex items-center gap-2 ${i===0 ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}>
              {t.name}
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${i===0 ? "bg-white/20" : "bg-muted"}`}>{t.count}</span>
            </button>
          ))}
          <button className="ml-auto inline-flex items-center gap-2 border border-border px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Order ID</th>
                  <th className="px-5 py-3 text-left font-semibold">Customer</th>
                  <th className="px-5 py-3 text-left font-semibold">Items</th>
                  <th className="px-5 py-3 text-left font-semibold">Total</th>
                  <th className="px-5 py-3 text-left font-semibold">Payment</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono font-semibold">{o.id}</td>
                    <td className="px-5 py-3">{o.customer}</td>
                    <td className="px-5 py-3">{o.items}</td>
                    <td className="px-5 py-3 font-semibold">৳{o.total.toLocaleString()}</td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded bg-muted">{o.payment}</span></td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyle[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{o.date}</td>
                    <td className="px-5 py-3 text-right">
                      <button className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--brand-pink)] hover:underline">
                        <Eye className="h-3 w-3" /> View
                      </button>
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
