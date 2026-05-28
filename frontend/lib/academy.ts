/* ───────────────────────────────────────────────────────────────────────────
   academy.ts — the deep-dive curriculum. Pure data: every block is bilingual
   (EN/HE) and written at three levels (beginner/intermediate/advanced). The
   <Lesson> component renders it and adapts to the reader's chosen level.

   This is the "real academy" layer: the model zoo, tokenizers, LoRA/QLoRA,
   Unsloth, diffusion, and ai-toolkit — how each works and when to pick it.
─────────────────────────────────────────────────────────────────────────── */

export type Tri = {
  beginner: { en: string; he: string };
  intermediate: { en: string; he: string };
  advanced: { en: string; he: string };
};

export type Block = {
  k: string;
  tagEn?: string; tagHe?: string;
  titleEn: string; titleHe: string;
  body: Tri;
};

export type DecisionRow = {
  wantEn: string; wantHe: string;
  useEn: string; useHe: string;
  whyEn: string; whyHe: string;
};

export type LessonData = {
  id: string;
  tone: "content" | "act";
  eyebrowEn: string; eyebrowHe: string;
  titleEn: string; titleHe: string;
  introEn: string; introHe: string;
  blocks: Block[];
  decision?: DecisionRow[];
};

// ── 1 · FOUNDATIONS: the model zoo + how to choose ──────────────────────────
export const FOUNDATIONS: LessonData = {
  id: "foundations",
  tone: "content",
  eyebrowEn: "THE ACADEMY · FOUNDATIONS",
  eyebrowHe: "האקדמיה · יסודות",
  titleEn: "Every model, and how to choose one",
  titleHe: "כל סוגי המודלים, ואיך לבחור",
  introEn: "There is no single \"AI model\". There's a zoo of shapes, each good at a different job. Get the shape right and a tiny model beats a giant one. Here's the whole zoo — and a cheat-sheet for picking.",
  introHe: "אין דבר כזה \"מודל AI\" אחד. יש גן חיות של צורות, כל אחת טובה במשימה אחרת. תבחר את הצורה הנכונה ומודל זעיר ינצח ענק. הנה כל גן החיות — וגיליון בחירה.",
  blocks: [
    {
      k: "nn", tagEn: "THE BASE", tagHe: "הבסיס",
      titleEn: "Neural networks", titleHe: "רשתות נוירונים",
      body: {
        beginner: {
          en: "Layers of tiny math units (\"neurons\"). Each multiplies its inputs by learned weights and passes the result on. Stack enough layers and the network can learn almost any pattern from examples.",
          he: "שכבות של יחידות מתמטיות זעירות (\"נוירונים\"). כל אחת מכפילה את הקלט במשקלים נלמדים ומעבירה הלאה. ערום מספיק שכבות והרשת לומדת כמעט כל תבנית מתוך דוגמאות.",
        },
        intermediate: {
          en: "Weighted sums followed by nonlinear activations, composed across layers. Training = forward pass → loss → backpropagation → gradient-descent weight updates. Depth lets the model build features on top of features.",
          he: "סכומים משוקללים ואחריהם אקטיבציות לא-ליניאריות, מורכבים לאורך שכבות. אימון = forward → loss → backpropagation → עדכון משקלים בגרדיאנט. עומק מאפשר למודל לבנות מאפיינים מעל מאפיינים.",
        },
        advanced: {
          en: "Universal function approximators. Today's workhorse is the Transformer — attention replaces recurrence, residual streams carry information, normalization stabilizes training. Architecture = inductive bias; pick it to match the data's structure.",
          he: "מקרבי פונקציות אוניברסליים. סוס העבודה כיום הוא הטרנספורמר — attention מחליף רקורסיה, residual streams נושאים מידע, נרמול מייצב אימון. ארכיטקטורה = הטיה אינדוקטיבית; בחר אותה כך שתתאים למבנה הדאטה.",
        },
      },
    },
    {
      k: "enc", tagEn: "UNDERSTAND", tagHe: "להבין",
      titleEn: "Encoder-only (BERT)", titleHe: "אנקודר בלבד (BERT)",
      body: {
        beginner: {
          en: "Reads the whole text at once to UNDERSTAND it — not to write. Perfect for sorting text into buckets. The router and sentiment classifier in this app are exactly this.",
          he: "קורא את כל הטקסט בבת אחת כדי להבין אותו — לא כדי לכתוב. מושלם למיון טקסט לתאים. הראוטר ומסווג הסנטימנט באפליקציה הזו הם בדיוק זה.",
        },
        intermediate: {
          en: "Bidirectional self-attention (every token sees every other), a [CLS] pooling slot, no causal mask. Outputs contextual embeddings; bolt on a small head to do classification, NER, or retrieval.",
          he: "self-attention דו-כיווני (כל טוקן רואה את כל האחרים), משבצת [CLS] לאיגום, ללא causal mask. מפיק embeddings הקשריים; הוסף ראש קטן לסיווג, NER, או אחזור.",
        },
        advanced: {
          en: "Pretrained with masked-language-modelling; bidirectional context but not generative. Strong modern variants: RoBERTa, DeBERTa-v3, and E5/BGE for embeddings. Cheap to fine-tune, tiny to serve.",
          he: "אומן עם masked-language-modelling; הקשר דו-כיווני אך לא גנרטיבי. וריאנטים מודרניים חזקים: RoBERTa, DeBERTa-v3, ו-E5/BGE ל-embeddings. זול לכוונון, זעיר להרצה.",
        },
      },
    },
    {
      k: "dec", tagEn: "GENERATE", tagHe: "לייצר",
      titleEn: "Decoder-only (GPT, Llama)", titleHe: "דקודר בלבד (GPT, Llama)",
      body: {
        beginner: {
          en: "Writes text one word at a time, always predicting what comes next. This is what ChatGPT, Llama and Qwen are. Great at chatting, writing and coding.",
          he: "כותב טקסט מילה-מילה, תמיד מנבא מה בא אחר כך. זה מה ש-ChatGPT, Llama ו-Qwen הם. מצוין בשיחה, כתיבה וקוד.",
        },
        intermediate: {
          en: "Causal (left-to-right) self-attention + autoregressive next-token prediction. Base models are pretrained on the internet, then instruction-tuned and aligned (RLHF/DPO) to become helpful chat models.",
          he: "self-attention סיבתי (שמאל-לימין) + ניבוי אוטו-רגרסיבי של הטוקן הבא. מודלי בסיס אומנו על האינטרנט, ואז כוונו להוראות ויושרו (RLHF/DPO) כדי להפוך לצ'אט מועיל.",
        },
        advanced: {
          en: "The dominant LLM family. Production-critical pieces: KV-cache (fast decoding), RoPE (positions), GQA (cheaper attention), long context, and emergent abilities at scale. Most fine-tuning today targets these.",
          he: "משפחת ה-LLM הדומיננטית. רכיבים קריטיים: KV-cache (פענוח מהיר), RoPE (מיקומים), GQA (attention זול יותר), הקשר ארוך, ויכולות מתהוות בקנה מידה. רוב הכוונון כיום מכוון אליהם.",
        },
      },
    },
    {
      k: "encdec", tagEn: "TRANSFORM", tagHe: "להמיר",
      titleEn: "Encoder-decoder (T5)", titleHe: "אנקודר-דקודר (T5)",
      body: {
        beginner: {
          en: "Reads one thing and writes another — like translating English→Hebrew or turning an article into a summary.",
          he: "קורא דבר אחד וכותב אחר — כמו לתרגם אנגלית→עברית או להפוך מאמר לתקציר.",
        },
        intermediate: {
          en: "The encoder builds a representation of the input; the decoder cross-attends to it while generating the output. Classic sequence-to-sequence; T5 frames every task as text-to-text.",
          he: "האנקודר בונה ייצוג של הקלט; הדקודר עושה cross-attention אליו תוך כדי יצירת הפלט. sequence-to-sequence קלאסי; T5 ממסגר כל משימה כ-text-to-text.",
        },
        advanced: {
          en: "Cross-attention bridges the two stacks. Strong for conditional generation (translation, summarization, NMT). Decoder-only LLMs now cover much of this, but enc-dec still wins on tight input→output mappings.",
          he: "cross-attention מגשר בין שתי הערימות. חזק ליצירה מותנית (תרגום, תמצות, NMT). LLM-ים דקודר-בלבד מכסים הרבה מזה כיום, אך enc-dec עדיין מנצח במיפויי קלט→פלט הדוקים.",
        },
      },
    },
    {
      k: "emb", tagEn: "SEARCH / RAG", tagHe: "חיפוש / RAG",
      titleEn: "Embedding models", titleHe: "מודלי embedding",
      body: {
        beginner: {
          en: "Turn any text into a vector \"fingerprint\" so similar meanings sit close together. This is what powers semantic search and RAG (giving an LLM the right documents).",
          he: "הופכים כל טקסט ל\"טביעת אצבע\" וקטורית כך שמשמעויות דומות יושבות קרוב. זה מה שמניע חיפוש סמנטי ו-RAG (להזין ל-LLM את המסמכים הנכונים).",
        },
        intermediate: {
          en: "An encoder fine-tuned with contrastive loss to place similar texts nearby in vector space; compare with cosine similarity. Used for retrieval, clustering, dedup and recommendation.",
          he: "אנקודר שכוונן עם contrastive loss כדי למקם טקסטים דומים קרוב במרחב הווקטורי; משווים עם cosine similarity. משמש לאחזור, אשכול, הסרת כפילויות והמלצות.",
        },
        advanced: {
          en: "Bi-encoders (fast, index once) vs cross-encoders (accurate rerankers). Track MTEB for quality, mind dimension/latency tradeoffs, prefer instruction-tuned embeddings (E5/BGE/GTE) and add a reranker for the last mile.",
          he: "bi-encoders (מהיר, אינדוקס פעם אחת) מול cross-encoders (rerankers מדויקים). עקוב אחר MTEB לאיכות, שים לב ל-tradeoff מימד/חביון, העדף embeddings מכווני-הוראה (E5/BGE/GTE) והוסף reranker למקטע האחרון.",
        },
      },
    },
    {
      k: "scale", tagEn: "SCALE", tagHe: "קנה מידה",
      titleEn: "Big vs small LLMs", titleHe: "LLM גדול מול קטן",
      body: {
        beginner: {
          en: "Bigger models know more but cost more and run slower. Smaller models are fast and cheap. For a narrow job, a small model you fine-tuned often beats a giant general one.",
          he: "מודלים גדולים יודעים יותר אך עולים יותר ורצים לאט. מודלים קטנים מהירים וזולים. למשימה צרה, מודל קטן שכוונן לרוב מנצח ענק כללי.",
        },
        intermediate: {
          en: "Trade params against latency, cost and VRAM. Quantization (8-bit/4-bit) shrinks a model to fit your GPU. The right move is usually the smallest model that clears your quality bar.",
          he: "אזן בין פרמטרים לחביון, עלות ו-VRAM. קוונטיזציה (8-bit/4-bit) מכווצת מודל כך שייכנס ל-GPU. המהלך הנכון הוא בדרך כלל המודל הקטן ביותר שעובר את רף האיכות שלך.",
        },
        advanced: {
          en: "Scaling laws set the frontier; MoE buys capacity at fixed compute; distillation moves a big model's behavior into a small one. Benchmark on YOUR data, not leaderboards — task fit beats raw size.",
          he: "scaling laws קובעים את הגבול; MoE קונה קיבולת בחישוב קבוע; דיסטילציה מעבירה התנהגות ממודל גדול לקטן. מדוד על הדאטה שלך, לא על לוחות תוצאות — התאמה למשימה מנצחת גודל גולמי.",
        },
      },
    },
  ],
  decision: [
    { wantEn: "Classify or route text", wantHe: "לסווג או לנתב טקסט", useEn: "Encoder-only + a head", useHe: "אנקודר-בלבד + ראש", whyEn: "Cheap, fast, trains on tiny data — like this app.", whyHe: "זול, מהיר, מתאמן על מעט דאטה — כמו האפליקציה הזו." },
    { wantEn: "Chat, write, or code", wantHe: "לשוחח, לכתוב, או קוד", useEn: "Decoder-only LLM", useHe: "LLM דקודר-בלבד", whyEn: "Autoregressive generation is what they're built for.", whyHe: "יצירה אוטו-רגרסיבית היא מה שהם בנויים לו." },
    { wantEn: "Search / RAG / similarity", wantHe: "חיפוש / RAG / דמיון", useEn: "Embedding model + vector DB", useHe: "מודל embedding + DB וקטורי", whyEn: "Meaning becomes geometry you can search.", whyHe: "משמעות הופכת לגיאומטריה שאפשר לחפש בה." },
    { wantEn: "Translate / summarize", wantHe: "לתרגם / לתמצת", useEn: "Encoder-decoder (or an LLM)", useHe: "אנקודר-דקודר (או LLM)", whyEn: "Tight input→output mappings.", whyHe: "מיפויי קלט→פלט הדוקים." },
    { wantEn: "Specialize a giant cheaply", wantHe: "להתמחות ענק בזול", useEn: "LoRA / QLoRA", useHe: "LoRA / QLoRA", whyEn: "Train ~1% of the weights, keep the rest frozen.", whyHe: "אמן ~1% מהמשקלים, השאר קפוא." },
    { wantEn: "Generate images", wantHe: "לייצר תמונות", useEn: "Diffusion model (FLUX/SDXL)", useHe: "מודל דיפוזיה (FLUX/SDXL)", whyEn: "Iterative denoising synthesizes pixels.", whyHe: "ניקוי רעש איטרטיבי מסנתז פיקסלים." },
    { wantEn: "Run on a laptop / 8GB GPU", wantHe: "להריץ על לפטופ / 8GB", useEn: "Small quantized model + Unsloth", useHe: "מודל קטן מקוונטז + Unsloth", whyEn: "4-bit + optimized kernels fit and fly.", whyHe: "4-bit + קרנלים מותאמים נכנסים וטסים." },
  ],
};

// ── 2 · TOKENIZERS ──────────────────────────────────────────────────────────
export const TOKENIZERS: LessonData = {
  id: "tokenizers",
  tone: "content",
  eyebrowEn: "THE ACADEMY · TOKENIZERS",
  eyebrowHe: "האקדמיה · טוקנייזרים",
  titleEn: "The model's alphabet",
  titleHe: "האלפבית של המודל",
  introEn: "A model never sees letters — it sees token IDs. The tokenizer is the dictionary that splits text into pieces and numbers them. The scheme it uses decides how efficiently Hebrew, code, and emoji are handled.",
  introHe: "מודל לעולם לא רואה אותיות — הוא רואה מזהי טוקנים. הטוקנייזר הוא המילון שמפצל טקסט לחתיכות וממספר אותן. השיטה שהוא משתמש בה קובעת כמה ביעילות מטופלים עברית, קוד ואימוג'י.",
  blocks: [
    {
      k: "why", tagEn: "WHY", tagHe: "למה",
      titleEn: "Why tokenize at all", titleHe: "למה בכלל לפרק לטוקנים",
      body: {
        beginner: { en: "Computers do math, not language. The tokenizer chops text into reusable pieces and gives each a number the model can crunch. Try the live playground above to see it.", he: "מחשבים עושים מתמטיקה, לא שפה. הטוקנייזר חותך טקסט לחתיכות לשימוש חוזר ונותן לכל אחת מספר שהמודל יכול לעבד. נסה את מגרש המשחקים החי למעלה." },
        intermediate: { en: "Sub-word tokenization balances vocabulary size against sequence length: rare words split into known pieces, so the model never hits an unknown token. Fewer tokens = less compute and longer effective context.", he: "טוקניזציית תת-מילה מאזנת בין גודל אוצר המילים לאורך הרצף: מילים נדירות מתפצלות לחתיכות מוכרות, כך שהמודל לעולם לא נתקל בטוקן לא ידוע. פחות טוקנים = פחות חישוב והקשר ארוך יותר." },
        advanced: { en: "Token count drives cost, latency and context budget. Languages under-represented in the training corpus (e.g. Hebrew) fragment into more tokens — the hidden tax this app makes visible by comparing EN vs HE counts.", he: "ספירת הטוקנים מניעה עלות, חביון ותקציב הקשר. שפות שמיוצגות חסר בקורפוס האימון (למשל עברית) מתפצלות ליותר טוקנים — המס הנסתר שהאפליקציה הזו הופכת לגלוי בהשוואת EN מול HE." },
      },
    },
    {
      k: "bpe", tagEn: "GPT", tagHe: "GPT",
      titleEn: "BPE — byte-pair encoding", titleHe: "BPE — קידוד זוגות-בתים",
      body: {
        beginner: { en: "Starts from single characters and repeatedly merges the most common neighboring pair into one new piece, until it has a fixed-size vocabulary. Used by GPT-family models.", he: "מתחיל מתווים בודדים וממזג שוב ושוב את הזוג השכן הנפוץ ביותר לחתיכה אחת חדשה, עד אוצר מילים בגודל קבוע. בשימוש על ידי משפחת GPT." },
        intermediate: { en: "Greedy frequency-based merges learned on the corpus. GPT-2/3/4 use byte-level BPE so any UTF-8 input is representable with no unknown tokens — robust to emoji, code and any language.", he: "מיזוגים חמדניים מבוססי-תדירות שנלמדו על הקורפוס. GPT-2/3/4 משתמשים ב-BPE ברמת הבתים כך שכל קלט UTF-8 ניתן לייצוג ללא טוקנים לא ידועים — עמיד לאימוג'י, קוד וכל שפה." },
        advanced: { en: "Deterministic merge table; encoding is greedy longest-match over learned merges. Byte-level BPE sidesteps OOV entirely at the cost of multi-token non-Latin scripts. Vocab size trades sequence length against embedding-table size.", he: "טבלת מיזוג דטרמיניסטית; הקידוד הוא longest-match חמדני מעל מיזוגים נלמדים. BPE ברמת בתים עוקף OOV לחלוטין במחיר ריבוי טוקנים בכתבים לא-לטיניים. גודל אוצר המילים מאזן בין אורך רצף לגודל טבלת ה-embedding." },
      },
    },
    {
      k: "wp", tagEn: "BERT", tagHe: "BERT",
      titleEn: "WordPiece", titleHe: "WordPiece",
      body: {
        beginner: { en: "BERT's scheme. Splits words into a base piece plus continuation pieces marked with ##, like play + ##ing. That's why you saw ## in the pipeline above.", he: "השיטה של BERT. מפצלת מילים לחתיכת בסיס ועוד חתיכות המשך מסומנות ב-##, כמו play + ##ing. לכן ראית ## בצינור למעלה." },
        intermediate: { en: "Like BPE but merges are chosen to maximize training-corpus likelihood rather than raw frequency. The ## prefix marks intra-word continuation so detokenization is unambiguous.", he: "כמו BPE אך המיזוגים נבחרים כדי למקסם את הסבירות של קורפוס האימון ולא תדירות גולמית. הקידומת ## מסמנת המשך בתוך-מילה כך שדה-טוקניזציה חד-משמעית." },
        advanced: { en: "Likelihood-driven merges; greedy longest-match-first decoding with a `[UNK]` fallback (unlike byte-level BPE). Used by BERT/DistilBERT — including the multilingual tokenizer powering this app's Hebrew support.", he: "מיזוגים מונעי-סבירות; פענוח חמדני longest-match-first עם fallback ל-`[UNK]` (בניגוד ל-BPE ברמת בתים). בשימוש על ידי BERT/DistilBERT — כולל הטוקנייזר הרב-לשוני שמניע את תמיכת העברית כאן." },
      },
    },
    {
      k: "uni", tagEn: "T5 / XLM", tagHe: "T5 / XLM",
      titleEn: "Unigram & SentencePiece", titleHe: "Unigram ו-SentencePiece",
      body: {
        beginner: { en: "A different idea: start with a big set of candidate pieces and prune the least useful, keeping the set that explains the text best. SentencePiece also treats spaces as characters, so it needs no pre-splitting.", he: "רעיון אחר: מתחילים מקבוצה גדולה של חתיכות מועמדות וגוזמים את הכי פחות שימושיות, ומשאירים את הקבוצה שמסבירה את הטקסט הכי טוב. SentencePiece גם מתייחס לרווחים כתווים, אז אין צורך בפיצול מוקדם." },
        intermediate: { en: "The Unigram LM picks the most probable segmentation per input from a learned piece distribution (probabilistic, not greedy). SentencePiece is the language-agnostic implementation used by T5, XLM-R and Llama.", he: "מודל ה-Unigram בוחר את הסגמנטציה ההסתברותית ביותר לכל קלט מתוך התפלגות חתיכות נלמדת (הסתברותי, לא חמדני). SentencePiece הוא המימוש חסר-השפה שבשימוש T5, XLM-R ו-Llama." },
        advanced: { en: "Unigram trains via EM, pruning to a target vocab while maximizing corpus likelihood; supports sampling multiple segmentations (subword regularization) for robustness. SentencePiece's ▁ space marker enables fully reversible, pre-tokenization-free encoding.", he: "Unigram מתאמן עם EM, גוזם לאוצר מילים יעד תוך מקסום סבירות הקורפוס; תומך בדגימת סגמנטציות מרובות (subword regularization) לחוסן. סמן הרווח ▁ של SentencePiece מאפשר קידוד הפיך לחלוטין וללא טוקניזציה מוקדמת." },
      },
    },
  ],
};

// ── 3 · LoRA & QLoRA ─────────────────────────────────────────────────────────
export const LORA: LessonData = {
  id: "lora",
  tone: "act",
  eyebrowEn: "BONUS · PARAMETER-EFFICIENT FINE-TUNING",
  eyebrowHe: "בונוס · כוונון יעיל-פרמטרים",
  titleEn: "LoRA & QLoRA — bend a giant, cheaply",
  titleHe: "LoRA ו-QLoRA — לכופף ענק, בזול",
  introEn: "Full fine-tuning updates every weight — billions of them — needing huge GPUs. LoRA freezes the model and trains a tiny pair of extra matrices instead. QLoRA adds 4-bit quantization so a 70B model fits on one consumer card.",
  introHe: "כוונון מלא מעדכן כל משקל — מיליארדים מהם — ודורש GPU ענקיים. LoRA מקפיא את המודל ומאמן במקום זוג מטריצות נוספות זעיר. QLoRA מוסיף קוונטיזציה של 4-bit כך שמודל 70B נכנס בכרטיס צרכני אחד.",
  blocks: [
    {
      k: "prob", tagEn: "THE PROBLEM", tagHe: "הבעיה",
      titleEn: "Full fine-tuning is heavy", titleHe: "כוונון מלא הוא כבד",
      body: {
        beginner: { en: "To teach a big model something new the old way, you nudge ALL of its billions of weights — and you need enough memory to hold a copy of all of them plus their gradients. That means expensive datacenter GPUs.", he: "כדי ללמד מודל גדול משהו חדש בדרך הישנה, אתה מזיז את כל מיליארדי המשקלים — וצריך מספיק זיכרון להחזיק עותק של כולם בתוספת הגרדיאנטים. זה אומר GPU יקרים של מרכזי נתונים." },
        intermediate: { en: "Full FT stores weights + gradients + optimizer states (Adam keeps two extra tensors per weight). For a 7B model in fp16 that's ~80GB+ — out of reach for one consumer GPU.", he: "כוונון מלא מאחסן משקלים + גרדיאנטים + מצבי אופטימייזר (Adam שומר שני טנזורים נוספים לכל משקל). למודל 7B ב-fp16 זה ~80GB+ — מחוץ להישג יד של GPU צרכני אחד." },
        advanced: { en: "Memory ≈ params × (weights + grad + 2 optimizer moments) × dtype bytes. Adam on 7B fp16 ≈ 4×14GB. You also risk catastrophic forgetting and need to store a full checkpoint per task.", he: "זיכרון ≈ פרמטרים × (משקלים + גרדיאנט + 2 מומנטים של אופטימייזר) × בתים של dtype. Adam על 7B fp16 ≈ 4×14GB. בנוסף יש סיכון לשכחה קטסטרופלית וצורך לאחסן checkpoint מלא לכל משימה." },
      },
    },
    {
      k: "lowrank", tagEn: "THE TRICK", tagHe: "הטריק",
      titleEn: "Low-rank adapters", titleHe: "אדפטרים בדרגה נמוכה",
      body: {
        beginner: { en: "Instead of editing the giant weight grid, LoRA freezes it and learns a small \"diff\" on the side — two skinny matrices that multiply to the same shape. Only that little diff is trained.", he: "במקום לערוך את רשת המשקלים הענקית, LoRA מקפיא אותה ולומד \"הפרש\" קטן בצד — שתי מטריצות רזות שמכפלתן באותה צורה. רק ההפרש הקטן הזה מתאמן." },
        intermediate: { en: "Replace ΔW with B·A, where A is r×k and B is d×r for a small rank r (e.g. 8–32). You train only A and B; the frozen W stays put. At inference, output = Wx + (α/r)·BAx.", he: "מחליפים את ΔW ב-B·A, כאשר A הוא r×k ו-B הוא d×r לדרגה נמוכה r (למשל 8–32). מאמנים רק את A ו-B; ה-W הקפוא נשאר. בהסקה, פלט = Wx + (α/r)·BAx." },
        advanced: { en: "Hypothesis: the task-specific update has low intrinsic rank, so ΔW ≈ BA suffices. α scales the update (effective lr knob); init B=0 so training starts as identity. Adapters merge into W at deploy for zero added latency.", he: "השערה: לעדכון הספציפי-למשימה יש דרגה אינטרינסית נמוכה, אז ΔW ≈ BA מספיק. α משנה את קנה המידה של העדכון (כפתור lr אפקטיבי); אתחול B=0 כך שאימון מתחיל כזהות. אדפטרים מתמזגים ל-W בפריסה ללא תוספת חביון." },
      },
    },
    {
      k: "what", tagEn: "WHAT TRAINS", tagHe: "מה מתאמן",
      titleEn: "~1% of the weights", titleHe: "~1% מהמשקלים",
      body: {
        beginner: { en: "Because the side matrices are so skinny, you end up training a tiny fraction of the model — often under 1%. Same data, same goal, a fraction of the cost and a tiny file to share.", he: "כי המטריצות בצד כל כך רזות, בסוף מאמנים חלק זעיר מהמודל — לרוב מתחת ל-1%. אותו דאטה, אותה מטרה, חלק זעיר מהעלות וקובץ זעיר לשיתוף." },
        intermediate: { en: "Pick which modules get adapters (usually the attention q/k/v/o projections). The trainable count is 2·r·(d+k) per adapted matrix — megabytes, not gigabytes. Swap adapters per task without touching the base.", he: "בוחרים אילו מודולים מקבלים אדפטרים (בדרך כלל הטלות ה-attention q/k/v/o). מספר הניתנים-לאימון הוא 2·r·(d+k) לכל מטריצה מותאמת — מגה-בייטים, לא ג'יגה. מחליפים אדפטרים לכל משימה בלי לגעת בבסיס." },
        advanced: { en: "Example: d=k=4096, r=16 → 2·16·4096 ≈ 131K params vs 16.7M for full ΔW — ~0.8%. Target more modules (MLP up/down) for harder tasks; tune r/α/dropout. One frozen base + many small adapters = cheap multi-tenant serving.", he: "דוגמה: d=k=4096, r=16 → 2·16·4096 ≈ 131K פרמטרים מול 16.7M ל-ΔW מלא — ~0.8%. כוון יותר מודולים (MLP up/down) למשימות קשות; כוונן r/α/dropout. בסיס קפוא אחד + הרבה אדפטרים קטנים = הגשה זולה מרובת-דיירים." },
      },
    },
    {
      k: "qlora", tagEn: "4-BIT", tagHe: "4-ביט",
      titleEn: "QLoRA — 4-bit base", titleHe: "QLoRA — בסיס 4-ביט",
      body: {
        beginner: { en: "QLoRA shrinks the frozen base model to 4-bit numbers so it takes ~4× less memory, then trains LoRA adapters on top. Result: you can fine-tune surprisingly large models on a single gaming GPU.", he: "QLoRA מכווץ את מודל הבסיס הקפוא למספרי 4-bit כך שהוא תופס ~פי 4 פחות זיכרון, ואז מאמן אדפטרי LoRA מעליו. התוצאה: אפשר לכוונן מודלים גדולים להפתיע על GPU גיימינג אחד." },
        intermediate: { en: "The base is quantized to 4-bit NF4 and dequantized on the fly for the forward pass; gradients flow only into the fp16 LoRA adapters. Paged optimizers spill to CPU to survive memory spikes.", he: "הבסיס מקוונטז ל-4-bit NF4 ומפוענח תוך כדי תנועה ל-forward; גרדיאנטים זורמים רק לאדפטרי ה-LoRA ב-fp16. paged optimizers נשפכים ל-CPU כדי לשרוד קפיצות זיכרון." },
        advanced: { en: "QLoRA = NF4 (information-theoretically optimal for normal weights) + double quantization (quantize the quant constants) + paged optimizers. Famously fine-tuned a 65B model on a single 48GB GPU with no quality loss vs 16-bit LoRA.", he: "QLoRA = NF4 (אופטימלי תאורטית-אינפורמטיבית למשקלים נורמליים) + double quantization (קוונטיזציה של קבועי הקוונט) + paged optimizers. כיוונן מפורסמות מודל 65B על GPU יחיד של 48GB ללא אובדן איכות מול LoRA של 16-bit." },
      },
    },
  ],
  decision: [
    { wantEn: "Fits in VRAM, small model", wantHe: "נכנס ל-VRAM, מודל קטן", useEn: "LoRA (16-bit base)", useHe: "LoRA (בסיס 16-bit)", whyEn: "Simplest, fastest, mergeable.", whyHe: "הכי פשוט, מהיר, ניתן למיזוג." },
    { wantEn: "Big model, one GPU", wantHe: "מודל גדול, GPU אחד", useEn: "QLoRA (4-bit base)", useHe: "QLoRA (בסיס 4-bit)", whyEn: "4× memory cut, near-zero quality loss.", whyHe: "חיתוך זיכרון פי 4, כמעט ללא אובדן איכות." },
    { wantEn: "Maximum quality, big budget", wantHe: "איכות מקסימלית, תקציב גדול", useEn: "Full fine-tuning", useHe: "כוונון מלא", whyEn: "Every weight moves — when you can afford it.", whyHe: "כל משקל זז — כשאתה יכול להרשות זאת." },
    { wantEn: "Many tasks, one base", wantHe: "הרבה משימות, בסיס אחד", useEn: "Multiple LoRA adapters", useHe: "אדפטרי LoRA מרובים", whyEn: "Swap MB-sized adapters at runtime.", whyHe: "החלף אדפטרים בגודל MB בזמן ריצה." },
  ],
};

// ── 4 · UNSLOTH ──────────────────────────────────────────────────────────────
export const UNSLOTH: LessonData = {
  id: "unsloth",
  tone: "content",
  eyebrowEn: "BONUS · THE EASY, FAST PATH",
  eyebrowHe: "בונוס · הדרך הקלה והמהירה",
  titleEn: "Unsloth — fine-tune 2× faster, on less VRAM",
  titleHe: "Unsloth — כוונון פי 2 מהיר, על פחות VRAM",
  introEn: "Unsloth is a library that makes LoRA/QLoRA fine-tuning dramatically faster and lighter — without changing the math. It hand-writes the GPU kernels HuggingFace runs generically, so the same training just costs less.",
  introHe: "Unsloth היא ספרייה שהופכת כוונון LoRA/QLoRA למהיר וקל בהרבה — בלי לשנות את המתמטיקה. היא כותבת ביד את קרנלי ה-GPU ש-HuggingFace מריץ באופן גנרי, כך שאותו אימון פשוט עולה פחות.",
  blocks: [
    {
      k: "what", tagEn: "WHAT", tagHe: "מה",
      titleEn: "What it is", titleHe: "מה זה",
      body: {
        beginner: { en: "A drop-in toolkit that loads a model, attaches LoRA adapters, and trains — but tuned to be much faster and use far less GPU memory. Great for fine-tuning on a laptop or a free Colab.", he: "ערכת כלים מהירת-התקנה שטוענת מודל, מצרפת אדפטרי LoRA, ומאמנת — אך מכווננת להיות הרבה יותר מהירה ולהשתמש בהרבה פחות זיכרון GPU. מצוין לכוונון על לפטופ או Colab חינמי." },
        intermediate: { en: "A wrapper over Transformers/PEFT exposing FastLanguageModel.from_pretrained(...) + get_peft_model(...). It plugs straight into TRL's SFTTrainer, so your existing training script barely changes.", he: "עטיפה מעל Transformers/PEFT שחושפת FastLanguageModel.from_pretrained(...) + get_peft_model(...). היא מתחברת ישירות ל-SFTTrainer של TRL, כך שסקריפט האימון הקיים שלך כמעט לא משתנה." },
        advanced: { en: "Supports popular open models (Llama, Mistral, Qwen, Gemma, Phi, MoEs) with 4-bit QLoRA and full LoRA. Exports to merged fp16, GGUF (llama.cpp/Ollama) and Hub — the full train→ship loop.", he: "תומך במודלים פתוחים פופולריים (Llama, Mistral, Qwen, Gemma, Phi, MoE) עם QLoRA של 4-bit ו-LoRA מלא. מייצא ל-fp16 ממוזג, GGUF (llama.cpp/Ollama) ו-Hub — לולאת train→ship המלאה." },
      },
    },
    {
      k: "fast", tagEn: "WHY FASTER", tagHe: "למה מהיר",
      titleEn: "Hand-written kernels", titleHe: "קרנלים בכתב יד",
      body: {
        beginner: { en: "Normally the GPU runs generic, one-size-fits-all code. Unsloth rewrites the hot parts as custom kernels built exactly for fine-tuning — same result, far less wasted work. Roughly 2× faster and ~70% less memory.", he: "בדרך כלל ה-GPU מריץ קוד גנרי שמתאים-לכולם. Unsloth כותבת מחדש את החלקים החמים כקרנלים מותאמים שנבנו בדיוק לכוונון — אותה תוצאה, הרבה פחות עבודה מבוזבזת. בערך פי 2 מהיר ו-~70% פחות זיכרון." },
        intermediate: { en: "It rewrites forward AND backward passes in Triton, derives backprop by hand, and implements RoPE + RMSNorm + a causal-mask path as fused kernels. Crucially, the computation is mathematically identical — no accuracy traded for speed.", he: "היא כותבת מחדש את מעברי ה-forward וה-backward ב-Triton, גוזרת backprop ביד, ומממשת RoPE + RMSNorm + מסלול causal-mask כקרנלים מאוחדים. חשוב: החישוב זהה מתמטית — לא מקריבים דיוק עבור מהירות." },
        advanced: { en: "Fused Triton kernels cut memory traffic and Python overhead; manual gradient derivations avoid autograd bloat; smart packing + the latest kernels push 3–5× on some setups. Identical math means metrics match a vanilla run exactly.", he: "קרנלי Triton מאוחדים חותכים תעבורת זיכרון ותקורת Python; גזירות גרדיאנט ידניות נמנעות מנפיחות autograd; packing חכם + הקרנלים האחרונים מגיעים ל-3–5× בחלק מההגדרות. מתמטיקה זהה אומרת שהמדדים תואמים ריצה רגילה בדיוק." },
      },
    },
    {
      k: "vram", tagEn: "MEMORY", tagHe: "זיכרון",
      titleEn: "Fits where others can't", titleHe: "נכנס איפה שאחרים לא",
      body: {
        beginner: { en: "By loading the model in 4-bit and trimming memory waste, a 7B model drops from ~14GB to ~5GB — small enough for an 8GB gaming GPU or a free cloud notebook.", he: "על ידי טעינת המודל ב-4-bit וקיצוץ בזבוז זיכרון, מודל 7B יורד מ-~14GB ל-~5GB — קטן מספיק ל-GPU גיימינג של 8GB או מחברת ענן חינמית." },
        intermediate: { en: "4-bit weights + activation-memory optimizations + gradient checkpointing let 7B QLoRA run in ~8GB (16GB comfortable). Long-context training that OOMs elsewhere often fits here.", he: "משקלי 4-bit + אופטימיזציות זיכרון אקטיבציה + gradient checkpointing מאפשרים ל-QLoRA של 7B לרוץ ב-~8GB (16GB בנוחות). אימון הקשר ארוך ש-OOM במקומות אחרים לרוב נכנס כאן." },
        advanced: { en: "Aggressive activation recomputation, paged optimizer states and 4-bit base shrink the working set so context length and batch size you couldn't reach before become viable — without distributed training.", he: "חישוב-מחדש אגרסיבי של אקטיבציות, מצבי אופטימייזר עם paging ובסיס 4-bit מכווצים את ה-working set כך שאורך הקשר וגודל אצווה שלא יכולת להגיע אליהם נעשים בני-ביצוע — ללא אימון מבוזר." },
      },
    },
    {
      k: "data", tagEn: "DATA PREP", tagHe: "הכנת דאטה",
      titleEn: "Data prep & chat templates", titleHe: "הכנת דאטה ותבניות צ'אט",
      body: {
        beginner: { en: "Most fine-tuning data is conversations: a user turn and the answer you WANT. Unsloth helps wrap each example in the exact chat format the model expects, so it learns to respond the right way.", he: "רוב דאטה הכוונון הוא שיחות: תור משתמש והתשובה שאתה רוצה. Unsloth עוזרת לעטוף כל דוגמה בפורמט הצ'אט המדויק שהמודל מצפה לו, כך שהוא לומד להגיב נכון." },
        intermediate: { en: "Format rows as messages [{role, content}], then apply the model's chat template (get_chat_template) so special tokens line up. Train only on the assistant's tokens (mask the prompt) so the model learns to answer, not to echo.", he: "מעצבים שורות כ-messages [{role, content}], ואז מחילים את תבנית הצ'אט של המודל (get_chat_template) כך שטוקנים מיוחדים מתיישרים. מאמנים רק על טוקני העוזר (ממסכים את הפרומפט) כך שהמודל לומד לענות, לא להדהד." },
        advanced: { en: "Match the template to the base (Llama-3, ChatML, Gemma…), enable response-only loss masking, and use packing to fill sequences. Garbage-in still rules: dedup, balance, and length-filter — curation beats kernel speed every time.", he: "התאם את התבנית לבסיס (Llama-3, ChatML, Gemma…), הפעל מיסוך loss על התשובה בלבד, והשתמש ב-packing למילוי רצפים. garbage-in עדיין שולט: הסר כפילויות, אזן, וסנן אורך — אצירה מנצחת מהירות קרנל בכל פעם." },
      },
    },
  ],
};

// ── 5 · DIFFUSION ─────────────────────────────────────────────────────────────
export const DIFFUSION: LessonData = {
  id: "diffusion",
  tone: "act",
  eyebrowEn: "BONUS · IMAGE GENERATION",
  eyebrowHe: "בונוס · יצירת תמונות",
  titleEn: "Diffusion — how text becomes a picture",
  titleHe: "דיפוזיה — איך טקסט הופך לתמונה",
  introEn: "Image models don't paint left-to-right. They start from pure static and remove noise, step by step, until an image appears — guided by your prompt. Here's the whole trick.",
  introHe: "מודלי תמונה לא מציירים משמאל לימין. הם מתחילים מרעש טהור ומסירים אותו, צעד אחר צעד, עד שתמונה מופיעה — מודרכים על ידי הפרומפט שלך. הנה כל הטריק.",
  blocks: [
    {
      k: "idea", tagEn: "THE IDEA", tagHe: "הרעיון",
      titleEn: "Learn to denoise", titleHe: "ללמוד לנקות רעש",
      body: {
        beginner: { en: "Take a clear photo, add a little static, repeat until it's pure noise. Now train a model to UNDO one step of that. Run the undo many times starting from random static and a picture emerges.", he: "קח תמונה ברורה, הוסף מעט רעש, חזור עד שזה רעש טהור. עכשיו אמן מודל לבטל צעד אחד של זה. הרץ את הביטול הרבה פעמים החל מרעש אקראי ותמונה מופיעה." },
        intermediate: { en: "A forward process gradually adds Gaussian noise over T steps; the network learns the reverse process — predicting the noise to subtract at each step. Sampling = iterate the learned denoiser from t=T down to 0.", he: "תהליך קדמי מוסיף בהדרגה רעש גאוסיאני לאורך T צעדים; הרשת לומדת את התהליך ההפוך — לנבא את הרעש להחסרה בכל צעד. דגימה = איטרציה של מנקה הרעש הנלמד מ-t=T עד 0." },
        advanced: { en: "Train ε-prediction (or v/score) by minimizing ‖ε − ε_θ(x_t, t, c)‖² over the noise schedule. Sampling solves the reverse SDE/ODE; the score function ∇ log p(x) is what the net implicitly learns.", he: "אמן ניבוי-ε (או v/score) על ידי מזעור ‖ε − ε_θ(x_t, t, c)‖² לאורך לוח הרעש. דגימה פותרת את ה-SDE/ODE ההפוך; פונקציית ה-score‏ ∇ log p(x) היא מה שהרשת לומדת באופן מובלע." },
      },
    },
    {
      k: "latent", tagEn: "WHY IT'S FAST", tagHe: "למה זה מהיר",
      titleEn: "Latent diffusion + VAE", titleHe: "דיפוזיה לטנטית + VAE",
      body: {
        beginner: { en: "Denoising full-resolution pixels would be painfully slow. So we first squeeze the image into a small \"summary\" space, do all the denoising there, then expand back to pixels. That's why Stable Diffusion is quick.", he: "ניקוי רעש של פיקסלים ברזולוציה מלאה היה איטי להחריד. אז קודם דוחסים את התמונה למרחב \"תקציר\" קטן, עושים שם את כל ניקוי הרעש, ואז מרחיבים בחזרה לפיקסלים. לכן Stable Diffusion מהיר." },
        intermediate: { en: "A VAE encoder maps the image to a compact latent (e.g. 8× smaller per side); diffusion runs in that latent space; the VAE decoder reconstructs pixels at the end. ~64× fewer values to denoise.", he: "אנקודר VAE ממפה את התמונה ללטנט קומפקטי (למשל קטן פי 8 לכל צד); דיפוזיה רצה במרחב הלטנטי הזה; דקודר ה-VAE משחזר פיקסלים בסוף. ~פי 64 פחות ערכים לניקוי." },
        advanced: { en: "Latent Diffusion Models (Rombach et al.) decouple perceptual compression (VAE) from generative modelling (diffusion in latent space), slashing compute while keeping fidelity — the basis of SD/SDXL. FLUX uses a similar latent + transformer recipe.", he: "Latent Diffusion Models (Rombach et al.) מנתקים דחיסה תפיסתית (VAE) ממידול גנרטיבי (דיפוזיה במרחב לטנטי), חותכים חישוב תוך שמירת נאמנות — הבסיס של SD/SDXL. FLUX משתמש במתכון דומה של לטנט + טרנספורמר." },
      },
    },
    {
      k: "cond", tagEn: "STEERING", tagHe: "היגוי",
      titleEn: "Text conditioning", titleHe: "התניה על טקסט",
      body: {
        beginner: { en: "How does it know to draw YOUR prompt? Your words are turned into numbers by a text model, and those numbers are fed into the denoiser at every step, nudging it toward an image that matches.", he: "איך הוא יודע לצייר את הפרומפט שלך? המילים שלך הופכות למספרים על ידי מודל טקסט, והמספרים האלה מוזנים למנקה הרעש בכל צעד, ודוחפים אותו לתמונה שמתאימה." },
        intermediate: { en: "A text encoder (CLIP and/or T5) embeds the prompt; the denoiser cross-attends to those embeddings each step. Classifier-free guidance (CFG) mixes a conditioned and unconditioned prediction to control how strongly the prompt is obeyed.", he: "אנקודר טקסט (CLIP ו/או T5) מטמיע את הפרומפט; מנקה הרעש עושה cross-attention ל-embeddings האלה בכל צעד. classifier-free guidance (CFG) מערבב ניבוי מותנה ולא-מותנה כדי לשלוט בכמה חזק מצייתים לפרומפט." },
        advanced: { en: "Cross-attention injects conditioning into the UNet/DiT; CFG: ε̂ = ε_uncond + s·(ε_cond − ε_uncond), with scale s trading fidelity vs diversity. Architectures shift from UNet (SD) to diffusion transformers (DiT/FLUX) for scale.", he: "cross-attention מזריק התניה ל-UNet/DiT; CFG: ε̂ = ε_uncond + s·(ε_cond − ε_uncond), כאשר scale s מאזן נאמנות מול גיוון. ארכיטקטורות עוברות מ-UNet (SD) לטרנספורמרים של דיפוזיה (DiT/FLUX) לקנה מידה." },
      },
    },
    {
      k: "samplers", tagEn: "KNOBS", tagHe: "כפתורים",
      titleEn: "Steps, samplers & CFG", titleHe: "צעדים, סמפלרים ו-CFG",
      body: {
        beginner: { en: "More denoising steps = cleaner image but slower. A \"guidance\" dial controls how literally it follows your prompt — too high looks fried, too low ignores you. Samplers are different recipes for taking those steps.", he: "יותר צעדי ניקוי = תמונה נקייה יותר אך איטית יותר. חוגת \"הדרכה\" שולטת בכמה מילולית הוא עוקב אחר הפרומפט — גבוה מדי נראה שרוף, נמוך מדי מתעלם ממך. סמפלרים הם מתכונים שונים לביצוע הצעדים." },
        intermediate: { en: "Samplers (Euler, DPM++ , …) are different numerical solvers for the reverse process — fewer steps for the same quality. Typical: 20–50 steps, CFG ~5–8. Schedulers decide the noise levels visited.", he: "סמפלרים (Euler, DPM++ , …) הם פותרים נומריים שונים לתהליך ההפוך — פחות צעדים לאותה איכות. טיפוסי: 20–50 צעדים, CFG ~5–8. schedulers קובעים את רמות הרעש שמבקרים בהן." },
        advanced: { en: "ODE solvers (DPM++ 2M, UniPC) hit good quality in ~20 steps; distillation (LCM, Turbo, flow-matching) reaches 1–4 steps. Guidance scale, scheduler and step count jointly trade speed, fidelity and diversity.", he: "פותרי ODE (DPM++ 2M, UniPC) מגיעים לאיכות טובה ב-~20 צעדים; דיסטילציה (LCM, Turbo, flow-matching) מגיעה ל-1–4 צעדים. scale ההדרכה, ה-scheduler וספירת הצעדים מאזנים יחד מהירות, נאמנות וגיוון." },
      },
    },
  ],
};

// ── 6 · AI-TOOLKIT (media LoRA) ───────────────────────────────────────────────
export const AITOOLKIT: LessonData = {
  id: "ai-toolkit",
  tone: "content",
  eyebrowEn: "BONUS · TRAIN A LoRA FOR IMAGES",
  eyebrowHe: "בונוס · אמן LoRA לתמונות",
  titleEn: "ai-toolkit — teach a diffusion model your subject",
  titleHe: "ai-toolkit — ללמד מודל דיפוזיה את הנושא שלך",
  introEn: "The same LoRA idea works on image models. Ostris's ai-toolkit fine-tunes diffusion models (FLUX, SDXL) on a handful of your images so they can draw your face, product, or art style on command. Here's the real workflow.",
  introHe: "אותו רעיון של LoRA עובד על מודלי תמונה. ה-ai-toolkit של Ostris מכוונן מודלי דיפוזיה (FLUX, SDXL) על קומץ מהתמונות שלך כך שיוכלו לצייר את הפנים, המוצר או סגנון האמנות שלך לפי בקשה. הנה זרימת העבודה האמיתית.",
  blocks: [
    {
      k: "what", tagEn: "WHAT", tagHe: "מה",
      titleEn: "A diffusion training toolkit", titleHe: "ערכת אימון לדיפוזיה",
      body: {
        beginner: { en: "An open-source toolkit for fine-tuning image models. You give it ~10–30 photos of one subject and it trains a small LoRA file that teaches the model that subject — your dog, your face, a logo, a look.", he: "ערכת קוד-פתוח לכוונון מודלי תמונה. אתה נותן לה ~10–30 תמונות של נושא אחד והיא מאמנת קובץ LoRA קטן שמלמד את המודל את הנושא — הכלב שלך, הפנים שלך, לוגו, מראה." },
        intermediate: { en: "Wraps diffusion fine-tuning (FLUX.1, SDXL, Flex) behind one YAML config + a Gradio UI. Trains LoRA adapters on the denoiser; a 24GB GPU config ships out of the box, and there are Colab/Modal notebooks.", he: "עוטף כוונון דיפוזיה (FLUX.1, SDXL, Flex) מאחורי קובץ YAML אחד + ממשק Gradio. מאמן אדפטרי LoRA על מנקה הרעש; קונפיג ל-GPU של 24GB מגיע מוכן, ויש מחברות Colab/Modal." },
        advanced: { en: "Targets the transformer/UNet blocks in diffusers layer-naming (e.g. only_if_contains \"transformer.single_transformer_blocks\" to train just FLUX's single blocks). Same low-rank adapter math as LLM LoRA, applied to the image denoiser.", he: "מכוון לבלוקי הטרנספורמר/UNet בשמות שכבות diffusers (למשל only_if_contains \"transformer.single_transformer_blocks\" כדי לאמן רק את הבלוקים הבודדים של FLUX). אותה מתמטיקת אדפטר בדרגה נמוכה כמו LoRA של LLM, מיושמת על מנקה רעש התמונה." },
      },
    },
    {
      k: "data", tagEn: "DATA", tagHe: "דאטה",
      titleEn: "Images + caption files", titleHe: "תמונות + קבצי כיתוב",
      body: {
        beginner: { en: "Your dataset is just a folder of pictures, each with a matching text file describing it (cat.jpg + cat.txt). The model learns to connect the words with what it sees.", he: "ה-dataset שלך הוא פשוט תיקייה של תמונות, לכל אחת קובץ טקסט תואם שמתאר אותה (cat.jpg + cat.txt). המודל לומד לחבר בין המילים למה שהוא רואה." },
        intermediate: { en: "jpg/jpeg/png only; each image needs a same-named .txt caption. Images are never upscaled — they're downscaled and sorted into aspect-ratio buckets for batching. Caption quality drives what the LoRA actually learns.", he: "רק jpg/jpeg/png; כל תמונה צריכה כיתוב .txt באותו שם. תמונות לעולם לא מוגדלות — הן מוקטנות וממוינות לדליי יחס-גובה-רוחב לאצווה. איכות הכיתוב קובעת מה ה-LoRA באמת לומד." },
        advanced: { en: "Aspect-ratio bucketing avoids destructive cropping; caption_dropout_rate (default 0.05) randomly blanks captions so the model also learns from pure visual context. Balance subject coverage and avoid leaking incidental attributes into captions.", he: "bucketing לפי יחס גובה-רוחב נמנע מחיתוך הרסני; caption_dropout_rate (ברירת מחדל 0.05) מרוקן כיתובים אקראית כך שהמודל לומד גם מהקשר ויזואלי טהור. אזן כיסוי נושא והימנע מהדלפת תכונות אגביות לכיתובים." },
      },
    },
    {
      k: "trigger", tagEn: "TRIGGER", tagHe: "טריגר",
      titleEn: "The trigger word", titleHe: "מילת הטריגר",
      body: {
        beginner: { en: "You pick a special word (say \"sks dog\") that means \"the thing I trained\". After training, putting that word in a prompt summons your subject. Without it, the model behaves normally.", he: "אתה בוחר מילה מיוחדת (נניח \"sks dog\") שמשמעותה \"הדבר שאימנתי\". אחרי האימון, הכנסת המילה בפרומפט מזמנת את הנושא שלך. בלעדיה, המודל מתנהג רגיל." },
        intermediate: { en: "Set trigger_word in the config, or drop a [trigger] placeholder in caption files and it's auto-substituted. The trigger becomes the handle the LoRA binds your concept to, keeping the base model's general ability intact.", he: "הגדר trigger_word בקונפיג, או שים placeholder בשם [trigger] בקבצי הכיתוב והוא יוחלף אוטומטית. הטריגר הופך לידית שאליה ה-LoRA קושר את הקונספט שלך, תוך שמירה על יכולת הבסיס הכללית." },
        advanced: { en: "A rare token minimizes collision with learned concepts. Inject [trigger] precisely in captions to control where the concept attaches; combined with caption dropout it balances editability (responds to prompts) against fidelity (looks like the subject).", he: "טוקן נדיר ממזער התנגשות עם קונספטים נלמדים. הזרק [trigger] בדיוק בכיתובים כדי לשלוט היכן הקונספט נקשר; בשילוב עם caption dropout זה מאזן עריכוּת (מגיב לפרומפטים) מול נאמנות (נראה כמו הנושא)." },
      },
    },
    {
      k: "run", tagEn: "THE RUN", tagHe: "הריצה",
      titleEn: "Config → train → use", titleHe: "קונפיג → אימון → שימוש",
      body: {
        beginner: { en: "Copy an example config, point it at your image folder, set your trigger word, and start. Out comes a small LoRA file you load into your image tool (ComfyUI, etc.) to generate your subject anywhere.", he: "העתק קונפיג לדוגמה, כוון אותו לתיקיית התמונות, הגדר מילת טריגר, והתחל. יוצא קובץ LoRA קטן שאתה טוען לכלי התמונות שלך (ComfyUI וכו') כדי לייצר את הנושא בכל מקום." },
        intermediate: { en: "Edit the YAML (model, dataset path, trigger, steps, rank, learning rate), run the trainer, and it periodically saves samples so you can watch it learn. The output LoRA drops into any FLUX/SDXL pipeline.", he: "ערוך את ה-YAML (מודל, נתיב dataset, טריגר, צעדים, rank, קצב למידה), הרץ את המאמן, והוא שומר דגימות מעת לעת כך שתוכל לצפות בו לומד. ה-LoRA שיוצא נכנס לכל צינור FLUX/SDXL." },
        advanced: { en: "Tune rank/steps/LR and layer targeting per goal (face vs style vs object); watch sample prompts for overfitting (subject bleeds into everything) vs underfitting (won't trigger). Same train→evaluate→export loop as the classifiers in this app — different modality.", he: "כוונן rank/צעדים/LR וכיוון שכבות לפי מטרה (פנים מול סגנון מול אובייקט); עקוב אחר פרומפטי דגימה לזיהוי overfitting (הנושא דולף לכל מקום) מול underfitting (לא מופעל). אותה לולאת train→evaluate→export כמו המסווגים באפליקציה — מודאליות אחרת." },
      },
    },
  ],
};

export const LESSONS = [FOUNDATIONS, TOKENIZERS, LORA, UNSLOTH, DIFFUSION, AITOOLKIT];
