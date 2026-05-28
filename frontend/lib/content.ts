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
};
