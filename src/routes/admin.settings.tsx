import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Store, CreditCard, Truck, Bell, Shield } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const sections = [
  { icon: Store, title: "Store details", desc: "Store name, contact info, business address" },
  { icon: CreditCard, title: "Payments", desc: "bKash, Nagad, cards, cash on delivery" },
  { icon: Truck, title: "Shipping", desc: "Zones, rates, delivery partners" },
  { icon: Bell, title: "Notifications", desc: "Email & SMS alerts for orders and stock" },
  { icon: Shield, title: "Team & permissions", desc: "Admin accounts and roles" },
];

function SettingsPage() {
  return (
    <>
      <AdminTopbar title="Settings" subtitle="Configure your store" />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="space-y-1">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <button key={s.title} className={`w-full text-left flex items-start gap-3 p-3 rounded-xl ${i===0 ? "bg-card border border-border" : "hover:bg-muted"}`}>
                <div className="h-9 w-9 rounded-lg bg-[color:var(--brand-pink)]/10 text-[color:var(--brand-pink)] grid place-items-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </aside>

        <section className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold">Store details</h3>
          <p className="text-xs text-muted-foreground">Basic information about your store</p>

          <div className="mt-6 space-y-4">
            <Field label="Store name" value="Shajgoj" />
            <Field label="Support email" value="support@shajgoj.com" />
            <Field label="Phone" value="+880 1700 000 000" />
            <Field label="Business address" value="House 42, Road 11, Banani, Dhaka 1213" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Currency" value="BDT (৳)" />
              <Field label="Timezone" value="Asia/Dhaka (GMT+6)" />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-border">
            <button className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button className="text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90">Save changes</button>
          </div>
        </section>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input defaultValue={value} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--brand-pink)]" />
    </label>
  );
}
