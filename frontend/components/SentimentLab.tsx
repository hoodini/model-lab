"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLab } from "./providers";
import { Explain } from "./Explain";
import { LossChart, type Point } from "./LossChart";
import { CounterUp } from "./Counter";
import { fireConfetti } from "./Confetti";
import { ConfusionMatrix } from "./ConfusionMatrix";
import * as api from "@/lib/api";
import type { Label, Row } from "@/lib/api";

const TASK = "sentiment";
const CLASS_COLORS: Record<string, string> = {
  positive: "#5E17EB", negative: "#000000", neutral: "#7A7A7A",
};

/* ───────────────────────────────────────────────────────────────────────────
   PROJECT 02 — Sentiment classifier. Same machine as the router: only the data
   and the labels change. Real training loop, real evals, real inference, real
   export — all task-scoped to "sentiment" so it never collides with the router.
─────────────────────────────────────────────────────────────────────────── */
export function SentimentLab() {
  const { t, lang } = useLab();

  const [labels, setLabels] = useState<Label[]>([]);
  const [rows, setRows] = useState<Row[]>([]);

  const [epochs, setEpochs] = useState(10);
  const [lr, setLr] = useState(5e-5);
  const [testSize, setTestSize] = useState(0.25);

  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [points, setPoints] = useState<Point[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState({ step: 0, total: 0 });
  const [metrics, setMetrics] = useState<{ acc?: number; f1?: number }>({});
  const [evals, setEvals] = useState<api.Evals | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const [inferText, setInferText] = useState("");
  const [inferRes, setInferRes] = useState<api.InferResult | null>(null);

  const [hfToken, setHfToken] = useState("");
  const [hfRepo, setHfRepo] = useState("");
  const [hfPrivate, setHfPrivate] = useState(true);
  const [hfBusy, setHfBusy] = useState(false);
  const [hfRes, setHfRes] = useState<api.HubResult | null>(null);

  const [hw, setHw] = useState<{ device?: string; device_name?: string; dtype?: string; mixed_precision?: boolean } | null>(null);
  const hasModel = status === "done" || !!evals;

  const labelName = (id: string) => labels.find((x) => x.id === id)?.[lang] ?? id;

  useEffect(() => {
    api.getDataset(TASK).then((d) => { setLabels(d.labels); setRows(d.rows); });
    api.getHealth().then(setHw).catch(() => {});
    api.getEvals(TASK).then((e) => { if (!e.error) setEvals(e); }).catch(() => {});
  }, []);

  useEffect(() => () => esRef.current?.close(), []);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    rows.forEach((r) => { m[r.label] = (m[r.label] || 0) + 1; });
    return m;
  }, [rows]);

  async function train() {
    setStatus("running");
    setPoints([]); setLogs([]); setMetrics({}); setProgress({ step: 0, total: 0 });
    const { job_id } = await api.startTraining({
      rows, task: TASK, base_model: "distilbert-base-multilingual-cased",
      epochs, lr, batch_size: 8, test_size: testSize,
    });
    esRef.current = api.streamTraining(job_id, (e) => {
      if (e.type === "device") setHw(e);
      if (e.type === "start") setProgress({ step: 0, total: e.total_steps });
      if (e.type === "info") setLogs((L) => [...L, e.message]);
      if (e.type === "log") {
        setProgress((p) => ({ step: e.step, total: p.total }));
        setPoints((pts) => {
          const next = [...pts];
          if (e.loss != null) next.push({ step: e.step, loss: e.loss });
          if (e.eval_loss != null) next.push({ step: e.step, evalLoss: e.eval_loss });
          return next;
        });
        if (e.eval_accuracy != null) setMetrics({ acc: e.eval_accuracy, f1: e.eval_f1 });
      }
      if (e.type === "eval" || e.type === "done") {
        const m = e.metrics || {};
        setMetrics({ acc: m.eval_accuracy, f1: m.eval_f1 });
      }
      if (e.type === "evals") setEvals(e);
      if (e.type === "done") {
        setStatus("done"); esRef.current?.close();
        fireConfetti({ count: 160 });
        setTimeout(() => fireConfetti({ count: 90, originY: 0.45 }), 350);
      }
      if (e.type === "error") { setStatus("error"); setLogs((L) => [...L, "ERROR: " + e.message]); esRef.current?.close(); }
    });
  }

  async function doInfer() {
    if (!inferText.trim()) return;
    setInferRes(await api.infer(inferText, TASK));
  }

  async function doHubExport() {
    if (!hfToken.trim() || !hfRepo.trim()) return;
    setHfBusy(true); setHfRes(null);
    try { setHfRes(await api.exportToHub(hfToken.trim(), hfRepo.trim(), hfPrivate, TASK)); }
    catch (e: any) { setHfRes({ error: String(e?.message || e) }); }
    finally { setHfBusy(false); }
  }

  const pct = progress.total ? Math.min(100, (progress.step / progress.total) * 100) : 0;

  const H = (en: string, he: string) => (
    <h3 className="display" style={{ fontSize: 26, display: "flex", alignItems: "stretch", gap: 12, margin: "8px 0 4px" }}>
      <span className="purple-bar" /> {t(en, he)}
    </h3>
  );

  return (
    <section id="sentiment" className="content section" style={{ borderTop: "2px solid var(--yuv-grey-dark)" }}>
      <div className="wrap" style={{ display: "grid", gap: 56 }}>

        <div>
          <div className="eyebrow" style={{ color: "var(--yuv-purple)" }}>{t("PROJECT 02", "פרויקט 02")}</div>
          {H("The sentiment classifier", "מסווג הסנטימנט")}
          <Explain concept="sentiment" />
          <p style={{ marginTop: 12, maxWidth: 720 }}>
            {t(
              "Exact same machine as the router — we only swapped the dataset and the labels. That's the lesson: once you can train one classifier, you can train any classifier.",
              "אותה מכונה בדיוק כמו הראוטר — רק החלפנו את הדאטה ואת התוויות. זה השיעור: ברגע שאתה יודע לאמן מסווג אחד, אתה יודע לאמן כל מסווג."
            )}
          </p>
        </div>

        {/* classes */}
        <div>
          {H("Step 0 · the classes", "שלב 0 · המחלקות")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14, marginTop: 8 }}>
            {labels.map((l) => (
              <div key={l.id} className="card" style={{ borderColor: CLASS_COLORS[l.id] || "#000" }}>
                <div className="mono tag" style={{ color: CLASS_COLORS[l.id] || "#000" }}>{l.id}</div>
                <div className="display" style={{ fontSize: 22, marginTop: 8 }}>{l[lang]}</div>
                <div className="mono" style={{ fontSize: 12, opacity: .7, marginTop: 6 }}>→ {l.route_to}</div>
                <p style={{ fontSize: 13, marginTop: 8 }}>{l.why}</p>
                <div className="mono" style={{ fontSize: 12, marginTop: 10, color: "var(--yuv-purple)" }}>
                  {counts[l.id] || 0} {t("examples", "דוגמאות")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* train */}
        <div>
          {H("Step 1 · train it", "שלב 1 · אמן אותו")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, margin: "8px 0 16px" }}>
            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Epochs", "אפוקים")}: {epochs}</label>
              <input type="range" min={1} max={15} value={epochs} onChange={(e) => setEpochs(+e.target.value)} />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Learning rate", "קצב למידה")}</label>
              <select value={lr} onChange={(e) => setLr(+e.target.value)}>
                <option value={2e-5}>2e-5 ({t("gentle", "עדין")})</option>
                <option value={5e-5}>5e-5 ({t("standard", "סטנדרטי")})</option>
                <option value={1e-4}>1e-4 ({t("aggressive", "אגרסיבי")})</option>
              </select>
            </div>
            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Test split", "חלוקת מבחן")}: {Math.round(testSize * 100)}%</label>
              <input type="range" min={0.1} max={0.4} step={0.05} value={testSize} onChange={(e) => setTestSize(+e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "8px 0 16px", flexWrap: "wrap" }}>
            <button className="btn btn-yellow" onClick={train} disabled={status === "running" || rows.length === 0}>
              {status === "running" ? t("Training…", "מתאמן…") : t("▶ Train the classifier", "▶ אמן את המסווג")}
            </button>
            <div style={{ flex: 1, minWidth: 200, height: 14, background: "#fff", border: "2px solid #000" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "var(--yuv-purple)", transition: "width .2s" }} />
            </div>
            <span className="mono" style={{ fontSize: 13 }}>{progress.step}/{progress.total || "?"}</span>
          </div>

          {hw?.device && (
            <div className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, padding: "6px 12px", border: "2px solid #000", background: hw.device === "cpu" ? "#fff" : "var(--yuv-yellow)", marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--yuv-purple)" }} />
              {t("Auto-detected compute", "חומרה שזוהתה אוטומטית")}: <strong>{hw.device_name}</strong>
            </div>
          )}

          {status === "done" && metrics.acc != null && (
            <div className="act fx-reveal" style={{
              background: "var(--yuv-purple)", color: "#fff", border: "3px solid var(--yuv-yellow)",
              padding: "22px 24px", margin: "4px 0 18px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
            }}>
              <div>
                <div className="mono" style={{ color: "var(--yuv-yellow)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>
                  {t("✈ Landed — your classifier is trained", "✈ נחתנו — המסווג שלך מאומן")}
                </div>
                <div className="display" style={{ fontSize: "clamp(26px,4vw,40px)", marginTop: 4 }}>
                  {t("IT CAN READ SENTIMENT NOW", "הוא יודע לקרוא רגש עכשיו")}
                </div>
              </div>
              <div style={{ marginInlineStart: "auto", textAlign: "center" }}>
                <CounterUp to={(metrics.acc ?? 0) * 100} decimals={0} suffix="%" replayKey={metrics.acc}
                  style={{ fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "clamp(48px,9vw,88px)", lineHeight: 1, color: "var(--yuv-yellow)", display: "block" }} />
                <div className="mono" style={{ fontSize: 12, opacity: .8, marginTop: 4 }}>{t("accuracy on held-out text", "דיוק על טקסט שהוחזק")}</div>
              </div>
            </div>
          )}

          <div className="train-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 18 }}>
            <LossChart points={points} />
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Stat label={t("Accuracy", "דיוק")} value={metrics.acc} />
                <Stat label="F1" value={metrics.f1} />
              </div>
              <div className="card" style={{ marginTop: 12, height: 150, overflow: "auto", background: "#000", color: "#FFEC00", borderColor: "#000" }}>
                <div className="mono" style={{ fontSize: 12, lineHeight: 1.7 }}>
                  {logs.length === 0 ? t("// training log will stream here", "// יומן האימון יזרום לכאן") : logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* evals */}
        <div>
          {H("Step 2 · evals", "שלב 2 · הערכה")}
          {!evals ? (
            <p style={{ marginTop: 8, opacity: .8 }}>
              {t("Train above — the confusion matrix and per-class scores appear here, on text the model never saw.",
                 "אמן למעלה — מטריצת הבלבול והציונים לכל מחלקה יופיעו כאן, על טקסט שהמודל לא ראה.")}
            </p>
          ) : (
            <div style={{ marginTop: 10, display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 10 }}>
                <Stat label={t("Accuracy", "דיוק")} value={evals.accuracy} />
                <Stat label={t("Macro F1", "מאקרו F1")} value={evals.macro_f1} />
                <Stat label={t("Weighted F1", "F1 משוקלל")} value={evals.weighted_f1} />
                <div className="card" style={{ textAlign: "center", padding: 16 }}>
                  <div className="display" style={{ fontSize: 40, color: "var(--yuv-purple)" }}>{evals.n_eval}</div>
                  <div className="mono" style={{ fontSize: 12, opacity: .7 }}>{t("held-out texts", "טקסטים שהוחזקו")}</div>
                </div>
              </div>
              <ConfusionMatrix evals={evals} labelName={labelName} t={t} lang={lang} />
              <div className="card">
                <div className="mono tag" style={{ color: "var(--yuv-purple)", marginBottom: 10 }}>
                  {t("PER-CLASS METRICS (scikit-learn)", "מדדים לכל מחלקה (scikit-learn)")}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="mono" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>{[t("class", "מחלקה"), t("precision", "דיוק"), t("recall", "ריקול"), "F1", t("support", "תמיכה")].map((h) => (
                        <th key={h} style={{ textAlign: lang === "he" ? "right" : "left", padding: "6px 10px", borderBottom: "2px solid #000" }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {evals.per_class.map((c) => (
                        <tr key={c.id}>
                          <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--yuv-grey)" }}>{labelName(c.id)}</td>
                          <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--yuv-grey)" }}>{(c.precision * 100).toFixed(0)}%</td>
                          <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--yuv-grey)" }}>{(c.recall * 100).toFixed(0)}%</td>
                          <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--yuv-grey)" }}>{(c.f1 * 100).toFixed(0)}%</td>
                          <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--yuv-grey)" }}>{c.support}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* try it */}
        <div>
          {H("Step 3 · try it", "שלב 3 · נסה בעצמך")}
          <p style={{ marginBottom: 12 }}>
            {hasModel
              ? t("Type any sentence — your model reads its feeling.", "כתוב משפט כלשהו — המודל שלך קורא את הרגש שבו.")
              : t("Train a model above first, then come back to test it.", "אמן מודל למעלה קודם, ואז חזור לבדוק אותו.")}
          </p>
          <div className="card">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input value={inferText} onChange={(e) => setInferText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doInfer()}
                placeholder={t("e.g. this is the best thing I've ever bought", "למשל: זו הקנייה הכי טובה שעשיתי")}
                style={{ flex: 1, minWidth: 240 }} />
              <button className="btn btn-purple" onClick={doInfer} disabled={!hasModel}>{t("Read it →", "קרא →")}</button>
            </div>
            {inferRes?.probs && (
              <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
                {inferRes.probs.map((p, i) => (
                  <div key={p.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }} className="mono">
                      <span>{labelName(p.label)}</span><span>{(p.prob * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 12, background: "var(--yuv-grey)", border: "1.5px solid #000" }}>
                      <div style={{ width: `${p.prob * 100}%`, height: "100%", background: i === 0 ? "var(--yuv-yellow)" : "var(--yuv-purple)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {inferRes?.error && <p style={{ color: "#c00", marginTop: 10 }}>{inferRes.error}</p>}
          </div>
        </div>

        {/* export */}
        <div>
          {H("Step 4 · take it with you", "שלב 4 · קח אותו איתך")}
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
            <div className="card">
              <div className="mono tag" style={{ color: "var(--yuv-purple)" }}>{t("DOWNLOAD", "הורדה")}</div>
              <div className="display" style={{ fontSize: 20, margin: "8px 0" }}>{t("As a .zip file", "כקובץ .zip")}</div>
              <p style={{ fontSize: 13, marginBottom: 12 }}>{t("The complete sentiment model — weights, tokenizer, config.", "מודל הסנטימנט המלא — משקלים, טוקנייזר, קונפיג.")}</p>
              <a className="btn btn-purple" href={hasModel ? api.exportZipUrl(TASK) : undefined}
                onClick={(e) => { if (!hasModel) e.preventDefault(); }}
                style={{ pointerEvents: hasModel ? "auto" : "none", opacity: hasModel ? 1 : .5, display: "inline-block" }} download>
                {t("↓ Download model .zip", "↓ הורד את המודל .zip")}
              </a>
            </div>
            <div className="card">
              <div className="mono tag" style={{ color: "var(--yuv-purple)" }}>{t("PUBLISH", "פרסום")}</div>
              <div className="display" style={{ fontSize: 20, margin: "8px 0" }}>{t("To the Hugging Face Hub", "ל-Hugging Face Hub")}</div>
              <div style={{ display: "grid", gap: 8 }}>
                <input value={hfRepo} onChange={(e) => setHfRepo(e.target.value)} placeholder="username/sentiment-model" disabled={!hasModel} />
                <input type="password" value={hfToken} onChange={(e) => setHfToken(e.target.value)} placeholder={t("hf_… write token", "hf_… טוקן כתיבה")} disabled={!hasModel} autoComplete="off" />
                <label className="mono" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={hfPrivate} onChange={(e) => setHfPrivate(e.target.checked)} disabled={!hasModel} style={{ width: "auto" }} />
                  {t("private repository", "מאגר פרטי")}
                </label>
                <button className="btn btn-yellow" onClick={doHubExport} disabled={!hasModel || hfBusy || !hfToken.trim() || !hfRepo.trim()}>
                  {hfBusy ? t("Uploading…", "מעלה…") : t("↑ Push to Hugging Face", "↑ דחוף ל-Hugging Face")}
                </button>
              </div>
              {hfRes?.url && (
                <p style={{ fontSize: 13, marginTop: 10, color: "var(--yuv-purple)" }}>
                  {t("Done →", "בוצע →")} <a href={hfRes.url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>{hfRes.url}</a>
                </p>
              )}
              {hfRes?.error && <p style={{ color: "#c00", fontSize: 13, marginTop: 10 }}>{hfRes.error}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: 16 }}>
      <div className="display" style={{ fontSize: 40, color: "var(--yuv-purple)" }}>
        {value != null ? (value * 100).toFixed(0) : "—"}<span style={{ fontSize: 20 }}>%</span>
      </div>
      <div className="mono" style={{ fontSize: 12, opacity: .7 }}>{label}</div>
    </div>
  );
}
