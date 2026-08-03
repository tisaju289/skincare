import { MessageCircle } from "lucide-react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/site-settings";
import { whatsappEnabled, whatsappLink } from "@/lib/whatsapp";

export function WhatsAppButton({ settings = DEFAULT_SETTINGS }: { settings?: SiteSettings }) {
  if (!whatsappEnabled(settings)) return null;

  return (
    <a
      href={whatsappLink(settings)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={settings.whatsapp_label || "Chat on WhatsApp"}
      className="fixed right-4 bottom-20 md:bottom-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-3 shadow-lg hover:brightness-105 transition"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline text-sm font-bold">{settings.whatsapp_label || "WhatsApp"}</span>
    </a>
  );
}
