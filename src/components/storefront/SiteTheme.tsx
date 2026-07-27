import { themeVars, type SiteSettings } from "@/lib/site-settings";

/** Injects the admin-configured brand colours as CSS variables. */
export function SiteTheme({ settings }: { settings: SiteSettings }) {
  return <style dangerouslySetInnerHTML={{ __html: themeVars(settings) }} />;
}
