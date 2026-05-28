"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLab } from "./providers";
import { getHealth } from "@/lib/api";

/* ───────────────────────────────────────────────────────────────────────────
   Hero — the first drop of the ride. A living neuron field fires behind a
   word-by-word headline reveal, magnetic CTAs, and a live "your hardware"
   badge. Fly High act section (purple bg, white headline, yellow accent).
   Motion is rAF-driven (Hyperframes-friendly); the field is purely decorative
   and sits behind the copy at low opacity so text stays readable.
─────────────────────────────────────────────────────────────────────────── */

function NeuronField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parent = canvas.parentElement!;
    type Node = { x: number; y: number; vx: number; vy: number };
    let nodes: Node[] = [];
    const LINK = 150;          // px distance to draw an edge
    let pulses: { a: number; b: number; t: number; sp: number }[] = [];

    const seedNodes = () => {
      const count = Math.round(Math.min(54, Math.max(26, (W * H) / 26000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
      pulses = Array.from({ length: 7 }, () => spawnPulse());
    };

    const spawnPulse = () => {
      const a = Math.floor(Math.random() * nodes.length);
      let b = Math.floor(Math.random() * nodes.length);
      if (b === a) b = (b + 1) % nodes.length;
      return { a, b, t: Math.random(), sp: 0.006 + Math.random() * 0.012 };
    };

    const resize = () => {
      W = parent.clientWidth; H = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    };

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // move
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      // edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const a = (1 - d / LINK) * 0.22;
            ctx.strokeStyle = `rgba(255,255,255,${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        ctx.fillStyle = "rgba(255,236,0,0.55)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // firing pulses travelling node→node
      for (const p of pulses) {
        p.t += p.sp;
        if (p.t >= 1) { Object.assign(p, spawnPulse()); continue; }
        const A = nodes[p.a], B = nodes[p.b];
        if (!A || !B) { Object.assign(p, spawnPulse()); continue; }
        const x = A.x + (B.x - A.x) * p.t;
        const y = A.y + (B.y - A.y) * p.t;
        ctx.fillStyle = "rgba(255,236,0,0.95)";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,236,0,0.18)";
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.9, pointerEvents: "none" }}
    />
  );
}

function Magnetic({ children, className, href, style }: {
  children: React.ReactNode; className?: string; href: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * 0.28, y: dy * 0.32, duration: 0.35, ease: "power3.out" });
    };
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);
  return <a ref={ref} href={href} className={className} style={style}>{children}</a>;
}

export function Hero() {
  const { t, lang } = useLab();
  const root = useRef<HTMLDivElement>(null);
  const [hw, setHw] = useState<{ device?: string; device_name?: string } | null>(null);

  useEffect(() => { getHealth().then(setHw).catch(() => {}); }, []);

  // Headline pieces — one word gets the yellow highlight. Built per language so
  // we can do a per-word "mask rise" reveal that keeps the highlight intact.
  const line1 = lang === "he" ? ["ללמד", "מכונה"] : ["Teach", "a", "machine", "to"];
  const hlWord = lang === "he" ? "לחשוב" : "think";
  const line2 = lang === "he" ? ["—", "שורה", "אחר", "שורה."] : ["—", "one", "line", "at", "a", "time."];

  useEffect(() => {
    // Fail-open: everything is visible by default; GSAP animates it IN with
    // .from(). If a tween is interrupted (React dev double-mount) the elements
    // simply stay visible — content is never stuck invisible.
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: 16, duration: 0.6 })
        .from(".hero-word", { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.05 }, "-=0.2")
        .from(".hero-sub", { opacity: 0, y: 16, duration: 0.7 }, "-=0.3")
        .from(".hero-cta", { opacity: 0, y: 16, duration: 0.6, stagger: 0.1 }, "-=0.4")
        .from(".hero-badge", { opacity: 0, y: 16, duration: 0.6 }, "-=0.4");
    }, root);
    return () => ctx.revert();
  }, [lang]);

  const Word = ({ children, hl }: { children: React.ReactNode; hl?: boolean }) => (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em" }}>
      <span className="hero-word" style={{ display: "inline-block" }}>
        {hl ? <span className="hl">{children}</span> : children}
      </span>
    </span>
  );

  return (
    <section
      ref={root}
      className="act"
      style={{ position: "relative", overflow: "hidden", minHeight: "92vh", display: "flex", alignItems: "center" }}
    >
      <NeuronField />

      {/* soft vignette so the headline always wins over the field */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(120% 90% at 20% 30%, rgba(61,13,168,0) 0%, rgba(61,13,168,0.55) 70%, rgba(61,13,168,0.85) 100%)",
        pointerEvents: "none",
      }} />

      <div className="wrap" style={{ position: "relative", zIndex: 2, paddingTop: 80, paddingBottom: 80 }}>
        <div className="hero-eyebrow eyebrow" style={{ color: "var(--yuv-yellow)", marginBottom: 22 }}>
          {t("TRAIN AI · FROM ZERO · ON YOUR OWN HARDWARE", "אימון AI · מאפס · על החומרה שלך")}
        </div>

        <h1 className="display" style={{ fontSize: "clamp(46px, 8.5vw, 116px)", color: "#fff", maxWidth: 1040, lineHeight: 1.02, letterSpacing: 0 }}>
          <span style={{ display: "flex", flexWrap: "wrap", gap: "0 0.28em" }}>
            {line1.map((w, i) => <Word key={`a${i}`}>{w}</Word>)}
            <Word hl>{hlWord}</Word>
          </span>
          <span style={{ display: "flex", flexWrap: "wrap", gap: "0 0.28em", marginTop: "0.04em" }}>
            {line2.map((w, i) => <Word key={`b${i}`}>{w}</Word>)}
          </span>
        </h1>

        <p className="hero-sub" style={{ fontSize: 20, color: "#EDE7FF", maxWidth: 640, marginTop: 28, lineHeight: 1.6 }}>
          {t(
            "No magic, no black boxes. We train a real model on whatever hardware you have — the app auto-detects your GPU or CPU and picks the best settings — and explain every concept at your level, beginner to advanced, in English and Hebrew.",
            "בלי קסמים, בלי קופסאות שחורות. נאמן מודל אמיתי על כל חומרה שיש לך — האפליקציה מזהה אוטומטית GPU או CPU ובוחרת את ההגדרות הטובות ביותר — ונסביר כל מושג ברמה שלך, ממתחיל ועד מתקדם, באנגלית ובעברית."
          )}
        </p>

        <div style={{ marginTop: 38, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Magnetic href="#lab" className="hero-cta btn btn-yellow">
            {t("Start the Router lab →", "התחל את מעבדת הראוטר →")}
          </Magnetic>
          <Magnetic href="#how" className="hero-cta btn" style={{ background: "transparent", color: "#fff", borderColor: "#fff" }}>
            {t("How training works", "איך אימון עובד")}
          </Magnetic>
        </div>

        {hw?.device && (
          <div className="hero-badge mono" style={{
            marginTop: 28, display: "inline-flex", alignItems: "center", gap: 9,
            fontSize: 12.5, padding: "8px 14px", border: "2px solid rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 999,
          }}>
            <span style={{
              width: 9, height: 9, borderRadius: 999,
              background: hw.device === "cpu" ? "#fff" : "var(--yuv-yellow)",
              boxShadow: hw.device === "cpu" ? "none" : "0 0 0 4px rgba(255,236,0,0.25)",
            }} />
            {t("Detected on your machine", "זוהה במכונה שלך")}: <strong style={{ color: "var(--yuv-yellow)" }}>{hw.device_name}</strong>
          </div>
        )}
      </div>
    </section>
  );
}
