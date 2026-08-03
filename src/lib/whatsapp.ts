import type { SiteSettings } from "@/lib/site-settings";

export function whatsappNumber(settings: Pick<SiteSettings, "whatsapp_number">) {
  return (settings.whatsapp_number ?? "").replace(/[^\d]/g, "");
}

export function whatsappEnabled(settings: Pick<SiteSettings, "whatsapp_enabled" | "whatsapp_number">) {
  return settings.whatsapp_enabled === true && whatsappNumber(settings).length >= 8;
}

export function whatsappLink(
  settings: Pick<SiteSettings, "whatsapp_enabled" | "whatsapp_number" | "whatsapp_message">,
  message?: string,
) {
  const number = whatsappNumber(settings);
  const text = message || settings.whatsapp_message || "Hello! I need help with my order.";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
