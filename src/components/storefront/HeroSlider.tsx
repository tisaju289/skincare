import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/site-settings";
import { imgProps } from "@/lib/image";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  return (
    <section className="max-w-7xl mx-auto px-4 pt-4 md:pt-6">
      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-gradient-brand shadow-brand">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-700 ${
              i === index ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
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

            {/* editorial scrim */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--brand-purple)_88%,transparent),color-mix(in_oklab,var(--brand-magenta)_55%,transparent)_45%,transparent_85%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(0_0_0/0.35),transparent_55%)]" />

            <div className="relative h-full flex flex-col justify-center px-4 sm:px-10 md:px-16 max-w-[86%] sm:max-w-[70%] md:max-w-[58%] min-w-0 text-primary-foreground">
              {s.kicker ? (
                <p className="text-[8px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.28em] uppercase opacity-90 line-clamp-1">
                  {s.kicker}
                </p>
              ) : null}
              {s.title ? (
                <h1 className="font-display mt-1 sm:mt-4 text-2xl sm:text-6xl lg:text-8xl uppercase break-words line-clamp-2">
                  {s.title}
                </h1>
              ) : null}
              {s.subtitle ? (
                <p className="mt-1 sm:mt-3 text-[11px] sm:text-lg font-medium opacity-90 max-w-md line-clamp-2">
                  {s.subtitle}
                </p>
              ) : null}
              <div className="mt-2.5 sm:mt-6 flex items-center gap-3">
                {s.cta_label ? (
                  <a
                    href={s.cta_link || "/search"}
                    className="inline-flex items-center gap-2 rounded-full bg-background text-foreground font-bold px-4 sm:px-7 py-1.5 sm:py-3 text-[11px] sm:text-sm uppercase tracking-wider hover:gap-3 transition-all"
                  >
                    {s.cta_label} <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </a>
                ) : null}
                {s.badge ? (
                  <span className="hidden sm:inline-flex items-center rounded-full border border-current/40 px-4 py-2.5 text-xs font-bold uppercase tracking-widest">
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
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-background/70 backdrop-blur hover:bg-background hidden sm:grid place-items-center"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-background/70 backdrop-blur hover:bg-background grid place-items-center"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="absolute bottom-3 sm:bottom-5 right-4 sm:right-6 flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-background" : "w-3 bg-background/50"
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
