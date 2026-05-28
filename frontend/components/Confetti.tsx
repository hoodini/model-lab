"use client";

import { gsap } from "gsap";

/* ───────────────────────────────────────────────────────────────────────────
   Brand confetti — the dopamine payoff. No dependency: we spawn DOM particles
   in the Fly High palette (purple / yellow / white / purple-dark) and animate
   them with GSAP, then clean up. Call fireConfetti() from an event handler
   (e.g. when YOUR model finishes training). This is an EARNED celebration, not
   ambient noise — fire it sparingly.
─────────────────────────────────────────────────────────────────────────── */

const COLORS = ["#FFEC00", "#5E17EB", "#3D0DA8", "#FFFFFF"];

export function fireConfetti(opts?: { count?: number; originY?: number }) {
  if (typeof window === "undefined") return;
  const count = opts?.count ?? 140;
  const originY = opts?.originY ?? 0.32; // fraction of viewport height

  const layer = document.createElement("div");
  layer.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(layer);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const cx = W / 2;
  const cy = H * originY;

  const pieces: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const size = 6 + Math.random() * 10;
    const isRect = Math.random() > 0.4;
    el.style.cssText = [
      "position:absolute",
      `left:${cx}px`,
      `top:${cy}px`,
      `width:${size}px`,
      `height:${isRect ? size * 0.5 : size}px`,
      `background:${COLORS[i % COLORS.length]}`,
      isRect ? "border-radius:0" : "border-radius:999px",
      "will-change:transform,opacity",
    ].join(";");
    layer.appendChild(el);
    pieces.push(el);
  }

  pieces.forEach((el) => {
    // Launch up-and-out in a fan, then fall under "gravity" (a second tween).
    const angle = (Math.random() * Math.PI) - Math.PI / 2; // -90°..+90° (upward fan)
    const power = 260 + Math.random() * 520;
    const dx = Math.cos(angle) * power * (Math.random() > 0.5 ? 1 : -1);
    const dy = -(Math.abs(Math.sin(angle)) * power) - 120 - Math.random() * 220;
    const rot = (Math.random() * 720 - 360);
    const dur = 0.9 + Math.random() * 0.9;

    const tl = gsap.timeline();
    tl.to(el, { x: dx, y: dy, rotation: rot, duration: 0.45 + Math.random() * 0.2, ease: "power2.out" })
      .to(el, { y: dy + H * 0.9, x: `+=${(Math.random() * 80 - 40)}`, rotation: `+=${rot}`, duration: dur, ease: "power1.in" }, ">-0.05")
      .to(el, { opacity: 0, duration: 0.4, ease: "power1.in" }, "<+0.4");
  });

  // Tear down after the longest possible animation.
  window.setTimeout(() => layer.remove(), 2600);
}
