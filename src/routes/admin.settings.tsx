import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { supabase } from "@/integrations/supabase/client";
import { Store, CreditCard, Truck, Bell, Shield, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

type Settings = {
  id: string;
  store_name: string;
  support_email: string | null;
  phone: string | null;
  business_address: string | null;
  currency: string;
  timezone: string;
};

const sections = [
  { icon: Store, title: "Store details", desc: "Store name, contact info, business address" },
  { icon: CreditCard, title: "Payments", desc: "bKash, Nagad, cards, cash on delivery" },
  { icon: Truck, title: "Shipping", desc: "Zones, rates, delivery partners" },
  { icon: Bell, title: "Notifications", desc: "Email & SMS alerts for orders and stock" },
  { icon: Shield, title: "Team & permissions", desc: "Admin accounts and roles" },
];

function SettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Settings>>({});

  const q = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
  });

  useEffect(() => { if (q.data) setForm(q.data); }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!q.data?.id) throw new Error("No settings row found");
      const { error } = await supabase.from("store_settings").update(form).eq("id", q.data.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["admin", "settings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

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

          {q.isLoading ? (
            <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="mt-6 space-y-4">
              <Field label="Store name" value={form.store_name ?? ""} onChange={(v) => setForm({ ...form, store_name: v })} />
              <Field label="Support email" value={form.support_email ?? ""} onChange={(v) => setForm({ ...form, support_email: v })} />
              <Field label="Phone" value={form.phone ?? ""} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Business address" value={form.business_address ?? ""} onChange={(v) => setForm({ ...form, business_address: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Currency" value={form.currency ?? ""} onChange={(v) => setForm({ ...form, currency: v })} />
                <Field label="Timezone" value={form.timezone ?? ""} onChange={(v) => setForm({ ...form, timezone: v })} />
              </div>
              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-border">
                <button type="button" onClick={() => q.data && setForm(q.data)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Reset</button>
                <button disabled={save.isPending} type="submit" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90">{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save changes</button>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--brand-pink)]" />
    </label>
  );
}
