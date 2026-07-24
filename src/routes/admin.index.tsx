import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const stats = [
  { label: "Total Revenue", value: "৳4,82,340", delta: "+12.4%", up: true, icon: DollarSign, tint: "bg-emerald-100 text-emerald-700" },
  { label: "Orders", value: "1,284", delta: "+8.2%", up: true, icon: ShoppingCart, tint: "bg-pink-100 text-pink-700" },
  { label: "Customers", value: "9,431", delta: "+3.1%", up: true, icon: Users, tint: "bg-violet-100 text-violet-700" },
  { label: "Low Stock", value: "23", delta: "-2", up: false, icon: Package, tint: "bg-amber-100 text-amber-700" },
];

const recentOrders = [
  { id: "#SJ-10284", customer: "Nadia Rahman", total: 2340, status: "Paid", date: "2m ago" },
  { id: "#SJ-10283", customer: "Tanvir Ahmed", total: 890, status: "Pending", date: "14m ago" },
  { id: "#SJ-10282", customer: "Sabrina Islam", total: 4590, status: "Shipped", date: "1h ago" },
  { id: "#SJ-10281", customer: "Rifat Chowdhury", total: 1290, status: "Paid", date: "2h ago" },
  { id: "#SJ-10280", customer: "Maliha Sultana", total: 730, status: "Cancelled", date: "3h ago" },
  { id: "#SJ-10279", customer: "Ayesha Karim", total: 3120, status: "Delivered", date: "5h ago" },
];

const topProducts = [
  { name: "Lakme Absolute Foundation", sales: 342, revenue: 564300 },
  { name: "The Ordinary Niacinamide 10%", sales: 298, revenue: 295020 },
  { name: "Ponds Bright Beauty Serum", sales: 271, revenue: 147695 },
  { name: "Maybelline Fit Me Foundation", sales: 254, revenue: 327660 },
  { name: "Garnier Micellar Water", sales: 189, revenue: 136080 },
];

const statusStyle: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Shipped: "bg-sky-100 text-sky-700",
  Delivered: "bg-violet-100 text-violet-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

function Dashboard() {
  const chart = [42, 58, 51, 67, 74, 62, 81, 78, 89, 95, 88, 102];
  const max = Math.max(...chart);

  return (
    <>
      <AdminTopbar title="Dashboard" subtitle="Welcome back, here's what's happening today." />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-xl grid place-items-center ${s.tint}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${s.up ? "text-emerald-600" : "text-rose-600"}`}>
                    {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {s.delta}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-black">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Chart + Top products */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold">Revenue Overview</h3>
                <p className="text-xs text-muted-foreground">Last 12 months</p>
              </div>
              <select className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
            <div className="h-64 flex items-end gap-2">
              {chart.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[color:var(--brand-pink)] to-pink-300 hover:opacity-80 transition"
                    style={{ height: `${(v / max) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {["J","F","M","A","M","J","J","A","S","O","N","D"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Top Products</h3>
              <button className="text-xs text-[color:var(--brand-pink)] font-semibold">View all</button>
            </div>
            <ul className="space-y-4">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted grid place-items-center text-xs font-bold text-muted-foreground">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sales} sold</p>
                  </div>
                  <p className="text-sm font-bold">৳{p.revenue.toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-card rounded-2xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="font-bold">Recent Orders</h3>
              <p className="text-xs text-muted-foreground">Latest transactions from your store</p>
            </div>
            <button className="text-xs font-semibold text-[color:var(--brand-pink)] inline-flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Order</th>
                  <th className="text-left font-semibold px-5 py-3">Customer</th>
                  <th className="text-left font-semibold px-5 py-3">Total</th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                  <th className="text-left font-semibold px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono font-semibold">{o.id}</td>
                    <td className="px-5 py-3">{o.customer}</td>
                    <td className="px-5 py-3 font-semibold">৳{o.total.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyle[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{o.date}</td>
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
