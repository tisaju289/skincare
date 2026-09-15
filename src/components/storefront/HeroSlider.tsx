import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <section className="max-w-7xl mx-auto px-4 pt-4 md:pt-7">
      <div className="relative aspect-[16/9] md:aspect-[16/5] overflow-hidden rounded-[1.75rem] md:rounded-[2.5rem] bg-gradient-soft">
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
                alt="Promotional banner"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
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
