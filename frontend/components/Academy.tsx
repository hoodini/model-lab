"use client";

import { Lesson } from "./Lesson";
import { useLab } from "./providers";
import { FOUNDATIONS, TOKENIZERS, LORA, UNSLOTH, DIFFUSION, AITOOLKIT } from "@/lib/academy";

/* ───────────────────────────────────────────────────────────────────────────
   Academy — the deep-dive curriculum, rendered as level-aware lessons with two
   bespoke visuals (LoRA low-rank decomposition, diffusion denoising strip).
─────────────────────────────────────────────────────────────────────────── */

// A row of tiles going from pure noise (left) to a clean image (right) — the
// reverse diffusion process, deterministic SVG noise fading out step by step.
function DiffusionStrip() {
  const { t } = useLab();
  const NOISE =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const tiles = [0, 1, 2, 3, 4, 5];
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {tiles.map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              position: "relative", width: 92, height: 92, overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.5)",
              background: "linear-gradient(135deg, #5E17EB 0%, #7A3BF0 45%, #FFEC00 100%)",
            }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: NOISE, opacity: (tiles.length - 1 - i) / (tiles.length - 1), mixBlendMode: "screen" }} />
            </div>
            {i < tiles.length - 1 && <span style={{ color: "var(--yuv-yellow)", fontWeight: 900 }}>→</span>}
          </div>
        ))}
      </div>
      <div className="mono" style={{ marginTop: 8, fontSize: 12, color: "#EDE7FF", display: "flex", justifyContent: "space-between", maxWidth: 640 }}>
        <span>{t("t = T · pure noise", "t = T · רעש טהור")}</span>
        <span>{t("t = 0 · image", "t = 0 · תמונה")}</span>
      </div>
    </div>
  );
}

// Schematic of LoRA's low-rank decomposition: the frozen weight grid W stays
// put; only the two skinny matrices B and A are trained.
function LoraVisual() {
  const { t } = useLab();
  const box = (label: string, w: number, h: number, filled: boolean) => (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: w, height: h, border: "2px solid rgba(255,255,255,0.6)",
        background: filled ? "rgba(255,236,0,0.85)" : "repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 6px, rgba(255,255,255,0.04) 6px 12px)",
      }} />
      <div className="mono" style={{ fontSize: 11, color: "#fff", marginTop: 6 }}>{label}</div>
    </div>
  );
  return (
    <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      {box(t("W · frozen", "W · קפוא"), 92, 92, false)}
      <span style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>+</span>
      {box("B · d×r", 26, 92, true)}
      <span style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>·</span>
      {box("A · r×k", 92, 26, true)}
      <div className="mono" style={{ color: "#EDE7FF", fontSize: 13, maxWidth: 240 }}>
        {t("Yellow = trained. Example d=k=4096, r=16 → ~131K params vs 16.7M (~0.8%).",
           "צהוב = מאומן. דוגמה d=k=4096, r=16 ← ~131K פרמטרים מול 16.7M (~0.8%).")}
      </div>
    </div>
  );
}

export function Academy() {
  return (
    <>
      <Lesson data={FOUNDATIONS} />
      <Lesson data={TOKENIZERS} />
      <Lesson data={LORA}><LoraVisual /></Lesson>
      <Lesson data={UNSLOTH} />
      <Lesson data={DIFFUSION}><DiffusionStrip /></Lesson>
      <Lesson data={AITOOLKIT} />
    </>
  );
}
