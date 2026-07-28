import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminModal, Field, inputCls } from "@/components/admin/AdminModal";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeRow } from "@/lib/db";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { matchesQuery } from "@/lib/csv";
import { Loader2, Trash2, Edit2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
type Payment = "bkash" | "nagad" | "card" | "cod";
type Order = {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: OrderStatus;
  payment_method: Payment;
  total: number;
  shipping_address: string | null;
  created_at: string;
};
type FormState = Partial<Order>;

const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  refunded: "bg-muted text-muted-foreground",
};

const empty: FormState = { order_number: "", status: "pending", payment_method: "cod", total: 0 };

function OrdersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("all");
  const [detail, setDetail] = useState<any | null>(null);

  const q = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, customers(name,phone,email,address)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const itemsQ = useQuery({
    queryKey: ["admin", "order-items", detail?.id],
    enabled: !!detail?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", detail.id)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
  const custQ = useQuery({
    queryKey: ["admin", "customers-select"],
    queryFn: async () => (await supabase.from("customers").select("id,name").order("name")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async (p: FormState) => {
      const payload = sanitizeRow(p);
      const { error } = editing
        ? await supabase.from("orders").update(payload as never).eq("id", editing.id)
        : await supabase.from("orders").insert(payload as any);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(editing ? "Updated" : "Created"); qc.invalidateQueries({ queryKey: ["admin", "orders"] }); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("orders").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "orders"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const orders = (q.data ?? []) as any[];
  const filtered = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (payFilter === "all" || o.payment_method === payFilter) &&
      matchesQuery(o, search),
  );
  const tabs: (OrderStatus | "all")[] = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

  return (
    <>
      <AdminTopbar title="Orders" subtitle={`${orders.length} total orders`} action={
        <button onClick={() => { setEditing(null); setForm({ ...empty, order_number: `SJ-${Date.now().toString().slice(-6)}` }); setOpen(true); }} className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New order</span>
        </button>
      } />
      <div className="p-3 sm:p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const count = t === "all" ? orders.length : orders.filter(o => o.status === t).length;
            return (
              <button key={t} onClick={() => setFilter(t)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize inline-flex items-center gap-2 ${filter === t ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}>
                {t} <span className={`text-[10px] px-1.5 py-0.5 rounded ${filter === t ? "bg-white/20" : "bg-muted"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by order number, customer, address…"
          filters={[
            {
              label: "Status",
              value: filter,
              onChange: (v) => setFilter(v as OrderStatus | "all"),
              options: [
                { label: "All statuses", value: "all" },
                ...["pending", "processing", "shipped", "delivered", "cancelled", "refunded"].map((s) => ({ label: s, value: s })),
              ],
            },
            {
              label: "Payment",
              value: payFilter,
              onChange: setPayFilter,
              options: [
                { label: "All methods", value: "all" },
                ...["bkash", "nagad", "card", "cod"].map((s) => ({ label: s.toUpperCase(), value: s })),
              ],
            },
          ]}
          exportRows={filtered.map(({ customers, ...r }: any) => ({ ...r, customer: customers?.name ?? "Guest", phone: customers?.phone ?? "" }))}
          exportName="orders"
          importTable="orders"
          importColumns={["order_number", "customer_id", "status", "payment_method", "subtotal", "shipping", "discount", "total", "shipping_address", "notes"]}
          onImported={() => qc.invalidateQueries({ queryKey: ["admin", "orders"] })}
          resultCount={filtered.length}
        />

        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Order</th>
                  <th className="px-5 py-3 text-left font-semibold">Customer</th>
                  <th className="px-5 py-3 text-left font-semibold">Total</th>
                  <th className="px-5 py-3 text-left font-semibold">Payment</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {q.isLoading && <tr><td colSpan={7} className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></td></tr>}
                {!q.isLoading && filtered.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No orders.</td></tr>}
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setDetail(o)}
                    className="border-t border-border hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="px-5 py-3 font-mono font-semibold">#{o.order_number}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium">{o.customers?.name ?? "Guest"}</div>
                      {o.customers?.phone && (
                        <a href={`tel:${o.customers.phone}`} className="text-xs text-muted-foreground hover:underline">
                          {o.customers.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold">৳{Number(o.total).toLocaleString()}</td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded bg-muted uppercase">{o.payment_method}</span></td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${statusStyle[o.status as OrderStatus]}`}>{o.status}</span></td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(o); setForm(o); setOpen(true); }} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap"><Edit2 className="h-3.5 w-3.5"/></button>
                        <button onClick={() => confirm(`Delete order #${o.order_number}?`) && del.mutate(o.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted admin-tap text-rose-600"><Trash2 className="h-3.5 w-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminModal open={!!detail} onClose={() => setDetail(null)} title={detail ? `Order #${detail.order_number}` : "Order"}>
        {detail && (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${statusStyle[detail.status as OrderStatus]}`}>{detail.status}</span>
              <span className="text-xs px-2 py-1 rounded bg-muted uppercase">{detail.payment_method}</span>
              <span className="text-xs text-muted-foreground">{new Date(detail.created_at).toLocaleString()}</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs font-bold text-muted-foreground mb-1">Customer</p>
                <p className="font-semibold">{detail.customers?.name ?? "Guest"}</p>
                {detail.customers?.phone && <p className="text-muted-foreground">{detail.customers.phone}</p>}
                {detail.customers?.email && <p className="text-muted-foreground">{detail.customers.email}</p>}
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs font-bold text-muted-foreground mb-1">Shipping address</p>
                <p className="whitespace-pre-line">{detail.shipping_address || detail.customers?.address || "—"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Product</th>
                    <th className="px-3 py-2 text-right font-semibold">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold">Price</th>
                    <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsQ.isLoading && <tr><td colSpan={4} className="text-center py-6"><Loader2 className="h-4 w-4 animate-spin inline text-muted-foreground" /></td></tr>}
                  {!itemsQ.isLoading && (itemsQ.data ?? []).length === 0 && <tr><td colSpan={4} className="text-center py-6 text-muted-foreground">No items.</td></tr>}
                  {(itemsQ.data ?? []).map((it: any) => (
                    <tr key={it.id} className="border-t border-border">
                      <td className="px-3 py-2">{it.product_name}</td>
                      <td className="px-3 py-2 text-right">{it.quantity}</td>
                      <td className="px-3 py-2 text-right">৳{Number(it.unit_price).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-semibold">৳{(Number(it.unit_price) * it.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{Number(detail.subtotal ?? 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery charge</span><span>৳{Number(detail.shipping ?? 0).toLocaleString()}</span></div>
              {Number(detail.discount ?? 0) > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-৳{Number(detail.discount).toLocaleString()}</span></div>
              )}
              <div className="flex justify-between font-black text-base pt-2 border-t border-border"><span>Total</span><span>৳{Number(detail.total).toLocaleString()}</span></div>
            </div>

            {detail.notes && (
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs font-bold text-muted-foreground mb-1">Notes</p>
                <p className="whitespace-pre-line">{detail.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <button type="button" onClick={() => setDetail(null)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Close</button>
              <button type="button" onClick={() => { setEditing(detail); setForm(detail); setDetail(null); setOpen(true); }} className="text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90 admin-tap">Edit order</button>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit order" : "New order"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Order number"><input required className={inputCls} value={form.order_number ?? ""} onChange={(e) => setForm({ ...form, order_number: e.target.value })} /></Field>
            <Field label="Customer">
              <select className={inputCls} value={form.customer_id ?? ""} onChange={(e) => setForm({ ...form, customer_id: e.target.value || null })}>
                <option value="">Guest</option>
                {(custQ.data ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.status ?? "pending"} onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}>
                {["pending","processing","shipped","delivered","cancelled","refunded"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Payment">
              <select className={inputCls} value={form.payment_method ?? "cod"} onChange={(e) => setForm({ ...form, payment_method: e.target.value as Payment })}>
                <option value="cod">Cash on delivery</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="card">Card</option>
              </select>
            </Field>
            <Field label="Total (৳)"><input required type="number" step="0.01" className={inputCls} value={form.total ?? 0} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Shipping address"><textarea rows={2} className={inputCls} value={form.shipping_address ?? ""} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button disabled={save.isPending} type="submit" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90 admin-tap">{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
