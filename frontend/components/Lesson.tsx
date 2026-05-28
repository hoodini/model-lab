"use client";

import { useLab } from "./providers";
import type { LessonData } from "@/lib/academy";

/* ───────────────────────────────────────────────────────────────────────────
   Lesson — a data-driven, level-aware, bilingual teaching section. Every block
   adapts its body to the reader's chosen level (Beginner/Intermediate/Advanced)
   and language. Fly High two-background rule: pass tone "content" (grey) or
   "act" (purple). Optional decision table for "when to use which".
─────────────────────────────────────────────────────────────────────────── */
export function Lesson({ data, children }: { data: LessonData; children?: React.ReactNode }) {
  const { t, lang, level } = useLab();
  const act = data.tone === "act";
  const fg = act ? "#fff" : "#000";
  const sub = act ? "#EDE7FF" : "inherit";

  return (
    <section
      id={data.id}
      className={act ? "act section" : "content section"}
      style={act ? { position: "relative", overflow: "hidden" } : { borderTop: "2px solid var(--yuv-grey-dark)" }}
    >
      <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
        <div className="eyebrow" style={{ color: act ? "var(--yuv-yellow)" : "var(--yuv-purple)" }}>
          {t(data.eyebrowEn, data.eyebrowHe)}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", marginTop: 8 }}>
          <span className="purple-bar" />
          <h2 className="display" style={{ fontSize: "clamp(28px,4.6vw,48px)", color: fg }}>
            {t(data.titleEn, data.titleHe)}
          </h2>
        </div>
        <p style={{ maxWidth: 780, marginTop: 14, fontSize: 17, lineHeight: 1.6, color: sub }}>
          {t(data.introEn, data.introHe)}
        </p>
        <p className="mono" style={{ marginTop: 8, fontSize: 12, opacity: 0.6, color: act ? "#fff" : "inherit" }}>
          {t("↑ Explanations below adapt to your level — switch Beginner / Intermediate / Advanced up top.",
             "↑ ההסברים למטה מתאימים את עצמם לרמה שלך — החלף מתחיל / בינוני / מתקדם למעלה.")}
        </p>

        {children}

        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {data.blocks.map((b) => (
            <div
              key={b.k}
              className={act ? "fx-reveal ride-card" : "card fx-reveal"}
              style={act ? { border: "2px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.05)", padding: 22, transition: "transform .2s ease, border-color .2s ease, background .2s ease" } : undefined}
            >
              {b.tagEn && (
                <div className="mono tag" style={{ color: act ? "var(--yuv-yellow)" : "var(--yuv-purple)" }}>
                  {t(b.tagEn, b.tagHe || b.tagEn)}
                </div>
              )}
              <div className="display" style={{ fontSize: 21, margin: "8px 0", color: fg, lineHeight: 1.08 }}>
                {t(b.titleEn, b.titleHe)}
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: sub }}>
                {t(b.body[level].en, b.body[level].he)}
              </p>
            </div>
          ))}
        </div>

        {data.decision && (
          <div className={act ? "" : "card"} style={{ marginTop: 24, overflowX: "auto", ...(act ? { border: "2px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.05)", padding: 22 } : {}) }}>
            <div className="mono tag" style={{ color: act ? "var(--yuv-yellow)" : "var(--yuv-purple)", marginBottom: 12 }}>
              {t("WHEN TO USE WHICH", "מתי להשתמש במה")}
            </div>
            <table className="mono" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: fg }}>
              <thead>
                <tr>
                  {[t("I want to…", "אני רוצה…"), t("Reach for…", "תשתמש ב…"), t("Why", "למה")].map((h) => (
                    <th key={h} style={{ textAlign: lang === "he" ? "right" : "left", padding: "8px 12px", borderBottom: `2px solid ${act ? "rgba(255,255,255,.4)" : "#000"}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.decision.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${act ? "rgba(255,255,255,.15)" : "var(--yuv-grey)"}` }}>{t(row.wantEn, row.wantHe)}</td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${act ? "rgba(255,255,255,.15)" : "var(--yuv-grey)"}`, color: act ? "var(--yuv-yellow)" : "var(--yuv-purple)", fontWeight: 700 }}>{t(row.useEn, row.useHe)}</td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${act ? "rgba(255,255,255,.15)" : "var(--yuv-grey)"}`, opacity: 0.85 }}>{t(row.whyEn, row.whyHe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
