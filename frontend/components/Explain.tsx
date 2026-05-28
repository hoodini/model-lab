"use client";

import { CONCEPTS } from "@/lib/content";
import { useLab } from "./providers";

const LEVEL_LABEL = {
  beginner: { en: "Beginner", he: "מתחיל" },
  intermediate: { en: "Intermediate", he: "בינוני" },
  advanced: { en: "Advanced", he: "מתקדם" },
};

// Renders one concept at the user's current level + language. The whole app's
// "no term left unexplained" promise lives here: wherever a concept appears in
// a control, we drop an <Explain> next to it.
export function Explain({ concept }: { concept: keyof typeof CONCEPTS }) {
  const { lang, level } = useLab();
  const c = CONCEPTS[concept];
  if (!c) return null;
  return (
    <div
      style={{
        borderInlineStart: "4px solid var(--yuv-purple)",
        background: "#fff",
        padding: "14px 18px",
        marginTop: 10,
      }}
    >
      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--yuv-purple-dark)", marginBottom: 6 }}
      >
        {c.title[lang]} · {LEVEL_LABEL[level][lang]}
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.6 }}>{c.levels[level][lang]}</p>
    </div>
  );
}
