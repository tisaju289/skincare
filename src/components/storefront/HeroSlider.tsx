
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/site-settings";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  return (
    <section className="max-w-7xl mx-auto px-4 pt-6">
      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden bg-[color:var(--brand-lilac)]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-conic-gradient(from 0deg, oklch(0.95 0.05 300) 0deg 10deg, transparent 10deg 20deg)",
          }}
        />

        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={i === index ? undefined : true}
          >
            {s.image ? (
              <img
                src={s.image}
                alt={s.title ?? "Promotional banner"}
                loading={i === 0 ? "eager" : "lazy"}
                className="absolute right-0 top-0 h-full w-1/2 md:w-[45%] object-cover"
              />
            ) : null}
            <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-14 max-w-[58%] md:max-w-[52%]">
              {s.kicker ? (
                <p className="text-[10px] sm:text-sm font-bold tracking-widest text-blue-700">{s.kicker}</p>
              ) : null}
              {s.badge ? (
                <div className="mt-1.5 sm:mt-3 self-start bg-[color:var(--brand-pink)] text-white text-sm sm:text-3xl font-black px-2 sm:px-4 py-0.5 sm:py-1.5 rounded">
                  {s.badge}
                </div>
              ) : null}
              {s.title ? (
                <h1 className="mt-1.5 sm:mt-3 text-2xl sm:text-5xl lg:text-6xl font-black leading-none text-blue-900 -rotate-2">
                  {s.title}
                </h1>
              ) : null}
              {s.subtitle ? (
                <p className="mt-1.5 sm:mt-3 text-sm sm:text-2xl font-black text-blue-900">{s.subtitle}</p>
              ) : null}
              {s.cta_label ? (
                <a
                  href={s.cta_link || "/search"}
                  className="mt-2.5 sm:mt-6 self-start inline-flex items-center gap-1.5 bg-[color:var(--brand-pink)] hover:opacity-90 text-white font-bold px-3.5 sm:px-8 py-1.5 sm:py-3 rounded-full text-[11px] sm:text-base"
                >
                  {s.cta_label} <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              ) : null}

            </div>
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/80 hover:bg-white grid place-items-center shadow"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/80 hover:bg-white grid place-items-center shadow"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-[color:var(--brand-pink)]" : "w-2 bg-white/80"
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
