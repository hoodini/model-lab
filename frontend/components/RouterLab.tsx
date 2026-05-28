"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLab } from "./providers";
import { Explain } from "./Explain";
import { LossChart, type Point } from "./LossChart";
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
  const esRef = useRef<EventSource | null>(null);

  // ── inference ─────────────────────────────────────────────────────────
  const [inferText, setInferText] = useState("");
  const [inferRes, setInferRes] = useState<any>(null);

  const labelName = (id: string) => {
    const l = labels.find((x) => x.id === id);
    return l ? l[lang] : id;
  };

  useEffect(() => {
    api.getDataset().then((d) => { setLabels(d.labels); setRows(d.rows); });
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
      if (e.type === "done") { setStatus("done"); esRef.current?.close(); }
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
      </div>
    </section>
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
