"use client";

import { useEffect, useMemo, useState } from "react";
import { useLab } from "./providers";
import { getHardware, type Hardware } from "@/lib/api";

/* ───────────────────────────────────────────────────────────────────────────
   "Will it run on YOUR machine?" — reads the real detected GPU/VRAM/RAM and
   computes, for popular open LLMs, whether you can (a) RUN them locally for
   inference (Ollama / LM Studio, 4-bit GGUF) and (b) FINE-TUNE them with QLoRA
   (Unsloth). The numbers are honest rough estimates — actual fit depends on
   quantization, context length and KV-cache — and are labelled as such.
─────────────────────────────────────────────────────────────────────────── */

type Model = {
  name: string; b: number; active?: number; family: string;
  gated?: boolean; ollama?: string;
};

// Popular open models (params in billions). MoE: `active` is for speed only —
// VRAM holds ALL weights, so we size on total params.
const MODELS: Model[] = [
  { name: "Gemma 4 E2B", b: 2.3, family: "Gemma", gated: true, ollama: "hf.co/unsloth/gemma-4-E2B-it-GGUF" },
  { name: "Gemma 4 E4B", b: 4.5, family: "Gemma", gated: true, ollama: "hf.co/unsloth/gemma-4-E4B-it-GGUF" },
  { name: "Gemma 4 26B-MoE", b: 26, active: 4, family: "Gemma", gated: true },
  { name: "Gemma 4 31B", b: 31, family: "Gemma", gated: true },
  { name: "Gemma 2 9B", b: 9, family: "Gemma", gated: true, ollama: "gemma2:9b" },
  { name: "Llama 3.1 8B", b: 8, family: "Llama", gated: true, ollama: "llama3.1:8b" },
  { name: "Llama 3.3 70B", b: 70, family: "Llama", gated: true, ollama: "llama3.3:70b" },
  { name: "Qwen3 4B", b: 4, family: "Qwen", ollama: "qwen3:4b" },
  { name: "Qwen3 8B", b: 8, family: "Qwen", ollama: "qwen3:8b" },
  { name: "Qwen3 14B", b: 14, family: "Qwen", ollama: "qwen3:14b" },
  { name: "Qwen3 32B", b: 32, family: "Qwen", ollama: "qwen3:32b" },
  { name: "Mistral 7B", b: 7, family: "Mistral", ollama: "mistral" },
  { name: "Mistral Small 24B", b: 24, family: "Mistral", ollama: "mistral-small" },
  { name: "Phi-4 14B", b: 14, family: "Phi", ollama: "phi4" },
  { name: "DeepSeek-R1 14B", b: 14, family: "DeepSeek", ollama: "deepseek-r1:14b" },
  { name: "DeepSeek-R1 32B", b: 32, family: "DeepSeek", ollama: "deepseek-r1:32b" },
];

// Rough VRAM models. Q4 inference ≈ 0.55 GB/B weights + ~1.5GB overhead.
// QLoRA fine-tune (Unsloth-optimized) ≈ 0.6 GB/B + ~2.5GB.
const Q4 = 0.55, OH_I = 1.5, FT = 0.6, OH_FT = 2.5;
const needInfer = (b: number) => b * Q4 + OH_I;
const needFT = (b: number) => b * FT + OH_FT;

type Verdict = "yes" | "maybe" | "no";

export function HardwareAdvisor() {
  const { t, lang } = useLab();
  const [hw, setHw] = useState<Hardware | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { getHardware().then(setHw).catch(() => {}); }, []);

  const gpu = hw?.gpu_budget_gb ?? null;          // GPU/unified budget (GB)
  const ram = hw?.ram_gb ?? null;
  const isCpu = hw?.device === "cpu" || gpu == null;

  const rows = useMemo(() => MODELS.map((m) => {
    const ni = needInfer(m.b), nf = needFT(m.b);
    // inference
    let inf: Verdict = "no";
    const offloadBudget = (gpu ?? 0) + (ram ?? 0) - 2;
    if (gpu != null && ni <= gpu - 1) inf = "yes";
    else if (ni <= offloadBudget) inf = "maybe";
    // fine-tune (QLoRA needs a CUDA GPU realistically)
    let ft: Verdict = "no";
    if (gpu != null && !isCpu) {
      if (nf <= gpu) ft = "yes";
      else if (nf <= gpu * 1.4) ft = "maybe";
    }
    return { m, ni, nf, inf, ft };
  }), [gpu, ram, isCpu]);

  const maxInfer = useMemo(() => {
    const fit = rows.filter((r) => r.inf === "yes").map((r) => r.m.b);
    return fit.length ? Math.max(...fit) : 0;
  }, [rows]);
  const maxFt = useMemo(() => {
    const fit = rows.filter((r) => r.ft === "yes").map((r) => r.m.b);
    return fit.length ? Math.max(...fit) : 0;
  }, [rows]);

  const copy = (s: string) => { navigator.clipboard?.writeText(s); setCopied(s); setTimeout(() => setCopied(null), 1200); };

  const Pill = ({ v, label }: { v: Verdict; label: string }) => {
    const bg = v === "yes" ? "var(--yuv-yellow)" : v === "maybe" ? "rgba(94,23,235,.12)" : "var(--yuv-grey)";
    const col = v === "yes" ? "#000" : v === "maybe" ? "var(--yuv-purple)" : "#888";
    const mark = v === "yes" ? "✓" : v === "maybe" ? "≈" : "✕";
    return <span className="mono" style={{ background: bg, color: col, border: "1.5px solid " + (v === "no" ? "#ccc" : "#000"), padding: "3px 8px", fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>{mark} {label}</span>;
  };

  return (
    <section id="hardware" className="content section" style={{ borderTop: "2px solid var(--yuv-grey-dark)" }}>
      <div className="wrap">
        <div className="eyebrow" style={{ color: "var(--yuv-purple)" }}>{t("THE ACADEMY · YOUR MACHINE", "האקדמיה · המכונה שלך")}</div>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", marginTop: 8 }}>
          <span className="purple-bar" />
          <h2 className="display" style={{ fontSize: "clamp(28px,4.6vw,48px)" }}>{t("Will it run on YOUR machine?", "האם זה ירוץ על המכונה שלך?")}</h2>
        </div>
        <p style={{ maxWidth: 760, marginTop: 14, fontSize: 17, lineHeight: 1.6 }}>
          {t("We auto-detected your hardware. Below: which open LLMs you can RUN locally (Ollama / LM Studio, 4-bit) and which you can FINE-TUNE with QLoRA (Unsloth) — right here, no cloud.",
             "זיהינו אוטומטית את החומרה שלך. למטה: אילו LLM פתוחים אפשר להריץ מקומית (Ollama / LM Studio, 4-bit) ואילו אפשר לכוונן עם QLoRA (Unsloth) — כאן, בלי ענן.")}
        </p>

        {/* detected specs */}
        <div className="fx-reveal" style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
          {[
            { k: t("GPU", "GPU"), v: hw?.device === "cuda" ? hw?.device_name : hw?.device === "mps" ? t("Apple Silicon", "Apple Silicon") : t("none (CPU)", "אין (CPU)") },
            { k: t("VRAM", "VRAM"), v: hw?.vram_gb != null ? `${hw.vram_gb} GB` : (hw?.device === "mps" ? t("unified", "מאוחד") : "—") },
            { k: t("System RAM", "זיכרון מערכת"), v: hw?.ram_gb != null ? `${hw.ram_gb} GB` : "—" },
            { k: t("CPU cores", "ליבות CPU"), v: hw?.cores ?? "—" },
          ].map((s, i) => (
            <div key={i} style={{ borderInlineStart: "3px solid var(--yuv-yellow)", paddingInlineStart: 14 }}>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 900, fontSize: 22, color: "var(--yuv-purple)", lineHeight: 1.1 }}>{String(s.v)}</div>
              <div className="mono" style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>{s.k}</div>
            </div>
          ))}
        </div>

        {hw && !hw.error && (
          <div className="card fx-reveal" style={{ marginTop: 16, borderColor: "var(--yuv-purple)" }}>
            <p style={{ fontSize: 15.5, lineHeight: 1.6 }}>
              {isCpu
                ? t("No CUDA GPU detected — you can still RUN small quantized models on CPU (slower), but QLoRA fine-tuning really wants an NVIDIA GPU.",
                     "לא זוהה GPU של CUDA — עדיין אפשר להריץ מודלים קטנים מקוונטזים על CPU (לאט יותר), אבל כוונון QLoRA באמת רוצה GPU של NVIDIA.")
                : t(`On this machine you can comfortably RUN models up to ~${Math.round(maxInfer)}B (4-bit) and FINE-TUNE up to ~${Math.round(maxFt)}B with QLoRA. Bigger models still run with CPU offload — just slower.`,
                     `על המכונה הזו אפשר בנוחות להריץ מודלים עד ~${Math.round(maxInfer)}B (4-bit) ולכוונן עד ~${Math.round(maxFt)}B עם QLoRA. מודלים גדולים יותר עדיין רצים עם CPU offload — רק לאט יותר.`)}
            </p>
          </div>
        )}

        {/* catalog table */}
        <div className="card" style={{ marginTop: 20, overflowX: "auto" }}>
          <table className="mono" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {[t("Model", "מודל"), t("Size", "גודל"), t("Run locally", "הרצה מקומית"), t("Fine-tune (QLoRA)", "כוונון (QLoRA)"), t("Get it", "להשיג")].map((h) => (
                  <th key={h} style={{ textAlign: lang === "he" ? "right" : "left", padding: "8px 10px", borderBottom: "2px solid #000", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ m, ni, nf, inf, ft }) => (
                <tr key={m.name}>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--yuv-grey)", whiteSpace: "nowrap" }}>
                    {m.name}{m.gated ? <span title={t("gated — accept license on HF", "גייטד — אשר רישיון ב-HF")} style={{ color: "var(--yuv-purple)" }}> ★</span> : ""}
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--yuv-grey)", opacity: .8 }}>{m.b}B{m.active ? ` (${m.active}B act)` : ""}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--yuv-grey)" }}>
                    <Pill v={inf} label={inf === "yes" ? t("runs · GPU", "רץ · GPU") : inf === "maybe" ? t("offload · slow", "offload · לאט") : t("too big", "גדול מדי")} />
                    <span style={{ opacity: .55, marginInlineStart: 8 }}>~{ni.toFixed(0)}GB</span>
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--yuv-grey)" }}>
                    <Pill v={ft} label={ft === "yes" ? t("yes", "כן") : ft === "maybe" ? t("tight", "צפוף") : t("no", "לא")} />
                    <span style={{ opacity: .55, marginInlineStart: 8 }}>~{nf.toFixed(0)}GB</span>
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--yuv-grey)", whiteSpace: "nowrap" }}>
                    {m.ollama && inf !== "no" ? (
                      <button onClick={() => copy(`ollama run ${m.ollama}`)} title={t("copy command", "העתק פקודה")}
                        style={{ border: "1.5px solid #000", background: copied === `ollama run ${m.ollama}` ? "var(--yuv-yellow)" : "#fff", padding: "3px 8px", cursor: "pointer", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
                        {copied === `ollama run ${m.ollama}` ? t("copied!", "הועתק!") : `ollama run ${m.ollama!.length > 22 ? m.ollama!.slice(0, 20) + "…" : m.ollama}`}
                      </button>
                    ) : (
                      <span style={{ opacity: .55 }}>{t("HF / LM Studio", "HF / LM Studio")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* legend + tools + caveat */}
        <div style={{ marginTop: 16, display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 12 }}><Pill v="yes" label={t("fits in VRAM", "נכנס ל-VRAM")} /></span>
          <span className="mono" style={{ fontSize: 12 }}><Pill v="maybe" label={t("possible (offload / tight)", "אפשרי (offload / צפוף)")} /></span>
          <span className="mono" style={{ fontSize: 12 }}><Pill v="no" label={t("too big here", "גדול מדי כאן")} /></span>
          <span className="mono" style={{ fontSize: 12, opacity: .7 }}>★ {t("gated — accept the license on Hugging Face", "גייטד — אשר את הרישיון ב-Hugging Face")}</span>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { n: "Ollama", u: "https://ollama.com", d: t("one-command local run", "הרצה מקומית בפקודה אחת") },
            { n: "LM Studio", u: "https://lmstudio.ai", d: t("desktop GUI, search & download GGUF", "GUI לשולחן עבודה, חיפוש והורדת GGUF") },
            { n: "Unsloth", u: "https://unsloth.ai", d: t("2× faster QLoRA fine-tuning", "כוונון QLoRA מהיר פי 2") },
          ].map((tool) => (
            <a key={tool.n} href={tool.u} target="_blank" rel="noreferrer" className="card" style={{ padding: "12px 16px", textDecoration: "none", color: "inherit", flex: "1 1 200px", transition: "transform .15s" }}>
              <div className="display" style={{ fontSize: 18 }}>{tool.n}</div>
              <div className="mono" style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>{tool.d}</div>
            </a>
          ))}
        </div>
        <p className="mono" style={{ fontSize: 12, opacity: .65, marginTop: 14, lineHeight: 1.5 }}>
          {t("Estimates assume 4-bit (Q4) weights + a little overhead for KV-cache/context. Real usage shifts with quant level, context length and batch size. Long contexts need more; Ollama tags — verify the exact name at ollama.com/library.",
             "ההערכות מניחות משקלי 4-bit (Q4) + מעט תקורה ל-KV-cache/הקשר. השימוש בפועל משתנה עם רמת הקוונטיזציה, אורך ההקשר וגודל ה-batch. הקשרים ארוכים דורשים יותר; תגיות Ollama — ודא את השם המדויק ב-ollama.com/library.")}
        </p>
      </div>
    </section>
  );
}
