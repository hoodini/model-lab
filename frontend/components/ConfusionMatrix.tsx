"use client";

import type { Evals } from "@/lib/api";

// Real confusion matrix: rows = the TRUE class, columns = the class the model
// PREDICTED. Diagonal = correct (purple, scaled by count). Off-diagonal non-zero
// cells = specific mistakes, highlighted in yellow so your eye lands on exactly
// where the model confuses one class for another. Shared by every lab.
export function ConfusionMatrix({
  evals, labelName, t, lang,
}: {
  evals: Evals;
  labelName: (id: string) => string;
  t: (en: string, he: string) => string;
  lang: string;
}) {
  const { confusion, labels } = evals;
  const max = Math.max(1, ...confusion.flat());
  const cell = 56;
  return (
    <div className="card" style={{ overflowX: "auto" }}>
      <div className="mono tag" style={{ color: "var(--yuv-purple)", marginBottom: 12 }}>
        {t("CONFUSION MATRIX · true (row) → predicted (column)", "מטריצת בלבול · אמת (שורה) → ניבוי (עמודה)")}
      </div>
      <table style={{ borderCollapse: "collapse", margin: "0 auto" }}>
        <thead>
          <tr>
            <th />
            {labels.map((l) => (
              <th key={l} className="mono" style={{ fontSize: 11, fontWeight: 700, padding: "4px 6px", maxWidth: cell, lineHeight: 1.1 }}>
                {labelName(l)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {confusion.map((row, ri) => (
            <tr key={ri}>
              <th className="mono" style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", textAlign: lang === "he" ? "left" : "right", whiteSpace: "nowrap" }}>
                {labelName(labels[ri])}
              </th>
              {row.map((v, ci) => {
                const diag = ri === ci;
                const inten = v / max;
                const bg = v === 0
                  ? "var(--yuv-grey)"
                  : diag
                  ? `rgba(94,23,235,${0.18 + 0.82 * inten})`
                  : `rgba(255,236,0,${0.30 + 0.70 * inten})`;
                return (
                  <td key={ci} style={{
                    width: cell, height: cell, textAlign: "center", verticalAlign: "middle",
                    border: "1.5px solid #000", background: bg,
                    color: diag && inten > 0.5 ? "#fff" : "#000",
                    fontWeight: 700, fontSize: 16,
                  }} className="mono">
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 18, marginTop: 12, flexWrap: "wrap", fontSize: 12 }} className="mono">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, background: "rgba(94,23,235,.9)", border: "1.5px solid #000", display: "inline-block" }} />
          {t("correct (on the diagonal)", "נכון (על האלכסון)")}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, background: "rgba(255,236,0,.9)", border: "1.5px solid #000", display: "inline-block" }} />
          {t("mistake (off-diagonal)", "טעות (מחוץ לאלכסון)")}
        </span>
      </div>
    </div>
  );
}
