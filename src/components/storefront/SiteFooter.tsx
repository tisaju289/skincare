import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import type { Category } from "@/lib/shop-data";
import { subscribeNewsletter } from "@/lib/storefront.functions";
import { DEFAULT_SETTINGS, normalizeFooterColumns, type SiteSettings } from "@/lib/site-settings";
import { Button } from "@/components/ui/button";
import { ArrowRight, Facebook, Instagram, Youtube } from "lucide-react";

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
      <section className="border-y border-primary/15 bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 md:grid-cols-2 md:py-12">
          <div>
          <p className="mb-2 text-[10px] font-bold uppercase text-primary">Stay in the glow</p>
          <h3 className="font-display text-2xl font-semibold md:text-3xl">
            {settings.newsletter_title || `Join the ${settings.store_name} beauty club`}
          </h3>
          {settings.newsletter_subtitle !== "" && (
            <p className="mt-2 text-sm text-muted-foreground">
              {settings.newsletter_subtitle || "Get 10% off your first order + weekly beauty tips."}
            </p>
          )}
          </div>
          <form onSubmit={onSubscribe} className="flex w-full border-b border-foreground">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="min-w-0 flex-1 bg-transparent px-1 py-3 text-foreground outline-none"
            />
            <Button
              disabled={busy}
              variant="ghost"
              className="rounded-none px-3 text-xs font-bold uppercase text-primary"
            >
              {busy ? "Subscribing…" : settings.newsletter_button || "Subscribe"} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
      )}

      <footer className="bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 md:py-16">
          <div className="col-span-2 md:col-span-1">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={`${settings.store_name} logo`} loading="lazy" decoding="async" className="h-10 w-auto object-contain" />
            ) : (
               <p className="font-display text-3xl font-semibold">{settings.store_name}</p>
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
             <div className="mt-5 flex gap-3 opacity-80">
               {settings.facebook_url && <a aria-label="Facebook" href={settings.facebook_url} target="_blank" rel="noreferrer"><Facebook className="h-4 w-4" /></a>}
               {settings.instagram_url && <a aria-label="Instagram" href={settings.instagram_url} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" /></a>}
               {settings.youtube_url && <a aria-label="YouTube" href={settings.youtube_url} target="_blank" rel="noreferrer"><Youtube className="h-4 w-4" /></a>}
            </div>
          </div>
          <div>
             <p className="mb-4 text-xs font-bold uppercase text-primary">Shop</p>
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
               <p className="mb-4 text-xs font-bold uppercase text-primary">{col.title}</p>
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
         <div className="border-t border-background/10 py-5 text-center text-xs opacity-60">
          {settings.footer_copyright ||
            `© ${new Date().getFullYear()} ${settings.store_name}. All rights reserved.`}
        </div>
      </footer>
    </>
  );
}
