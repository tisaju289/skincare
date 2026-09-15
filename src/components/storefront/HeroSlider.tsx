import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/site-settings";
import { imgProps } from "@/lib/image";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  return (
    <section className="max-w-7xl mx-auto px-4 pt-3 md:pt-5">
      <div className="relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg bg-muted shadow-brand">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-[900ms] ease-out ${
              i === index ? "opacity-100 scale-100" : "opacity-0 scale-[1.04] pointer-events-none"
            }`}
            aria-hidden={i === index ? undefined : true}
          >
            {s.image ? (
              <img
                {...imgProps(s.image, {
                  width: 1600,
                  widths: [640, 960, 1280, 1600],
                  sizes: "(max-width: 768px) 100vw, 1200px",
                  eager: i === 0,
                })}
                alt={s.title ?? "Promotional banner"}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}

            <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_96%,transparent),color-mix(in_oklab,var(--color-background)_72%,transparent)_42%,transparent_72%)]" />

            <div className="relative flex h-full min-w-0 max-w-[94%] flex-col justify-center px-6 sm:max-w-[64%] sm:px-12 md:max-w-[52%] md:px-16">
              {s.kicker ? <p className="eyebrow line-clamp-1">{s.kicker}</p> : null}
              {s.title ? (
                <h1 className="font-display mt-3 text-[2.5rem] sm:text-6xl lg:text-7xl text-foreground line-clamp-3">
                  {s.title}
                </h1>
              ) : null}
              {s.subtitle ? (
                <p className="mt-4 max-w-md text-sm sm:text-base text-foreground/70 leading-relaxed line-clamp-3">
                  {s.subtitle}
                </p>
              ) : null}
              <div className="mt-4 sm:mt-7 flex flex-wrap items-center gap-2.5">
                {s.cta_label ? (
                  <a
                    href={s.cta_link || "/search"}
                    className="inline-flex items-center gap-2 rounded bg-foreground px-5 sm:px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-background transition-all hover:gap-3.5"
                  >
                    {s.cta_label} <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ) : null}
                {s.badge ? (
                  <span className="inline-flex items-center border-l border-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                    {s.badge}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute right-20 bottom-5 hidden h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur transition hover:bg-background sm:grid dew-ring"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-6 bottom-5 hidden h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur transition hover:bg-background sm:grid dew-ring"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-4 left-5 flex gap-1.5 sm:left-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1 rounded-full transition-all ${
                    i === index ? "w-9 bg-foreground" : "w-3.5 bg-foreground/25"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
