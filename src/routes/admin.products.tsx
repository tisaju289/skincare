import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Plus, Filter, Download, MoreHorizontal, Edit2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

const products = [
  { sku: "LKM-001", name: "Lakme Absolute Skin Gloss Foundation", brand: "Lakme", category: "Makeup", price: 1650, stock: 42, status: "Active" },
  { sku: "PND-014", name: "Ponds Bright Beauty Serum Cream 50g", brand: "Ponds", category: "Skincare", price: 545, stock: 128, status: "Active" },
  { sku: "MYB-032", name: "Maybelline Fit Me Matte Foundation", brand: "Maybelline", category: "Makeup", price: 1290, stock: 8, status: "Low stock" },
  { sku: "TOR-101", name: "The Ordinary Niacinamide 10% + Zinc", brand: "The Ordinary", category: "Skincare", price: 990, stock: 65, status: "Active" },
  { sku: "LOR-221", name: "L'Oreal Revitalift Hyaluronic Serum", brand: "L'Oreal", category: "Skincare", price: 1890, stock: 27, status: "Active" },
  { sku: "NIV-054", name: "Nivea Soft Light Moisturizer 100ml", brand: "Nivea", category: "Skincare", price: 420, stock: 0, status: "Out of stock" },
  { sku: "GRN-078", name: "Garnier Micellar Cleansing Water Pink", brand: "Garnier", category: "Skincare", price: 720, stock: 54, status: "Active" },
  { sku: "OMB-009", name: "Ombre Perfume — Iris Flare 100ml", brand: "Ombre", category: "Fragrance", price: 850, stock: 33, status: "Active" },
  { sku: "SEN-004", name: "Senora Feather Light 08 Pads", brand: "Senora", category: "Personal Care", price: 149, stock: 220, status: "Active" },
  { sku: "LKM-018", name: "Lakme 9 to 5 Primer + Matte Lipstick", brand: "Lakme", category: "Makeup", price: 640, stock: 12, status: "Low stock" },
];

const statusStyle: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  "Low stock": "bg-amber-100 text-amber-700",
  "Out of stock": "bg-rose-100 text-rose-700",
};

function ProductsPage() {
  return (
    <>
      <AdminTopbar
        title="Products"
        subtitle={`${products.length} products across your catalog`}
        action={
          <button className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
            <Plus className="h-4 w-4" /> Add product
          </button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Makeup", "Skincare", "Fragrance", "Personal Care", "Hair"].map((c, i) => (
            <button key={c} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${i===0 ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"}`}>
              {c}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button className="inline-flex items-center gap-2 border border-border px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted">
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
            <button className="inline-flex items-center gap-2 border border-border px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left"><input type="checkbox" /></th>
                  <th className="px-5 py-3 text-left font-semibold">Product</th>
                  <th className="px-5 py-3 text-left font-semibold">SKU</th>
                  <th className="px-5 py-3 text-left font-semibold">Category</th>
                  <th className="px-5 py-3 text-left font-semibold">Price</th>
                  <th className="px-5 py-3 text-left font-semibold">Stock</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.sku} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3"><input type="checkbox" /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-100 to-fuchsia-100 grid place-items-center text-[10px] font-bold text-muted-foreground">
                          {p.brand.slice(0,3).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[220px]">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{p.sku}</td>
                    <td className="px-5 py-3">{p.category}</td>
                    <td className="px-5 py-3 font-semibold">৳{p.price}</td>
                    <td className="px-5 py-3">{p.stock}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyle[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"><Edit2 className="h-3.5 w-3.5"/></button>
                        <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-rose-600"><Trash2 className="h-3.5 w-3.5"/></button>
                        <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"><MoreHorizontal className="h-3.5 w-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-border text-xs text-muted-foreground">
            <span>Showing 1–{products.length} of 248 products</span>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted">Previous</button>
              <button className="px-3 py-1.5 bg-foreground text-background rounded-lg">1</button>
              <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted">2</button>
              <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted">3</button>
              <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted">Next</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
