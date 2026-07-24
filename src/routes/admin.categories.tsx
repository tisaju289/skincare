import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Plus, Edit2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

const categories = [
  { name: "Makeup", slug: "makeup", products: 342, color: "from-pink-400 to-rose-500" },
  { name: "Skincare", slug: "skincare", products: 528, color: "from-fuchsia-400 to-pink-500" },
  { name: "Hair Care", slug: "hair", products: 184, color: "from-purple-400 to-fuchsia-500" },
  { name: "Personal Care", slug: "personal-care", products: 226, color: "from-rose-400 to-pink-500" },
  { name: "Mom & Baby", slug: "mom-baby", products: 97, color: "from-pink-300 to-rose-400" },
  { name: "Fragrance", slug: "fragrance", products: 68, color: "from-violet-400 to-purple-500" },
  { name: "Men", slug: "men", products: 143, color: "from-emerald-500 to-teal-600" },
  { name: "Jewellery", slug: "jewellery", products: 54, color: "from-amber-400 to-orange-500" },
];

function CategoriesPage() {
  return (
    <>
      <AdminTopbar title="Categories" subtitle="Organize products into browseable categories" action={
        <button className="inline-flex items-center gap-2 bg-[color:var(--brand-pink)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
          <Plus className="h-4 w-4" /> New category
        </button>
      }/>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div key={c.slug} className="bg-card border border-border rounded-2xl overflow-hidden group">
              <div className={`h-28 bg-gradient-to-br ${c.color} relative`}>
                <div className="absolute inset-0 flex items-end p-4">
                  <p className="text-white text-xl font-black drop-shadow">{c.name}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                  <p className="text-sm font-semibold mt-0.5">{c.products} products</p>
                </div>
                <div className="flex gap-1">
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"><Edit2 className="h-3.5 w-3.5"/></button>
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-rose-600"><Trash2 className="h-3.5 w-3.5"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
