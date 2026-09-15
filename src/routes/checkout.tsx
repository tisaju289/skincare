import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { placeOrder, getSiteSettings } from "@/lib/storefront.functions";
import { SiteTheme } from "@/components/storefront/SiteTheme";
import { DEFAULT_SETTINGS, siteHead, type SiteSettings } from "@/lib/site-settings";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { imgProps } from "@/lib/image";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  loader: () => getSiteSettings(),
  head: ({ loaderData }) => {
    const settings = (loaderData as SiteSettings) ?? DEFAULT_SETTINGS;
    return siteHead(settings, {
      title: `Checkout — ${settings.store_name}`,
      description: `Complete your ${settings.store_name} order securely.`,
      path: "/checkout",
    });
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const settings = (Route.useLoaderData() as SiteSettings) ?? DEFAULT_SETTINGS;
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const submit = useServerFn(placeOrder);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "cod" as const,
  });

  const [zone, setZone] = useState<"inside" | "outside">("inside");
  const zoneRate =
    zone === "outside"
      ? Number(settings.shipping_outside_dhaka ?? 120)
      : Number(settings.shipping_inside_dhaka ?? 60);
  const shipping = subtotal === 0 ? 0 : zoneRate;
  const total = subtotal + shipping;

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setBusy(true);
    try {
      const res = await submit({
        data: {
          ...form,
          email: "",
          deliveryZone: zone,
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity, variantId: i.variantId ?? null })),
        },
      });
      clear();
      setDone(res.orderNumber);
      toast.success("Order placed!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <>
      <SiteTheme settings={settings} />
      <SiteHeader categories={[]} settings={settings} />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500" />
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Order confirmed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your order number is <span className="font-bold text-foreground">{done}</span>. We'll call you shortly to
            confirm delivery.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded bg-foreground text-background font-semibold px-8 py-3"
          >
            Continue shopping
          </Link>
        </div>
        <SiteFooter categories={[]} settings={settings} />
      </>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <>
      <SiteTheme settings={settings} />
      <SiteHeader categories={[]} settings={settings} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl sm:text-5xl">Checkout</h1>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Link to="/" className="mt-4 inline-block font-semibold text-primary">
              ← Continue shopping
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              <Field label="Full name" required value={form.name} onChange={(v) => set("name", v)} />
              <Field label="Phone" required value={form.phone} onChange={(v) => set("phone", v)} />
              <div className="mt-3">
                <label className="text-xs font-bold text-muted-foreground" htmlFor="address">
                  Address
                </label>
                <textarea
                  id="address"
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2">Delivery area</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: "inside", label: "Inside Dhaka", rate: Number(settings.shipping_inside_dhaka ?? 60) },
                    { id: "outside", label: "Outside Dhaka", rate: Number(settings.shipping_outside_dhaka ?? 120) },
                  ] as const).map((z) => (
                    <button
                      type="button"
                      key={z.id}
                      onClick={() => setZone(z.id)}
                      className={`rounded border px-3 py-2.5 text-sm font-semibold ${
                        zone === z.id
                          ? "border-primary bg-secondary/60 text-foreground"
                          : "border-border"
                      }`}
                    >
                      {z.label}
                      <span className="block text-[11px] font-normal opacity-70">৳{z.rate}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2">Payment method</p>
                <div className="rounded border border-primary/50 bg-secondary/40 px-3 py-2.5 text-sm font-semibold text-foreground">
                  Cash on Delivery
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-md border border-border p-5 bg-muted/30">
              <h2 className="font-display text-2xl">Order summary</h2>
              <ul className="mt-4 space-y-3">
                {items.map((i) => (
                  <li key={i.key ?? i.slug} className="flex gap-3 text-sm">
                    <img {...imgProps(i.image, { width: 120, widths: [96, 160], sizes: "48px" })} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="line-clamp-2 font-medium">{i.name}</p>
                      {i.variantLabel && <p className="text-xs text-muted-foreground">{i.variantLabel}</p>}
                      <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                    </div>
                    <p className="font-bold">৳{i.price * i.quantity}</p>
                  </li>
                ))}

              </ul>
              <div className="mt-4 space-y-1 text-sm border-t border-border pt-4">
                <Row label="Subtotal" value={`৳${subtotal}`} />
                <Row label="Delivery charge" value={`৳${shipping}`} />
                {settings.delivery_partner && (
                  <p className="text-xs text-muted-foreground">Delivered by {settings.delivery_partner}</p>
                )}
                <div className="flex justify-between font-black text-base pt-2">
                  <span>Total</span>
                  <span>৳{total}</span>
                </div>
              </div>
              <button
                disabled={busy}
                className="mt-5 w-full rounded bg-foreground text-background font-semibold py-3 disabled:opacity-60"
              >
                {busy ? "Placing order…" : "Place order"}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="mt-2 w-full rounded border border-border font-semibold py-2.5 text-sm"
              >
                Continue shopping
              </button>
            </aside>
          </form>
        )}
      </div>

      <SiteFooter categories={[]} settings={settings} />
      </>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="mt-3">
      <label className="text-xs font-bold text-muted-foreground" htmlFor={label}>
        {label}
      </label>
      <input
        id={label}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground font-semibold">{value}</span>
    </div>
  );
}
