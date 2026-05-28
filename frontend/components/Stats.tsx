"use client";

import { useEffect, useState } from "react";
import { useLab } from "./providers";
import { CounterUp } from "./Counter";
import { CONCEPTS } from "@/lib/content";
import { getDataset, getHealth } from "@/lib/api";

/* ───────────────────────────────────────────────────────────────────────────
   Momentum band — real numbers, counted up on entry. This is honest FOMO: it
   says "look how much is actually here", not a fake scarcity timer. Grey
   content section (Fly High two-background rule). One Anton element (the
   headline); the big stat numbers are Inter 900 so the surface stays calm.
─────────────────────────────────────────────────────────────────────────── */

export function Stats() {
  const { t, lang } = useLab();
  const conceptCount = Object.keys(CONCEPTS).length;
  const [examples, setExamples] = useState(40);
  const [hw, setHw] = useState<{ device?: string; device_name?: string } | null>(null);

  useEffect(() => {
    getDataset().then((d) => d?.rows?.length && setExamples(d.rows.length)).catch(() => {});
    getHealth().then(setHw).catch(() => {});
  }, []);

  const numStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "clamp(40px,7vw,72px)",
    lineHeight: 1, color: "var(--yuv-purple)", display: "block",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, marginTop: 8, opacity: 0.75, lineHeight: 1.35,
  };

  const tiles: { num: React.ReactNode; label: string }[] = [
    {
      num: <CounterUp to={conceptCount} suffix="+" style={numStyle} />,
      label: t("ML concepts — every one explained at 3 levels", "מושגי ML — כל אחד מוסבר ב-3 רמות"),
    },
    {
      num: <CounterUp to={768} style={numStyle} />,
      label: t("numbers in each token's meaning vector", "מספרים בכל וקטור משמעות של טוקן"),
    },
    {
      num: <CounterUp to={12} style={numStyle} />,
      label: t("attention heads reading your prompt at once", "ראשי קשב שקוראים את הפרומפט שלך בו-זמנית"),
    },
    {
      num: <CounterUp to={examples} style={numStyle} />,
      label: t("labelled examples you can edit and train on", "דוגמאות מתויגות שאפשר לערוך ולאמן עליהן"),
    },
  ];

  return (
    <section className="content" style={{ padding: "72px 0", borderTop: "2px solid var(--yuv-grey-dark)" }}>
      <div className="wrap">
        <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
          <span className="purple-bar" />
          <h2 className="display" style={{ fontSize: "clamp(26px,4vw,42px)" }}>
            {t("The house that has everything", "הבית שיש בו הכול")}
          </h2>
        </div>

        <div className="fx-reveal" style={{
          marginTop: 32, display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24,
        }}>
          {tiles.map((tile, i) => (
            <div key={i} style={{ borderInlineStart: "3px solid var(--yuv-yellow)", paddingInlineStart: 16 }}>
              {tile.num}
              <div className="mono" style={labelStyle}>{tile.label}</div>
            </div>
          ))}
        </div>

        {hw?.device && (
          <div className="mono fx-reveal" style={{
            marginTop: 28, display: "inline-flex", alignItems: "center", gap: 9,
            fontSize: 13, padding: "8px 16px", border: "2px solid var(--yuv-black)",
            background: hw.device === "cpu" ? "#fff" : "var(--yuv-yellow)", borderRadius: 999,
          }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: "var(--yuv-purple)" }} />
            {t("Right now, running on", "כרגע, רץ על")}: <strong>{hw.device_name}</strong>
          </div>
        )}
      </div>
    </section>
  );
}
