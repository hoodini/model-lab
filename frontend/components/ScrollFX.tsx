"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLab } from "./providers";

// App-wide scroll effects: a top progress bar + scroll-triggered reveals for
// cards and anything tagged .fx-reveal. Kept in one place so individual
// components stay declarative. Re-runs on language change because RTL flips
// layout and ScrollTrigger needs fresh measurements.
export function ScrollFX() {
  const bar = useRef<HTMLDivElement>(null);
  const { lang } = useLab();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Top progress bar scaling 0→1 across the whole page scroll.
      if (bar.current) {
        gsap.set(bar.current, { scaleX: 0, transformOrigin: "left center" });
        gsap.to(bar.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        });
      }

      // Reveal cards as they scroll into view. batch() handles instant jumps
      // and groups nearby cards into one staggered entrance.
      const targets = gsap.utils.toArray<HTMLElement>(".card, .fx-reveal");
      gsap.set(targets, { opacity: 0, y: 28 });
      ScrollTrigger.batch(targets, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 }),
      });
    });

    // RouterLab fetches its dataset async, which changes page height after
    // first paint — recompute trigger positions once that settles, on load,
    // and run a safety sweep so a mis-measured card can never stay invisible.
    const refresh = () => ScrollTrigger.refresh();
    const t1 = window.setTimeout(refresh, 400);
    const t2 = window.setTimeout(refresh, 1200);
    window.addEventListener("load", refresh);
    const safety = window.setTimeout(() => {
      gsap.utils.toArray<HTMLElement>(".card, .fx-reveal").forEach((el) => {
        if (Number(getComputedStyle(el).opacity) < 0.05) gsap.to(el, { opacity: 1, y: 0, duration: 0.4 });
      });
    }, 2500);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(safety);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [lang]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        insetInlineStart: 0,
        width: "100%",
        height: 4,
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div ref={bar} style={{ height: "100%", width: "100%", background: "var(--yuv-yellow)" }} />
    </div>
  );
}
