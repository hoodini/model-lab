"use client";

import { useEffect, useRef, useState } from "react";

/* ───────────────────────────────────────────────────────────────────────────
   CounterUp — a number that counts from 0 to `to` on viewport entry, ease-out
   cubic over ~1.4s (the design-system stat pattern). Pure rAF, no deps. Re-runs
   if `to` changes (e.g. accuracy arriving after training) so it animates to the
   new value. Respects prefers-reduced-motion.
─────────────────────────────────────────────────────────────────────────── */

export function CounterUp({
  to,
  decimals = 0,
  duration = 1400,
  prefix = "",
  suffix = "",
  className,
  style,
  replayKey,
}: {
  to: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
  replayKey?: string | number; // change to force a re-count to a new value
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) { setVal(to); return; }

    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const from = 0;
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        setVal(from + (to - from) * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            run();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
    // replayKey in deps lets a parent force a fresh count to a new target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, duration, replayKey]);

  // When replayKey changes, allow the counter to run again.
  useEffect(() => { started.current = false; }, [replayKey]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{val.toFixed(decimals)}{suffix}
    </span>
  );
}
