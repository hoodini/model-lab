// ─────────────────────────────────────────────────────────────────────────────
// The teaching content. Every concept is explained at THREE depths, in BOTH
// languages. The UI picks beginner / intermediate / advanced based on the level
// switch. The promise of this app: no term is ever left unexplained.
// ─────────────────────────────────────────────────────────────────────────────

export type Lang = "en" | "he";
export type Level = "beginner" | "intermediate" | "advanced";

export type Explain = {
  title: Record<Lang, string>;
  levels: Record<Level, Record<Lang, string>>;
};

export const CONCEPTS: Record<string, Explain> = {
  router: {
    title: { en: "What is a router model?", he: "מהו מודל ראוטר?" },
    levels: {
      beginner: {
        en: "A doorman for AI. You have several AI models, each good at different things. The router reads your request and points it to the right one — it doesn't answer, it just chooses the best expert for the job.",
        he: "סדרן כניסה ל-AI. יש לך כמה מודלים, כל אחד מצטיין במשהו אחר. הראוטר קורא את הבקשה ומפנה אותה למודל הנכון — הוא לא עונה בעצמו, הוא רק בוחר את המומחה המתאים.",
      },
      intermediate: {
        en: "A text classifier. Input = a prompt, output = one label from a fixed set (code / chat / reasoning / creative). Because the output is a choice between a few buckets — not free text — it's far easier and cheaper to train than a generative model.",
        he: "מסווג טקסט. קלט = פרומפט, פלט = תווית אחת מתוך קבוצה קבועה (קוד / שיחה / היגיון / יצירתי). מכיוון שהפלט הוא בחירה בין כמה תאים — לא טקסט חופשי — קל וזול בהרבה לאמן אותו ממודל גנרטיבי.",
      },
      advanced: {
        en: "A discriminative sequence-classification head over a pretrained encoder. We fine-tune an encoder (DistilBERT-multilingual) with a linear classification head; cross-entropy over k classes. In production you'd add a confidence threshold and a fallback lane, and likely calibrate probabilities (temperature scaling) before acting on them.",
        he: "ראש סיווג דיסקרימינטיבי מעל אנקודר מאומן-מראש. מכווננים אנקודר (DistilBERT רב-לשוני) עם ראש לינארי; cross-entropy על k מחלקות. בפרודקשן מוסיפים סף ביטחון ומסלול fallback, וכנראה מכיילים את ההסתברויות (temperature scaling) לפני שמסתמכים עליהן.",
      },
    },
  },

  tokenization: {
    title: { en: "Tokenization", he: "טוקניזציה" },
    levels: {
      beginner: {
        en: "Models can't read letters — only numbers. Tokenization chops your text into small pieces ('tokens') and gives each piece a number. The sentence becomes a list of numbers the model can work with.",
        he: "מודלים לא קוראים אותיות — רק מספרים. טוקניזציה חותכת את הטקסט לחתיכות קטנות ('טוקנים') ונותנת לכל חתיכה מספר. המשפט הופך לרשימת מספרים שהמודל יכול לעבוד איתה.",
      },
      intermediate: {
        en: "Sub-word tokenization (WordPiece/BPE) splits text into frequent fragments. Common words stay whole; rare words split into pieces. A MULTILINGUAL tokenizer was trained on many languages, so Hebrew gets sensible pieces instead of being shredded into single bytes.",
        he: "טוקניזציית תת-מילה (WordPiece/BPE) מפצלת טקסט לחתיכות נפוצות. מילים שכיחות נשארות שלמות; מילים נדירות מתפצלות. טוקנייזר רב-לשוני אומן על שפות רבות, כך שעברית מקבלת חתיכות הגיוניות במקום להתפרק לבייטים בודדים.",
      },
      advanced: {
        en: "Each token maps to a row in the embedding matrix. Tokenizer 'fertility' (tokens per word) directly costs context length and FLOPs. GPT-2's English-centric BPE has high fertility on Hebrew; a multilingual vocab lowers it. Watch this in the live view: compare token counts for the same sentence in EN vs HE.",
        he: "כל טוקן ממופה לשורה במטריצת ה-embedding. 'פוריות' הטוקנייזר (טוקנים למילה) עולה ישירות באורך הקשר וב-FLOPs. ה-BPE האנגלוצנטרי של GPT-2 בעל פוריות גבוהה בעברית; אוצר מילים רב-לשוני מוריד אותה. שים לב לזה בתצוגה החיה: השווה מספר טוקנים לאותו משפט באנגלית מול עברית.",
      },
    },
  },

  base_model: {
    title: { en: "Base model", he: "מודל בסיס" },
    levels: {
      beginner: {
        en: "We don't start from zero. We take a model that already learned language from huge amounts of text, then teach it our small, specific task. Like hiring someone who already speaks the language and just training them on your company's rules.",
        he: "לא מתחילים מאפס. לוקחים מודל שכבר למד שפה מכמויות עתק של טקסט, ואז מלמדים אותו את המשימה הקטנה והספציפית שלנו. כמו לגייס מישהו שכבר יודע את השפה ורק להכשיר אותו על הנהלים שלך.",
      },
      intermediate: {
        en: "This is 'transfer learning'. The pretrained encoder already encodes grammar and meaning; fine-tuning mostly adapts the top layers + the new classification head. We default to distilbert-base-multilingual-cased: small (~134M params), fast, and it understands Hebrew.",
        he: "זה 'transfer learning'. האנקודר המאומן כבר מקודד דקדוק ומשמעות; הכוונון בעיקר מתאים את השכבות העליונות + ראש הסיווג החדש. ברירת המחדל היא distilbert-base-multilingual-cased: קטן (~134M פרמטרים), מהיר, ומבין עברית.",
      },
      advanced: {
        en: "Encoder-only (BERT-family) is the right inductive bias for classification — bidirectional attention, [CLS] pooling. Alternatives: XLM-RoBERTa (stronger, heavier), or a Hebrew-specific encoder (AlephBERT/HeRo). On a 4090 you can fine-tune all of these full-parameter; reserve LoRA for the generative stages.",
        he: "אנקודר-בלבד (משפחת BERT) הוא ה-inductive bias הנכון לסיווג — attention דו-כיווני, pooling דרך [CLS]. חלופות: XLM-RoBERTa (חזק יותר, כבד יותר), או אנקודר עברי ייעודי (AlephBERT/HeRo). על 4090 אפשר לכוונן את כולם ב-full-parameter; שמור LoRA לשלבים הגנרטיביים.",
      },
    },
  },

  epochs: {
    title: { en: "Epochs", he: "אפוקים (Epochs)" },
    levels: {
      beginner: {
        en: "One epoch = the model looked at ALL your examples once. More epochs = more practice. Too few and it hasn't learned; too many and it just memorizes the answers instead of understanding.",
        he: "אפוק אחד = המודל ראה את כל הדוגמאות שלך פעם אחת. יותר אפוקים = יותר תרגול. מעט מדי והוא לא למד; יותר מדי והוא פשוט שינן את התשובות במקום להבין.",
      },
      intermediate: {
        en: "Each epoch is a full pass over the training set. Watch the two loss curves: when training loss keeps dropping but eval loss starts rising, you're overfitting — stop there. For a tiny dataset like ours, 3–6 epochs is usually right.",
        he: "כל אפוק הוא מעבר מלא על סט האימון. עקוב אחרי שתי עקומות ה-loss: כשה-loss של האימון ממשיך לרדת אבל זה של ההערכה מתחיל לעלות — זה overfitting, עצור שם. לדאטהסט זעיר כמו שלנו, 3–6 אפוקים בדרך כלל נכון.",
      },
      advanced: {
        en: "Epoch count interacts with LR schedule and dataset size to set total optimizer steps. With few hundred examples, prefer early stopping on eval F1 over a fixed epoch count. The generalization gap (train vs eval loss) is your overfitting gauge.",
        he: "מספר האפוקים מתכתב עם לוח ה-LR וגודל הדאטהסט כדי לקבוע את סך צעדי האופטימייזר. עם כמה מאות דוגמאות, עדיף early stopping לפי eval F1 על פני מספר אפוקים קבוע. פער ההכללה (train מול eval loss) הוא מד ה-overfitting שלך.",
      },
    },
  },

  lr: {
    title: { en: "Learning rate", he: "קצב למידה (Learning Rate)" },
    levels: {
      beginner: {
        en: "How big a step the model takes each time it corrects itself. Too big and it overshoots and never settles; too small and it learns painfully slowly. It's the single most important knob.",
        he: "כמה גדול צעד התיקון של המודל בכל פעם. גדול מדי — הוא 'קופץ' ולא מתייצב; קטן מדי — הוא לומד לאט להחריד. זה הכפתור הכי חשוב.",
      },
      intermediate: {
        en: "It scales each weight update. For fine-tuning transformers, 2e-5 to 5e-5 is the classic safe range. If your loss explodes or stays flat, this is the first knob to change. Notice it's a tiny number — fine-tuning needs gentle nudges, not big leaps.",
        he: "זה מכפיל כל עדכון משקל. לכוונון טרנספורמרים, 2e-5 עד 5e-5 הוא הטווח הקלאסי הבטוח. אם ה-loss מתפוצץ או נשאר שטוח — זה הכפתור הראשון לשנות. שים לב שזה מספר זעיר — כוונון דורש דחיפות עדינות, לא קפיצות.",
      },
      advanced: {
        en: "Peak LR of the AdamW schedule (with warmup + linear/cosine decay under the hood). Too high → divergence or catastrophic forgetting of pretrained features; too low → underfitting within the step budget. Scale roughly with batch size. Layer-wise LR decay can squeeze out more.",
        he: "ה-LR המקסימלי של לוח AdamW (עם warmup + decay לינארי/קוסינוסי מתחת לפני השטח). גבוה מדי → דיברגנס או שכחה קטסטרופלית של פיצ'רים מאומנים; נמוך מדי → underfitting בתקציב הצעדים. מתכווננים בערך עם גודל ה-batch. layer-wise LR decay יכול לסחוט עוד.",
      },
    },
  },

  batch_size: {
    title: { en: "Batch size", he: "גודל אצווה (Batch Size)" },
    levels: {
      beginner: {
        en: "How many examples the model looks at before making one correction. Bigger batches give smoother, steadier learning but use more GPU memory. Smaller batches are noisier but lighter.",
        he: "כמה דוגמאות המודל רואה לפני שהוא מבצע תיקון אחד. אצווה גדולה = למידה חלקה ויציבה יותר אבל צורכת יותר זיכרון GPU. אצווה קטנה = רועשת יותר אבל קלה יותר.",
      },
      intermediate: {
        en: "Examples processed per optimizer step. It trades GPU memory for gradient stability. If you hit an out-of-memory error, halve the batch size. On a 24GB 4090 you have lots of headroom for a small encoder — 8 to 32 is comfortable.",
        he: "דוגמאות המעובדות בכל צעד אופטימייזר. מאזן בין זיכרון GPU ליציבות הגרדיאנט. אם קיבלת שגיאת out-of-memory, חצה את גודל האצווה. על 4090 עם 24GB יש המון מרווח לאנקודר קטן — 8 עד 32 נוח.",
      },
      advanced: {
        en: "Sets gradient-estimate variance. Larger batch → lower-variance gradients, often allowing a higher LR (linear scaling rule). Use gradient accumulation to simulate large batches under VRAM limits. Watch the noise scale: tiny datasets can prefer smaller batches for regularization.",
        he: "קובע את שונות אומדן הגרדיאנט. אצווה גדולה → גרדיאנטים בשונות נמוכה, לרוב מאפשר LR גבוה יותר (linear scaling rule). השתמש ב-gradient accumulation כדי לדמות אצוות גדולות תחת מגבלת VRAM. דאטהסטים זעירים עשויים להעדיף אצוות קטנות לרגולריזציה.",
      },
    },
  },

  test_size: {
    title: { en: "Train / test split", he: "חלוקת אימון / מבחן" },
    levels: {
      beginner: {
        en: "We hide some examples from the model during training, then test it on those. It's like an exam with questions the student never saw — the only honest way to know if it really learned.",
        he: "מסתירים חלק מהדוגמאות מהמודל בזמן האימון, ואז בוחנים אותו עליהן. כמו מבחן עם שאלות שהתלמיד לא ראה — הדרך הכנה היחידה לדעת אם הוא באמת למד.",
      },
      intermediate: {
        en: "test_size=0.2 holds out 20% for evaluation. Performance on the held-out set estimates how the model behaves on new prompts. If train accuracy is high but test accuracy is low, the model memorized instead of generalizing.",
        he: "test_size=0.2 שומר 20% להערכה. הביצועים על הסט המוסתר מעריכים איך המודל יתנהג על פרומפטים חדשים. אם דיוק האימון גבוה אבל דיוק המבחן נמוך — המודל שינן במקום להכליל.",
      },
      advanced: {
        en: "A single holdout is high-variance on small data; prefer stratified k-fold CV and report mean ± std. Guard against leakage (near-duplicate prompts across splits). With class imbalance, stratify and track per-class F1, not just accuracy.",
        he: "holdout בודד הוא בעל שונות גבוהה על מעט דאטה; עדיף stratified k-fold CV ולדווח ממוצע ± סטיית תקן. היזהר מדליפה (פרומפטים כמעט-זהים בין החלקים). עם חוסר איזון מחלקות, בצע stratify ועקוב אחרי F1 לכל מחלקה, לא רק דיוק.",
      },
    },
  },

  loss: {
    title: { en: "Loss", he: "Loss (פונקציית ההפסד)" },
    levels: {
      beginner: {
        en: "A single number that says how wrong the model is right now. The whole point of training is to make this number go DOWN. Watching it fall is watching the model learn in real time.",
        he: "מספר יחיד שאומר כמה המודל טועה כרגע. כל מטרת האימון היא להוריד אותו. לראות אותו יורד = לראות את המודל לומד בזמן אמת.",
      },
      intermediate: {
        en: "For classification we use cross-entropy: it's low when the model puts high probability on the correct label, high when it's confidently wrong. Training nudges weights to reduce it; eval loss on held-out data tells you if that learning generalizes.",
        he: "לסיווג משתמשים ב-cross-entropy: נמוך כשהמודל נותן הסתברות גבוהה לתווית הנכונה, גבוה כשהוא בטוח וטועה. האימון מזיז משקלים כדי להקטין אותו; ה-eval loss על דאטה מוסתר אומר אם הלמידה מכלילה.",
      },
      advanced: {
        en: "Mean token/sequence cross-entropy = negative log-likelihood of the true class under the softmax. Gradients of this w.r.t. parameters drive backprop. A smooth monotonic decrease with a widening train/eval gap is the canonical overfitting signature.",
        he: "ממוצע cross-entropy = negative log-likelihood של המחלקה הנכונה תחת ה-softmax. הגרדיאנטים שלו ביחס לפרמטרים מניעים את ה-backprop. ירידה מונוטונית חלקה עם פער train/eval מתרחב היא החתימה הקלאסית של overfitting.",
      },
    },
  },

  metrics: {
    title: { en: "Accuracy & F1", he: "דיוק (Accuracy) ו-F1" },
    levels: {
      beginner: {
        en: "Accuracy = out of all prompts, what fraction did the router send to the right lane. 0.9 means it's right 90% of the time. F1 is a fairer score when some lanes have fewer examples than others.",
        he: "דיוק = מתוך כל הפרומפטים, איזה אחוז הראוטר שלח למסלול הנכון. 0.9 אומר שהוא צודק ב-90% מהמקרים. F1 הוא ציון הוגן יותר כשלמסלולים מסוימים יש פחות דוגמאות.",
      },
      intermediate: {
        en: "Accuracy can lie under class imbalance (always-guess-the-common-class scores high). F1 = harmonic mean of precision and recall, so it punishes a model that ignores rare classes. We report weighted F1 across all lanes.",
        he: "דיוק יכול לשקר תחת חוסר איזון (לנחש תמיד את המחלקה השכיחה מקבל ציון גבוה). F1 = ממוצע הרמוני של precision ו-recall, אז הוא מעניש מודל שמתעלם ממחלקות נדירות. אנחנו מדווחים weighted F1 על פני כל המסלולים.",
      },
      advanced: {
        en: "Inspect the full confusion matrix, not scalars. Track macro-F1 (treats classes equally) vs weighted-F1. For a router specifically, the cost of misroutes is asymmetric — a calibrated confidence + abstention policy usually beats chasing raw accuracy.",
        he: "בחן את מטריצת הבלבול המלאה, לא סקלרים. עקוב אחרי macro-F1 (מתייחס למחלקות שווה בשווה) מול weighted-F1. לראוטר במיוחד, עלות ניתוב-שגוי אסימטרית — מדיניות ביטחון מכויל + הימנעות בדרך כלל עדיפה על רדיפה אחרי דיוק גולמי.",
      },
    },
  },

  // ── DEEP DIVE: what actually happens inside the model ────────────────────
  bpe: {
    title: { en: "How tokens are chosen (BPE & friends)", he: "איך נבחרים הטוקנים (BPE וחברים)" },
    levels: {
      beginner: {
        en: "How do we decide where to cut the text? We don't cut on spaces — we cut on the most COMMON pieces. The tokenizer learned, from billions of words, which letter-chunks show up together a lot ('ing', 'tion', 'שלום'). Frequent chunks become single tokens; rare words get split into smaller known pieces.",
        he: "איך מחליטים איפה לחתוך את הטקסט? לא חותכים ברווחים — חותכים בחתיכות הכי נפוצות. הטוקנייזר למד ממיליארדי מילים אילו צירופי-אותיות מופיעים הרבה יחד ('ing', 'tion', 'שלום'). חתיכות שכיחות הופכות לטוקן בודד; מילים נדירות מתפצלות לחתיכות קטנות ומוכרות.",
      },
      intermediate: {
        en: "BPE (Byte-Pair Encoding) starts from single characters and repeatedly merges the most frequent adjacent pair, building a vocabulary of sub-words. WordPiece (BERT) is similar but merges by likelihood gain. Unigram/SentencePiece prunes a big vocab down by probability. Byte-level BPE (GPT-2) works on raw bytes so it can never hit an unknown character — even an emoji or rare Hebrew glyph becomes some sequence of byte-tokens.",
        he: "BPE (Byte-Pair Encoding) מתחיל מתווים בודדים וממזג שוב ושוב את הצמד הסמוך הכי נפוץ, ובונה אוצר מילים של תת-מילים. WordPiece (BERT) דומה אבל ממזג לפי רווח בסבירות. Unigram/SentencePiece גוזם אוצר מילים גדול לפי הסתברות. Byte-level BPE (GPT-2) עובד על בייטים גולמיים כך שלעולם לא ייתקל בתו לא-מוכר — אפילו אימוג'י או אות עברית נדירה הופכים לרצף של טוקני-בייט.",
      },
      advanced: {
        en: "The merge table is a deterministic, greedy compression learned once on a corpus, then frozen. Vocab size trades sequence length against embedding-matrix size (V×d): a 250k multilingual vocab keeps Hebrew fertility low but adds parameters. Special tokens ([CLS], [SEP], [PAD], [UNK]) are reserved ids. The exact pre-tokenization (whitespace/punctuation rules, NFKC normalization, byte-fallback) is part of the tokenizer contract — mismatches between train and inference silently wreck accuracy.",
        he: "טבלת המיזוגים היא דחיסה חמדנית דטרמיניסטית שנלמדת פעם אחת על קורפוס, ואז מוקפאת. גודל אוצר המילים מאזן בין אורך הרצף לגודל מטריצת ה-embedding (V×d): אוצר רב-לשוני של 250k שומר פוריות נמוכה בעברית אך מוסיף פרמטרים. טוקנים מיוחדים ([CLS], [SEP], [PAD], [UNK]) הם ids שמורים. הפרה-טוקניזציה המדויקת (חוקי רווחים/פיסוק, נרמול NFKC, נפילה-לבייט) היא חלק מהחוזה — אי-התאמה בין אימון להסקה הורסת דיוק בשקט.",
      },
    },
  },

  embeddings: {
    title: { en: "Embeddings", he: "Embeddings (וקטורי שיכון)" },
    levels: {
      beginner: {
        en: "A token id like 7138 is just a name tag — it carries no meaning. The embedding turns each id into a list of numbers (a 'vector') that DOES carry meaning. Words with similar meaning get similar vectors. This is the model's first idea of 'what this word is about'.",
        he: "מזהה טוקן כמו 7138 הוא רק תווית-שם — הוא לא נושא משמעות. ה-embedding הופך כל מזהה לרשימת מספרים ('וקטור') שכן נושא משמעות. מילים בעלות משמעות דומה מקבלות וקטורים דומים. זו ההבנה הראשונה של המודל לגבי 'על מה המילה הזו'.",
      },
      intermediate: {
        en: "An embedding is a lookup: id → row in a learned matrix of shape (vocab_size × hidden_dim). For DistilBERT hidden_dim is 768, so every token becomes a 768-number vector. Position embeddings are added so the model knows word ORDER (a tokenizer alone throws order away). These vectors are learned during pretraining and nudged during fine-tuning.",
        he: "embedding הוא חיפוש בטבלה: id → שורה במטריצה נלמדת בגודל (vocab_size × hidden_dim). ב-DistilBERT ה-hidden_dim הוא 768, כך שכל טוקן הופך לוקטור של 768 מספרים. מוסיפים position embeddings כדי שהמודל יידע את סדר המילים (טוקנייזר לבד מאבד את הסדר). הוקטורים האלה נלמדים בפרי-טריינינג ומכווננים בפיין-טיונינג.",
      },
      advanced: {
        en: "The embedding matrix is typically the single largest parameter block (V·d). Token + positional (+ segment, in BERT) embeddings are summed and LayerNorm'd to form the layer-0 hidden states. Geometry matters: cosine distances encode semantic similarity, and the same matrix is often tied to the output projection in decoder LMs. Positional info can be absolute-learned (BERT), sinusoidal, or rotary (RoPE) in modern decoders.",
        he: "מטריצת ה-embedding היא לרוב בלוק הפרמטרים הגדול ביותר (V·d). embeddings של טוקן + מיקום (+ segment ב-BERT) מסוכמים ועוברים LayerNorm ליצירת ה-hidden states בשכבה 0. הגאומטריה חשובה: מרחקי קוסינוס מקודדים דמיון סמנטי, ולעיתים אותה מטריצה קשורה להטלת הפלט במודלי דקודר. מידע מיקום יכול להיות absolute-learned (BERT), סינוסואידלי, או rotary (RoPE) בדקודרים מודרניים.",
      },
    },
  },

  encoder: {
    title: { en: "Encoder (why, if we have tokens + embeddings?)", he: "אנקודר (למה, אם יש טוקנים + embeddings?)" },
    levels: {
      beginner: {
        en: "Great question. Tokens + embeddings give each word a meaning vector — but each word is still ALONE, with no idea of its neighbors. 'Bank' near 'river' vs near 'money' should mean different things. The encoder is the part that lets every word LOOK AT every other word and update its meaning based on context. Tokenizer = cut into words. Embedding = give each word a starting meaning. Encoder = mix those meanings together using context.",
        he: "שאלה מצוינת. טוקנים + embeddings נותנים לכל מילה וקטור משמעות — אבל כל מילה עדיין לבד, בלי מושג על השכנות שלה. 'בנק' ליד 'נהר' מול ליד 'כסף' צריך להיות שונה. האנקודר הוא החלק שמאפשר לכל מילה להסתכל על כל מילה אחרת ולעדכן את משמעותה לפי ההקשר. טוקנייזר = לחתוך למילים. Embedding = לתת לכל מילה משמעות התחלתית. אנקודר = לערבב את המשמעויות יחד בעזרת ההקשר.",
      },
      intermediate: {
        en: "An encoder is a stack of identical Transformer blocks. Each block does two things: (1) self-attention — every token gathers information from all other tokens; (2) a small feed-forward network applied to each token. With residual connections + LayerNorm around both. After N blocks, each token's vector is 'context-aware' — it now encodes meaning given the whole sentence. BERT/DistilBERT are encoder-ONLY: bidirectional (a word sees left AND right), which is ideal for understanding/classification.",
        he: "אנקודר הוא ערימה של בלוקי Transformer זהים. כל בלוק עושה שני דברים: (1) self-attention — כל טוקן אוסף מידע מכל שאר הטוקנים; (2) רשת feed-forward קטנה על כל טוקן. עם residual connections + LayerNorm סביב שניהם. אחרי N בלוקים, הוקטור של כל טוקן הוא 'מודע-הקשר' — הוא מקודד משמעות בהינתן כל המשפט. BERT/DistilBERT הם אנקודר-בלבד: דו-כיווני (מילה רואה שמאל וגם ימין), אידיאלי להבנה/סיווג.",
      },
      advanced: {
        en: "Formally the encoder maps a sequence of embeddings to a sequence of contextual representations via L layers of MultiHeadSelfAttention + position-wise FFN, each wrapped in pre/post-LayerNorm residual blocks. Attention is full (non-causal) bidirectional, so it's not autoregressive and can't generate — but it builds the richest possible per-token context, which is why encoders dominate classification, retrieval embeddings, and reranking. DistilBERT = 6 layers, 12 heads, d=768, distilled from BERT-base with ~40% fewer params at ~97% of its quality.",
        he: "פורמלית האנקודר ממפה רצף embeddings לרצף ייצוגים הקשריים דרך L שכבות של MultiHeadSelfAttention + FFN פר-מיקום, כל אחת עטופה בבלוק residual עם pre/post-LayerNorm. ה-attention מלא (לא-סיבתי) דו-כיווני, לכן הוא לא אוטו-רגרסיבי ולא יכול לייצר — אבל הוא בונה את ההקשר הפר-טוקן העשיר ביותר, ולכן אנקודרים שולטים בסיווג, embeddings לאחזור, ו-reranking. DistilBERT = 6 שכבות, 12 ראשים, d=768, מזוקק מ-BERT-base עם ~40% פחות פרמטרים ב~97% מהאיכות.",
      },
    },
  },

  decoder: {
    title: { en: "Decoder (and why our router doesn't have one)", he: "דקודר (ולמה לראוטר שלנו אין כזה)" },
    levels: {
      beginner: {
        en: "A decoder is the part that GENERATES text — one token at a time, each new word based on everything written so far. That's what ChatGPT (GPT) is: a big decoder. Our router doesn't generate anything — it just CHOOSES one of 4 labels. So it needs the understanding half (encoder), not the writing half (decoder). Understanding ≠ generating.",
        he: "דקודר הוא החלק שמייצר טקסט — טוקן אחד בכל פעם, כל מילה חדשה מבוססת על כל מה שנכתב עד כה. זה מה ש-ChatGPT (GPT) הוא: דקודר גדול. הראוטר שלנו לא מייצר כלום — הוא רק בוחר אחת מ-4 תוויות. לכן הוא צריך את חצי-ההבנה (אנקודר), לא את חצי-הכתיבה (דקודר). הבנה ≠ יצירה.",
      },
      intermediate: {
        en: "A decoder uses MASKED (causal) self-attention: each token can only see tokens BEFORE it, so it can predict the next one without cheating. GPT is decoder-only (generate). BERT is encoder-only (understand). T5/translation models are encoder-decoder: encode the source fully, then decode the target step by step, with cross-attention linking them. Pick by task: classify → encoder; generate → decoder; transform A→B → both.",
        he: "דקודר משתמש ב-self-attention ממוסך (סיבתי): כל טוקן רואה רק טוקנים שלפניו, כדי שיוכל לנבא את הבא בלי לרמות. GPT הוא דקודר-בלבד (יצירה). BERT הוא אנקודר-בלבד (הבנה). מודלי T5/תרגום הם אנקודר-דקודר: מקודדים את המקור במלואו, ואז מפענחים את היעד צעד-צעד, עם cross-attention שמחבר ביניהם. בוחרים לפי המשימה: סיווג → אנקודר; יצירה → דקודר; המרה A→B → שניהם.",
      },
      advanced: {
        en: "Causal masking (upper-triangular −∞ before softmax) enforces autoregression: p(x) = Πₜ p(xₜ | x_<t). Decoder-only LMs share the encoder block design but with the mask + a tied LM head + KV-caching at inference. Encoder-decoder adds cross-attention (queries from the decoder, keys/values from encoder outputs). For routing you'd never pay the autoregressive generation cost — a single bidirectional forward pass + a softmax over k classes is orders of magnitude cheaper and lower-latency.",
        he: "מיסוך סיבתי (משולש עליון של −∞ לפני softmax) אוכף אוטו-רגרסיה: p(x) = Πₜ p(xₜ | x_<t). מודלי דקודר-בלבד חולקים את עיצוב הבלוק עם המסכה + ראש LM קשור + KV-caching בהסקה. אנקודר-דקודר מוסיף cross-attention (queries מהדקודר, keys/values מפלטי האנקודר). לניתוב לעולם לא תשלם על עלות היצירה האוטו-רגרסיבית — מעבר דו-כיווני יחיד + softmax על k מחלקות זול בסדרי גודל ובעל latency נמוך יותר.",
      },
    },
  },

  attention: {
    title: { en: "Attention", he: "Attention (קשב)" },
    levels: {
      beginner: {
        en: "Attention is how each word decides which OTHER words matter to it right now. Reading 'the trophy didn't fit in the suitcase because IT was too big' — what is 'it'? Attention is the mechanism that lets the model pay more attention to 'trophy' than to 'suitcase'. It's a weighted spotlight: each word shines more light on the words it depends on.",
        he: "Attention הוא איך כל מילה מחליטה אילו מילים אחרות חשובות לה כרגע. בקריאת 'הגביע לא נכנס למזוודה כי הוא היה גדול מדי' — מה זה 'הוא'? Attention הוא המנגנון שמאפשר למודל לשים יותר לב ל'גביע' מאשר ל'מזוודה'. זה זרקור משוקלל: כל מילה מאירה יותר אור על המילים שהיא תלויה בהן.",
      },
      intermediate: {
        en: "Each token produces three vectors: a Query (what am I looking for?), a Key (what do I offer?), and a Value (the info I'll pass on). A token's new representation = a weighted sum of all Values, where the weights come from how well its Query matches each Key. High match → high weight → that token's Value dominates. Those weights are the 'attention map' you can visualize.",
        he: "כל טוקן מייצר שלושה וקטורים: Query (מה אני מחפש?), Key (מה אני מציע?), ו-Value (המידע שאעביר). הייצוג החדש של טוקן = סכום משוקלל של כל ה-Values, כשהמשקלים נובעים מכמה ה-Query שלו מתאים לכל Key. התאמה גבוהה → משקל גבוה → ה-Value של אותו טוקן שולט. המשקלים האלה הם 'מפת ה-attention' שאפשר להמחיש.",
      },
      advanced: {
        en: "Scaled dot-product attention: softmax(QKᵀ/√d_k)·V. The √d_k scaling keeps logits from saturating the softmax as d_k grows. Complexity is O(n²·d) in sequence length — the core bottleneck that FlashAttention, sparse, and linear-attention variants attack. In encoders the mask is all-ones (bidirectional); in decoders it's causal. The attention matrix is row-stochastic and fully differentiable, so gradients flow through the routing weights themselves.",
        he: "Scaled dot-product attention: softmax(QKᵀ/√d_k)·V. הסקיילינג ב-√d_k מונע מה-logits להרווֹת את ה-softmax ככל ש-d_k גדל. הסיבוכיות היא O(n²·d) באורך הרצף — צוואר הבקבוק שש-FlashAttention, sparse, ו-linear-attention תוקפים. באנקודרים המסכה כולה אחדות (דו-כיווני); בדקודרים היא סיבתית. מטריצת ה-attention היא row-stochastic ודיפרנציאבילית לחלוטין, כך שגרדיאנטים זורמים דרך משקלי הניתוב עצמם.",
      },
    },
  },

  self_attention: {
    title: { en: "Self-attention", he: "Self-Attention (קשב-עצמי)" },
    levels: {
      beginner: {
        en: "'Self' means the words are looking at EACH OTHER inside the SAME sentence — not at some other text. Every word asks every word (including itself) 'how relevant are you to me?' and updates itself accordingly. Do this for all words at once and the sentence becomes a web of meaning where context flows everywhere.",
        he: "'עצמי' אומר שהמילים מסתכלות אחת על השנייה בתוך אותו משפט — לא על טקסט אחר. כל מילה שואלת כל מילה (כולל עצמה) 'כמה את רלוונטית לי?' ומעדכנת את עצמה בהתאם. עושים זאת לכל המילים בו-זמנית, והמשפט הופך לרשת משמעות שבה ההקשר זורם לכל מקום.",
      },
      intermediate: {
        en: "Self-attention = attention where Q, K, V all come from the SAME sequence. (Cross-attention is when Q comes from one sequence and K,V from another — used in encoder-decoder.) It's the operation that replaces RNNs: instead of passing info left-to-right step by step, every token reaches every other token in a single parallel operation. That parallelism is why Transformers train so fast on GPUs.",
        he: "Self-attention = attention שבו Q, K, V כולם מגיעים מאותו רצף. (Cross-attention הוא כש-Q מגיע מרצף אחד ו-K,V מאחר — בשימוש באנקודר-דקודר.) זו הפעולה שמחליפה RNNs: במקום להעביר מידע משמאל-לימין צעד-צעד, כל טוקן מגיע לכל טוקן אחר בפעולה מקבילית אחת. המקביליות הזו היא הסיבה שטרנספורמרים מתאמנים כל-כך מהר על GPU.",
      },
      advanced: {
        en: "Per layer: X → Q=XW_Q, K=XW_K, V=XW_V; out = softmax(QKᵀ/√d_k)V, then a residual add + LayerNorm. Because there's no recurrence, position must be injected (embeddings/RoPE) or the operation is permutation-equivariant. Self-attention is content-based, dynamic routing — the weights are computed per input, unlike the static weights of a conv/FFN. This data-dependent mixing is the inductive bias that makes Transformers general sequence learners.",
        he: "פר שכבה: X → Q=XW_Q, K=XW_K, V=XW_V; out = softmax(QKᵀ/√d_k)V, ואז residual add + LayerNorm. מכיוון שאין רקורסיה, חייבים להזריק מיקום (embeddings/RoPE) אחרת הפעולה שוויונית-לתמורות. Self-attention הוא ניתוב דינמי מבוסס-תוכן — המשקלים מחושבים פר-קלט, בניגוד למשקלים הסטטיים של conv/FFN. הערבוב התלוי-בנתונים הזה הוא ה-inductive bias שהופך טרנספורמרים ללומדי-רצף כלליים.",
      },
    },
  },

  multi_head: {
    title: { en: "Heads & multi-head attention", he: "ראשים ו-Multi-Head Attention" },
    levels: {
      beginner: {
        en: "Instead of paying attention one way, the model does it several ways IN PARALLEL — each way is a 'head'. One head might track grammar, another might track who-does-what, another long-range references. Then all heads' findings are combined. Multiple heads = multiple kinds of relationships noticed at the same time.",
        he: "במקום לשים לב בצורה אחת, המודל עושה זאת בכמה צורות במקביל — כל צורה היא 'ראש'. ראש אחד עשוי לעקוב אחרי דקדוק, אחר אחרי מי-עושה-מה, אחר אחרי הפניות למרחק. ואז ממצאי כל הראשים משולבים. ריבוי ראשים = ריבוי סוגי קשרים שמבחינים בהם בו-זמנית.",
      },
      intermediate: {
        en: "Multi-head attention splits the 768-dim vector into h smaller subspaces (DistilBERT: 12 heads × 64 dims). Each head runs its own Q/K/V attention in its subspace, so heads can specialize. The outputs are concatenated and passed through a final linear projection. More heads ≠ always better; it's about giving the model several independent 'relationship channels'.",
        he: "Multi-head attention מפצל את הוקטור בן 768 הממדים ל-h תת-מרחבים קטנים (DistilBERT: 12 ראשים × 64 ממדים). כל ראש מריץ Q/K/V משלו בתת-המרחב שלו, כך שראשים יכולים להתמחות. הפלטים משורשרים ועוברים הטלה לינארית סופית. יותר ראשים ≠ תמיד טוב יותר; העניין הוא לתת למודל כמה 'ערוצי קשר' עצמאיים.",
      },
      advanced: {
        en: "MHA: concat(head_1..head_h)·W_O where head_i = Attention(XW_Q^i, XW_K^i, XW_V^i), each in ℝ^{d/h}. Splitting into subspaces costs nothing extra (same total FLOPs as one big head) but lets heads attend to different positions/features — provably more expressive than single-head. Interpretability work finds induction heads, positional heads, syntactic heads. Variants reduce KV memory: MQA (1 KV head) and GQA (grouped) trade a little quality for big inference speedups.",
        he: "MHA: concat(head_1..head_h)·W_O כאשר head_i = Attention(XW_Q^i, XW_K^i, XW_V^i), כל אחד ב-ℝ^{d/h}. הפיצול לתת-מרחבים לא עולה תוספת (אותם FLOPs כמו ראש גדול אחד) אך מאפשר לראשים לשים לב למיקומים/פיצ'רים שונים — מוכחות יותר מראש בודד. עבודות פרשנות מוצאות induction heads, ראשים מיקומיים, ראשים תחביריים. וריאנטים מקטינים זיכרון KV: MQA (ראש KV אחד) ו-GQA (מקובץ) מוותרים על מעט איכות תמורת זירוז הסקה גדול.",
      },
    },
  },

  logits: {
    title: { en: "Logits", he: "Logits" },
    levels: {
      beginner: {
        en: "After all the thinking, the model outputs one raw score per possible answer — here, one number per lane (code / chat / reasoning / creative). These raw scores are called logits. They can be any size, even negative. Higher = the model leans that way. They're not percentages yet.",
        he: "אחרי כל החשיבה, המודל מוציא ציון גולמי אחד לכל תשובה אפשרית — כאן, מספר אחד לכל מסלול (קוד / שיחה / היגיון / יצירתי). הציונים הגולמיים האלה נקראים logits. הם יכולים להיות בכל גודל, אפילו שליליים. גבוה יותר = המודל נוטה לכיוון הזה. הם עדיין לא אחוזים.",
      },
      intermediate: {
        en: "Logits are the output of the final linear layer (the classification head): z = W·h_[CLS] + b, one value per class. We then apply softmax to turn them into probabilities that sum to 1. The GAP between logits matters more than their absolute size — a big gap means a confident decision, a small gap means the model is unsure between two lanes.",
        he: "logits הם הפלט של השכבה הלינארית הסופית (ראש הסיווג): z = W·h_[CLS] + b, ערך אחד לכל מחלקה. ואז מפעילים softmax כדי להפוך אותם להסתברויות שמסתכמות ל-1. הפער בין ה-logits חשוב יותר מהגודל המוחלט שלהם — פער גדול = החלטה בטוחה, פער קטן = המודל לא בטוח בין שני מסלולים.",
      },
      advanced: {
        en: "Logits are pre-softmax, unnormalized log-odds (up to an additive constant). Cross-entropy is computed directly from logits for numerical stability (log-sum-exp), never from probabilities. Their scale encodes (mis)calibration: modern nets are overconfident, so temperature scaling z/T on a validation set is the standard fix. Argmax(logits) = argmax(probs), so for the routing DECISION you don't even need the softmax — but you do for a confidence threshold.",
        he: "logits הם log-odds לא-מנורמלים שלפני ה-softmax (עד כדי קבוע חיבורי). cross-entropy מחושב ישירות מה-logits ליציבות נומרית (log-sum-exp), לעולם לא מההסתברויות. הסקייל שלהם מקודד (חוסר)כיול: רשתות מודרניות בטוחות-מדי, לכן temperature scaling z/T על סט ולידציה הוא התיקון הסטנדרטי. Argmax(logits) = argmax(probs), אז להחלטת הניתוב אינך צריך אפילו את ה-softmax — אך כן עבור סף ביטחון.",
      },
    },
  },

  softmax: {
    title: { en: "Softmax", he: "Softmax" },
    levels: {
      beginner: {
        en: "Softmax turns the raw scores (logits) into clean percentages that add up to 100%. Biggest score becomes the biggest percentage. It's how 'the model leans toward code' becomes 'code: 87%, reasoning: 9%, …' — numbers you can actually read and compare.",
        he: "Softmax הופך את הציונים הגולמיים (logits) לאחוזים נקיים שמסתכמים ל-100%. הציון הגדול ביותר הופך לאחוז הגדול ביותר. כך 'המודל נוטה לקוד' הופך ל'קוד: 87%, היגיון: 9%, …' — מספרים שאפשר באמת לקרוא ולהשוות.",
      },
      intermediate: {
        en: "softmax(z)_i = e^{z_i} / Σ_j e^{z_j}. Exponentiating makes everything positive; dividing by the sum normalizes to a probability distribution. Because of the exponential, it exaggerates differences: a slightly higher logit becomes a much higher probability. That's usually good for decisiveness but is also why models look overconfident.",
        he: "softmax(z)_i = e^{z_i} / Σ_j e^{z_j}. ההעלאה בחזקה הופכת הכל לחיובי; החלוקה בסכום מנרמלת להתפלגות הסתברות. בגלל האקספוננט, הוא מגדיל הבדלים: logit מעט גבוה יותר הופך להסתברות גבוהה בהרבה. זה בדרך כלל טוב להחלטיות אך גם הסיבה שמודלים נראים בטוחים-מדי.",
      },
      advanced: {
        en: "Softmax is the categorical-distribution link function; with cross-entropy its gradient is the clean (p − y). Temperature T: softmax(z/T) — T>1 softens (use for calibration/distillation), T→0 approaches argmax. It's shift-invariant (subtract max for stable log-sum-exp) but not scale-invariant. For top-1 routing it's monotonic in the logits, so it changes confidences, not the decision — relevant when you set abstention thresholds.",
        he: "Softmax הוא פונקציית הקישור של ההתפלגות הקטגוריאלית; עם cross-entropy הגרדיאנט שלו הוא ה(p − y) הנקי. טמפרטורה T: softmax(z/T) — T>1 מרכך (לכיול/דיסטילציה), T→0 מתקרב ל-argmax. הוא אינווריאנטי-להזזה (מחסירים max ליציבות log-sum-exp) אך לא אינווריאנטי-לסקייל. לניתוב top-1 הוא מונוטוני ב-logits, אז הוא משנה ביטחון, לא את ההחלטה — רלוונטי כשקובעים ספי הימנעות.",
      },
    },
  },

  neural_net: {
    title: { en: "The neural network itself", he: "הרשת הנוירונית עצמה" },
    levels: {
      beginner: {
        en: "Underneath everything is a neural network: layers of simple units ('neurons'). Each neuron multiplies its inputs by learned weights, adds them up, and passes the result through a bend (so it can learn non-straight patterns). Stack enough layers and the network can learn astonishingly complex rules — all just from adjusting those weights.",
        he: "מתחת להכל יש רשת נוירונית: שכבות של יחידות פשוטות ('נוירונים'). כל נוירון מכפיל את הקלטים שלו במשקלים נלמדים, מסכם אותם, ומעביר את התוצאה דרך 'כיפוף' (כדי שיוכל ללמוד דפוסים לא-ישרים). ערום מספיק שכבות והרשת יכולה ללמוד חוקים מורכבים להפליא — והכל רק מכוונון המשקלים האלה.",
      },
      intermediate: {
        en: "A layer computes y = activation(W·x + b). W (weights) and b (bias) are the learned parameters; the activation (ReLU, GELU) adds non-linearity. A Transformer block is just a clever arrangement of such layers: attention to mix tokens, then a 2-layer feed-forward network applied to each token, with residual shortcuts so gradients flow through deep stacks. 'Training' = finding the W's and b's that make the loss small.",
        he: "שכבה מחשבת y = activation(W·x + b). W (משקלים) ו-b (היסט) הם הפרמטרים הנלמדים; ה-activation (ReLU, GELU) מוסיף אי-לינאריות. בלוק Transformer הוא רק סידור חכם של שכבות כאלה: attention לערבוב טוקנים, ואז רשת feed-forward בת 2 שכבות על כל טוקן, עם קיצורי-דרך residual כדי שגרדיאנטים יזרמו דרך ערימות עמוקות. 'אימון' = מציאת ה-W וה-b שמקטינים את ה-loss.",
      },
      advanced: {
        en: "An MLP is a universal function approximator; depth buys parameter-efficient expressivity. The FFN in a Transformer is typically d→4d→d with GELU, holding the bulk of the parameters. Residuals (He et al.) keep the Jacobian near identity so very deep nets stay trainable; LayerNorm stabilizes activation statistics. The whole network is one big differentiable function f_θ; training is gradient descent on θ over the loss surface, and architecture is mostly about shaping that surface to be learnable.",
        he: "MLP הוא מקרב-פונקציות אוניברסלי; עומק קונה אקספרסיביות יעילת-פרמטרים. ה-FFN בטרנספורמר הוא בדרך כלל d→4d→d עם GELU, ומחזיק את עיקר הפרמטרים. residuals (He et al.) שומרים על היעקוביאן קרוב לזהות כך שרשתות עמוקות מאוד נשארות ניתנות-לאימון; LayerNorm מייצב את סטטיסטיקות האקטיבציה. כל הרשת היא פונקציה דיפרנציאבילית גדולה אחת f_θ; אימון הוא gradient descent על θ על פני משטח ה-loss, וארכיטקטורה היא בעיקר עיצוב המשטח הזה להיות ניתן-ללמידה.",
      },
    },
  },

  backprop: {
    title: { en: "Backprop & gradient descent (the learning itself)", he: "Backprop ו-Gradient Descent (הלמידה עצמה)" },
    levels: {
      beginner: {
        en: "How does the model actually improve? After it guesses, we measure the error (loss). Then we work BACKWARDS through the network to find how much each weight contributed to the mistake, and nudge each one a tiny bit in the direction that would reduce the error. Repeat millions of times and the weights settle into values that get things right. That backward blame-assignment is 'backpropagation'.",
        he: "איך המודל באמת משתפר? אחרי שהוא מנחש, מודדים את הטעות (loss). אז עובדים אחורה דרך הרשת כדי למצוא כמה כל משקל תרם לטעות, ודוחפים כל אחד טיפה בכיוון שיקטין את הטעות. חוזרים מיליוני פעמים והמשקלים מתייצבים על ערכים שמצליחים. הקצאת-האשמה האחורית הזו היא 'backpropagation'.",
      },
      intermediate: {
        en: "Forward pass → loss → backward pass (chain rule computes ∂loss/∂w for every weight) → optimizer step (w ← w − lr·gradient). One such cycle over a batch is a 'step'; the learning rate sets the step size. The optimizer (AdamW) adapts the step per-parameter using running averages of past gradients, which makes training far more stable than plain SGD.",
        he: "מעבר קדימה → loss → מעבר אחורה (כלל השרשרת מחשב ∂loss/∂w לכל משקל) → צעד אופטימייזר (w ← w − lr·gradient). מחזור כזה על batch הוא 'צעד'; קצב הלמידה קובע את גודל הצעד. האופטימייזר (AdamW) מתאים את הצעד פר-פרמטר בעזרת ממוצעים נעים של גרדיאנטים קודמים, מה שהופך את האימון ליציב בהרבה מ-SGD פשוט.",
      },
      advanced: {
        en: "Backprop = reverse-mode autodiff: one forward pass caches activations, one reverse pass accumulates vector-Jacobian products in O(1) passes regardless of parameter count. AdamW maintains 1st/2nd moment estimates (m, v) with bias correction and decoupled weight decay. Stability tooling: gradient clipping, LR warmup (the early steps have huge, noisy gradients), mixed-precision (bf16/fp16) with loss scaling. On a 4090 you'd enable bf16 + gradient checkpointing to trade compute for memory on larger models.",
        he: "Backprop = autodiff במצב-הפוך: מעבר קדימה אחד שומר אקטיבציות, מעבר הפוך אחד צובר מכפלות vector-Jacobian ב-O(1) מעברים ללא תלות במספר הפרמטרים. AdamW מתחזק אומדני מומנט ראשון/שני (m, v) עם תיקון הטיה ו-weight decay מנותק. כלי יציבות: gradient clipping, LR warmup (לצעדים הראשונים גרדיאנטים ענקיים ורועשים), mixed-precision (bf16/fp16) עם loss scaling. על 4090 תפעיל bf16 + gradient checkpointing כדי להמיר חישוב בזיכרון במודלים גדולים יותר.",
      },
    },
  },
};
