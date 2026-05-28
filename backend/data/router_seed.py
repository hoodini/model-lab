"""
router_seed.py
==============
The *training data* for our first model: a PROMPT ROUTER.

WHAT IS A ROUTER?
-----------------
Imagine you have several different LLMs available, each good at something:
  - a coding model        (expensive, great at code)
  - a small fast model    (cheap, great for simple chat)
  - a reasoning model     (slow, great at math / logic / multi-step)
  - a creative model      (great at stories, marketing, poetry)

A "router" is a tiny model whose ONLY job is to read the user's prompt and
decide *which* of those models should answer. It does NOT answer the prompt
itself — it just picks a lane. That makes it a CLASSIFICATION problem:
    input  = a piece of text (the prompt)
    output = one label out of a fixed list (which lane)

This is the easiest kind of model to train, which is exactly why it's our
first project. We don't need the model to *generate* anything — we only need
it to choose 1 of 4 buckets.

WHY BILINGUAL?
--------------
Every example below exists in both English and Hebrew so the trained router
works on Hebrew prompts too. We use a *multilingual* base model so Hebrew
text is understood, not mangled.
"""

# ── The set of "lanes" the router can choose from ────────────────────────────
# Order matters: the model internally uses the *index* (0,1,2,3) as the label,
# and we map back to these names. id2label / label2id are built from this.
LABELS = [
    {
        "id": "code",
        "en": "Code",
        "he": "קוד",
        "route_to": "Coding specialist (e.g. a strong code model)",
        "why": "Programming, debugging, code review — needs a code-tuned model.",
    },
    {
        "id": "simple_chat",
        "en": "Simple chat",
        "he": "שיחה פשוטה",
        "route_to": "Small fast model (cheapest tier)",
        "why": "Greetings, small talk, trivial questions — don't waste a big model.",
    },
    {
        "id": "reasoning",
        "en": "Reasoning / math",
        "he": "היגיון / מתמטיקה",
        "route_to": "Reasoning model (slow, powerful)",
        "why": "Math, logic, multi-step planning — needs deliberate reasoning.",
    },
    {
        "id": "creative",
        "en": "Creative writing",
        "he": "כתיבה יצירתית",
        "route_to": "Creative model",
        "why": "Stories, marketing copy, poetry — needs a fluent, expressive model.",
    },
]

LABEL_IDS = [l["id"] for l in LABELS]

# ── The labeled examples (the actual "supervision") ──────────────────────────
# Each row is (text, label_id). The model learns the mapping text -> label by
# seeing many of these. The more varied and clean these are, the better the
# router generalizes. This is the part YOU curate — and curation quality is
# ~80% of real-world model performance.
SEED_ROWS = [
    # ---- code ----
    ("Write a Python function that reverses a linked list", "code"),
    ("Why does my React useEffect run twice in development?", "code"),
    ("Refactor this SQL query to avoid a full table scan", "code"),
    ("How do I fix a segmentation fault in my C program?", "code"),
    ("Add type hints to this function and explain mypy errors", "code"),
    ("כתוב פונקציה בפייתון שממיינת רשימה של מילונים לפי מפתח", "code"),
    ("למה ה-useEffect שלי ב-React רץ פעמיים בפיתוח?", "code"),
    ("תכתוב לי דוקר-קומפוז שמרים פוסטגרס ואפליקציית נוד", "code"),
    ("איך מתקנים שגיאת null pointer בג'אווה?", "code"),
    ("תעשה ריפקטור לקוד הזה כדי שלא יהיו לולאות מקוננות", "code"),

    # ---- simple_chat ----
    ("hey, how are you today?", "simple_chat"),
    ("what's the weather like?", "simple_chat"),
    ("thanks, that's all I needed", "simple_chat"),
    ("good morning!", "simple_chat"),
    ("can you say that again?", "simple_chat"),
    ("היי, מה נשמע?", "simple_chat"),
    ("בוקר טוב!", "simple_chat"),
    ("תודה רבה, זה הכל", "simple_chat"),
    ("מה השעה?", "simple_chat"),
    ("אפשר שתחזור על זה?", "simple_chat"),

    # ---- reasoning ----
    ("If a train leaves at 3pm going 60mph and another at 4pm going 80mph, when do they meet?", "reasoning"),
    ("Prove that the square root of 2 is irrational", "reasoning"),
    ("Plan the optimal order to visit 5 cities to minimize travel time", "reasoning"),
    ("A bat and ball cost $1.10 together, the bat costs $1 more than the ball — how much is the ball?", "reasoning"),
    ("Derive the formula for the sum of the first n integers", "reasoning"),
    ("אם 3 פועלים בונים קיר ב-6 ימים, כמה ימים ייקח ל-2 פועלים?", "reasoning"),
    ("הוכח שאין מספר ראשוני גדול ביותר", "reasoning"),
    ("תכנן את הדרך הקצרה ביותר לעבור בין 4 ערים", "reasoning"),
    ("מה הסיכוי להוציא שני מלכים ברצף מחפיסת קלפים?", "reasoning"),
    ("פתור את מערכת המשוואות: 2x+y=10, x-y=2", "reasoning"),

    # ---- creative ----
    ("Write a short poem about the sea at night", "creative"),
    ("Give me a catchy slogan for a coffee brand", "creative"),
    ("Write the opening paragraph of a fantasy novel", "creative"),
    ("Brainstorm names for a friendly robot character", "creative"),
    ("Write a birthday message that rhymes", "creative"),
    ("כתוב שיר קצר על הים בלילה", "creative"),
    ("תן לי סלוגן קליט למותג קפה", "creative"),
    ("כתוב את פסקת הפתיחה לרומן פנטזיה", "creative"),
    ("תחשוב על שמות לדמות של רובוט חברותי", "creative"),
    ("כתוב ברכת יום הולדת מחורזת", "creative"),
]


def get_seed():
    """Return labels + rows. The backend serves these to the website so the
    user can SEE and EDIT the data before training — data literacy first."""
    return {"labels": LABELS, "rows": [{"text": t, "label": l} for t, l in SEED_ROWS]}
