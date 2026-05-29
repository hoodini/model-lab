"use client";

import { useLab } from "./providers";

/* Small inline visuals for the foundations lessons (content sections, grey). */

const cell = (bg: string, txt = "", color = "#fff"): React.CSSProperties => ({
  width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
  background: bg, color, border: "1.5px solid #000", fontSize: 11, fontFamily: "var(--font-mono)",
});

// scalar → vector → matrix → tensor, the ladder of shapes.
export function ShapeViz() {
  const { t } = useLab();
  const P = "var(--yuv-purple)";
  const Item = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "inline-block" }}>{children}</div>
      <div className="mono" style={{ fontSize: 11, marginTop: 8, opacity: 0.75 }}>{label}</div>
    </div>
  );
  const row = (n: number) => <div style={{ display: "flex", gap: 3 }}>{Array.from({ length: n }).map((_, i) => <span key={i} style={cell(P)} />)}</div>;
  const grid = (r: number, c: number) => <div style={{ display: "grid", gridTemplateRows: `repeat(${r}, 26px)`, gap: 3 }}>{Array.from({ length: r }).map((_, i) => <div key={i} style={{ display: "flex", gap: 3 }}>{Array.from({ length: c }).map((_, j) => <span key={j} style={cell(P)} />)}</div>)}</div>;
  return (
    <div style={{ marginTop: 24, display: "flex", gap: 30, flexWrap: "wrap", alignItems: "flex-end" }}>
      <Item label={t("scalar · 0-D", "סקלר · 0-D")}><span style={cell("var(--yuv-yellow)", "7", "#000")} /></Item>
      <Item label={t("vector · 1-D", "וקטור · 1-D")}>{row(4)}</Item>
      <Item label={t("matrix · 2-D", "מטריצה · 2-D")}>{grid(3, 4)}</Item>
      <Item label={t("tensor · n-D", "טנזור · n-D")}>
        <div style={{ position: "relative", width: 92, height: 92 }}>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ position: "absolute", top: k * 10, insetInlineStart: k * 10 }}>{grid(3, 3)}</div>
          ))}
        </div>
      </Item>
    </div>
  );
}

// one category → a one-hot vector (a single 1, the rest 0).
export function OneHotViz() {
  const { t, lang } = useLab();
  const cats = [
    { en: "code", he: "קוד" }, { en: "chat", he: "שיחה" }, { en: "reasoning", he: "היגיון" }, { en: "creative", he: "יצירתי" },
  ];
  const hot = 2; // "reasoning" is the active class
  return (
    <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
      {cats.map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="mono" style={{ width: 90, fontSize: 13, textAlign: lang === "he" ? "right" : "left", fontWeight: i === hot ? 700 : 400, color: i === hot ? "var(--yuv-purple)" : "#000" }}>{c[lang]}</span>
          <span className="mono" style={{ opacity: 0.5 }}>→</span>
          <div style={{ display: "flex", gap: 4 }}>
            {cats.map((_, j) => (
              <span key={j} style={cell(i === hot && j === i ? "var(--yuv-yellow)" : "#fff", i === hot && j === i ? "1" : "0", i === hot && j === i ? "#000" : "#999")} />
            ))}
          </div>
        </div>
      ))}
      <p className="mono" style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
        {t("Each category becomes a row of 0s with a single 1 — no fake ordering between classes.",
           "כל קטגוריה הופכת לשורת אפסים עם 1 בודד — בלי סדר מלאכותי בין המחלקות.")}
      </p>
    </div>
  );
}

// softmax (one winner, sums to 100%) vs sigmoid-per-label (each independent).
export function SoftmaxVsSigmoid() {
  const { t } = useLab();
  const soft = [{ l: "A", v: 0.71 }, { l: "B", v: 0.2 }, { l: "C", v: 0.09 }];
  const sig = [{ l: "A", v: 0.92 }, { l: "B", v: 0.78 }, { l: "C", v: 0.12 }];
  const Bars = ({ data, title, note }: { data: { l: string; v: number }[]; title: string; note: string }) => (
    <div className="card" style={{ flex: 1, minWidth: 220 }}>
      <div className="mono tag" style={{ color: "var(--yuv-purple)" }}>{title}</div>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {data.map((d) => (
          <div key={d.l}>
            <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>{d.l}</span><span>{Math.round(d.v * 100)}%</span></div>
            <div style={{ height: 12, background: "var(--yuv-grey)", border: "1.5px solid #000" }}>
              <div style={{ width: `${d.v * 100}%`, height: "100%", background: d.v >= 0.5 ? "var(--yuv-yellow)" : "var(--yuv-purple)" }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mono" style={{ fontSize: 11.5, opacity: 0.7, marginTop: 10 }}>{note}</p>
    </div>
  );
  return (
    <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
      <Bars data={soft} title={t("SOFTMAX · multi-class", "SOFTMAX · רב-מחלקתי")} note={t("Sums to 100%. Exactly one winner.", "מסתכם ב-100%. מנצח אחד בדיוק.")} />
      <Bars data={sig} title={t("SIGMOID per label · multi-label", "SIGMOID לכל תווית · רב-תווית")} note={t("Each label independent — many can be true.", "כל תווית עצמאית — רבות יכולות להיות נכונות.")} />
    </div>
  );
}
