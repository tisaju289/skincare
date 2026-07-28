import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const line = [30, 45, 38, 55, 60, 52, 70, 78, 72, 85, 92, 88, 96, 105];
  const max = Math.max(...line);
  const donut = [
    { label: "Makeup", value: 32, color: "bg-pink-500" },
    { label: "Skincare", value: 41, color: "bg-fuchsia-500" },
    { label: "Fragrance", value: 12, color: "bg-violet-500" },
    { label: "Personal Care", value: 15, color: "bg-rose-400" },
  ];

  return (
    <>
      <AdminTopbar title="Analytics" subtitle="Sales insights and customer behavior" />
      <div className="p-3 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold">Sales trend</h3>
                <p className="text-xs text-muted-foreground">Last 14 days</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +18.4%
              </span>
            </div>
            <svg viewBox="0 0 400 160" className="w-full h-48">
              <defs>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.24 5)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="oklch(0.65 0.24 5)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="oklch(0.65 0.24 5)"
                strokeWidth="2.5"
                points={line.map((v, i) => `${(i / (line.length - 1)) * 400},${160 - (v / max) * 140}`).join(" ")}
              />
              <polygon
                fill="url(#grad)"
                points={`0,160 ${line.map((v, i) => `${(i / (line.length - 1)) * 400},${160 - (v / max) * 140}`).join(" ")} 400,160`}
              />
            </svg>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold mb-4">Sales by category</h3>
            <div className="flex items-center justify-center h-32">
              <div className="relative h-32 w-32 rounded-full" style={{
                background: `conic-gradient(
                  oklch(0.65 0.24 5) 0 ${donut[0].value}%,
                  oklch(0.6 0.25 330) ${donut[0].value}% ${donut[0].value + donut[1].value}%,
                  oklch(0.55 0.22 300) ${donut[0].value + donut[1].value}% ${donut[0].value + donut[1].value + donut[2].value}%,
                  oklch(0.7 0.15 15) ${donut[0].value + donut[1].value + donut[2].value}% 100%
                )`,
              }}>
                <div className="absolute inset-4 bg-card rounded-full grid place-items-center">
                  <div className="text-center">
                    <p className="text-lg font-black">100%</p>
                    <p className="text-[10px] text-muted-foreground">Sales</p>
                  </div>
                </div>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {donut.map(d => (
                <li key={d.label} className="flex items-center gap-2 text-xs">
                  <span className={`h-2 w-2 rounded-full ${d.color}`} />
                  <span className="flex-1">{d.label}</span>
                  <span className="font-semibold">{d.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Conversion rate", value: "3.42%", sub: "+0.4% vs last week" },
            { label: "Avg. order value", value: "৳1,840", sub: "+৳120 vs last week" },
            { label: "Returning customers", value: "62%", sub: "+2% vs last week" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-3xl font-black mt-2">{s.value}</p>
              <p className="text-xs text-emerald-600 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
