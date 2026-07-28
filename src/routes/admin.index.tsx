import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  refunded: "bg-muted text-muted-foreground",
};

function Dashboard() {
  const q = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [orders, customers, products, recent] = await Promise.all([
        supabase.from("orders").select("total, status"),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id, status"),
        supabase.from("orders").select("*, customers(name)").order("created_at", { ascending: false }).limit(6),
      ]);
      const totalRevenue = (orders.data ?? []).reduce((a, o) => a + Number(o.total), 0);
      const orderCount = orders.data?.length ?? 0;
      const customerCount = customers.count ?? 0;
      const lowStock = (products.data ?? []).filter((p) => p.status === "low_stock" || p.status === "out_of_stock").length;
      return { totalRevenue, orderCount, customerCount, lowStock, recent: recent.data ?? [] };
    },
  });

  const s = q.data;

  const stats = [
    { label: "Total Revenue", value: s ? `৳${s.totalRevenue.toLocaleString()}` : "—", icon: DollarSign, tint: "bg-emerald-100 text-emerald-700" },
    { label: "Orders", value: s ? s.orderCount.toLocaleString() : "—", icon: ShoppingCart, tint: "bg-pink-100 text-pink-700" },
    { label: "Customers", value: s ? s.customerCount.toLocaleString() : "—", icon: Users, tint: "bg-violet-100 text-violet-700" },
    { label: "Low / Out of stock", value: s ? s.lowStock.toLocaleString() : "—", icon: Package, tint: "bg-amber-100 text-amber-700" },
  ];

  return (
    <>
      <AdminTopbar title="Dashboard" subtitle="Welcome back, here's what's happening today." />
      <div className="p-3 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((st) => {
            const Icon = st.icon;
            return (
              <div key={st.label} className="admin-card p-5">
                <div className={`h-10 w-10 rounded-xl grid place-items-center ${st.tint}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-2xl font-black">{st.value}</p>
                <p className="text-xs text-muted-foreground">{st.label}</p>
              </div>
            );
          })}
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="font-bold">Recent Orders</h3>
              <p className="text-xs text-muted-foreground">Latest transactions from your store</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-[color:var(--brand-pink)] inline-flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Order</th>
                  <th className="text-left font-semibold px-5 py-3">Customer</th>
                  <th className="text-left font-semibold px-5 py-3">Total</th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                  <th className="text-left font-semibold px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {q.isLoading && <tr><td colSpan={5} className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></td></tr>}
                {!q.isLoading && (s?.recent.length ?? 0) === 0 && <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No orders yet.</td></tr>}
                {(s?.recent ?? []).map((o: any) => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono font-semibold">#{o.order_number}</td>
                    <td className="px-5 py-3">{o.customers?.name ?? "Guest"}</td>
                    <td className="px-5 py-3 font-semibold">৳{Number(o.total).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${statusStyle[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
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
