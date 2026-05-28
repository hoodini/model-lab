"use client";

import { useLab } from "./providers";

/* ───────────────────────────────────────────────────────────────────────────
   Coming Attractions — the "next stops on the ride". Honest FOMO: these are
   real projects on the roadmap, built the same way as the router (real models,
   full transparency, your hardware). Clearly labelled NEXT STOP so nothing
   pretends to work yet. Purple act section = the finale drama.
─────────────────────────────────────────────────────────────────────────── */

type Ride = { en: string; he: string; descEn: string; descHe: string; chipEn: string; chipHe: string };

const RIDES: Ride[] = [
  {
    en: "Write in anyone's voice",
    he: "כתיבה בקול של כל אחד",
    descEn: "Fine-tune a text generator on a style and watch it write in that voice — the same training loop, a generative head instead of a classifier.",
    descHe: "כיוונון מחולל טקסט על סגנון, ולראות אותו כותב באותו קול — אותו לולאת אימון, ראש גנרטיבי במקום מסווג.",
    chipEn: "GENERATION", chipHe: "ג'נרציה",
  },
  {
    en: "Fine-tune giants with LoRA",
    he: "כיוונון ענקים עם LoRA",
    descEn: "Train tiny adapters (LoRA / QLoRA) to bend huge models on a single GPU — most of the weights frozen, a few million trained.",
    descHe: "אימון אדפטרים זעירים (LoRA / QLoRA) כדי לכופף מודלים ענקיים על GPU יחיד — רוב המשקלים קפואים, כמה מיליונים מתאמנים.",
    chipEn: "EFFICIENT", chipHe: "יעיל",
  },
  {
    en: "Text becomes pixels",
    he: "טקסט הופך לפיקסלים",
    descEn: "Image generation, demystified: how diffusion turns noise into a picture — run it and watch each denoising step.",
    descHe: "יצירת תמונות, ללא מסתורין: איך דיפוזיה הופכת רעש לתמונה — הרצה וצפייה בכל צעד ניקוי.",
    chipEn: "DIFFUSION", chipHe: "דיפוזיה",
  },
  {
    en: "Generative models & GPT-2",
    he: "מודלים גנרטיביים ו-GPT-2",
    descEn: "Add decoder models to the training list — and finally see why routing uses an encoder while writing needs a decoder.",
    descHe: "הוספת מודלי דקודר לרשימת האימון — וסוף סוף להבין למה ניתוב משתמש באנקודר בעוד כתיבה דורשת דקודר.",
    chipEn: "DECODERS", chipHe: "דקודרים",
  },
];

export function ComingSoon() {
  const { t, lang } = useLab();
  return (
    <section className="act" style={{ position: "relative", overflow: "hidden", padding: "96px 0" }}>
      <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
        <div className="eyebrow" style={{ color: "var(--yuv-yellow)" }}>
          {t("THE RIDE DOESN'T STOP HERE", "הנסיעה לא נעצרת כאן")}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", marginTop: 10 }}>
          <span className="purple-bar" />
          <h2 className="display" style={{ fontSize: "clamp(30px,5vw,56px)", color: "#fff" }}>
            {t("Next stops on the track", "התחנות הבאות במסלול")}
          </h2>
        </div>
        <p style={{ maxWidth: 680, marginTop: 14, fontSize: 17, lineHeight: 1.6, color: "#EDE7FF" }}>
          {t(
            "Projects 01 (router) and 02 (sentiment) are live above. These are coming next — each one a real model you train yourself, explained at every level, running on your own hardware. Same promise: nothing hidden.",
            "פרויקטים 01 (ראוטר) ו-02 (סנטימנט) פעילים למעלה. אלו מגיעים בהמשך — כל אחד מודל אמיתי שאתם מאמנים בעצמכם, מוסבר בכל רמה, רץ על החומרה שלכם. אותה הבטחה: שום דבר לא מוסתר."
          )}
        </p>

        <div style={{
          marginTop: 36, display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18,
        }}>
          {RIDES.map((r, i) => (
            <div key={i} className="fx-reveal ride-card" style={{
              border: "2px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.05)",
              padding: 22, display: "flex", flexDirection: "column", gap: 10,
              transition: "transform .2s ease, border-color .2s ease, background .2s ease",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{
                  fontSize: 11, color: "#000", background: "var(--yuv-yellow)", padding: "3px 9px",
                  letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700,
                }}>
                  {t("NEXT STOP", "תחנה הבאה")} {String(i + 3).padStart(2, "0")}
                </span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--yuv-yellow)", letterSpacing: ".08em" }}>
                  {lang === "he" ? r.chipHe : r.chipEn}
                </span>
              </div>
              <div className="display" style={{ fontSize: 23, color: "#fff", lineHeight: 1.05 }}>
                {lang === "he" ? r.he : r.en}
              </div>
              <p style={{ fontSize: 14, color: "#EDE7FF", lineHeight: 1.55 }}>
                {lang === "he" ? r.descHe : r.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
