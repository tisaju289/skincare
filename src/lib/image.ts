/**
 * Image helpers: serve optimized (WebP/AVIF via `auto=format`) sized variants
 * from the image CDN when the source supports it, with a graceful fallback to
 * the original URL for any host we can't transform.
 */

const CDN_HOSTS = ["images.unsplash.com", "plus.unsplash.com"];

function parse(url?: string | null): URL | null {
  if (!url) return null;
  try {
    return new URL(url, typeof window === "undefined" ? "https://local" : window.location.origin);
  } catch {
    return null;
  }
}

function isCdn(url?: string | null): boolean {
  const u = parse(url);
  return !!u && CDN_HOSTS.includes(u.hostname);
}

/** Optimized variant of an image at a given width. Falls back to the original URL. */
export function optimizedImage(url?: string | null, width = 800, quality = 72): string {
  if (!url) return "";
  const u = parse(url);
  if (!u || !CDN_HOSTS.includes(u.hostname)) return url;
  u.searchParams.set("auto", "format,compress");
  u.searchParams.set("fit", "crop");
  u.searchParams.set("q", String(quality));
  u.searchParams.set("w", String(width));
  u.searchParams.delete("h");
  return u.toString();
}

/** Responsive srcset string, or undefined when the host can't be transformed. */
export function imageSrcSet(
  url?: string | null,
  widths: number[] = [240, 480, 720, 960, 1440],
): string | undefined {
  if (!isCdn(url)) return undefined;
  return widths.map((w) => `${optimizedImage(url, w)} ${w}w`).join(", ");
}

/** Everything an <img> needs for an optimized, responsive, lazy image. */
export function imgProps(
  url?: string | null,
  opts: { width?: number; sizes?: string; widths?: number[]; eager?: boolean } = {},
) {
  const { width = 800, sizes, widths, eager } = opts;
  return {
    src: optimizedImage(url, width),
    srcSet: imageSrcSet(url, widths),
    sizes: sizes ?? (imageSrcSet(url, widths) ? `${width}px` : undefined),
    loading: (eager ? "eager" : "lazy") as "eager" | "lazy",
    decoding: (eager ? "sync" : "async") as "sync" | "async",
    fetchPriority: (eager ? "high" : "auto") as "high" | "auto",
  };
}
