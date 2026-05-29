"use client";

import { useEffect, useRef, useState } from "react";
import { useLab } from "./providers";
import { Explain } from "./Explain";
import { LossChart, type Point } from "./LossChart";
import { CounterUp } from "./Counter";
import { fireConfetti } from "./Confetti";
import * as api from "@/lib/api";
import type { GenRow } from "@/lib/api";

const MODELS = [
  { id: "google/gemma-4-E4B-it", label: "Gemma 4 · E4B-it (~4.5B)", gated: true },
  { id: "google/gemma-4-E2B-it", label: "Gemma 4 · E2B-it (~2.3B)", gated: true },
  { id: "HuggingFaceTB/SmolLM2-135M-Instruct", label: "SmolLM2 · 135M (try now — no token)", gated: false },
];

// Parse pasted JSONL into chat rows. Accepts {messages:[...]}, {user,assistant},
// {instruction,output}, or {prompt,response} per line.
function parseRows(text: string): { rows: GenRow[]; errors: number } {
  const rows: GenRow[] = [];
  let errors = 0;
  for (const line of text.split("\n").map((l) => l.trim()).filter(Boolean)) {
    try {
      const o = JSON.parse(line);
      if (Array.isArray(o.messages)) rows.push({ messages: o.messages });
      else {
        const u = o.user ?? o.instruction ?? o.prompt;
        const a = o.assistant ?? o.output ?? o.response;
        if (u && a) rows.push({ messages: [{ role: "user", content: String(u) }, { role: "assistant", content: String(a) }] });
        else errors++;
      }
    } catch { errors++; }
  }
  return { rows, errors };
}

export function GemmaLab() {
  const { t, lang } = useLab();

  const [model, setModel] = useState(MODELS[0].id);
  const [hfToken, setHfToken] = useState("");
  const [epochs, setEpochs] = useState(3);
  const [lr, setLr] = useState(2e-4);
  const [rank, setRank] = useState(16);
  const [sample, setSample] = useState<GenRow[]>([]);
  const [customText, setCustomText] = useState("");

  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [points, setPoints] = useState<Point[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState({ step: 0, total: 0 });
  const [finalLoss, setFinalLoss] = useState<number | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const [chat, setChat] = useState("");
  const [reply, setReply] = useState<{ text?: string; error?: string } | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [trained, setTrained] = useState(false);

  const [hw, setHw] = useState<{ device?: string; device_name?: string } | null>(null);

  const picked = MODELS.find((m) => m.id === model)!;
  const needsToken = picked.gated && !hfToken.trim();

  useEffect(() => {
    api.getGenDataset().then((d) => setSample(d.rows || [])).catch(() => {});
    api.getHealth().then(setHw).catch(() => {});
  }, []);
  useEffect(() => () => esRef.current?.close(), []);

  const parsed = customText.trim() ? parseRows(customText) : null;
  const trainRows = parsed && parsed.rows.length ? parsed.rows : sample;

  async function train() {
    setStatus("running"); setPoints([]); setLogs([]); setProgress({ step: 0, total: 0 }); setFinalLoss(null);
    const { job_id } = await api.startGenTraining({
      rows: trainRows, base_model: model, epochs, lr, rank, hf_token: hfToken.trim() || undefined,
    });
    esRef.current = api.streamTraining(job_id, (e) => {
      if (e.type === "device") setHw(e);
      if (e.type === "start") setProgress({ step: 0, total: e.total_steps });
      if (e.type === "info") setLogs((L) => [...L, e.message]);
      if (e.type === "log") {
        setProgress((p) => ({ step: e.step, total: p.total }));
        if (e.loss != null) { setPoints((pts) => [...pts, { step: e.step, loss: e.loss }]); setFinalLoss(e.loss); }
      }
      if (e.type === "done") {
        setStatus("done"); setTrained(true); esRef.current?.close();
        fireConfetti({ count: 160 }); setTimeout(() => fireConfetti({ count: 90, originY: 0.45 }), 350);
      }
      if (e.type === "error") { setStatus("error"); setLogs((L) => [...L, "ERROR: " + e.message]); esRef.current?.close(); }
    });
  }

  async function doChat() {
    if (!chat.trim()) return;
    setGenBusy(true); setReply(null);
    try { setReply(await api.genSample(chat.trim(), hfToken.trim() || undefined)); }
    catch (e: any) { setReply({ error: String(e?.message || e) }); }
    finally { setGenBusy(false); }
  }

  const pct = progress.total ? Math.min(100, (progress.step / progress.total) * 100) : 0;
  const H = (en: string, he: string) => (
    <h3 className="display" style={{ fontSize: 26, display: "flex", alignItems: "stretch", gap: 12, margin: "8px 0 4px" }}>
      <span className="purple-bar" /> {t(en, he)}
    </h3>
  );

  return (
    <section id="gemma" className="content section" style={{ borderTop: "2px solid var(--yuv-grey-dark)" }}>
      <div className="wrap" style={{ display: "grid", gap: 56 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--yuv-purple)" }}>{t("PROJECT 03", "פרויקט 03")}</div>
          {H("Fine-tune Gemma 4 (QLoRA)", "כוונון Gemma 4 (QLoRA)")}
          <Explain concept="generative_ft" />
          <p style={{ marginTop: 12, maxWidth: 720 }}>
            {t("This is generative fine-tuning — teaching an LLM to WRITE in a voice, not pick a label. The base is loaded in 4-bit and we train a tiny LoRA adapter on top, live on your GPU.",
               "זהו כוונון גנרטיבי — ללמד LLM לכתוב בקול מסוים, לא לבחור תווית. הבסיס נטען ב-4-bit ואנחנו מאמנים אדפטר LoRA זעיר מעליו, בזמן אמת על ה-GPU שלך.")}
          </p>
        </div>

        {/* setup */}
        <div>
          {H("Step 1 · pick a base model", "שלב 1 · בחר מודל בסיס")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 18, marginTop: 8 }}>
            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Base model", "מודל בסיס")}</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              <Explain concept="quantization" />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Hugging Face token", "טוקן Hugging Face")} {picked.gated ? "★" : `(${t("optional", "אופציונלי")})`}</label>
              <input type="password" value={hfToken} onChange={(e) => setHfToken(e.target.value)} placeholder="hf_…" autoComplete="off" />
              <p className="mono" style={{ fontSize: 11, opacity: .7, marginTop: 6 }}>
                {picked.gated
                  ? t("Gemma is gated — accept its license on huggingface.co, then paste a read token. Used once, never stored.",
                       "Gemma גייטד — אשר את הרישיון ב-huggingface.co, ואז הדבק read token. בשימוש פעם אחת, לא נשמר.")
                  : t("This model is open — no token needed. Great for a first run.",
                       "המודל הזה פתוח — אין צורך בטוקן. מצוין להרצה ראשונה.")}
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 18, marginTop: 14 }}>
            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Epochs", "אפוקים")}: {epochs}</label>
              <input type="range" min={1} max={8} value={epochs} onChange={(e) => setEpochs(+e.target.value)} />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("Learning rate", "קצב למידה")}</label>
              <select value={lr} onChange={(e) => setLr(+e.target.value)}>
                <option value={1e-4}>1e-4</option><option value={2e-4}>2e-4 ({t("standard", "סטנדרטי")})</option><option value={3e-4}>3e-4</option>
              </select>
            </div>
            <div>
              <label className="mono" style={{ fontSize: 13 }}>{t("LoRA rank", "דרגת LoRA")}: {rank}</label>
              <input type="range" min={4} max={64} step={4} value={rank} onChange={(e) => setRank(+e.target.value)} />
              <Explain concept="lora" />
            </div>
          </div>
        </div>

        {/* data */}
        <div>
          {H("Step 2 · the data (conversations)", "שלב 2 · הדאטה (שיחות)")}
          <p style={{ marginBottom: 10 }}>
            {t(`Ships with ${sample.length} sample EN/HE conversations that teach a concise tutor voice. Paste your own JSONL below to override — one example per line.`,
               `מגיע עם ${sample.length} שיחות לדוגמה באנגלית/עברית שמלמדות קול מורה תמציתי. הדבק JSONL משלך למטה כדי להחליף — דוגמה אחת בכל שורה.`)}
          </p>
          <textarea
            value={customText} onChange={(e) => setCustomText(e.target.value)} rows={4}
            placeholder={'{"messages":[{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}\n{"user":"...","assistant":"..."}'}
            style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}
          />
          <p className="mono" style={{ fontSize: 12, marginTop: 6, opacity: .75 }}>
            {parsed
              ? t(`Using ${parsed.rows.length} pasted examples${parsed.errors ? ` · ${parsed.errors} lines skipped` : ""}.`,
                   `משתמש ב-${parsed.rows.length} דוגמאות שהודבקו${parsed.errors ? ` · ${parsed.errors} שורות דולגו` : ""}.`)
              : t(`Using the ${sample.length} built-in sample conversations.`, `משתמש ב-${sample.length} שיחות הדוגמה המובנות.`)}
          </p>
        </div>

        {/* train */}
        <div>
          {H("Step 3 · fine-tune", "שלב 3 · כוונון")}
          <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "8px 0 16px", flexWrap: "wrap" }}>
            <button className="btn btn-yellow" onClick={train} disabled={status === "running" || needsToken || trainRows.length === 0}>
              {status === "running" ? t("Fine-tuning…", "מכוונן…") : t("▶ Fine-tune with QLoRA", "▶ כוונן עם QLoRA")}
            </button>
            <div style={{ flex: 1, minWidth: 200, height: 14, background: "#fff", border: "2px solid #000" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "var(--yuv-purple)", transition: "width .2s" }} />
            </div>
            <span className="mono" style={{ fontSize: 13 }}>{progress.step}/{progress.total || "?"}</span>
          </div>
          {needsToken && (
            <p className="mono" style={{ fontSize: 12.5, color: "#c00", marginBottom: 8 }}>
              {t("↑ Gemma is gated — paste a Hugging Face token above, or pick SmolLM2 to try without one.",
                 "↑ Gemma גייטד — הדבק טוקן Hugging Face למעלה, או בחר SmolLM2 כדי לנסות בלי טוקן.")}
            </p>
          )}
          {hw?.device && (
            <div className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, padding: "6px 12px", border: "2px solid #000", background: hw.device === "cpu" ? "#fff" : "var(--yuv-yellow)", marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--yuv-purple)" }} />
              {t("Compute", "חומרה")}: <strong>{hw.device_name}</strong> {hw.device === "cuda" ? "· 4-bit QLoRA" : "· full-precision (slow)"}
            </div>
          )}

          {status === "done" && finalLoss != null && (
            <div className="act fx-reveal" style={{ background: "var(--yuv-purple)", color: "#fff", border: "3px solid var(--yuv-yellow)", padding: "22px 24px", margin: "4px 0 18px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div>
                <div className="mono" style={{ color: "var(--yuv-yellow)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>{t("✈ Landed — your LoRA is trained", "✈ נחתנו — ה-LoRA שלך מאומן")}</div>
                <div className="display" style={{ fontSize: "clamp(26px,4vw,40px)", marginTop: 4 }}>{t("YOU FINE-TUNED AN LLM", "כיוונת LLM")}</div>
              </div>
              <div style={{ marginInlineStart: "auto", textAlign: "center" }}>
                <CounterUp to={finalLoss} decimals={2} replayKey={finalLoss} style={{ fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "clamp(44px,8vw,80px)", lineHeight: 1, color: "var(--yuv-yellow)", display: "block" }} />
                <div className="mono" style={{ fontSize: 12, opacity: .8, marginTop: 4 }}>{t("final training loss", "loss אימון סופי")}</div>
              </div>
            </div>
          )}

          <div className="train-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 18 }}>
            <LossChart points={points} />
            <div className="card" style={{ height: 280, overflow: "auto", background: "#000", color: "#FFEC00", borderColor: "#000" }}>
              <div className="mono" style={{ fontSize: 12, lineHeight: 1.7 }}>
                {logs.length === 0 ? t("// training log will stream here", "// יומן האימון יזרום לכאן") : logs.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>
          </div>
        </div>

        {/* chat */}
        <div>
          {H("Step 4 · talk to your fine-tune", "שלב 4 · דבר עם הכוונון שלך")}
          <p style={{ marginBottom: 12 }}>
            {trained ? t("Ask it anything — it answers in the voice you trained.", "שאל אותו כל דבר — הוא עונה בקול שאימנת.")
                     : t("Fine-tune above first, then chat with the result here.", "כוונן למעלה קודם, ואז שוחח עם התוצאה כאן.")}
          </p>
          <div className="card">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input value={chat} onChange={(e) => setChat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doChat()}
                placeholder={t("e.g. explain overfitting", "למשל: הסבר overfitting")} style={{ flex: 1, minWidth: 240 }} disabled={!trained} />
              <button className="btn btn-purple" onClick={doChat} disabled={!trained || genBusy}>{genBusy ? t("Thinking…", "חושב…") : t("Generate →", "ייצר →")}</button>
            </div>
            {reply?.text && (
              <div style={{ marginTop: 14, padding: 14, background: "var(--yuv-grey)", border: "2px solid #000", whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.6 }}>{reply.text}</div>
            )}
            {reply?.error && <p style={{ color: "#c00", marginTop: 10 }}>{reply.error}</p>}
          </div>
        </div>

        {/* export */}
        <div>
          {H("Step 5 · take the adapter", "שלב 5 · קח את האדפטר")}
          <p style={{ marginBottom: 12, maxWidth: 720 }}>
            {t("Your fine-tune is a few-MB LoRA adapter (not the whole model). Download it and load it on top of the base anywhere.",
               "הכוונון שלך הוא אדפטר LoRA במשקל מגה-בייטים (לא כל המודל). הורד אותו וטען אותו מעל הבסיס בכל מקום.")}
          </p>
          <a className="btn btn-purple" href={trained ? api.genExportZipUrl() : undefined}
            onClick={(e) => { if (!trained) e.preventDefault(); }}
            style={{ pointerEvents: trained ? "auto" : "none", opacity: trained ? 1 : .5, display: "inline-block" }} download>
            {t("↓ Download LoRA adapter .zip", "↓ הורד אדפטר LoRA .zip")}
          </a>
        </div>
      </div>
    </section>
  );
}
