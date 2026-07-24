import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

const customers = [
  { name: "Nadia Rahman", email: "nadia@example.com", phone: "+8801711000001", orders: 12, spent: 24500, tier: "VIP" },
  { name: "Tanvir Ahmed", email: "tanvir@example.com", phone: "+8801711000002", orders: 3, spent: 4200, tier: "Regular" },
  { name: "Sabrina Islam", email: "sabrina@example.com", phone: "+8801711000003", orders: 24, spent: 68900, tier: "VIP" },
  { name: "Rifat Chowdhury", email: "rifat@example.com", phone: "+8801711000004", orders: 7, spent: 12800, tier: "Regular" },
  { name: "Maliha Sultana", email: "maliha@example.com", phone: "+8801711000005", orders: 1, spent: 730, tier: "New" },
  { name: "Ayesha Karim", email: "ayesha@example.com", phone: "+8801711000006", orders: 18, spent: 42100, tier: "VIP" },
  { name: "Farhan Hossain", email: "farhan@example.com", phone: "+8801711000007", orders: 5, spent: 7900, tier: "Regular" },
];

const tierStyle: Record<string, string> = {
  VIP: "bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-900",
  Regular: "bg-sky-100 text-sky-700",
  New: "bg-emerald-100 text-emerald-700",
};

const avatarColors = ["from-pink-400 to-rose-500", "from-violet-400 to-fuchsia-500", "from-sky-400 to-blue-500", "from-emerald-400 to-teal-500", "from-amber-400 to-orange-500"];

function CustomersPage() {
  return (
    <>
      <AdminTopbar title="Customers" subtitle="9,431 total customers · 284 new this month" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total customers", value: "9,431" },
            { label: "New this month", value: "284" },
            { label: "VIP customers", value: "128" },
            { label: "Avg. order value", value: "৳1,840" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-black mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Customer</th>
                  <th className="px-5 py-3 text-left font-semibold">Contact</th>
                  <th className="px-5 py-3 text-left font-semibold">Orders</th>
                  <th className="px-5 py-3 text-left font-semibold">Total spent</th>
                  <th className="px-5 py-3 text-left font-semibold">Tier</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.email} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} grid place-items-center text-white font-bold text-sm`}>
                          {c.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <p className="font-semibold">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Mail className="h-3 w-3"/>{c.email}</div>
                      <div className="flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3"/>{c.phone}</div>
                    </td>
                    <td className="px-5 py-3">{c.orders}</td>
                    <td className="px-5 py-3 font-semibold">৳{c.spent.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tierStyle[c.tier]}`}>{c.tier}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="text-xs font-semibold text-[color:var(--brand-pink)] hover:underline">View profile</button>
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
