"use client";

import { useLab } from "./providers";

// The 5 universal steps of supervised training — the mental model the whole
// app reinforces. Purple "act" section to break up the grey content flow.
const STEPS = [
  { n: "01", en: "Tokenize", he: "טוקניזציה", den: "Turn text into numbers the model can read.", dhe: "הופכים טקסט למספרים שהמודל יכול לקרוא." },
  { n: "02", en: "Model", he: "מודל", den: "Load a pretrained brain + a fresh head for our task.", dhe: "טוענים מוח מאומן-מראש + ראש חדש למשימה שלנו." },
  { n: "03", en: "Configure", he: "כיוונון", den: "Set the knobs: learning rate, epochs, batch size.", dhe: "מכוונים: קצב למידה, אפוקים, גודל אצווה." },
  { n: "04", en: "Train", he: "אימון", den: "Predict → measure error → nudge weights. Repeat.", dhe: "ניבוי → מדידת טעות → תיקון משקלים. שוב ושוב." },
  { n: "05", en: "Evaluate", he: "הערכה", den: "Grade it on prompts it never saw.", dhe: "בוחנים אותו על פרומפטים שלא ראה מעולם." },
];

export function HowItWorks() {
  const { t, lang } = useLab();
  return (
    <section id="how" className="act section">
      <div className="wrap">
        <div className="eyebrow" style={{ color: "var(--yuv-yellow)" }}>{t("THE MENTAL MODEL", "המודל המנטלי")}</div>
        <h2 className="display" style={{ fontSize: "clamp(32px,5vw,64px)", color: "#fff", maxWidth: 820, marginTop: 10 }}>
          {t("Every training job is the ", "כל אימון הוא אותם ")}
          <span className="hl">{t("same 5 steps", "5 שלבים")}</span>.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16, marginTop: 40 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ borderTop: "3px solid var(--yuv-yellow)", paddingTop: 14 }}>
              <div className="display" style={{ fontSize: 34, color: "var(--yuv-yellow)" }}>{s.n}</div>
              <div className="display" style={{ fontSize: 22, color: "#fff", marginTop: 4 }}>{lang === "he" ? s.he : s.en}</div>
              <p style={{ color: "#EDE7FF", fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>{lang === "he" ? s.dhe : s.den}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
