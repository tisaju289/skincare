import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import type { Category } from "@/lib/shop-data";
import { subscribeNewsletter } from "@/lib/storefront.functions";
import { DEFAULT_SETTINGS, normalizeFooterColumns, type SiteSettings } from "@/lib/site-settings";

export function SiteFooter({
  categories = [],
  settings = DEFAULT_SETTINGS,
}: {
  categories?: Category[];
  settings?: SiteSettings;
}) {
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

  const columns = normalizeFooterColumns(settings.footer_columns).filter((c) => c.enabled);

  return (
    <>
      {settings.newsletter_enabled !== false && (
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="rounded-3xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white p-6 sm:p-8 md:p-12 text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">
            {settings.newsletter_title || `Join the ${settings.store_name} beauty club`}
          </h3>
          {settings.newsletter_subtitle !== "" && (
            <p className="mt-2 opacity-90 text-sm">
              {settings.newsletter_subtitle || "Get 10% off your first order + weekly beauty tips."}
            </p>
          )}
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
              {busy ? "Subscribing…" : settings.newsletter_button || "Subscribe"}
            </button>
          </form>
        </div>
      </section>
      )}

      <footer className="mt-16 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={`${settings.store_name} logo`} loading="lazy" decoding="async" className="h-10 w-auto object-contain" />
            ) : (
              <p className="text-2xl font-black uppercase">{settings.store_name}</p>
            )}
            <p className="mt-3 text-sm opacity-70">
              {settings.footer_about ||
                settings.seo_description ||
                "Bangladesh's beauty destination for authentic makeup, skincare & fragrance."}
            </p>
            {(settings.support_email || settings.phone || settings.business_address) && (
              <ul className="mt-3 space-y-1 text-sm opacity-70">
                {settings.support_email && <li>{settings.support_email}</li>}
                {settings.phone && <li>{settings.phone}</li>}
                {settings.business_address && <li>{settings.business_address}</li>}
              </ul>
            )}
            <div className="mt-3 flex gap-3 text-sm opacity-80">
              {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}
              {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}
              {settings.youtube_url && <a href={settings.youtube_url} target="_blank" rel="noreferrer">YouTube</a>}
            </div>
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
          {columns.map((col, i) => (
            <div key={i}>
              <p className="font-bold mb-3">{col.title}</p>
              <ul className="space-y-2 text-sm opacity-80">
                {col.links.map((l, j) => (
                  <li key={j}>
                    <a
                      href={l.url || "#"}
                      {...(l.url?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="hover:opacity-100"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 text-center text-xs opacity-60 py-4">
          {settings.footer_copyright ||
            `© ${new Date().getFullYear()} ${settings.store_name}. All rights reserved.`}
        </div>
      </footer>
    </>
  );
}
