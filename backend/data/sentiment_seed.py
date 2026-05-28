"""
sentiment_seed.py
=================
Training data for PROJECT 02: a SENTIMENT CLASSIFIER.

Same shape as the router (text -> one label out of a fixed list), so it reuses
the EXACT training loop in training/router_trainer.py. The only thing that
changes is the data and the labels — which is the whole point of the lesson:
once you can train one classifier, you can train any classifier. Swap the
dataset, keep the machine.

WHAT IT DOES
------------
Reads a piece of text and decides how it FEELS:
  - positive   (praise, satisfaction, delight)
  - negative   (complaint, frustration, anger)
  - neutral    (factual, mixed, no strong feeling)

Sentiment is the classic real-world classification task — support tickets,
product reviews, social monitoring. We attach a downstream ACTION to each
label so it mirrors a real pipeline (route the angry ones to a human, etc.).

BILINGUAL
---------
Every example exists in English and Hebrew, trained on a multilingual base
model, so it works on Hebrew text too.
"""

LABELS = [
    {
        "id": "positive",
        "en": "Positive",
        "he": "חיובי",
        "route_to": "Thank the user · ask for a review",
        "why": "Praise, satisfaction, delight — a happy customer worth amplifying.",
    },
    {
        "id": "negative",
        "en": "Negative",
        "he": "שלילי",
        "route_to": "Escalate to a human agent fast",
        "why": "Complaints, frustration, anger — needs a real person, quickly.",
    },
    {
        "id": "neutral",
        "en": "Neutral",
        "he": "ניטרלי",
        "route_to": "Auto-reply · no escalation",
        "why": "Factual, mixed, or no strong feeling — routine handling is fine.",
    },
]

LABEL_IDS = [l["id"] for l in LABELS]

SEED_ROWS = [
    # ---- positive ----
    ("Absolutely love this product, it exceeded my expectations!", "positive"),
    ("Fantastic support — they solved my problem in minutes.", "positive"),
    ("Best purchase I've made all year, highly recommend.", "positive"),
    ("The new update is smooth and fast, great job team.", "positive"),
    ("Thank you so much, you made my day!", "positive"),
    ("מוצר מדהים, עלה על כל הציפיות שלי!", "positive"),
    ("שירות מעולה — פתרו לי את הבעיה תוך דקות.", "positive"),
    ("הקנייה הכי טובה שעשיתי השנה, ממליץ בחום.", "positive"),
    ("העדכון החדש חלק ומהיר, כל הכבוד.", "positive"),
    ("תודה רבה, עשיתם לי את היום!", "positive"),
    ("Incredible quality and it arrived a day early — so happy.", "positive"),
    ("The team went above and beyond, I'm genuinely impressed.", "positive"),
    ("Five stars, would buy again in a heartbeat.", "positive"),
    ("This made my workflow so much easier, thank you!", "positive"),
    ("איכות מדהימה והגיע יום לפני הזמן — מאושר.", "positive"),
    ("הצוות עשה מעל ומעבר, ממש התרשמתי.", "positive"),
    ("חמישה כוכבים, אקנה שוב בלי לחשוב פעמיים.", "positive"),
    ("זה הפך לי את העבודה להרבה יותר קלה, תודה!", "positive"),

    # ---- negative ----
    ("This is the worst experience I've ever had, totally useless.", "negative"),
    ("It broke after two days and nobody will help me.", "negative"),
    ("I'm extremely frustrated, I want a refund now.", "negative"),
    ("Terrible service, I waited an hour and got cut off.", "negative"),
    ("The app keeps crashing and it's driving me crazy.", "negative"),
    ("החוויה הכי גרועה שהייתה לי, חסר תועלת לחלוטין.", "negative"),
    ("זה נשבר אחרי יומיים ואף אחד לא מוכן לעזור לי.", "negative"),
    ("אני מתוסכל בטירוף, אני רוצה החזר כספי עכשיו.", "negative"),
    ("שירות נוראי, חיכיתי שעה והשיחה נותקה.", "negative"),
    ("האפליקציה כל הזמן קורסת וזה משגע אותי.", "negative"),
    ("Completely disappointed, it stopped working in a week.", "negative"),
    ("Awful quality and the support just ignored me.", "negative"),
    ("I regret buying this, total waste of money.", "negative"),
    ("Slow, buggy, and overpriced — avoid it.", "negative"),
    ("מאוכזב לחלוטין, זה הפסיק לעבוד תוך שבוע.", "negative"),
    ("איכות גרועה והתמיכה פשוט התעלמה ממני.", "negative"),
    ("אני מתחרט שקניתי את זה, בזבוז כסף מוחלט.", "negative"),
    ("איטי, מלא באגים ויקר מדי — תתרחקו.", "negative"),

    # ---- neutral ----
    ("The package arrived on Tuesday as scheduled.", "neutral"),
    ("It works, though the color is different from the photo.", "neutral"),
    ("I have a question about the return policy.", "neutral"),
    ("The meeting is moved to 3pm tomorrow.", "neutral"),
    ("It's fine — does what it says, nothing special.", "neutral"),
    ("החבילה הגיעה ביום שלישי כמתוכנן.", "neutral"),
    ("זה עובד, אבל הצבע שונה מהתמונה.", "neutral"),
    ("יש לי שאלה לגבי מדיניות ההחזרות.", "neutral"),
    ("הפגישה הוזזה למחר בשלוש.", "neutral"),
    ("זה בסדר — עושה את מה שכתוב, שום דבר מיוחד.", "neutral"),
    ("The order number is 48213, shipped from the Tel Aviv warehouse.", "neutral"),
    ("Can you confirm whether this comes in size medium?", "neutral"),
    ("It's okay. Not bad, not great, just average.", "neutral"),
    ("Please update my email address on the account.", "neutral"),
    ("מספר ההזמנה הוא 48213, נשלח ממחסן תל אביב.", "neutral"),
    ("אפשר לאשר אם זה מגיע במידה M?", "neutral"),
    ("זה בסדר. לא רע, לא מצוין, ממוצע.", "neutral"),
    ("אנא עדכנו את כתובת המייל בחשבון שלי.", "neutral"),

    # ---- extra variety (intensifiers, slang, mixed cases) ----
    ("Honestly the worst, it broke immediately — never again.", "negative"),
    ("Such a disappointment, do not waste your money.", "negative"),
    ("Garbage product, returning it tomorrow.", "negative"),
    ("הכי גרוע, נשבר מיד — לא שוב.", "negative"),
    ("אכזבה ענקית, אל תבזבזו את הכסף.", "negative"),
    ("מוצר זבל, מחזיר אותו מחר.", "negative"),

    ("Amazing, works perfectly and looks beautiful.", "positive"),
    ("I'm thrilled — exactly what I hoped for.", "positive"),
    ("Superb experience from start to finish.", "positive"),
    ("מדהים, עובד מושלם ונראה יפהפה.", "positive"),
    ("אני בעננים — בדיוק מה שקיוויתי לו.", "positive"),
    ("חוויה משובחת מההתחלה ועד הסוף.", "positive"),

    ("The invoice is attached, payment is due in 30 days.", "neutral"),
    ("What are the store hours on Saturday?", "neutral"),
    ("It does the job; nothing more to say.", "neutral"),
    ("החשבונית מצורפת, התשלום תוך 30 יום.", "neutral"),
    ("מה שעות הפעילות בשבת?", "neutral"),
    ("עושה את העבודה; אין מה להוסיף.", "neutral"),
]


def get_seed():
    """Labels + rows, same contract as the router seed so the UI and trainer
    treat every classification task identically."""
    return {"labels": LABELS, "rows": [{"text": t, "label": l} for t, l in SEED_ROWS]}
