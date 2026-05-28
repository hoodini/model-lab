"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLab } from "./providers";
import { Explain } from "./Explain";
import { tokenize as apiTokenize, inspect as apiInspect, type Inspect } from "@/lib/api";

/* ───────────────────────────────────────────────────────────────────────────
   "Under the Hood" — trace a real prompt through every stage of the router,
   from raw text to a routing decision. Each stage gets a real visual so the
   abstract terms (tokens, embeddings, attention, logits, softmax) become
   things you can SEE. Standalone: the 4 lanes are hardcoded so this section
   tells the whole story even before a model is trained.
─────────────────────────────────────────────────────────────────────────── */

type Lane = { key: string; en: string; he: string };
const LANES: Lane[] = [
  { key: "code", en: "Code", he: "קוד" },
  { key: "simple_chat", en: "Simple chat", he: "שיחה פשוטה" },
  { key: "reasoning", en: "Reasoning", he: "היגיון" },
  { key: "creative", en: "Creative", he: "יצירתי" },
];

// Deterministic pseudo-random — used ONLY as an offline fallback when the
// backend is unreachable. When the backend is up, every embedding and
// attention value below is the model's real output (see /api/inspect).
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Colour a 0..1 weight along the purple↔yellow brand ramp.
function ramp(w: number): string {
  // low = deep purple, mid = bright purple, high = yellow
  if (w < 0.5) {
    const t = w / 0.5;
    const r = Math.round(61 + (94 - 61) * t);
    const g = Math.round(13 + (23 - 13) * t);
    const b = Math.round(168 + (235 - 168) * t);
    return `rgb(${r},${g},${b})`;
  }
  const t = (w - 0.5) / 0.5;
  const r = Math.round(94 + (255 - 94) * t);
  const g = Math.round(23 + (236 - 23) * t);
  const b = Math.round(235 + (0 - 235) * t);
  return `rgb(${r},${g},${b})`;
}

type Stage = {
  id: string;
  concept?: string;
  en: string;
  he: string;
};
const STAGES: Stage[] = [
  { id: "text", en: "Raw text", he: "טקסט גולמי" },
  { id: "tokens", concept: "bpe", en: "Tokenize", he: "טוקניזציה" },
  { id: "ids", concept: "tokenization", en: "Token IDs", he: "מזהי טוקנים" },
  { id: "embed", concept: "embeddings", en: "Embeddings", he: "אמבדינגים" },
  { id: "encoder", concept: "encoder", en: "Encoder", he: "אנקודר" },
  { id: "pool", concept: "neural_net", en: "[CLS] pooling", he: "איגום [CLS]" },
  { id: "logits", concept: "logits", en: "Logits", he: "לוגיטים" },
  { id: "softmax", concept: "softmax", en: "Softmax → route", he: "סופטמקס → ניתוב" },
];

const DEFAULT_EN = "Write a Python function that sorts an array";
const DEFAULT_HE = "כתוב פונקציה בפייתון שממיינת מערך";

// Keyword bias → makes logits land on a believable lane for the typed prompt.
function laneBias(text: string): number[] {
  const t = text.toLowerCase();
  const b = [0, 0, 0, 0]; // code, simple_chat, reasoning, creative
  const has = (...ws: string[]) => ws.some((w) => t.includes(w));
  if (has("function", "python", "code", "array", "bug", "api", "script", "כתוב פונקציה", "קוד", "פייתון", "מערך")) b[0] += 3;
  if (has("hi", "hello", "thanks", "how are", "שלום", "תודה", "מה שלומך")) b[1] += 3;
  if (has("why", "explain", "prove", "calculate", "step", "logic", "reason", "למה", "הסבר", "חשב", "הוכח")) b[2] += 3;
  if (has("poem", "story", "imagine", "write a song", "creative", "שיר", "סיפור", "דמיין", "יצירתי")) b[3] += 3;
  if (b.every((x) => x === 0)) b[1] += 1; // default lean to simple chat
  return b;
}

export function Anatomy() {
  const { lang, t } = useLab();
  const [stage, setStage] = useState(0);
  const [prompt, setPrompt] = useState(lang === "he" ? DEFAULT_HE : DEFAULT_EN);
  const [tokens, setTokens] = useState<{ piece: string; id: number }[]>([]);
  const [insp, setInsp] = useState<Inspect | null>(null);
  const [live, setLive] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Swap the default prompt when language flips (only if user hasn't edited).
  const editedRef = useRef(false);
  useEffect(() => {
    if (!editedRef.current) setPrompt(lang === "he" ? DEFAULT_HE : DEFAULT_EN);
  }, [lang]);

  // Real tokens from the backend tokenizer; fall back to whitespace split
  // so the section still works if the backend is down.
  useEffect(() => {
    let live = true;
    const fallback = () =>
      prompt
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((p, i) => ({ piece: p, id: 1000 + (hashStr(p) % 29000) }));
    apiTokenize(prompt)
      .then((r) => {
        if (live && r?.tokens?.length) setTokens(r.tokens);
        else if (live) setTokens(fallback());
      })
      .catch(() => live && setTokens(fallback()));
    return () => {
      live = false;
    };
  }, [prompt]);

  // Fetch the model's REAL internals (embeddings + attention) for this prompt.
  // Debounced so we don't hammer the backend on every keystroke. Falls back to
  // the deterministic offline demo if the backend is unreachable.
  useEffect(() => {
    let live = true;
    const id = setTimeout(() => {
      apiInspect(prompt)
        .then((r) => {
          if (!live) return;
          if (r?.tokens?.length) { setInsp(r); setLive(true); }
          else { setInsp(null); setLive(false); }
        })
        .catch(() => { if (live) { setInsp(null); setLive(false); } });
    }, 350);
    return () => { live = false; clearTimeout(id); };
  }, [prompt]);

  const seed = useMemo(() => hashStr(prompt), [prompt]);
  // When live, drive the visuals off the model's real token count. The inspect
  // and tokenize endpoints share a tokenizer, so positions stay aligned.
  const n = Math.min((insp?.tokens.length ?? tokens.length), 12) || 1;

  // Per-token embedding strips. REAL: the model's input-embedding vectors,
  // min-max normalised to 0..1 purely for colour mapping (values stay faithful
  // to their relative magnitude). Offline fallback: deterministic per token.
  const embRows = useMemo(() => {
    if (insp?.embeddings?.length) {
      const flat = insp.embeddings.flat();
      const lo = Math.min(...flat);
      const hi = Math.max(...flat);
      const span = hi - lo || 1;
      return insp.embeddings.map((row) => row.map((v) => (v - lo) / span));
    }
    return tokens.slice(0, 12).map((tk) => {
      const r = mulberry32(seed ^ tk.id);
      return Array.from({ length: 16 }, () => r());
    });
  }, [insp, tokens, seed]);

  // Self-attention matrix n×n (rows attend to cols). REAL: averaged over heads
  // from the model's last layer (already softmaxed, sums to 1 per row).
  const attn = useMemo(() => {
    if (insp?.attention?.length) return insp.attention;
    const r = mulberry32(seed + 7);
    const m = Array.from({ length: n }, () => Array.from({ length: n }, () => r()));
    return m.map((row) => {
      const exp = row.map((x) => Math.exp(x * 2.2));
      const s = exp.reduce((a, b) => a + b, 0);
      return exp.map((x) => x / s);
    });
  }, [insp, n, seed]);

  // Individual attention heads. REAL: the model's per-head matrices.
  const heads = useMemo(() => {
    if (insp?.heads?.length) return insp.heads;
    return [0, 1, 2, 3].map((h) => {
      const r = mulberry32(seed + 31 * (h + 1));
      const m = Array.from({ length: n }, () => Array.from({ length: n }, () => r()));
      return m.map((row) => {
        const exp = row.map((x) => Math.exp(x * 2));
        const s = exp.reduce((a, b) => a + b, 0);
        return exp.map((x) => x / s);
      });
    });
  }, [insp, n, seed]);

  // Logits + softmax over the 4 lanes.
  const logits = useMemo(() => {
    const r = mulberry32(seed + 99);
    const bias = laneBias(prompt);
    return LANES.map((_, i) => (r() * 4 - 2) + bias[i]);
  }, [prompt, seed]);
  const probs = useMemo(() => {
    const exp = logits.map((x) => Math.exp(x));
    const s = exp.reduce((a, b) => a + b, 0);
    return exp.map((x) => x / s);
  }, [logits]);
  const winner = probs.indexOf(Math.max(...probs));

  const [encTab, setEncTab] = useState<"self" | "multi" | "ffn">("self");

  // Animate the stage canvas on every stage change.
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".stage-el",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.03, ease: "power2.out" }
      );
    }, canvasRef);
    return () => ctx.revert();
  }, [stage, encTab, lang, tokens]);

  const cur = STAGES[stage];

  return (
    <section className="content section" id="anatomy">
      <div className="wrap">
        <div className="eyebrow" style={{ color: "var(--yuv-purple-dark)" }}>
          {t("Under the hood", "מתחת למכסה המנוע")}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", marginTop: 8 }}>
          <span className="purple-bar" />
          <h2 className="display" style={{ fontSize: "clamp(30px,5vw,52px)" }}>
            {t("Watch a prompt become a decision", "צפו בפרומפט הופך להחלטה")}
          </h2>
        </div>
        <p style={{ maxWidth: 720, marginTop: 12, fontSize: 17, lineHeight: 1.6 }}>
          {t(
            "Type any prompt and step through every stage the model runs — the same path your text travels from raw characters to a routed lane. Nothing here is hidden.",
            "הקלידו פרומפט כלשהו וצעדו דרך כל שלב שהמודל מריץ — אותו מסלול שהטקסט שלכם עובר מתווים גולמיים ועד לל־ליין הנבחר. שום דבר כאן לא מוסתר."
          )}
        </p>

        {/* Prompt input */}
        <div style={{ marginTop: 20, maxWidth: 720 }}>
          <label className="mono" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em" }}>
            {t("Your prompt", "הפרומפט שלך")}
          </label>
          <input
            value={prompt}
            onChange={(e) => {
              editedRef.current = true;
              setPrompt(e.target.value);
            }}
            style={{ marginTop: 6 }}
          />
        </div>

        {/* Stage rail */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 24,
          }}
        >
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStage(i)}
              className="mono stage-pill"
              style={{
                cursor: "pointer",
                border: "2px solid var(--yuv-black)",
                background: i === stage ? "var(--yuv-purple)" : i < stage ? "var(--yuv-yellow)" : "#fff",
                color: i === stage ? "#fff" : "#000",
                padding: "6px 12px",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: ".04em",
                fontWeight: 700,
              }}
            >
              <span style={{ opacity: 0.6 }}>{String(i + 1).padStart(2, "0")}</span> {s[lang]}
            </button>
          ))}
        </div>

        {/* The black stage canvas */}
        <div
          ref={canvasRef}
          className="act"
          style={{
            marginTop: 16,
            background: "var(--yuv-black)",
            border: "3px solid var(--yuv-purple)",
            padding: "28px 24px",
            minHeight: 320,
            color: "#fff",
          }}
        >
          <div className="stage-el" style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div className="display" style={{ fontSize: 26, color: "var(--yuv-yellow)" }}>
              {String(stage + 1).padStart(2, "0")}
            </div>
            <div className="display" style={{ fontSize: 26 }}>{cur[lang]}</div>
            {live && (cur.id === "embed" || cur.id === "encoder") && (
              <span className="mono" style={{
                marginInlineStart: "auto", fontSize: 11, fontWeight: 700,
                color: "#000", background: "var(--yuv-yellow)", padding: "3px 10px",
                textTransform: "uppercase", letterSpacing: ".06em",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: "#000", display: "inline-block" }} />
                {t("Live from model", "חי מהמודל")}
              </span>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <StageBody
              stage={cur.id}
              lang={lang}
              t={t}
              prompt={prompt}
              tokens={tokens}
              live={live}
              embRows={embRows}
              attn={attn}
              heads={heads}
              encTab={encTab}
              setEncTab={setEncTab}
              logits={logits}
              probs={probs}
              winner={winner}
            />
          </div>
        </div>

        {/* Prev / Next */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 12 }}>
          <button
            className="btn"
            disabled={stage === 0}
            onClick={() => setStage((s) => Math.max(0, s - 1))}
          >
            {t("← Prev", "→ הקודם")}
          </button>
          <button
            className="btn btn-purple"
            disabled={stage === STAGES.length - 1}
            onClick={() => setStage((s) => Math.min(STAGES.length - 1, s + 1))}
          >
            {t("Next →", "← הבא")}
          </button>
        </div>

        {/* Per-stage concept explainer at the user's level */}
        {cur.concept && (
          <div style={{ maxWidth: 760, marginTop: 8 }}>
            <Explain concept={cur.concept as never} />
          </div>
        )}

        {/* Encoder vs decoder — the question the user asked directly */}
        <EncoderVsDecoder t={t} lang={lang} />
      </div>
    </section>
  );
}

/* ── Per-stage visualizations ──────────────────────────────────────────── */
function StageBody(props: {
  stage: string;
  lang: "en" | "he";
  t: (en: string, he: string) => string;
  prompt: string;
  tokens: { piece: string; id: number }[];
  live: boolean;
  embRows: number[][];
  attn: number[][];
  heads: number[][][];
  encTab: "self" | "multi" | "ffn";
  setEncTab: (v: "self" | "multi" | "ffn") => void;
  logits: number[];
  probs: number[];
  winner: number;
}) {
  const { stage, lang, t, prompt, tokens, live, embRows, attn, heads, encTab, setEncTab, logits, probs, winner } = props;
  const shown = tokens.slice(0, 12);

  if (stage === "text") {
    return (
      <div className="stage-el">
        <div style={{ fontSize: 26, lineHeight: 1.5, fontFamily: "var(--font-mono)" }}>{prompt}</div>
        <p style={{ marginTop: 16, opacity: 0.8 }}>
          {t(
            `Just characters — ${prompt.length} of them. The model can't read letters; first it has to chop the text into known pieces.`,
            `רק תווים — ${prompt.length} מהם. המודל לא יודע לקרוא אותיות; קודם הוא חייב לחתוך את הטקסט לחתיכות מוכרות.`
          )}
        </p>
      </div>
    );
  }

  if (stage === "tokens") {
    return (
      <div className="stage-el">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {shown.map((tk, i) => (
            <span
              key={i}
              className="mono"
              style={{
                background: i % 2 ? "var(--yuv-purple)" : "var(--yuv-purple-dark)",
                color: "#fff",
                padding: "6px 10px",
                border: "1px solid rgba(255,255,255,.25)",
              }}
            >
              {tk.piece.replace(/^##/, "▸").replace(/^▁/, "·")}
            </span>
          ))}
        </div>
        <p style={{ marginTop: 16, opacity: 0.8 }}>
          {t(
            `${tokens.length} tokens. Subword pieces (▸ marks a continuation of the previous word) let a fixed vocabulary cover any text — even words it never saw in training.`,
            `${tokens.length} טוקנים. חתיכות תת־מילה (▸ מסמן המשך של המילה הקודמת) מאפשרות לאוצר מילים קבוע לכסות כל טקסט — אפילו מילים שמעולם לא נראו באימון.`
          )}
        </p>
      </div>
    );
  }

  if (stage === "ids") {
    return (
      <div className="stage-el">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {shown.map((tk, i) => (
            <span key={i} className="mono" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", border: "1px solid rgba(255,255,255,.25)" }}>
              <span style={{ padding: "3px 8px", opacity: 0.7, fontSize: 11 }}>{tk.piece.replace(/^##/, "▸").replace(/^▁/, "·")}</span>
              <span style={{ padding: "5px 8px", background: "var(--yuv-yellow)", color: "#000", fontWeight: 700 }}>{tk.id}</span>
            </span>
          ))}
        </div>
        <p style={{ marginTop: 16, opacity: 0.8 }}>
          {t(
            "Each piece is just a row number into the vocabulary table. Pure integers now — that's all the network ever actually receives.",
            "כל חתיכה היא בסך הכל מספר שורה בטבלת אוצר המילים. מספרים שלמים בלבד עכשיו — זה כל מה שהרשת באמת מקבלת."
          )}
        </p>
      </div>
    );
  }

  if (stage === "embed") {
    return (
      <div className="stage-el">
        <div style={{ display: "grid", gap: 4 }}>
          {embRows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mono" style={{ width: 86, fontSize: 11, textAlign: lang === "he" ? "left" : "right", opacity: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {shown[ri]?.piece.replace(/^##/, "▸").replace(/^▁/, "·")}
              </span>
              <div style={{ display: "flex", gap: 2 }}>
                {row.map((w, ci) => (
                  <span key={ci} style={{ width: 16, height: 16, background: ramp(w) }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Honest color legend — what the cells actually mean */}
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>
            {t("each row = one token", "כל שורה = טוקן אחד")}
          </span>
          <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>
            {t("each column = one dimension", "כל עמודה = מימד אחד")}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>{t("low", "נמוך")}</span>
            <span style={{ width: 120, height: 12, background: "linear-gradient(90deg, var(--yuv-purple), var(--yuv-yellow))", display: "inline-block" }} />
            <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>{t("high", "גבוה")}</span>
          </span>
        </div>

        <p style={{ marginTop: 12, opacity: 0.8 }}>
          {t(
            "Each cell's color is one number in that token's vector: purple = low, yellow = high. Read a row left-to-right and you're reading the token's coordinates in meaning-space. Every ID is looked up into a learned 768-number vector (16 shown here). Similar meanings get similar vectors — this is where text turns into geometry.",
            "צבע כל משבצת הוא מספר אחד בוקטור של הטוקן: סגול = נמוך, צהוב = גבוה. קראו שורה משמאל לימין וזה הקואורדינטות של הטוקן במרחב־המשמעות. כל מזהה מומר לוקטור נלמד של 768 מספרים (16 מוצגים כאן). משמעויות דומות מקבלות וקטורים דומים — כאן הטקסט הופך לגאומטריה."
          )}
        </p>
        <p className="mono" style={{ marginTop: 8, fontSize: 11, opacity: 0.55 }}>
          {live
            ? t(
                "These are the model's REAL input-embedding values for your prompt (first 16 of 768 dims), pulled live from a forward pass. Colour is min-max normalised so the range is visible.",
                "אלו ערכי האמבדינג האמיתיים של המודל עבור הפרומפט שלך (16 מתוך 768 מימדים), נשלפים חי ממעבר קדימה. הצבע מנורמל מינ-מקס כדי שהטווח ייראה."
              )
            : t(
                "Backend offline — showing an illustrative pattern. Start the API to see the model's real embedding values here.",
                "השרת לא זמין — מוצג דפוס להמחשה. הפעילו את ה-API כדי לראות כאן את ערכי האמבדינג האמיתיים של המודל."
              )}
        </p>
      </div>
    );
  }

  if (stage === "encoder") {
    return (
      <div className="stage-el">
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {([["self", t("Self-attention", "סלף־אטנשן")], ["multi", t("Multi-head", "מולטי־הד")], ["ffn", t("Feed-forward", "פיד־פורוורד")]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setEncTab(k)}
              className="mono"
              style={{
                cursor: "pointer",
                border: "2px solid #fff",
                background: encTab === k ? "var(--yuv-yellow)" : "transparent",
                color: encTab === k ? "#000" : "#fff",
                padding: "5px 12px",
                fontSize: 12,
                textTransform: "uppercase",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {encTab === "self" && <AttnGrid m={attn} tokens={shown} lang={lang} cell={Math.max(14, Math.min(28, Math.floor(300 / Math.max(attn.length, 1))))} />}

        {encTab === "multi" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 14 }}>
            {heads.map((h, i) => (
              <div key={i}>
                <div className="mono" style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>{t("Head", "ראש")} {i + 1}</div>
                <AttnGrid m={h} tokens={shown} lang={lang} cell={11} compact />
              </div>
            ))}
          </div>
        )}

        {encTab === "ffn" && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <NetCol n={4} label="768" />
            <Arrow />
            <NetCol n={7} label="3072" highlight />
            <Arrow />
            <NetCol n={4} label="768" />
          </div>
        )}

        <div style={{ marginTop: 16, display: "inline-block", background: "var(--yuv-purple)", color: "#fff", padding: "4px 12px" }} className="mono">
          ×6 {t("encoder layers stacked", "שכבות אנקודר מוערמות")}
        </div>
        <p style={{ marginTop: 14, opacity: 0.85 }}>
          {encTab === "self" &&
            t(
              "Each token looks at every other token and decides how much to borrow from each. Brighter = more attention. This is how context flows in.",
              "כל טוקן מסתכל על כל טוקן אחר ומחליט כמה לשאוב מכל אחד. בהיר יותר = יותר תשומת לב. כך הקונטקסט זורם פנימה."
            )}
          {encTab === "multi" &&
            t(
              "12 heads run in parallel (4 shown), each learning a different relationship — syntax, subject, position. Their outputs are concatenated.",
              "12 ראשים רצים במקביל (4 מוצגים), כל אחד לומד יחס אחר — תחביר, נושא, מיקום. הפלטים שלהם משורשרים יחד."
            )}
          {encTab === "ffn" &&
            t(
              "After attention mixes tokens, each token is pushed through a 2-layer network (768→3072→768) on its own. Expand, transform, compress.",
              "אחרי שהאטנשן מערבב טוקנים, כל טוקן עובר דרך רשת דו־שכבתית (768→3072→768) בנפרד. הרחבה, טרנספורמציה, כיווץ."
            )}
        </p>
      </div>
    );
  }

  if (stage === "pool") {
    return (
      <div className="stage-el">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span className="mono" style={{ background: "var(--yuv-yellow)", color: "#000", padding: "6px 10px", fontWeight: 700, border: "2px solid #fff" }}>[CLS]</span>
          {shown.slice(0, 8).map((tk, i) => (
            <span key={i} className="mono" style={{ background: "rgba(255,255,255,.12)", padding: "6px 10px", opacity: 0.5 }}>
              {tk.piece.replace(/^##/, "▸").replace(/^▁/, "·")}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12 }}>
          <Arrow />
          <div style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} style={{ width: 10, height: 28, background: ramp(mulberry32(i + 5)()) }} />
            ))}
          </div>
          <span className="mono" style={{ opacity: 0.7 }}>{t("one 768-vector", "וקטור 768 יחיד")}</span>
        </div>
        <p style={{ marginTop: 16, opacity: 0.8 }}>
          {t(
            "A special [CLS] slot sits at the front. After the encoder, its vector has soaked up the whole sentence — we use just that one vector to classify.",
            "משבצת [CLS] מיוחדת יושבת בהתחלה. אחרי האנקודר, הוקטור שלה ספג את כל המשפט — אנחנו משתמשים רק בוקטור הזה כדי לסווג."
          )}
        </p>
      </div>
    );
  }

  if (stage === "logits") {
    const max = Math.max(...logits.map(Math.abs), 1);
    return (
      <div className="stage-el">
        <div style={{ display: "grid", gap: 10 }}>
          {LANES.map((l, i) => (
            <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="mono" style={{ width: 110, fontSize: 13 }}>{l[lang]}</span>
              <div style={{ flex: 1, height: 26, position: "relative", background: "rgba(255,255,255,.08)" }}>
                <div
                  style={{
                    position: "absolute",
                    insetInlineStart: "50%",
                    width: `${(Math.abs(logits[i]) / max) * 48}%`,
                    height: "100%",
                    background: logits[i] >= 0 ? "var(--yuv-yellow)" : "var(--yuv-purple)",
                    transform: logits[i] >= 0 ? "none" : "translateX(-100%)",
                  }}
                />
              </div>
              <span className="mono" style={{ width: 56, textAlign: "end", fontSize: 13 }}>{logits[i].toFixed(2)}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16, opacity: 0.8 }}>
          {t(
            "The [CLS] vector × a learned 768×4 weight matrix → 4 raw scores. They can be negative and don't sum to anything. Just confidence, unnormalized.",
            "וקטור ה־[CLS] × מטריצת משקלים נלמדת 768×4 ← 4 ציונים גולמיים. הם יכולים להיות שליליים ולא מסתכמים לכלום. רק ביטחון, ללא נרמול."
          )}
        </p>
      </div>
    );
  }

  if (stage === "softmax") {
    return (
      <div className="stage-el">
        <div style={{ display: "grid", gap: 10 }}>
          {LANES.map((l, i) => (
            <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="mono" style={{ width: 110, fontSize: 13, color: i === winner ? "var(--yuv-yellow)" : "#fff", fontWeight: i === winner ? 700 : 400 }}>{l[lang]}</span>
              <div style={{ flex: 1, height: 26, background: "rgba(255,255,255,.08)" }}>
                <div style={{ width: `${probs[i] * 100}%`, height: "100%", background: i === winner ? "var(--yuv-yellow)" : "var(--yuv-purple)" }} />
              </div>
              <span className="mono" style={{ width: 56, textAlign: "end", fontSize: 13 }}>{(probs[i] * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="mono" style={{ opacity: 0.7 }}>{t("Routed to", "מנותב אל")}</span>
          <span className="display" style={{ fontSize: 30, background: "var(--yuv-yellow)", color: "#000", padding: "2px 14px" }}>
            {LANES[winner][lang]}
          </span>
        </div>
        <p style={{ marginTop: 16, opacity: 0.8 }}>
          {t(
            "Softmax squashes the raw logits into 4 probabilities that sum to 100%. The biggest wins — and that's the lane the prompt is sent to.",
            "סופטמקס דוחס את הלוגיטים הגולמיים ל־4 הסתברויות שמסתכמות ב־100%. הגדול ביותר מנצח — וזה הליין שאליו הפרומפט נשלח."
          )}
        </p>
      </div>
    );
  }

  return null;
}

function AttnGrid({ m, tokens, lang, cell, compact }: { m: number[][]; tokens: { piece: string }[]; lang: "en" | "he"; cell: number; compact?: boolean }) {
  const max = Math.max(...m.flat(), 0.0001);
  return (
    <div style={{ display: "inline-block" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${m.length}, ${cell}px)`, gap: 2 }}>
        {m.map((row, ri) =>
          row.map((w, ci) => (
            <span key={`${ri}-${ci}`} title={`${tokens[ri]?.piece ?? ""} → ${tokens[ci]?.piece ?? ""}`} style={{ width: cell, height: cell, background: ramp(w / max) }} />
          ))
        )}
      </div>
      {!compact && (
        <div className="mono" style={{ fontSize: 10, opacity: 0.6, marginTop: 6 }}>
          {lang === "he" ? "שורות מסתכלות על עמודות" : "rows attend to columns"}
        </div>
      )}
    </div>
  );
}

function NetCol({ n, label, highlight }: { n: number; label: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Array.from({ length: n }).map((_, i) => (
          <span key={i} style={{ width: 18, height: 18, borderRadius: 999, background: highlight ? "var(--yuv-yellow)" : "var(--yuv-purple)", border: "2px solid #fff" }} />
        ))}
      </div>
      <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>{label}</span>
    </div>
  );
}

function Arrow() {
  return <span style={{ color: "var(--yuv-yellow)", fontSize: 24, lineHeight: 1 }}>→</span>;
}

/* ── Encoder vs Decoder — answers "why an encoder if I have tokens+embeddings" ── */
function EncoderVsDecoder({ t, lang }: { t: (en: string, he: string) => string; lang: "en" | "he" }) {
  const COLS = [
    {
      tag: t("Encoder-only", "אנקודר בלבד"),
      name: "BERT / DistilBERT",
      ours: true,
      reads: t("Reads the whole sentence at once, both directions", "קורא את כל המשפט בבת אחת, בשני הכיוונים"),
      good: t("Understanding & classifying — exactly our router", "הבנה וסיווג — בדיוק הראוטר שלנו"),
    },
    {
      tag: t("Decoder-only", "דקודר בלבד"),
      name: "GPT / Llama",
      ours: false,
      reads: t("Reads left-to-right, can't peek ahead (masked)", "קורא משמאל לימין, לא יכול להציץ קדימה (ממוסך)"),
      good: t("Generating text one token at a time", "ייצור טקסט טוקן אחד בכל פעם"),
    },
    {
      tag: t("Encoder-decoder", "אנקודר-דקודר"),
      name: "T5 / BART",
      ours: false,
      reads: t("One stack reads, another stack writes", "ערמה אחת קוראת, ערמה אחרת כותבת"),
      good: t("Translation, summarization — input→output", "תרגום, סיכום — קלט←פלט"),
    },
  ];
  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
        <span className="purple-bar" />
        <h3 className="display" style={{ fontSize: "clamp(22px,3.5vw,34px)" }}>
          {t("So why an encoder if you already have tokens + embeddings?", "אז למה צריך אנקודר אם כבר יש טוקנים + אמבדינגים?")}
        </h3>
      </div>
      <p style={{ maxWidth: 760, marginTop: 12, fontSize: 16, lineHeight: 1.65 }}>
        {t(
          "Tokens cut the text. Embeddings give each token a starting meaning — but in isolation. The word \"sorts\" means the same whether it's about arrays or laundry. The encoder is the part that MIXES those meanings using context, so \"sorts\" next to \"array\" comes out as code-flavored. Without it you have a bag of words with no relationships.",
          "טוקנים חותכים את הטקסט. אמבדינגים נותנים לכל טוקן משמעות התחלתית — אבל בבידוד. המילה \"ממיין\" אותה משמעות בין אם מדובר במערכים או בכביסה. האנקודר הוא החלק שמערבב את המשמעויות האלה לפי קונטקסט, כך ש\"ממיין\" ליד \"מערך\" יוצא בטעם של קוד. בלעדיו יש לך שק מילים בלי קשרים."
        )}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 20 }}>
        {COLS.map((c) => (
          <div
            key={c.name}
            className="card"
            style={{ borderColor: c.ours ? "var(--yuv-purple)" : "var(--yuv-black)", borderWidth: c.ours ? 3 : 2, position: "relative" }}
          >
            {c.ours && (
              <span className="mono" style={{ position: "absolute", insetInlineEnd: -2, top: -14, background: "var(--yuv-yellow)", color: "#000", padding: "2px 10px", fontSize: 11, fontWeight: 700, border: "2px solid #000" }}>
                {t("OUR ROUTER", "הראוטר שלנו")}
              </span>
            )}
            <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--yuv-purple-dark)" }}>{c.tag}</div>
            <div className="display" style={{ fontSize: 22, marginTop: 4 }}>{c.name}</div>
            <p style={{ fontSize: 14, marginTop: 10, lineHeight: 1.5 }}><strong>{t("Reads:", "קורא:")}</strong> {c.reads}</p>
            <p style={{ fontSize: 14, marginTop: 6, lineHeight: 1.5 }}><strong>{t("Best at:", "הכי טוב ב:")}</strong> {c.good}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
