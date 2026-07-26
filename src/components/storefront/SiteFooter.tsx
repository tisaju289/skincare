import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import type { Category } from "@/lib/shop-data";
import { subscribeNewsletter } from "@/lib/storefront.functions";

export function SiteFooter({ categories = [] }: { categories?: Category[] }) {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await subscribe({ data: { email } });
      toast.success("Subscribed! Check your inbox for the welcome offer.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="rounded-3xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white p-6 sm:p-8 md:p-12 text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">Join the Shajgoj beauty club</h3>
          <p className="mt-2 opacity-90 text-sm">Get 10% off your first order + weekly beauty tips.</p>
          <form onSubmit={onSubscribe} className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 min-w-0 rounded-full px-5 py-3 text-foreground outline-none"
            />
            <button
              disabled={busy}
              className="rounded-full bg-foreground text-background font-bold px-6 py-3 text-sm whitespace-nowrap disabled:opacity-60"
            >
              {busy ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        </div>
      </section>

      <footer className="mt-16 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-2xl font-black">SHAJGOJ</p>
            <p className="mt-3 text-sm opacity-70">
              Bangladesh's beauty destination for authentic makeup, skincare & fragrance.
            </p>
          </div>
          <div>
            <p className="font-bold mb-3">Shop</p>
            <ul className="space-y-2 text-sm opacity-80">
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link to="/category/$slug" params={{ slug: c.slug }}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold mb-3">Help</p>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link to="/search" search={{ q: "" }}>All products</Link>
              </li>
              <li>Shipping</li>
              <li>Returns</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <p className="font-bold mb-3">Company</p>
            <ul className="space-y-2 text-sm opacity-80">
              <li>About</li>
              <li>Blog</li>
              <li>Careers</li>
              <li>Privacy</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 text-center text-xs opacity-60 py-4">
          © {new Date().getFullYear()} Shajgoj. All rights reserved.
        </div>
      </footer>
    </>
  );
}
