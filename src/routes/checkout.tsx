import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { placeOrder } from "@/lib/storefront.functions";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Shajgoj" },
      { name: "description", content: "Complete your Shajgoj order with cash on delivery, bKash, Nagad or card." },
      { property: "og:title", content: "Checkout — Shajgoj" },
      { property: "og:description", content: "Secure checkout with cash on delivery across Bangladesh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutPage,
});

const PAYMENTS = [
  { id: "cod", label: "Cash on Delivery" },
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "card", label: "Card" },
] as const;

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const submit = useServerFn(placeOrder);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    promoCode: "",
    paymentMethod: "cod" as (typeof PAYMENTS)[number]["id"],
  });

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 60;
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
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
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
        <SiteHeader categories={[]} />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500" />
          <h1 className="mt-4 text-2xl sm:text-3xl font-black">Order confirmed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your order number is <span className="font-bold text-foreground">{done}</span>. We'll call you shortly to
            confirm delivery.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-[color:var(--brand-pink)] text-white font-bold px-8 py-3"
          >
            Continue shopping
          </Link>
        </div>
        <SiteFooter categories={[]} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader categories={[]} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-black">Checkout</h1>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Link to="/" className="mt-4 inline-block font-bold text-[color:var(--brand-pink)]">
              ← Continue shopping
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" required value={form.name} onChange={(v) => set("name", v)} />
                <Field label="Phone" required value={form.phone} onChange={(v) => set("phone", v)} />
              </div>
              <Field label="Email (optional)" type="email" value={form.email} onChange={(v) => set("email", v)} />
              <div>
                <label className="text-xs font-bold text-muted-foreground" htmlFor="address">
                  Delivery address
                </label>
                <textarea
                  id="address"
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground" htmlFor="notes">
                  Order notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2">Payment method</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PAYMENTS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => set("paymentMethod", p.id)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                        form.paymentMethod === p.id
                          ? "border-[color:var(--brand-pink)] bg-[color:var(--brand-pink)]/10 text-[color:var(--brand-pink)]"
                          : "border-border"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-border p-5 bg-muted/30">
              <h2 className="font-black">Order summary</h2>
              <ul className="mt-4 space-y-3">
                {items.map((i) => (
                  <li key={i.slug} className="flex gap-3 text-sm">
                    <img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="line-clamp-2 font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                    </div>
                    <p className="font-bold">৳{i.price * i.quantity}</p>
                  </li>
                ))}
              </ul>
              <Field
                label="Promo code"
                value={form.promoCode}
                onChange={(v) => set("promoCode", v.toUpperCase())}
              />
              <div className="mt-4 space-y-1 text-sm border-t border-border pt-4">
                <Row label="Subtotal" value={`৳${subtotal}`} />
                <Row label="Shipping" value={shipping ? `৳${shipping}` : "Free"} />
                <div className="flex justify-between font-black text-base pt-2">
                  <span>Total</span>
                  <span>৳{total}</span>
                </div>
              </div>
              <button
                disabled={busy}
                className="mt-5 w-full rounded-full bg-[color:var(--brand-pink)] text-white font-bold py-3 disabled:opacity-60"
              >
                {busy ? "Placing order…" : "Place order"}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="mt-2 w-full rounded-full border border-border font-semibold py-2.5 text-sm"
              >
                Continue shopping
              </button>
            </aside>
          </form>
        )}
      </div>

      <SiteFooter categories={[]} />
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
