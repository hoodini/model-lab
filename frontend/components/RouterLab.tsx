"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLab } from "./providers";
import { Explain } from "./Explain";
import { LossChart, type Point } from "./LossChart";
import { CounterUp } from "./Counter";
import { fireConfetti } from "./Confetti";
import * as api from "@/lib/api";
import type { Label, Row } from "@/lib/api";

const LANE_COLORS = ["#5E17EB", "#3D0DA8", "#000000", "#7A7A7A"];

export function RouterLab() {
  const { t, lang } = useLab();

  // ── dataset ────────────────────────────────────────────────────────────
  const [labels, setLabels] = useState<Label[]>([]);
  const [rows, setRows] = useState<Row[]>([]);

  // ── tokenizer playground ──────────────────────────────────────────────
  const [tokText, setTokText] = useState(lang === "he" ? "כתוב פונקציה בפייתון" : "Write a Python function");
  const [tokResult, setTokResult] = useState<{ count: number; tokens: { piece: string; id: number }[] } | null>(null);

  // ── hyperparameters (the knobs) ───────────────────────────────────────
  const [baseModel, setBaseModel] = useState("distilbert-base-multilingual-cased");
  const [epochs, setEpochs] = useState(10);
  const [lr, setLr] = useState(5e-5);
  const [batchSize, setBatchSize] = useState(8);
  const [testSize, setTestSize] = useState(0.2);

  // ── training run state ────────────────────────────────────────────────
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [points, setPoints] = useState<Point[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState({ step: 0, total: 0 });
  const [metrics, setMetrics] = useState<{ acc?: number; f1?: number; loss?: number }>({});
  const [evals, setEvals] = useState<api.Evals | null>(null);
  const esRef = useRef<EventSource | null>(null);

  // ── inference ─────────────────────────────────────────────────────────
  const [inferText, setInferText] = useState("");
  const [inferRes, setInferRes] = useState<any>(null);

  // ── export ──────────────────────────────────────────────────────────────
  const [hfToken, setHfToken] = useState("");
  const [hfRepo, setHfRepo] = useState("");
  const [hfPrivate, setHfPrivate] = useState(true);
  const [hfBusy, setHfBusy] = useState(false);
  const [hfRes, setHfRes] = useState<api.HubResult | null>(null);
  const hasModel = status === "done" || !!evals;

  // ── detected compute hardware (auto: NVIDIA GPU / Apple / CPU) ──────────
  const [hw, setHw] = useState<{ device?: string; device_name?: string; dtype?: string; mixed_precision?: boolean } | null>(null);

  const labelName = (id: string) => {
    const l = labels.find((x) => x.id === id);
    return l ? l[lang] : id;
  };

  useEffect(() => {
    api.getDataset().then((d) => { setLabels(d.labels); setRows(d.rows); });
    api.getHealth().then(setHw).catch(() => {});
    // Load any evals saved by the most recent training run (survives reloads).
    api.getEvals().then((e) => { if (!e.error) setEvals(e); }).catch(() => {});
  }, []);

  useEffect(() => () => esRef.current?.close(), []);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    rows.forEach((r) => { m[r.label] = (m[r.label] || 0) + 1; });
    return m;
  }, [rows]);

  async function runTokenize() {
    setTokResult(await api.tokenize(tokText, baseModel));
  }

  async function train() {
    setStatus("running");
    setPoints([]); setLogs([]); setMetrics({}); setProgress({ step: 0, total: 0 });
    const { job_id } = await api.startTraining({
      rows, base_model: baseModel, epochs, lr, batch_size: batchSize, test_size: testSize,
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
        if (e.eval_accuracy != null)
          setMetrics({ acc: e.eval_accuracy, f1: e.eval_f1, loss: e.eval_loss });
      }
      if (e.type === "eval" || e.type === "done") {
        const m = e.metrics || {};
        setMetrics({ acc: m.eval_accuracy, f1: m.eval_f1, loss: m.eval_loss });
      }
      if (e.type === "evals") setEvals(e);
      if (e.type === "done") {
        setStatus("done");
        esRef.current?.close();
        // The payoff: YOUR model just finished training. Earn it.
        fireConfetti({ count: 160 });
        setTimeout(() => fireConfetti({ count: 90, originY: 0.45 }), 350);
      }
      if (e.type === "error") {
        setStatus("error");
        setLogs((L) => [...L, "ERROR: " + e.message]);
        esRef.current?.close();
      }
    });
  }

  async function doInfer() {
    if (!inferText.trim()) return;
    setInferRes(await api.infer(inferText));
  }

  async function doHubExport() {
    if (!hfToken.trim() || !hfRepo.trim()) return;
    setHfBusy(true); setHfRes(null);
    try {
      setHfRes(await api.exportToHub(hfToken.trim(), hfRepo.trim(), hfPrivate));
    } catch (e: any) {
      setHfRes({ error: String(e?.message || e) });
    } finally {
      setHfBusy(false);
    }
  }

  const pct = progress.total ? Math.min(100, (progress.step / progress.total) * 100) : 0;

  const H = (en: string, he: string) => (
    <h3 className="display" style={{ fontSize: 26, display: "flex", alignItems: "stretch", gap: 12, margin: "8px 0 4px" }}>
      <span className="purple-bar" /> {t(en, he)}
    </h3>
  );

  return (
    <section id="lab" className="content section">
      <div className="wrap" style={{ display: "grid", gap: 56 }}>

        {/* 1 — what we're building */}
        <div>
          <div className="eyebrow" style={{ color: "var(--yuv-purple)" }}>{t("PROJECT 01", "פרויקט 01")}</div>
          {H("The prompt router", "ראוטר הפרומפטים")}
          <Explain concept="router" />
        </div>

        {/* 2 — the lanes */}
        <div>
          {H("Step 0 · the lanes", "שלב 0 · המסלולים")}
          <p style={{ marginBottom: 16 }}>{t("These are the buckets the router chooses between:", "אלו התאים שהראוטר בוחר ביניהם:")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {labels.map((l, i) => (
              <div key={l.id} className="card" style={{ borderColor: LANE_COLORS[i % 4] }}>
                <div className="mono tag" style={{ color: LANE_COLORS[i % 4] }}>{l.id}</div>
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

        {/* 3 — tokenizer playground */}
        <div>
          {H("Step 1 · tokenization", "שלב 1 · טוקניזציה")}
          <Explain concept="tokenization" />
          <div className="card" style={{ marginTop: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input value={tokText} onChange={(e) => setTokText(e.target.value)} style={{ flex: 1, minWidth: 240 }} />
              <button className="btn btn-purple" onClick={runTokenize}>{t("Tokenize", "פרק לטוקנים")}</button>
            </div>
            {tokResult && (
              <div style={{ marginTop: 14 }}>
                <div className="mono" style={{ fontSize: 13, marginBottom: 8 }}>
                  {tokResult.count} {t("tokens", "טוקנים")} · {tokText.length} {t("characters", "תווים")}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tokResult.tokens.map((tk, i) => (
                    <span key={i} className="mono" style={{ fontSize: 13, padding: "4px 8px", background: "var(--yuv-grey)", border: "1.5px solid #000" }}>
                      {tk.piece}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: 13, marginTop: 10, opacity: .8 }}>
                  {t("Tip: tokenize the same sentence in Hebrew and English — compare the token counts.",
                     "טיפ: פרק את אותו משפט בעברית ובאנגלית — והשווה את מספר הטוקנים.")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4 — hyperparameters */}
        <div>
          {H("Step 2 · the knobs", "שלב 2 · הכפתורים")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Base model", "מודל בסיס")}</label>
              <select value={baseModel} onChange={(e) => setBaseModel(e.target.value)}>
                <option value="distilbert-base-multilingual-cased">distilbert-base-multilingual-cased (~134M)</option>
                <option value="bert-base-multilingual-cased">bert-base-multilingual-cased (~178M)</option>
                <option value="xlm-roberta-base">xlm-roberta-base (~278M)</option>
              </select>
              <Explain concept="base_model" />
            </div>

            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Epochs", "אפוקים")}: {epochs}</label>
              <input type="range" min={1} max={15} value={epochs} onChange={(e) => setEpochs(+e.target.value)} />
              <Explain concept="epochs" />
            </div>

            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Learning rate", "קצב למידה")}</label>
              <select value={lr} onChange={(e) => setLr(+e.target.value)}>
                <option value={2e-5}>2e-5 ({t("gentle", "עדין")})</option>
                <option value={5e-5}>5e-5 ({t("standard", "סטנדרטי")})</option>
                <option value={1e-4}>1e-4 ({t("aggressive", "אגרסיבי")})</option>
              </select>
              <Explain concept="lr" />
            </div>

            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Batch size", "גודל אצווה")}</label>
              <select value={batchSize} onChange={(e) => setBatchSize(+e.target.value)}>
                {[4, 8, 16, 32].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <Explain concept="batch_size" />
            </div>

            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Test split", "חלוקת מבחן")}: {Math.round(testSize * 100)}%</label>
              <input type="range" min={0.1} max={0.4} step={0.05} value={testSize} onChange={(e) => setTestSize(+e.target.value)} />
              <Explain concept="test_size" />
            </div>
          </div>
        </div>

        {/* 5 — train + live loss */}
        <div>
          {H("Step 3 · take off (train)", "שלב 3 · המראה (אימון)")}
          <Explain concept="loss" />
          <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "16px 0", flexWrap: "wrap" }}>
            <button className="btn btn-yellow" onClick={train} disabled={status === "running" || rows.length === 0}>
              {status === "running" ? t("Training…", "מתאמן…") : t("▶ Train the router", "▶ אמן את הראוטר")}
            </button>
            <div style={{ flex: 1, minWidth: 200, height: 14, background: "#fff", border: "2px solid #000" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "var(--yuv-purple)", transition: "width .2s" }} />
            </div>
            <span className="mono" style={{ fontSize: 13 }}>{progress.step}/{progress.total || "?"}</span>
          </div>

          {hw?.device && (
            <div className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, padding: "6px 12px", border: "2px solid #000", background: hw.device === "cpu" ? "#fff" : "var(--yuv-yellow)", marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: hw.device === "cpu" ? "var(--yuv-grey-dark)" : "var(--yuv-purple)" }} />
              {t("Auto-detected compute", "חומרה שזוהתה אוטומטית")}: <strong>{hw.device_name}</strong>
              <span style={{ opacity: .65 }}>· {hw.dtype}{hw.mixed_precision ? t(" · mixed precision", " · דיוק מעורב") : ""}</span>
            </div>
          )}

          {status === "done" && metrics.acc != null && (
            <div className="act fx-reveal" style={{
              background: "var(--yuv-purple)", color: "#fff", border: "3px solid var(--yuv-yellow)",
              padding: "22px 24px", margin: "4px 0 18px",
              display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
            }}>
              <div>
                <div className="mono" style={{ color: "var(--yuv-yellow)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>
                  {t("✈ Landed — your model is trained", "✈ נחתנו — המודל שלך מאומן")}
                </div>
                <div className="display" style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 4 }}>
                  {t("YOU JUST TRAINED A NEURAL NET", "אימנת עכשיו רשת נוירונים")}
                </div>
              </div>
              <div style={{ marginInlineStart: "auto", textAlign: "center" }}>
                <CounterUp
                  to={(metrics.acc ?? 0) * 100}
                  decimals={0}
                  suffix="%"
                  replayKey={metrics.acc}
                  style={{ fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "clamp(48px,9vw,88px)", lineHeight: 1, color: "var(--yuv-yellow)", display: "block" }}
                />
                <div className="mono" style={{ fontSize: 12, opacity: .8, marginTop: 4 }}>{t("accuracy on held-out prompts", "דיוק על פרומפטים שהוחזקו")}</div>
              </div>
            </div>
          )}

          <div className="train-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 18 }}>
            <LossChart points={points} />
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Metric label={t("Accuracy", "דיוק")} value={metrics.acc} />
                <Metric label="F1" value={metrics.f1} />
              </div>
              <div className="card" style={{ marginTop: 12, height: 150, overflow: "auto", background: "#000", color: "#FFEC00", borderColor: "#000" }}>
                <div className="mono" style={{ fontSize: 12, lineHeight: 1.7 }}>
                  {logs.length === 0 ? t("// training log will stream here", "// יומן האימון יזרום לכאן") : logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}><Explain concept="metrics" /></div>
        </div>

        {/* 6 — try it */}
        <div>
          {H("Step 4 · try it", "שלב 4 · נסה בעצמך")}
          <p style={{ marginBottom: 12 }}>
            {status === "done"
              ? t("Type any prompt and watch your model route it.", "כתוב פרומפט כלשהו וצפה במודל שלך מנתב אותו.")
              : t("Train a model above first, then come back to test it.", "אמן מודל למעלה קודם, ואז חזור לבדוק אותו.")}
          </p>
          <div className="card">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                value={inferText}
                onChange={(e) => setInferText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doInfer()}
                placeholder={t("e.g. fix this null pointer bug", "למשל: תקן את הבאג הזה")}
                style={{ flex: 1, minWidth: 240 }}
              />
              <button className="btn btn-purple" onClick={doInfer} disabled={status !== "done"}>{t("Route it →", "נתב →")}</button>
            </div>
            {inferRes?.probs && (
              <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
                {inferRes.probs.map((p: any, i: number) => (
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

        {/* 7 — evals (confusion matrix + per-class metrics) */}
        <div>
          {H("Step 5 · evals", "שלב 5 · הערכה")}
          <Explain concept="confusion_matrix" />
          {!evals ? (
            <p style={{ marginTop: 12, opacity: .8 }}>
              {t("Train a model above — its confusion matrix and per-class scores appear here, computed on the held-out test set it never saw during training.",
                 "אמן מודל למעלה — מטריצת הבלבול והציונים לכל מחלקה יופיעו כאן, מחושבים על סט המבחן שהמודל לא ראה באימון.")}
            </p>
          ) : (
            <div style={{ marginTop: 14, display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                <Metric label={t("Accuracy", "דיוק")} value={evals.accuracy} />
                <Metric label={t("Macro F1", "מאקרו F1")} value={evals.macro_f1} />
                <Metric label={t("Weighted F1", "F1 משוקלל")} value={evals.weighted_f1} />
                <div className="card" style={{ textAlign: "center", padding: 16 }}>
                  <div className="display" style={{ fontSize: 40, color: "var(--yuv-purple)" }}>{evals.n_eval}</div>
                  <div className="mono" style={{ fontSize: 12, opacity: .7 }}>{t("held-out prompts", "פרומפטים שהוחזקו")}</div>
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
                      <tr>
                        {[t("lane", "מסלול"), t("precision", "דיוק"), t("recall", "ריקול"), "F1", t("support", "תמיכה")].map((h) => (
                          <th key={h} style={{ textAlign: lang === "he" ? "right" : "left", padding: "6px 10px", borderBottom: "2px solid #000" }}>{h}</th>
                        ))}
                      </tr>
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
                <p style={{ fontSize: 12.5, marginTop: 10, opacity: .8 }}>
                  {t("Precision = of the prompts sent to this lane, how many belonged there. Recall = of the prompts that truly belonged here, how many we caught. F1 balances both. Support = how many test prompts of this lane existed.",
                     "דיוק (precision) = מבין הפרומפטים שנשלחו למסלול הזה, כמה באמת שייכים אליו. ריקול (recall) = מבין הפרומפטים ששייכים באמת למסלול, כמה תפסנו. F1 מאזן בין השניים. תמיכה = כמה פרומפטים מהמסלול הזה היו בסט המבחן.")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 8 — export (take it with you) */}
        <div>
          {H("Step 6 · take it with you", "שלב 6 · קח אותו איתך")}
          <Explain concept="export" />
          {!hasModel && (
            <p style={{ marginTop: 12, opacity: .8 }}>
              {t("Train a model first — then download it or push it to Hugging Face.",
                 "אמן מודל קודם — ואז הורד אותו או דחוף אותו ל-Hugging Face.")}
            </p>
          )}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>

            {/* download zip */}
            <div className="card">
              <div className="mono tag" style={{ color: "var(--yuv-purple)" }}>{t("DOWNLOAD", "הורדה")}</div>
              <div className="display" style={{ fontSize: 20, margin: "8px 0" }}>{t("As a .zip file", "כקובץ .zip")}</div>
              <p style={{ fontSize: 13, marginBottom: 12 }}>
                {t("The complete model folder — weights, tokenizer, config. Keep it, share it, or commit it to GitHub.",
                   "תיקיית המודל המלאה — משקלים, טוקנייזר, קונפיג. שמור, שתף, או דחוף ל-GitHub.")}
              </p>
              <a
                className="btn btn-purple"
                href={hasModel ? api.exportZipUrl() : undefined}
                onClick={(e) => { if (!hasModel) e.preventDefault(); }}
                style={{ pointerEvents: hasModel ? "auto" : "none", opacity: hasModel ? 1 : .5, display: "inline-block" }}
                download
              >
                {t("↓ Download model .zip", "↓ הורד את המודל .zip")}
              </a>
            </div>

            {/* push to hugging face */}
            <div className="card">
              <div className="mono tag" style={{ color: "var(--yuv-purple)" }}>{t("PUBLISH", "פרסום")}</div>
              <div className="display" style={{ fontSize: 20, margin: "8px 0" }}>{t("To the Hugging Face Hub", "ל-Hugging Face Hub")}</div>
              <p style={{ fontSize: 13, marginBottom: 12 }}>
                {t("A real upload to the standard model registry. Your write token is used once and never stored.",
                   "העלאה אמיתית למאגר המודלים הסטנדרטי. טוקן הכתיבה משמש פעם אחת ואינו נשמר.")}
              </p>
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  value={hfRepo} onChange={(e) => setHfRepo(e.target.value)}
                  placeholder={t("username/router-model", "username/router-model")}
                  disabled={!hasModel}
                />
                <input
                  type="password" value={hfToken} onChange={(e) => setHfToken(e.target.value)}
                  placeholder={t("hf_… write token", "hf_… טוקן כתיבה")}
                  disabled={!hasModel}
                  autoComplete="off"
                />
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
              <p className="mono" style={{ fontSize: 11, marginTop: 10, opacity: .65 }}>
                {t("Get a write token at huggingface.co/settings/tokens", "השג טוקן כתיבה ב-huggingface.co/settings/tokens")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Real confusion matrix: rows = the TRUE lane, columns = the lane the model
// PREDICTED. Diagonal = correct routes (purple, scaled by count). Off-diagonal
// non-zero cells = specific mistakes, highlighted in yellow so your eye lands on
// exactly where the model confuses one lane for another.
function ConfusionMatrix({
  evals, labelName, t, lang,
}: {
  evals: api.Evals;
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

function Metric({ label, value }: { label: string; value?: number }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: 16 }}>
      <div className="display" style={{ fontSize: 40, color: "var(--yuv-purple)" }}>
        {value != null ? (value * 100).toFixed(0) : "—"}<span style={{ fontSize: 20 }}>%</span>
      </div>
      <div className="mono" style={{ fontSize: 12, opacity: .7 }}>{label}</div>
    </div>
  );
}
