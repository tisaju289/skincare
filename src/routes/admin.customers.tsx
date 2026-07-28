import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminModal, Field, inputCls } from "@/components/admin/AdminModal";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeRow } from "@/lib/db";
import { Mail, Phone, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

type Customer = { id: string; name: string; email: string | null; phone: string | null; tier: "vip" | "regular" | "new"; total_spent: number; orders_count: number; address: string | null };
type FormState = Partial<Customer>;
const empty: FormState = { name: "", email: "", phone: "", tier: "new", total_spent: 0, orders_count: 0 };

const tierStyle: Record<string, string> = {
  vip: "bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-900",
  regular: "bg-sky-100 text-sky-700",
  new: "bg-emerald-100 text-emerald-700",
};
const avatarColors = ["from-pink-400 to-rose-500", "from-violet-400 to-fuchsia-500", "from-sky-400 to-blue-500", "from-emerald-400 to-teal-500", "from-amber-400 to-orange-500"];

function CustomersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const q = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: FormState) => {
      const payload = sanitizeRow(p);
      const { error } = editing
        ? await supabase.from("customers").update(payload as never).eq("id", editing.id)
        : await supabase.from("customers").insert(payload as any);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(editing ? "Updated" : "Created"); qc.invalidateQueries({ queryKey: ["admin", "customers"] }); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("customers").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "customers"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const customers = q.data ?? [];
  const total = customers.length;
  const vip = customers.filter(c => c.tier === "vip").length;
  const totalRevenue = customers.reduce((a, c) => a + Number(c.total_spent), 0);
  const avg = total ? Math.round(totalRevenue / Math.max(1, customers.reduce((a, c) => a + c.orders_count, 0) || 1)) : 0;

  return (
    <>
      <AdminTopbar title="Customers" subtitle={`${total} total customers`} action={
        <button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add customer</span>
        </button>
      } />
      <div className="p-3 sm:p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total customers", value: total.toLocaleString() },
            { label: "VIP customers", value: vip.toLocaleString() },
            { label: "Total revenue", value: `৳${totalRevenue.toLocaleString()}` },
            { label: "Avg. order value", value: `৳${avg.toLocaleString()}` },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-black mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0 z-10">
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
                {q.isLoading && <tr><td colSpan={6} className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></td></tr>}
                {!q.isLoading && customers.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No customers yet.</td></tr>}
                {customers.map((c, i) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} grid place-items-center text-white font-bold text-sm`}>
                          {c.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <p className="font-semibold">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {c.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3"/>{c.email}</div>}
                      {c.phone && <div className="flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3"/>{c.phone}</div>}
                    </td>
                    <td className="px-5 py-3">{c.orders_count}</td>
                    <td className="px-5 py-3 font-semibold">৳{Number(c.total_spent).toLocaleString()}</td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${tierStyle[c.tier]}`}>{c.tier}</span></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(c); setForm(c); setOpen(true); }} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap"><Edit2 className="h-3.5 w-3.5"/></button>
                        <button onClick={() => confirm(`Delete "${c.name}"?`) && del.mutate(c.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap text-rose-600"><Trash2 className="h-3.5 w-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit customer" : "New customer"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <Field label="Name"><input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email"><input type="email" className={inputCls} value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Phone"><input className={inputCls} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Tier">
              <select className={inputCls} value={form.tier ?? "new"} onChange={(e) => setForm({ ...form, tier: e.target.value as Customer["tier"] })}>
                <option value="new">New</option>
                <option value="regular">Regular</option>
                <option value="vip">VIP</option>
              </select>
            </Field>
            <Field label="Orders count"><input type="number" className={inputCls} value={form.orders_count ?? 0} onChange={(e) => setForm({ ...form, orders_count: Number(e.target.value) })} /></Field>
            <Field label="Total spent (৳)"><input type="number" step="0.01" className={inputCls} value={form.total_spent ?? 0} onChange={(e) => setForm({ ...form, total_spent: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Address"><textarea rows={2} className={inputCls} value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button disabled={save.isPending} type="submit" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90 admin-tap">{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
