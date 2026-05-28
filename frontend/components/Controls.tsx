"use client";

import { useLab } from "./providers";
import type { Level } from "@/lib/content";

const LEVELS: { id: Level; en: string; he: string }[] = [
  { id: "beginner", en: "Beginner", he: "מתחיל" },
  { id: "intermediate", en: "Intermediate", he: "בינוני" },
  { id: "advanced", en: "Advanced", he: "מתקדם" },
];

// Fixed top bar: brand + level switcher + language toggle.
// The level switcher rewrites every explanation in the app on the fly.
export function Controls() {
  const { lang, level, setLang, setLevel, t } = useLab();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--yuv-black)",
        color: "#fff",
        borderBottom: "3px solid var(--yuv-yellow)",
      }}
    >
      <div
        className="wrap topbar-inner"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, gap: 16 }}
      >
        <div className="display topbar-brand" style={{ fontSize: 22, color: "#fff" }}>
          MODEL<span style={{ color: "var(--yuv-yellow)" }}>LAB</span>
        </div>

        <div className="topbar-group">
          {/* Level switcher */}
          <div className="level-switch">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className="mono"
                style={{
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  background: level === l.id ? "var(--yuv-yellow)" : "transparent",
                  color: level === l.id ? "#000" : "#fff",
                }}
              >
                {l[lang]}
              </button>
            ))}
          </div>

          {/* Language toggle (flips the whole page to RTL Hebrew) */}
          <button
            onClick={() => setLang(lang === "en" ? "he" : "en")}
            className="btn btn-pill lang-toggle"
            style={{ background: "var(--yuv-purple)", borderColor: "var(--yuv-purple)", padding: "7px 16px" }}
          >
            {t("עברית", "English")}
          </button>
        </div>
      </div>
    </header>
  );
}
