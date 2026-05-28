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
        en: "Encoder-only (BERT-family) is the right inductive bias for classification — bidirectional attention, [CLS] pooling. Alternatives: XLM-RoBERTa (stronger, heavier), or a Hebrew-specific encoder (AlephBERT/HeRo). A small encoder like this fine-tunes full-parameter on almost any modern GPU; reserve LoRA for the larger generative stages where memory is tight.",
        he: "אנקודר-בלבד (משפחת BERT) הוא ה-inductive bias הנכון לסיווג — attention דו-כיווני, pooling דרך [CLS]. חלופות: XLM-RoBERTa (חזק יותר, כבד יותר), או אנקודר עברי ייעודי (AlephBERT/HeRo). אנקודר קטן כזה מתכוונן ב-full-parameter כמעט על כל GPU מודרני; שמור LoRA לשלבים הגנרטיביים הגדולים יותר שבהם הזיכרון צפוף.",
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
        en: "Examples processed per optimizer step. It trades memory for gradient stability. If you hit an out-of-memory error, halve the batch size. For a small encoder like this, 8 to 32 is comfortable on most GPUs; on CPU keep it small (4–8) and expect it to be slower.",
        he: "דוגמאות המעובדות בכל צעד אופטימייזר. מאזן בין זיכרון ליציבות הגרדיאנט. אם קיבלת שגיאת out-of-memory, חצה את גודל האצווה. לאנקודר קטן כזה, 8 עד 32 נוח על רוב כרטיסי ה-GPU; על CPU שמור על ערך קטן (4–8) וצפה לאיטיות.",
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
        en: "Backprop = reverse-mode autodiff: one forward pass caches activations, one reverse pass accumulates vector-Jacobian products in O(1) passes regardless of parameter count. AdamW maintains 1st/2nd moment estimates (m, v) with bias correction and decoupled weight decay. Stability tooling: gradient clipping, LR warmup (the early steps have huge, noisy gradients), mixed-precision (bf16/fp16) with loss scaling. On any modern GPU you'd enable bf16 + gradient checkpointing to trade compute for memory on larger models — the app picks bf16/fp16/fp32 automatically for your hardware.",
        he: "Backprop = autodiff במצב-הפוך: מעבר קדימה אחד שומר אקטיבציות, מעבר הפוך אחד צובר מכפלות vector-Jacobian ב-O(1) מעברים ללא תלות במספר הפרמטרים. AdamW מתחזק אומדני מומנט ראשון/שני (m, v) עם תיקון הטיה ו-weight decay מנותק. כלי יציבות: gradient clipping, LR warmup (לצעדים הראשונים גרדיאנטים ענקיים ורועשים), mixed-precision (bf16/fp16) עם loss scaling. על כל GPU מודרני תפעיל bf16 + gradient checkpointing כדי להמיר חישוב בזיכרון במודלים גדולים יותר — האפליקציה בוחרת bf16/fp16/fp32 אוטומטית לפי החומרה שלך.",
      },
    },
  },

  head: {
    title: { en: "Head — why it's called that", he: "Head (ראש) — למה קוראים לזה ככה" },
    levels: {
      beginner: {
        en: "A 'head' is a small part bolted onto the end of a network that produces the final answer in the shape YOU need. Think of the big pretrained model as a body that understands language, and the head as a hat you swap depending on the job: a classification head outputs 4 lane scores; a different head could output one number, or a whole sentence. It's called a 'head' because it sits at the very top (the output end) of the network.",
        he: "'ראש' (head) הוא חלק קטן שמחברים לקצה הרשת והוא מפיק את התשובה הסופית בצורה שאתה צריך. דמיין את המודל הגדול המאומן כגוף שמבין שפה, והראש ככובע שמחליפים לפי המשימה: ראש סיווג מפיק 4 ציוני ליינים; ראש אחר יכול להפיק מספר אחד, או משפט שלם. קוראים לזה 'ראש' כי הוא יושב ממש בקצה העליון (צד הפלט) של הרשת.",
      },
      intermediate: {
        en: "Two different 'head' meanings share the word — don't confuse them. (1) A TASK head: the final layer(s) mapping the model's hidden representation to your output (e.g. a 768→4 linear layer for classification). (2) An ATTENTION head: one of the parallel attention computations inside each transformer layer. Same word, different place. When people say 'we froze the body and trained the head', they mean the task head.",
        he: "שתי משמעויות שונות חולקות את המילה 'head' — אל תתבלבל. (1) ראש משימה (task head): השכבה/ות האחרונות שממפות את הייצוג הפנימי של המודל לפלט שלך (למשל שכבה לינארית 768→4 לסיווג). (2) ראש קשב (attention head): אחד מחישובי הקשב המקבילים בתוך כל שכבת טרנספורמר. אותה מילה, מקום אחר. כשאומרים 'הקפאנו את הגוף ואימנו את הראש' מתכוונים לראש המשימה.",
      },
      advanced: {
        en: "Task head: a small module (often a single nn.Linear, sometimes pooler+dropout+linear) on top of the pooled/[CLS] representation; only its weights are randomly initialized, so fine-tuning spends most of its signal there. Attention head: with model dim d and h heads, each head works in a d/h subspace via its own learned Wq/Wk/Wv projections; outputs are concatenated and mixed by Wo. The two are unrelated mechanisms that unfortunately share a name.",
        he: "ראש משימה: מודול קטן (לרוב nn.Linear יחיד, לפעמים pooler+dropout+linear) מעל הייצוג המאוגם/[CLS]; רק המשקלים שלו מאותחלים אקראית, ולכן fine-tuning משקיע שם את רוב האות. ראש קשב: עם מימד מודל d ו-h ראשים, כל ראש עובד בתת-מרחב d/h דרך הטלות Wq/Wk/Wv נלמדות משלו; הפלטים משורשרים ומעורבבים ע\"י Wo. שני מנגנונים לא קשורים שלמרבה הצער חולקים שם.",
      },
    },
  },

  context_window: {
    title: { en: "Context window", he: "חלון הקשר (Context Window)" },
    levels: {
      beginner: {
        en: "The context window is how many tokens the model can 'see' at once — its short-term memory. If a model has a 4,000-token window and you paste a 10,000-token document, it physically cannot look at all of it; the overflow is cut. Bigger windows let the model consider more (a whole codebase, a long chat history) but cost much more memory and time.",
        he: "חלון ההקשר הוא כמה טוקנים המודל יכול 'לראות' בבת אחת — הזיכרון לטווח הקצר שלו. אם למודל יש חלון של 4,000 טוקנים ואתה מדביק מסמך של 10,000 טוקנים, הוא פיזית לא יכול להסתכל על הכל; העודף נחתך. חלונות גדולים מאפשרים למודל לשקול יותר (קוד שלם, היסטוריית שיחה ארוכה) אבל עולים הרבה יותר זיכרון וזמן.",
      },
      intermediate: {
        en: "The window size is the max sequence length the model accepts. The cost matters: classic self-attention is O(n²) in sequence length — double the context, quadruple the attention compute and memory. That quadratic wall is exactly why long-context models need tricks (Flash Attention for memory, RoPE/ALiBi for length generalization, sometimes sparse/sliding-window attention).",
        he: "גודל החלון הוא אורך הרצף המקסימלי שהמודל מקבל. העלות חשובה: self-attention קלאסי הוא O(n²) באורך הרצף — הכפלת ההקשר פי 2 מרבעת את חישוב וזיכרון הקשב. הקיר הריבועי הזה הוא בדיוק הסיבה שמודלים ארוכי-הקשר צריכים טריקים (Flash Attention לזיכרון, RoPE/ALiBi להכללת אורך, לפעמים קשב דליל/חלון נע).",
      },
      advanced: {
        en: "Effective context ≠ advertised context: models often degrade well before their max (the 'lost in the middle' effect — recall is best at the start and end of the window). KV-cache size grows linearly with context and dominates inference memory at long lengths. Extending context post-training uses RoPE scaling (linear/NTK/YaRN) plus a little continued training. Our router uses max_length=128 — tiny, because routing only needs the prompt's gist.",
        he: "הקשר אפקטיבי ≠ הקשר מוצהר: מודלים נוטים להידרדר הרבה לפני המקסימום (אפקט 'אבוד באמצע' — ה-recall הכי טוב בהתחלה ובסוף החלון). גודל ה-KV-cache גדל לינארית עם ההקשר ושולט בזיכרון ההסקה באורכים גדולים. הרחבת הקשר אחרי אימון משתמשת ב-RoPE scaling (linear/NTK/YaRN) ועוד קצת אימון המשך. הראוטר שלנו משתמש ב-max_length=128 — זעיר, כי ניתוב צריך רק את תמצית הפרומפט.",
      },
    },
  },

  flash_attention: {
    title: { en: "Flash Attention", he: "Flash Attention" },
    levels: {
      beginner: {
        en: "Flash Attention is a faster, leaner way to compute the exact same attention — it doesn't change the answer, just how it's calculated. The naive way builds a giant n×n table in memory; Flash Attention avoids ever storing that whole table, so it uses far less memory and runs much faster, especially on long inputs. You turn it on and your training just gets quicker and fits bigger models.",
        he: "Flash Attention היא דרך מהירה וחסכונית יותר לחשב את אותו attention בדיוק — היא לא משנה את התשובה, רק איך מחשבים אותה. הדרך הנאיבית בונה טבלת n×n ענקית בזיכרון; Flash Attention נמנעת מאחסון כל הטבלה הזו, ולכן משתמשת בהרבה פחות זיכרון ורצה הרבה יותר מהר, במיוחד על קלטים ארוכים. מפעילים אותה והאימון פשוט נהיה מהיר יותר ומכיל מודלים גדולים יותר.",
      },
      intermediate: {
        en: "It's an IO-aware exact attention algorithm. The bottleneck in attention isn't the math, it's moving the n×n score matrix between fast on-chip SRAM and slow HBM memory. Flash Attention tiles the computation and fuses softmax so the full matrix never materializes in HBM — memory drops from O(n²) to O(n), with a big wall-clock speedup. Same numerical result (up to floating-point noise).",
        he: "זהו אלגוריתם attention מדויק מודע-IO. צוואר הבקבוק ב-attention הוא לא החשבון אלא הזזת מטריצת הציונים n×n בין SRAM מהיר על-השבב ל-HBM איטי. Flash Attention מרצפת (tiling) את החישוב וממזגת softmax כך שהמטריצה המלאה לעולם לא מתממשת ב-HBM — הזיכרון יורד מ-O(n²) ל-O(n), עם האצה משמעותית בזמן-קיר. אותה תוצאה מספרית (עד רעש נקודה צפה).",
      },
      advanced: {
        en: "Online softmax with running max/sum lets each tile update the output without the global normalizer; the backward pass recomputes attention on the fly (cheaper than storing it). FA2 improves work partitioning across warps; FA3 exploits Hopper async/FP8. Caveats: needs a supported GPU + dtype (fp16/bf16), specific head dims, and integration (e.g. attn_implementation='flash_attention_2'). It changes throughput/footprint, not model quality.",
        he: "online softmax עם max/sum רצים מאפשר לכל אריח לעדכן את הפלט בלי הנרמול הגלובלי; המעבר האחורי מחשב מחדש attention תוך כדי תנועה (זול יותר מאחסון). FA2 משפר חלוקת עבודה בין warps; FA3 מנצל async/FP8 של Hopper. אזהרות: דורש GPU + dtype נתמכים (fp16/bf16), מימדי ראש מסוימים, ואינטגרציה (למשל attn_implementation='flash_attention_2'). משנה תפוקה/טביעת-זיכרון, לא איכות מודל.",
      },
    },
  },

  pre_norm: {
    title: { en: "Pre-norm vs post-norm (LayerNorm placement)", he: "Pre-norm מול Post-norm (מיקום LayerNorm)" },
    levels: {
      beginner: {
        en: "LayerNorm is a step that re-scales the numbers flowing through the network so they don't explode or vanish. The question is WHERE to put it: before each attention/feed-forward block ('pre-norm') or after it ('post-norm'). Pre-norm turned out to be much more stable to train, so almost every modern model uses it. It's a small placement choice with a big effect on whether training even converges.",
        he: "LayerNorm הוא שלב שמכייל מחדש את המספרים שזורמים דרך הרשת כדי שלא יתפוצצו או ייעלמו. השאלה היא איפה לשים אותו: לפני כל בלוק attention/feed-forward ('pre-norm') או אחריו ('post-norm'). התברר ש-pre-norm יציב הרבה יותר לאימון, ולכן כמעט כל מודל מודרני משתמש בו. בחירת מיקום קטנה עם השפעה גדולה על האם האימון בכלל מתכנס.",
      },
      intermediate: {
        en: "Post-norm (original Transformer): x → Sublayer → Add → LayerNorm. Pre-norm: x → LayerNorm → Sublayer → Add. Pre-norm keeps a clean residual highway from input to output, so gradients flow without being repeatedly rescaled — you can train deep stacks without the careful LR warmup post-norm demands. The trade-off: pre-norm can slightly underperform when very carefully tuned, but its robustness wins in practice.",
        he: "Post-norm (הטרנספורמר המקורי): x → Sublayer → Add → LayerNorm. Pre-norm: x → LayerNorm → Sublayer → Add. Pre-norm שומר כביש-מהיר שיורי נקי מהקלט לפלט, כך שגרדיאנטים זורמים בלי שמכיילים אותם שוב ושוב — אפשר לאמן ערימות עמוקות בלי ה-LR warmup הזהיר ש-post-norm דורש. הפשרה: pre-norm יכול להיות מעט פחות טוב כשמכווננים בקפידה רבה, אבל החוסן שלו מנצח בפועל.",
      },
      advanced: {
        en: "Post-norm's output-layer Jacobian compounds, giving gradient norms that grow/shrink with depth → needs warmup + careful init. Pre-norm makes the residual branch an identity at init, bounding the effective gradient and enabling 100+ layer training, but causes 'representation collapse'/growing residual stream variance, often patched with a final LN. Variants: RMSNorm (drops the mean-centering, used in Llama), DeepNorm, sandwich norm. This is why nearly all current LLMs are pre-norm + RMSNorm.",
        he: "ה-Jacobian של שכבת הפלט ב-post-norm מצטבר, ונותן נורמות גרדיאנט שגדלות/קטנות עם העומק → דורש warmup + אתחול זהיר. Pre-norm הופך את הענף השיורי לזהות באתחול, חוסם את הגרדיאנט האפקטיבי ומאפשר אימון 100+ שכבות, אבל גורם ל'קריסת ייצוג'/שונות גדלה בזרם השיורי, שלרוב מתוקנת ב-LN סופי. וריאנטים: RMSNorm (מוותר על מירכוז הממוצע, בשימוש ב-Llama), DeepNorm, sandwich norm. לכן כמעט כל ה-LLMים הנוכחיים הם pre-norm + RMSNorm.",
      },
    },
  },

  rope: {
    title: { en: "Rotary embeddings (RoPE)", he: "Rotary Embeddings (RoPE)" },
    levels: {
      beginner: {
        en: "Transformers process all tokens at once, so they need to be told the ORDER of words — otherwise 'dog bites man' and 'man bites dog' look identical. RoPE is the modern way to inject position. Instead of adding a 'position number' to each token, it rotates each token's vector by an angle that depends on its position. Models like Llama use it because it handles longer texts more gracefully than the old method.",
        he: "טרנספורמרים מעבדים את כל הטוקנים בבת אחת, ולכן צריך לומר להם את הסדר של המילים — אחרת 'כלב נושך אדם' ו'אדם נושך כלב' נראים זהים. RoPE היא הדרך המודרנית להזריק מיקום. במקום להוסיף 'מספר מיקום' לכל טוקן, היא מסובבת את הוקטור של כל טוקן בזווית שתלויה במיקומו. מודלים כמו Llama משתמשים בה כי היא מתמודדת עם טקסטים ארוכים יותר בחן רב יותר מהשיטה הישנה.",
      },
      intermediate: {
        en: "RoPE = Rotary Position Embedding. It applies a position-dependent rotation to the query and key vectors (in 2D pairs) before the dot product. The elegant consequence: the attention score between positions i and j ends up depending only on their RELATIVE distance (i−j), not absolute positions — so the model naturally generalizes to offsets it didn't see much in training. It's applied inside attention, not added at the input like the original sinusoidal encodings.",
        he: "RoPE = Rotary Position Embedding. היא מפעילה סיבוב תלוי-מיקום על וקטורי ה-query וה-key (בזוגות דו-מימדיים) לפני המכפלה הסקלרית. התוצאה האלגנטית: ציון הקשב בין מיקומים i ו-j תלוי בסוף רק במרחק היחסי שלהם (i−j), לא במיקומים מוחלטים — כך שהמודל מכליל באופן טבעי להיסטים שלא ראה הרבה באימון. מוחלת בתוך ה-attention, לא נוספת בקלט כמו הקידוד הסינוסואידלי המקורי.",
      },
      advanced: {
        en: "Each 2D subspace of q,k is rotated by angle θ_d·position with θ_d = base^(−2d/dim) (base=10000 classically). Because rotation matrices satisfy R(a)ᵀR(b)=R(b−a), qᵢᵀkⱼ depends on relative offset — relative position 'for free' with no extra params. Long-context extension scales the frequencies: linear interpolation, NTK-aware scaling, or YaRN, usually with brief continued pretraining. Contrast ALiBi (adds a linear distance bias to logits instead of rotating).",
        he: "כל תת-מרחב דו-מימדי של q,k מסובב בזווית θ_d·position כאשר θ_d = base^(−2d/dim) (base=10000 קלאסית). מכיוון שמטריצות סיבוב מקיימות R(a)ᵀR(b)=R(b−a), qᵢᵀkⱼ תלוי בהיסט היחסי — מיקום יחסי 'בחינם' בלי פרמטרים נוספים. הרחבת הקשר ארוך מכווצת/מותחת את התדרים: אינטרפולציה לינארית, NTK-aware scaling, או YaRN, לרוב עם אימון-המשך קצר. השוו ל-ALiBi (מוסיף הטיית מרחק לינארית ללוגיטים במקום לסובב).",
      },
    },
  },

  mixed_precision: {
    title: { en: "Mixed precision (bf16 / fp16)", he: "דיוק מעורב (bf16 / fp16)" },
    levels: {
      beginner: {
        en: "Numbers in a model are normally stored as 32-bit floats (high precision, lots of memory). Mixed precision stores most of them as 16-bit instead — half the memory, faster math — while keeping the few sensitive parts in 32-bit so accuracy barely changes. The result: training fits bigger models and runs faster on the same GPU. This app picks the right precision for your hardware automatically.",
        he: "מספרים במודל נשמרים בדרך כלל כ-float של 32 ביט (דיוק גבוה, הרבה זיכרון). דיוק מעורב שומר את רובם כ-16 ביט במקום — חצי מהזיכרון, חשבון מהיר יותר — תוך שמירת המעט החלקים הרגישים ב-32 ביט כך שהדיוק כמעט לא משתנה. התוצאה: האימון מכיל מודלים גדולים יותר ורץ מהר יותר על אותו GPU. האפליקציה בוחרת את הדיוק הנכון לחומרה שלך אוטומטית.",
      },
      intermediate: {
        en: "Two 16-bit formats: fp16 (1 sign / 5 exponent / 10 mantissa) is precise but has a narrow range that overflows easily → needs 'loss scaling'. bf16 (1/8/7) keeps fp32's exponent range, so it almost never overflows and needs no loss scaling — that's why it's preferred on GPUs that support it (Ampere+). Master weights and the optimizer state stay fp32; only the forward/backward compute is 16-bit (autocast).",
        he: "שני פורמטים של 16 ביט: fp16 (1 סימן / 5 מעריך / 10 מנטיסה) מדויק אבל בעל טווח צר שעולה על גדותיו בקלות → דורש 'loss scaling'. bf16 (1/8/7) שומר על טווח המעריך של fp32, כך שכמעט לעולם לא עולה על גדותיו ולא צריך loss scaling — לכן הוא מועדף על GPUים שתומכים בו (Ampere ומעלה). משקלי-אב ומצב האופטימייזר נשארים fp32; רק חישוב הפורוורד/בקוורד הוא 16 ביט (autocast).",
      },
      advanced: {
        en: "Autocast runs matmuls/convs in low precision while keeping reductions, softmax, and norm stats in fp32. fp16 needs a GradScaler (dynamic loss scaling to avoid gradient underflow); bf16 usually doesn't. Beyond bf16: fp8 (E4M3/E5M2) training on Hopper/Ada with per-tensor scaling, and int8/4 for inference. Trade-off is range vs precision — bf16 trades mantissa bits for exponent range, which matters more for training stability than raw precision. Our trainer sets bf16/fp16 from hardware.detect().",
        he: "Autocast מריץ matmuls/convs בדיוק נמוך תוך שמירת reductions, softmax, וסטטיסטיקות norm ב-fp32. fp16 דורש GradScaler (loss scaling דינמי למניעת underflow בגרדיאנטים); bf16 לרוב לא. מעבר ל-bf16: אימון fp8 (E4M3/E5M2) על Hopper/Ada עם scaling פר-טנזור, ו-int8/4 להסקה. הפשרה היא טווח מול דיוק — bf16 מחליף ביטי מנטיסה בטווח מעריך, מה שחשוב יותר ליציבות אימון מאשר דיוק גולמי. הטריינר שלנו קובע bf16/fp16 מ-hardware.detect().",
      },
    },
  },

  quantization: {
    title: { en: "Quantization", he: "קוונטיזציה (Quantization)" },
    levels: {
      beginner: {
        en: "Quantization shrinks a model by storing its weights with fewer bits — like saving a photo as a smaller JPEG. A model that needs 16-bit numbers might be squeezed to 8-bit or even 4-bit, cutting its memory to a quarter. That's how a model that wouldn't fit on your GPU suddenly runs on it. There's a small quality cost, but for many uses it's barely noticeable.",
        he: "קוונטיזציה מכווצת מודל ע\"י שמירת המשקלים שלו בפחות ביטים — כמו לשמור תמונה כ-JPEG קטן יותר. מודל שצריך מספרים של 16 ביט אפשר לדחוס ל-8 ביט או אפילו 4 ביט, וכך לחתוך את הזיכרון לרבע. ככה מודל שלא היה נכנס ל-GPU שלך פתאום רץ עליו. יש מחיר איכות קטן, אבל לשימושים רבים הוא כמעט לא מורגש.",
      },
      intermediate: {
        en: "Map high-precision weights to a small set of low-bit levels via a scale (and maybe zero-point). Two families: post-training quantization (PTQ — quantize an already-trained model, e.g. GPTQ, AWQ, bitsandbytes nf4) and quantization-aware training (QAT — simulate quantization during training for better accuracy). Inference in 4-bit can cut VRAM ~4× with modest perplexity loss. This is the 'Q' that makes QLoRA possible: load the base model in 4-bit, train small adapters on top.",
        he: "ממפים משקלים בדיוק גבוה לקבוצה קטנה של רמות לואו-ביט דרך scale (ואולי zero-point). שתי משפחות: קוונטיזציה אחרי אימון (PTQ — מכמתים מודל מאומן, למשל GPTQ, AWQ, bitsandbytes nf4) וקוונטיזציה מודעת-אימון (QAT — מדמים קוונטיזציה תוך כדי אימון לדיוק טוב יותר). הסקה ב-4 ביט יכולה לחתוך VRAM פי ~4 עם אובדן perplexity מתון. זה ה-'Q' שמאפשר QLoRA: טוענים את מודל הבסיס ב-4 ביט, מאמנים מתאמים קטנים מעליו.",
      },
      advanced: {
        en: "Per-tensor vs per-channel vs per-group scales trade accuracy for overhead; outlier-aware methods (LLM.int8's mixed-precision decomposition, AWQ's activation-aware scaling, SmoothQuant's migration of activation scale into weights) handle the heavy-tailed activations that naive int8 destroys. nf4 (QLoRA) is a 4-bit 'normal float' matched to weight distributions, plus double quantization of the scales. Calibration data choice materially affects PTQ quality; KV-cache quantization is the next frontier for long-context inference.",
        he: "scales פר-טנזור מול פר-ערוץ מול פר-קבוצה מחליפים דיוק בתקורה; שיטות מודעות-חריגים (פירוק דיוק-מעורב של LLM.int8, scaling מודע-אקטיבציה של AWQ, העברת scale האקטיבציה למשקלים של SmoothQuant) מטפלות באקטיבציות בעלות זנב כבד ש-int8 נאיבי הורס. nf4 (QLoRA) הוא 'normal float' של 4 ביט מותאם להתפלגות המשקלים, ועוד קוונטיזציה כפולה של ה-scales. בחירת נתוני הכיול משפיעה מהותית על איכות PTQ; קוונטיזציה של KV-cache היא החזית הבאה להסקה ארוכת-הקשר.",
      },
    },
  },

  lora: {
    title: { en: "LoRA — train big models cheaply", he: "LoRA — לאמן מודלים גדולים בזול" },
    levels: {
      beginner: {
        en: "Fully fine-tuning a big model means updating billions of weights — huge memory, huge cost. LoRA is a shortcut: freeze the whole original model and train only a tiny pair of extra matrices bolted onto each layer. You end up changing well under 1% of the parameters, yet you can still teach the model a new skill or style. The little file you save (the 'adapter') is megabytes, not gigabytes, and you can swap different adapters in and out.",
        he: "fine-tuning מלא של מודל גדול אומר לעדכן מיליארדי משקלים — זיכרון עצום, עלות עצומה. LoRA הוא קיצור דרך: מקפיאים את כל המודל המקורי ומאמנים רק זוג זעיר של מטריצות נוספות שמחוברות לכל שכבה. בסוף משנים הרבה פחות מ-1% מהפרמטרים, ועדיין אפשר ללמד את המודל מיומנות או סגנון חדשים. הקובץ הקטן שנשמר (ה'אדפטר') הוא מגה-בייטים, לא ג'יגה-בייטים, ואפשר להחליף אדפטרים שונים פנימה והחוצה.",
      },
      intermediate: {
        en: "LoRA = Low-Rank Adaptation. For a frozen weight W, it adds a low-rank update ΔW = B·A where A is r×k and B is d×r with rank r tiny (8–64). Only A and B train; W stays frozen. Because r≪d, you train orders of magnitude fewer params and store a small adapter. At inference you can keep it separate (swap adapters) or merge it (ΔW added back into W, zero extra latency). Common knobs: rank r, alpha (scaling), which modules to target (often q/v projections).",
        he: "LoRA = Low-Rank Adaptation. עבור משקל קפוא W, מוסיפים עדכון דרגה-נמוכה ΔW = B·A כאשר A הוא r×k ו-B הוא d×r עם דרגה r זעירה (8–64). רק A ו-B מתאמנים; W נשאר קפוא. מכיוון ש-r≪d, מאמנים סדרי גודל פחות פרמטרים ושומרים אדפטר קטן. בהסקה אפשר להשאיר אותו נפרד (להחליף אדפטרים) או למזג אותו (ΔW נוסף חזרה ל-W, אפס latency נוסף). כפתורים נפוצים: דרגה r, alpha (scaling), אילו מודולים למקד (לרוב הטלות q/v).",
      },
      advanced: {
        en: "ΔW = (α/r)·BA, A~N(0,σ²), B=0 at init so training starts as a no-op. The bet: fine-tuning updates have low 'intrinsic rank', so a rank-r factorization captures most of the useful change. Trains only ~0.1–1% of params, slashing optimizer-state memory (the real fine-tuning bottleneck). Variants: DoRA (decompose magnitude/direction), rsLoRA (rank-stabilized scaling), VeRA (shared random bases). Merging is exact and latency-free; serving many merged variants needs many copies, so adapter-swapping wins for multi-tenant.",
        he: "ΔW = (α/r)·BA, A~N(0,σ²), B=0 באתחול כך שהאימון מתחיל כ-no-op. ההימור: עדכוני fine-tuning הם בעלי 'דרגה אינטרינזית' נמוכה, כך שפירוק דרגה-r לוכד את רוב השינוי המועיל. מאמן רק ~0.1–1% מהפרמטרים, וחותך את זיכרון מצב-האופטימייזר (צוואר הבקבוק האמיתי ב-fine-tuning). וריאנטים: DoRA (פירוק עוצמה/כיוון), rsLoRA (scaling מיוצב-דרגה), VeRA (בסיסים אקראיים משותפים). המיזוג מדויק וחסר-latency; הגשת וריאנטים ממוזגים רבים דורשת עותקים רבים, ולכן החלפת-אדפטרים מנצחת ל-multi-tenant.",
      },
    },
  },

  qlora: {
    title: { en: "QLoRA — LoRA on a quantized base", he: "QLoRA — LoRA על בסיס מקוונטז" },
    levels: {
      beginner: {
        en: "QLoRA combines two tricks so you can fine-tune surprisingly large models on a single modest GPU. First, load the big base model in 4-bit so it barely takes any memory (quantization). Then train small LoRA adapters on top of it. Together: the frozen giant is cheap to hold in memory, and the tiny trainable part is cheap to train. Models that used to need a server farm became trainable on one consumer card.",
        he: "QLoRA משלב שני טריקים כדי שתוכל לעשות fine-tuning למודלים גדולים להפתיע על GPU צנוע יחיד. ראשית, טוענים את מודל הבסיס הגדול ב-4 ביט כך שהוא כמעט לא תופס זיכרון (קוונטיזציה). אז מאמנים אדפטרי LoRA קטנים מעליו. ביחד: הענק הקפוא זול להחזקה בזיכרון, והחלק הזעיר הניתן-לאימון זול לאימון. מודלים שפעם הצריכו חוות שרתים נהיו ניתנים לאימון על כרטיס צרכני אחד.",
      },
      intermediate: {
        en: "QLoRA = quantize the frozen base to 4-bit (nf4) + train LoRA adapters in 16-bit on top. Gradients flow THROUGH the 4-bit frozen weights into the adapters (the base is never updated). Key pieces: nf4 (an information-theoretically nice 4-bit datatype for normally-distributed weights), double quantization (quantize the quantization constants too), and paged optimizers (spill optimizer state to CPU on memory spikes). Net effect: fine-tune a 65B model on a single 48GB GPU.",
        he: "QLoRA = מכמתים את הבסיס הקפוא ל-4 ביט (nf4) + מאמנים אדפטרי LoRA ב-16 ביט מעליו. גרדיאנטים זורמים דרך המשקלים הקפואים של 4 הביט אל תוך האדפטרים (הבסיס לעולם לא מתעדכן). חלקים מרכזיים: nf4 (טיפוס נתונים יפה תיאורטית-אינפורמטיבית של 4 ביט למשקלים בהתפלגות נורמלית), קוונטיזציה כפולה (מכמתים גם את קבועי הקוונטיזציה), ואופטימייזרים מ-paged (שופכים את מצב האופטימייזר ל-CPU בקפיצות זיכרון). אפקט נטו: fine-tuning למודל 65B על GPU יחיד של 48GB.",
      },
      advanced: {
        en: "Forward pass dequantizes nf4 weights to bf16 on the fly per-block, computes, discards — so the 4-bit storage is the only persistent footprint while compute stays bf16. nf4 assumes zero-mean normal weights and uses quantiles of N(0,1) as levels; double quant stores the per-block absmax constants in 8-bit to save ~0.4 bits/param. Paged optimizers use NVIDIA unified memory to survive length-spike OOMs. Quality matches 16-bit LoRA on most benchmarks; the main cost is slower throughput from on-the-fly dequant.",
        he: "המעבר קדימה מבטל-קוונטיזציה של משקלי nf4 ל-bf16 תוך כדי תנועה פר-בלוק, מחשב, וזורק — כך שאחסון 4 הביט הוא טביעת-הרגל הקבועה היחידה בעוד החישוב נשאר bf16. nf4 מניח משקלים נורמליים ממוצע-אפס ומשתמש בקוונטילים של N(0,1) כרמות; קוונטיזציה כפולה שומרת את קבועי ה-absmax הפר-בלוק ב-8 ביט כדי לחסוך ~0.4 ביט/פרמטר. אופטימייזרים מ-paged משתמשים בזיכרון מאוחד של NVIDIA כדי לשרוד OOM בקפיצות אורך. האיכות משתווה ל-LoRA של 16 ביט ברוב המבחנים; המחיר העיקרי הוא תפוקה איטית יותר מביטול-הקוונטיזציה תוך-כדי.",
      },
    },
  },

  confusion_matrix: {
    title: { en: "Confusion matrix & evaluation metrics", he: "מטריצת בלבול ומדדי הערכה" },
    levels: {
      beginner: {
        en: "A confusion matrix is a simple grid that shows exactly WHERE a classifier gets things right and wrong. Rows are the true answer, columns are the model's guess. The diagonal is the correct cases; everything off the diagonal is a specific mistake (e.g. 'it called 3 reasoning prompts code'). Accuracy alone hides this — the matrix shows you which classes get mixed up, so you know what data to add.",
        he: "מטריצת בלבול היא רשת פשוטה שמראה בדיוק איפה מסווג צודק וטועה. השורות הן התשובה האמיתית, העמודות הן הניחוש של המודל. האלכסון הוא המקרים הנכונים; כל מה שמחוץ לאלכסון הוא טעות ספציפית (למשל 'הוא קרא ל-3 פרומפטים של reasoning בשם code'). דיוק לבד מסתיר את זה — המטריצה מראה לך אילו מחלקות מתבלבלות, כך שתדע איזה דאטה להוסיף.",
      },
      intermediate: {
        en: "From the matrix you derive per-class metrics. Precision = of everything I labeled X, how much really was X (cost of false alarms). Recall = of all real X, how much did I catch (cost of misses). F1 = their harmonic mean. Accuracy misleads on imbalanced data (99% accuracy is trivial if 99% of data is one class), which is why we report weighted/macro F1. scikit-learn's classification_report + confusion_matrix give all of this in two function calls.",
        he: "מהמטריצה גוזרים מדדים פר-מחלקה. Precision = מכל מה שתייגתי כ-X, כמה באמת היה X (מחיר אזעקות שווא). Recall = מכל ה-X האמיתי, כמה תפסתי (מחיר החמצות). F1 = הממוצע ההרמוני שלהם. דיוק מטעה בדאטה לא-מאוזן (99% דיוק טריוויאלי אם 99% מהדאטה הוא מחלקה אחת), ולכן מדווחים F1 משוקלל/מאקרו. classification_report + confusion_matrix של scikit-learn נותנים את כל זה בשתי קריאות פונקציה.",
      },
      advanced: {
        en: "Macro-F1 averages per-class F1 equally (sensitive to rare classes); micro-F1 pools TP/FP/FN globally (= accuracy in single-label); weighted-F1 weights by support. For ranked outputs use ROC-AUC (threshold-independent, but optimistic under heavy imbalance) vs PR-AUC (better for rare positives). Calibration (ECE, reliability diagrams) matters when you act on the probabilities, not just the argmax — directly relevant to a router with abstention thresholds. Always evaluate on a held-out set with the same preprocessing, and watch for label leakage.",
        he: "Macro-F1 ממצע F1 פר-מחלקה באופן שווה (רגיש למחלקות נדירות); micro-F1 מאגד TP/FP/FN גלובלית (= דיוק בתיוג-יחיד); weighted-F1 משקלל לפי support. לפלטים מדורגים השתמש ב-ROC-AUC (בלתי-תלוי-סף, אך אופטימי תחת חוסר-איזון כבד) מול PR-AUC (טוב יותר לחיוביים נדירים). כיול (ECE, דיאגרמות מהימנות) חשוב כשפועלים לפי ההסתברויות, לא רק ה-argmax — רלוונטי ישירות לראוטר עם ספי הימנעות. תמיד הערך על סט מוחזק עם אותו עיבוד מקדים, והיזהר מדליפת תוויות.",
      },
    },
  },

  sentiment: {
    title: { en: "Sentiment analysis", he: "ניתוח סנטימנט" },
    levels: {
      beginner: {
        en: "Sentiment analysis means teaching a model to read the FEELING behind text — is this review happy, angry, or just neutral? It's the same kind of task as the router (text in, one label out), which is why we can reuse the exact same training machine. Swap the dataset, keep the engine.",
        he: "ניתוח סנטימנט פירושו ללמד מודל לקרוא את הרגש שמאחורי הטקסט — האם הביקורת הזו מרוצה, כועסת, או סתם ניטרלית? זו אותה משפחת משימה כמו הראוטר (טקסט נכנס, תווית אחת יוצאת), ולכן אפשר לעשות שימוש חוזר באותה מכונת אימון בדיוק. החלף את הדאטה, שמור על המנוע.",
      },
      intermediate: {
        en: "It's single-label text classification over {positive, negative, neutral}. Real pipelines act on the label — escalate angry tickets to a human, auto-thank happy ones. The hard part isn't the model, it's the data: sarcasm, mixed sentiment, and domain words ('sick' = good in slang) are where accuracy goes to die, so per-class recall matters more than headline accuracy.",
        he: "זהו סיווג טקסט בתווית-יחידה מעל {חיובי, שלילי, ניטרלי}. צינורות אמיתיים פועלים לפי התווית — מסלולים פניות כועסות לאדם, מודים אוטומטית למרוצות. החלק הקשה אינו המודל אלא הדאטה: סרקזם, סנטימנט מעורב, ומילים תלויות-תחום הם המקום שבו הדיוק נשבר, ולכן ריקול פר-מחלקה חשוב יותר מדיוק כללי.",
      },
      advanced: {
        en: "Beyond 3-way polarity: fine-grained (1–5 stars), aspect-based sentiment (the food was great but the service was slow → +food, −service), and emotion classification (joy/anger/fear/…). Class imbalance is the norm (most text is neutral), so weight the loss or report macro-F1, not accuracy. For deployment, calibrate the probabilities and set an abstention threshold so low-confidence cases get a human — exactly the action-routing pattern the labels here encode.",
        he: "מעבר לקוטביות תלת-כיוונית: דירוג עדין (1–5 כוכבים), סנטימנט מבוסס-היבט (האוכל היה מצוין אבל השירות איטי → +אוכל, −שירות), וסיווג רגשות. חוסר-איזון מחלקות הוא הנורמה (רוב הטקסט ניטרלי), אז שקלל את ה-loss או דווח macro-F1, לא דיוק. לפריסה, כייל את ההסתברויות וקבע סף הימנעות כך שמקרים בביטחון נמוך יעברו לאדם — בדיוק תבנית ניתוב-הפעולה שהתוויות כאן מקודדות.",
      },
    },
  },

  export: {
    title: { en: "Exporting & sharing a model", he: "ייצוא ושיתוף מודל" },
    levels: {
      beginner: {
        en: "A trained model is just a folder of files: the learned weights, the tokenizer, and a small config that says what the labels are. 'Exporting' means taking that folder with you — either as a .zip you download, or by uploading it to Hugging Face, the public library where people share models. Once it's there, anyone (including future you) can load it by name and use it.",
        he: "מודל מאומן הוא בסך הכל תיקיית קבצים: המשקלים שנלמדו, הטוקנייזר, וקונפיג קטן שאומר מה התוויות. 'ייצוא' פירושו לקחת את התיקייה הזו איתך — או כקובץ .zip שמורידים, או בהעלאה ל-Hugging Face, הספרייה הציבורית שבה אנשים משתפים מודלים. ברגע שהוא שם, כל אחד (כולל אתה בעתיד) יכול לטעון אותו בשם ולהשתמש בו.",
      },
      intermediate: {
        en: "The folder contains safetensors weights, tokenizer files, and config.json with id2label/label2id so the model is fully self-describing — from_pretrained(path) reloads it exactly. Pushing to the Hub (huggingface_hub.upload_folder) versions it with git-LFS and gives you a model page, an inference widget, and a stable id others can depend on. Keep the repo private until you're happy with the evals.",
        he: "התיקייה מכילה משקלי safetensors, קבצי טוקנייזר, ו-config.json עם id2label/label2id כך שהמודל מתאר את עצמו במלואו — from_pretrained(path) טוען אותו בדיוק. דחיפה ל-Hub (huggingface_hub.upload_folder) מנהלת גרסאות עם git-LFS ונותנת לך עמוד מודל, ווידג'ט הסקה, ומזהה יציב שאחרים יכולים להסתמך עליו. שמור את המאגר פרטי עד שאתה מרוצה מההערכות.",
      },
      advanced: {
        en: "Ship a model card (intended use, training data, eval numbers, limitations) alongside the weights — it's the difference between an artifact and a reusable model. For adapter-based fine-tuning you'd push only the LoRA delta (a few MB) rather than the full backbone, and merge at load time. Mind the token scope: a write token is enough to create/overwrite repos under your namespace, so treat it like a password and never bake it into client code — here it's sent once to the backend for a single upload call and never persisted.",
        he: "צרף כרטיס מודל (שימוש מיועד, דאטה אימון, מספרי הערכה, מגבלות) לצד המשקלים — זה ההבדל בין ארטיפקט למודל לשימוש חוזר. בכוונון מבוסס-אדפטר היית דוחף רק את דלתת ה-LoRA (כמה מגה-בייט) במקום את כל ה-backbone, וממזג בזמן טעינה. שים לב להיקף הטוקן: טוקן כתיבה מספיק כדי ליצור/לדרוס מאגרים במרחב השמות שלך, אז התייחס אליו כמו סיסמה ולעולם אל תטמיע אותו בקוד צד-לקוח — כאן הוא נשלח פעם אחת ל-backend לקריאת העלאה יחידה ואינו נשמר.",
      },
    },
  },
};
