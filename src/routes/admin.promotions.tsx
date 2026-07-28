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
import { Plus, Copy, Edit2, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/promotions")({
  component: PromotionsPage,
});

type PromoType = "percentage" | "fixed" | "shipping";
type PromoStatus = "active" | "scheduled" | "expired" | "disabled";
type Promo = {
  id: string;
  code: string;
  description: string | null;
  type: PromoType;
  value: number;
  usage_count: number;
  usage_limit: number | null;
  status: PromoStatus;
};
type FormState = Partial<Promo>;
const empty: FormState = { code: "", description: "", type: "percentage", value: 0, usage_count: 0, status: "active" };

const statusStyle: Record<PromoStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-sky-100 text-sky-700",
  expired: "bg-muted text-muted-foreground",
  disabled: "bg-rose-100 text-rose-700",
};

function PromotionsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const q = useQuery({
    queryKey: ["admin", "promotions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Promo[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: FormState) => {
      const payload = sanitizeRow({ ...p, code: p.code?.toUpperCase() });
      const { error } = editing
        ? await supabase.from("promotions").update(payload as never).eq("id", editing.id)
        : await supabase.from("promotions").insert(payload as any);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(editing ? "Updated" : "Created"); qc.invalidateQueries({ queryKey: ["admin", "promotions"] }); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("promotions").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "promotions"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const allPromos = q.data ?? [];
  const promos = allPromos.filter(
    (p) =>
      matchesQuery(p, search) &&
      (statusFilter === "all" || p.status === statusFilter) &&
      (typeFilter === "all" || p.type === typeFilter),
  );

  return (
    <>
      <AdminTopbar title="Promotions" subtitle="Discount codes and campaigns" action={
        <button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Create promo</span>
        </button>
      }/>
      <div className="p-3 sm:p-6 space-y-4">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search promo codes…"
          filters={[
            {
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [{ label: "All statuses", value: "all" }, ...["active", "scheduled", "expired", "disabled"].map((s) => ({ label: s, value: s }))],
            },
            {
              label: "Type",
              value: typeFilter,
              onChange: setTypeFilter,
              options: [{ label: "All types", value: "all" }, ...["percentage", "fixed", "shipping"].map((s) => ({ label: s, value: s }))],
            },
          ]}
          exportRows={promos}
          exportName="promotions"
          importTable="promotions"
          importColumns={["code", "description", "type", "value", "usage_limit", "starts_at", "ends_at", "status"]}
          onImported={() => qc.invalidateQueries({ queryKey: ["admin", "promotions"] })}
          resultCount={promos.length}
        />
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto admin-scroll">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Code</th>
                <th className="px-5 py-3 text-left font-semibold">Description</th>
                <th className="px-5 py-3 text-left font-semibold">Type</th>
                <th className="px-5 py-3 text-left font-semibold">Value</th>
                <th className="px-5 py-3 text-left font-semibold">Usage</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {q.isLoading && <tr><td colSpan={7} className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></td></tr>}
              {!q.isLoading && promos.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">{allPromos.length ? "No promos match your search." : "No promo codes yet."}</td></tr>}
              {promos.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <button onClick={() => { navigator.clipboard.writeText(p.code); toast.success("Code copied"); }} className="inline-flex items-center gap-2 font-mono font-bold bg-muted px-2 py-1 rounded hover:bg-muted/70">
                      {p.code} <Copy className="h-3 w-3 opacity-60" />
                    </button>
                  </td>
                  <td className="px-5 py-3">{p.description}</td>
                  <td className="px-5 py-3 text-xs capitalize">{p.type}</td>
                  <td className="px-5 py-3 font-semibold">{p.type === "percentage" ? `${p.value}%` : `৳${p.value}`}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{p.usage_count} / {p.usage_limit ?? "∞"}</td>
                  <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${statusStyle[p.status]}`}>{p.status}</span></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing(p); setForm(p); setOpen(true); }} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"><Edit2 className="h-3.5 w-3.5"/></button>
                      <button onClick={() => confirm(`Delete "${p.code}"?`) && del.mutate(p.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-rose-600"><Trash2 className="h-3.5 w-3.5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit promo" : "New promo"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <Field label="Code"><input required className={inputCls + " font-mono uppercase"} value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></Field>
          <Field label="Description"><input className={inputCls} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Type">
              <select className={inputCls} value={form.type ?? "percentage"} onChange={(e) => setForm({ ...form, type: e.target.value as PromoType })}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
                <option value="shipping">Free shipping</option>
              </select>
            </Field>
            <Field label="Value"><input required type="number" step="0.01" className={inputCls} value={form.value ?? 0} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></Field>
            <Field label="Usage limit (blank = unlimited)"><input type="number" className={inputCls} value={form.usage_limit ?? ""} onChange={(e) => setForm({ ...form, usage_limit: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Status">
              <select className={inputCls} value={form.status ?? "active"} onChange={(e) => setForm({ ...form, status: e.target.value as PromoStatus })}>
                {["active","scheduled","expired","disabled"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            <button disabled={save.isPending} type="submit" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90">{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
