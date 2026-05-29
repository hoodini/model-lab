"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLab } from "./providers";

/* ───────────────────────────────────────────────────────────────────────────
   TrainingViz — an animated, looping picture of a neural net LEARNING:
   forward pass (signal fires left→right) → a loss number drops → backprop
   (gradients flash right→left) → weights nudge → repeat. The loss arc resets
   so the "training story" loops. Honors prefers-reduced-motion.
─────────────────────────────────────────────────────────────────────────── */

const LAYERS = [4, 6, 6, 3];
const W = 640, H = 300, PADX = 64, PADY = 34;

function layerX(i: number) { return PADX + (i * (W - 2 * PADX)) / (LAYERS.length - 1); }
function nodeY(li: number, ni: number) {
  const n = LAYERS[li];
  if (n === 1) return H / 2;
  const gap = (H - 2 * PADY) / (n - 1);
  return PADY + ni * gap;
}

export function TrainingViz() {
  const { t } = useLab();
  const root = useRef<SVGSVGElement>(null);
  const [loss, setLoss] = useState(1.84);
  const [epoch, setEpoch] = useState(0);

  // edges: connect every node in layer li to every node in layer li+1
  const edges: { x1: number; y1: number; x2: number; y2: number; to: number }[] = [];
  for (let li = 0; li < LAYERS.length - 1; li++) {
    for (let a = 0; a < LAYERS[li]; a++) {
      for (let b = 0; b < LAYERS[li + 1]; b++) {
        edges.push({ x1: layerX(li), y1: nodeY(li, a), x2: layerX(li + 1), y2: nodeY(li + 1, b), to: li + 1 });
      }
    }
  }

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;
    let lossVal = 1.84;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.35 });

      // FORWARD PASS — fire nodes + brighten incoming edges, layer by layer.
      LAYERS.forEach((_, li) => {
        const at = li * 0.22;
        if (li > 0) tl.to(`.tv-edge[data-to="${li}"]`, { stroke: "#FFEC00", strokeOpacity: 0.85, duration: 0.2 }, at);
        tl.to(`.tv-node[data-l="${li}"]`, { attr: { fill: "#FFEC00", r: 9 }, duration: 0.18, stagger: 0.03 }, at + 0.02);
      });

      // settle back to resting purple
      tl.to(".tv-node", { attr: { fill: "#5E17EB", r: 7 }, duration: 0.28 }, ">+0.1");
      tl.to(".tv-edge", { stroke: "#ffffff", strokeOpacity: 0.22, duration: 0.28 }, "<");

      // LOSS DROPS — one optimisation step happened.
      tl.call(() => {
        lossVal = lossVal * (0.78 + Math.random() * 0.13);
        if (lossVal < 0.12) lossVal = 1.6 + Math.random() * 0.3; // loop the story
        setLoss(lossVal);
        setEpoch((e) => (lossVal > 1.5 ? 1 : e + 1));
      });

      // BACKWARD PASS — gradients flash right→left, weights "update".
      for (let li = LAYERS.length - 1; li >= 1; li--) {
        tl.to(`.tv-edge[data-to="${li}"]`, { stroke: "#FFEC00", strokeOpacity: 0.7, duration: 0.12, yoyo: true, repeat: 1 }, ">");
      }
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ position: "relative", border: "2px solid rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.18)" }}>
        <svg ref={root} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} aria-hidden>
          {edges.map((e, i) => (
            <line key={i} className="tv-edge" data-to={e.to} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#ffffff" strokeOpacity={0.22} strokeWidth={1} />
          ))}
          {LAYERS.map((n, li) =>
            Array.from({ length: n }).map((_, ni) => (
              <circle key={`${li}-${ni}`} className="tv-node" data-l={li} cx={layerX(li)} cy={nodeY(li, ni)} r={7} fill="#5E17EB" stroke="#fff" strokeWidth={1.5} />
            ))
          )}
          {/* layer labels */}
          {["input", "hidden", "hidden", "output"].map((lab, li) => (
            <text key={li} x={layerX(li)} y={H - 8} fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fill="#EDE7FF" fillOpacity={0.7}>
              {lab}
            </text>
          ))}
        </svg>

        {/* live readout */}
        <div className="mono" style={{ position: "absolute", top: 10, insetInlineEnd: 12, textAlign: "end", color: "#fff" }}>
          <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: ".08em" }}>{t("LOSS", "LOSS")}</div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 900, fontSize: 30, color: "var(--yuv-yellow)", lineHeight: 1 }}>{loss.toFixed(2)}</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{t("epoch", "אפוק")} {epoch}</div>
        </div>
      </div>
      <div className="mono" style={{ marginTop: 8, fontSize: 12, color: "#EDE7FF", display: "flex", gap: 18, flexWrap: "wrap" }}>
        <span><span style={{ color: "var(--yuv-yellow)" }}>→</span> {t("forward: signal fires through the layers", "קדימה: האות נורה דרך השכבות")}</span>
        <span><span style={{ color: "var(--yuv-yellow)" }}>←</span> {t("backward: gradients update the weights", "אחורה: גרדיאנטים מעדכנים את המשקלים")}</span>
      </div>
    </div>
  );
}
