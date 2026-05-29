// AUTO-GENERATED curriculum data (deep-learning foundations). Authored + verified
// via the dl-foundations workflow; shape matches LessonData in ./academy.
import type { LessonData } from "./academy";

export const DL_LESSONS: LessonData[] = [
  {
    "id": "dl-learn",
    "tone": "act",
    "eyebrowEn": "THE ACADEMY · DEEP LEARNING",
    "eyebrowHe": "האקדמיה · למידה עמוקה",
    "titleEn": "How a neural network learns",
    "titleHe": "איך רשת נוירונים לומדת",
    "introEn": "This is the engine under everything. A network starts out with random numbers and is wrong about almost everything; then, one small step at a time, it adjusts itself to be a little less wrong. Repeat that loop millions of times and you get a model that works.",
    "introHe": "זה המנוע שמתחת לכל מה שאתם מכירים. רשת מתחילה עם מספרים אקראיים וטועה כמעט בכל דבר, ואז, צעד קטן אחרי צעד קטן, היא מכווננת את עצמה כדי לטעות קצת פחות. חוזרים על הלולאה הזו מיליוני פעמים ומקבלים מודל שעובד.",
    "blocks": [
      {
        "k": "neuron",
        "tagEn": "THE UNIT",
        "tagHe": "היחידה",
        "titleEn": "The neuron",
        "titleHe": "הנוירון",
        "body": {
          "beginner": {
            "en": "A neuron is like a tiny voting machine: it listens to several inputs, decides how much each one matters, adds up the votes, and then makes one simple decision about how strongly to fire.",
            "he": "נוירון הוא כמו מכונת הצבעה זעירה: הוא מקשיב לכמה קלטים, מחליט כמה כל אחד מהם חשוב, מסכם את הקולות, ואז מקבל החלטה פשוטה אחת עד כמה לפעול."
          },
          "intermediate": {
            "en": "A single artificial neuron computes a weighted sum of its inputs plus a bias, z = w·x + b, then passes z through a nonlinear activation function a = f(z) to produce its output.",
            "he": "נוירון מלאכותי בודד מחשב סכום משוקלל של הקלטים שלו ועוד הטיה, z = w·x + b, ואז מעביר את z דרך פונקציית אקטיבציה לא-לינארית a = f(z) כדי לייצר את הפלט שלו."
          },
          "advanced": {
            "en": "This is the McCulloch-Pitts/perceptron lineage: the dot product w·x is a linear projection and f introduces the nonlinearity that lets stacked neurons approximate arbitrary functions (universal approximation); the bias b is what shifts the decision boundary off the origin.",
            "he": "זוהי השושלת של McCulloch-Pitts והפרספטרון: המכפלה הסקלרית w·x היא היטל לינארי, ו-f מכניסה את האי-לינאריות שמאפשרת לנוירונים מוערמים לקרב פונקציות שרירותיות (universal approximation); ה-bias b הוא מה שמזיז את גבול ההחלטה אל מחוץ לראשית."
          }
        }
      },
      {
        "k": "weights",
        "tagEn": "THE EQUATION",
        "tagHe": "המשוואה",
        "titleEn": "Weights, bias and parameters",
        "titleHe": "משקלים, הטיה ופרמטרים",
        "body": {
          "beginner": {
            "en": "Each input gets a knob called a weight that says how loud it should be, and there's one extra knob, the bias, that nudges the whole answer up or down. Learning just means turning all these knobs to the right settings.",
            "he": "לכל קלט יש כפתור שנקרא משקל, שקובע כמה חזק הוא יישמע, ויש כפתור נוסף, ה-bias, שמזיז את כל התשובה למעלה או למטה. ללמוד זה פשוט לסובב את כל הכפתורים האלה למצב הנכון."
          },
          "intermediate": {
            "en": "The core equation is y = w·x + b: the weights w scale each input, the bias b shifts the result, and together all the weights and biases across the network are the parameters the model learns.",
            "he": "המשוואה המרכזית היא y = w·x + b: המשקלים w מכפילים כל קלט, ה-bias b מזיז את התוצאה, וביחד כל המשקלים וה-biases ברשת הם הפרמטרים שהמודל לומד."
          },
          "advanced": {
            "en": "In practice w·x is a matrix multiply Wx for a whole layer, so a layer's parameters are a weight matrix W plus a bias vector b; parameter count is what people mean by a model's size (e.g. 7B = seven billion learnable scalars), and initialization schemes like He/Xavier set their starting values to keep activation variance stable.",
            "he": "בפועל w·x הוא כפל מטריצות Wx עבור שכבה שלמה, כך שהפרמטרים של שכבה הם מטריצת משקלים W ועוד וקטור הטיה b; מספר הפרמטרים הוא מה שמתכוונים אליו כשמדברים על גודל מודל (למשל 7B = שבעה מיליארד סקלרים נלמדים), ושיטות אתחול כמו He/Xavier קובעות את ערכי ההתחלה כדי לשמור על שונות יציבה של האקטיבציות."
          }
        }
      },
      {
        "k": "activation",
        "tagEn": "NONLINEARITY",
        "tagHe": "אי-לינאריות",
        "titleEn": "Activation functions",
        "titleHe": "פונקציות אקטיבציה",
        "body": {
          "beginner": {
            "en": "After a neuron adds up its inputs, it passes the result through a little gate that can bend or block the signal. Without that bend, stacking many layers would be no smarter than a single straight line.",
            "he": "אחרי שנוירון מסכם את הקלטים שלו, הוא מעביר את התוצאה דרך שער קטן שיכול לכופף או לחסום את האות. בלי הכיפוף הזה, הערמה של הרבה שכבות לא תהיה חכמה יותר מקו ישר אחד."
          },
          "intermediate": {
            "en": "Activations add nonlinearity: ReLU(z) = max(0, z) zeros out negatives, sigmoid squashes to (0,1), tanh to (-1,1), and softmax turns a vector of scores into probabilities that sum to 1. Without a nonlinear f, a stack of linear layers collapses into a single linear layer.",
            "he": "אקטיבציות מוסיפות אי-לינאריות: הפונקציה ReLU(z) = max(0, z) מאפסת ערכים שליליים, sigmoid דוחסת לטווח (0,1), tanh לטווח (-1,1), ו-softmax הופכת וקטור של ציונים להסתברויות שמסתכמות ל-1. בלי f לא-לינארית, ערימה של שכבות לינאריות מתכווצת לשכבה לינארית אחת."
          },
          "advanced": {
            "en": "Choice matters: sigmoid/tanh saturate and cause vanishing gradients in deep nets, which is why ReLU and variants (Leaky ReLU, GELU, SiLU) dominate hidden layers; softmax = exp(z_i)/Σexp(z_j) is the standard output for multiclass classification and pairs naturally with cross-entropy loss.",
            "he": "הבחירה משנה: sigmoid/tanh נכנסות לרוויה וגורמות ל-vanishing gradients ברשתות עמוקות, ולכן ReLU והווריאנטים שלה (Leaky ReLU, GELU, SiLU) שולטים בשכבות הנסתרות; softmax = exp(z_i)/Σexp(z_j) הוא הפלט הסטנדרטי לסיווג רב-מחלקתי, ומשתלב באופן טבעי עם cross-entropy loss."
          }
        }
      },
      {
        "k": "forward",
        "tagEn": "FORWARD PASS",
        "tagHe": "מעבר קדימה",
        "titleEn": "Layers, depth and the forward pass",
        "titleHe": "שכבות, עומק והמעבר קדימה",
        "body": {
          "beginner": {
            "en": "Neurons are stacked into layers, and the data flows through them like water down a series of steps: input at the top, a few hidden layers in the middle, and the answer at the bottom. Each step reshapes the information a little.",
            "he": "נוירונים מוערמים לשכבות, והנתונים זורמים דרכן כמו מים שיורדים על סדרת מדרגות: קלט למעלה, כמה שכבות נסתרות באמצע, והתשובה למטה. כל מדרגה מעצבת מחדש את המידע מעט."
          },
          "intermediate": {
            "en": "The forward pass runs data input → hidden → output, where each layer computes a = f(Wx + b) and feeds its output as the next layer's input. Depth (more hidden layers) lets the network compose simple features into increasingly abstract ones.",
            "he": "המעבר קדימה (forward pass) מריץ את הנתונים בכיוון קלט ← נסתר ← פלט, כאשר כל שכבה מחשבת a = f(Wx + b) ומזינה את הפלט שלה כקלט לשכבה הבאה. עומק (יותר שכבות נסתרות) מאפשר לרשת להרכיב מאפיינים פשוטים למאפיינים מופשטים יותר ויותר."
          },
          "advanced": {
            "en": "Composition a^(L) = f(W^(L) … f(W^(1)x + b^(1)) … + b^(L)) is what gives deep nets their representational power, but naive depth brings vanishing/exploding gradients, addressed by residual connections, normalization (BatchNorm/LayerNorm) and careful initialization; the forward pass also caches intermediate activations because backprop needs them.",
            "he": "ההרכבה a^(L) = f(W^(L) … f(W^(1)x + b^(1)) … + b^(L)) היא מה שמעניק לרשתות עמוקות את כוח הייצוג שלהן, אבל עומק נאיבי מביא vanishing/exploding gradients, שמטופלים באמצעות residual connections, נורמליזציה (BatchNorm/LayerNorm) ואתחול זהיר; המעבר קדימה גם שומר במטמון את אקטיבציות הביניים כי ה-backprop זקוק להן."
          }
        }
      },
      {
        "k": "loss",
        "tagEn": "THE LOSS",
        "tagHe": "פונקציית ההפסד",
        "titleEn": "The loss function",
        "titleHe": "פונקציית ההפסד",
        "body": {
          "beginner": {
            "en": "After the network guesses, we need a single score for how wrong it was, like a golf score where lower is better. The entire goal of training is to push that one number down.",
            "he": "אחרי שהרשת מנחשת, אנחנו צריכים ציון אחד לכמה היא טעתה, כמו ציון בגולף שבו נמוך יותר זה טוב יותר. כל המטרה של האימון היא להוריד את המספר היחיד הזה."
          },
          "intermediate": {
            "en": "The loss (cost) function maps prediction ŷ and target y to one number measuring error: mean squared error MSE = (1/n)Σ(y − ŷ)² for regression, and cross-entropy = −Σ y·log(ŷ) for classification. Training is the search for parameters that minimize this loss.",
            "he": "פונקציית ההפסד (loss/cost) ממפה את התחזית ŷ ואת היעד y למספר אחד שמודד שגיאה: עבור רגרסיה משתמשים בשגיאה ריבועית ממוצעת MSE = (1/n)Σ(y − ŷ)², ועבור סיווג ב-cross-entropy = −Σ y·log(ŷ). אימון הוא החיפוש אחר פרמטרים שממזערים את ה-loss הזה."
          },
          "advanced": {
            "en": "Cross-entropy is the negative log-likelihood under the model's predicted distribution, which is why it pairs with softmax (and reduces to −log(ŷ_correct) for a one-hot target); the choice of loss encodes your assumptions (MSE ⇔ Gaussian noise, cross-entropy ⇔ categorical), and regularization terms like L2 (weight decay) are added to the loss to penalize complexity.",
            "he": "cross-entropy היא ה-negative log-likelihood תחת ההתפלגות שהמודל חוזה, ולכן היא משתלבת עם softmax (ומצטמצמת ל-−log(ŷ_correct) עבור יעד one-hot); בחירת ה-loss מקודדת את ההנחות שלכם (MSE ⇔ רעש גאוסיאני, cross-entropy ⇔ התפלגות קטגוריאלית), ואיברי רגולריזציה כמו L2 (weight decay) מתווספים ל-loss כדי לקנוס מורכבות."
          }
        }
      },
      {
        "k": "gradient",
        "tagEn": "LEARNING",
        "tagHe": "הלמידה",
        "titleEn": "Gradient descent & backpropagation",
        "titleHe": "Gradient descent ו-backpropagation",
        "body": {
          "beginner": {
            "en": "Imagine standing on a foggy hill and wanting to reach the bottom: you feel which way is downhill and take a small step that way, over and over. The network does the same with its error, nudging every knob in the direction that lowers it.",
            "he": "דמיינו שאתם עומדים על גבעה מעורפלת ורוצים להגיע לתחתית: אתם מרגישים לאיזה כיוון יורדים ולוקחים צעד קטן לשם, שוב ושוב. הרשת עושה את אותו הדבר עם השגיאה שלה, ומזיזה כל כפתור לכיוון שמקטין אותה."
          },
          "intermediate": {
            "en": "Gradient descent computes the gradient of the loss with respect to each weight, ∂L/∂w, and updates it downhill: w ← w − lr·∂L/∂w. Backpropagation is how those gradients are computed efficiently — the chain rule applied backward layer by layer.",
            "he": "gradient descent מחשב את הגרדיאנט של ה-loss ביחס לכל משקל, ∂L/∂w, ומעדכן אותו במורד המדרון: w ← w − lr·∂L/∂w. ה-backpropagation הוא הדרך שבה הגרדיאנטים האלה מחושבים ביעילות — כלל השרשרת (chain rule) שמיושם לאחור שכבה אחר שכבה."
          },
          "advanced": {
            "en": "Backprop is reverse-mode automatic differentiation: one forward pass caches activations, one backward pass propagates ∂L/∂a and accumulates ∂L/∂W in O(network size); in practice optimizers like SGD-with-momentum, RMSProp and Adam adapt the raw gradient (per-parameter learning rates, momentum) rather than using it verbatim, and gradients are estimated on mini-batches.",
            "he": "backprop הוא reverse-mode automatic differentiation: מעבר קדימה אחד שומר במטמון אקטיבציות, מעבר אחורה אחד מפיץ את ∂L/∂a וצובר את ∂L/∂W בסיבוכיות של O(גודל הרשת); בפועל אופטימייזרים כמו SGD-with-momentum, RMSProp ו-Adam מתאימים את הגרדיאנט הגולמי (learning rate פר-פרמטר, momentum) במקום להשתמש בו כמות שהוא, והגרדיאנטים מוערכים על mini-batches."
          }
        }
      },
      {
        "k": "lr",
        "tagEn": "STEP SIZE",
        "tagHe": "גודל הצעד",
        "titleEn": "The learning rate",
        "titleHe": "Learning rate",
        "body": {
          "beginner": {
            "en": "The learning rate is how big a step you take downhill each time. Leap too far and you overshoot and stumble around; tiptoe too cautiously and you'll take forever to get down.",
            "he": "ה-learning rate הוא כמה גדול הצעד שאתם לוקחים במורד בכל פעם. תקפצו רחוק מדי ותחמיצו את היעד ותתנדנדו סביבו; תפסעו בזהירות מוגזמת וייקח לכם נצח להגיע למטה."
          },
          "intermediate": {
            "en": "The learning rate (lr) is the step-size multiplier in w ← w − lr·∂L/∂w. Too large and the loss diverges or oscillates; too small and training converges painfully slowly — it's usually the single most important hyperparameter to tune.",
            "he": "ה-learning rate (lr) הוא מקדם גודל-הצעד במשוואה w ← w − lr·∂L/∂w. גדול מדי וה-loss מתבדר או מתנדנד; קטן מדי והאימון מתכנס באיטיות מייסרת — זהו בדרך כלל ה-hyperparameter היחיד והחשוב ביותר לכוונן."
          },
          "advanced": {
            "en": "In practice you rarely use a fixed lr: schedules (warmup, cosine decay, step decay) and adaptive optimizers (Adam) modulate it over training, and the largest stable lr scales with batch size; too-high rates can also be a feature, enabling the loss landscape exploration behind techniques like one-cycle and learning-rate range tests.",
            "he": "בפועל כמעט אף פעם לא משתמשים ב-lr קבוע: schedules (warmup, cosine decay, step decay) ואופטימייזרים אדפטיביים (Adam) מאפננים אותו לאורך האימון, וה-lr היציב המקסימלי גדל עם גודל ה-batch; קצב גבוה מדי יכול גם להיות יתרון, שכן הוא מאפשר את חקירת מרחב ה-loss שמאחורי טכניקות כמו one-cycle ו-learning-rate range tests."
          }
        }
      },
      {
        "k": "loop",
        "tagEn": "THE LOOP",
        "tagHe": "הלולאה",
        "titleEn": "Epochs, batches and the full loop",
        "titleHe": "Epochs, batches והלולאה המלאה",
        "body": {
          "beginner": {
            "en": "Training is just this cycle repeated again and again: guess, measure how wrong, figure out the fix, adjust the knobs. Go through all your examples once and that's one round; do it many rounds and the network slowly gets good.",
            "he": "אימון הוא פשוט המחזור הזה שחוזר שוב ושוב: לנחש, למדוד כמה טעית, להבין את התיקון, לכוונן את הכפתורים. עוברים על כל הדוגמאות פעם אחת וזהו סבב אחד; עושים הרבה סבבים והרשת לאט לאט נעשית טובה."
          },
          "intermediate": {
            "en": "The training loop repeats forward pass → loss → backward pass → update over the data. One epoch = one full pass through the training set, and instead of all data at once we use mini-batches (e.g. 32–256 examples) per update for speed and more stable gradient estimates.",
            "he": "לולאת האימון חוזרת על forward pass ← loss ← backward pass ← update על הנתונים. epoch אחד = מעבר מלא אחד על סט האימון, ובמקום כל הנתונים בבת אחת אנחנו משתמשים ב-mini-batches (למשל 32–256 דוגמאות) לכל update, לשם מהירות והערכת גרדיאנט יציבה יותר."
          },
          "advanced": {
            "en": "Mini-batch SGD trades the noiseless-but-expensive full-batch gradient against the noisy-but-cheap single-sample one; batch size interacts with lr, generalization and hardware throughput, and you watch train vs. validation loss across epochs to catch overfitting and trigger early stopping. That descending train-loss-per-epoch is exactly the loss curve plotted in the lab.",
            "he": "mini-batch SGD מאזן בין הגרדיאנט המלא חסר-הרעש אך היקר לבין גרדיאנט מבוסס דגימה בודדת רועש אך זול; גודל ה-batch משפיע על ה-lr, על ההכללה ועל תפוקת החומרה, ועוקבים אחרי train loss מול validation loss לאורך ה-epochs כדי לתפוס overfitting ולהפעיל early stopping. אותו train loss שיורד בכל epoch הוא בדיוק עקומת ה-loss שמשורטטת במעבדה."
          }
        }
      }
    ]
  },
  {
    "id": "dl-data",
    "tone": "content",
    "eyebrowEn": "THE ACADEMY · DATA & TENSORS",
    "eyebrowHe": "האקדמיה · דאטה וטנזורים",
    "titleEn": "Turning the world into numbers",
    "titleHe": "להפוך את העולם למספרים",
    "introEn": "A model never sees words, pictures, or categories — it only ever eats numbers arranged in precise shapes. Getting those shapes right, and scaling and splitting the data sensibly, is most of the real work; the model is the easy part.",
    "introHe": "מודל לעולם לא רואה מילים, תמונות או קטגוריות — הוא ניזון אך ורק ממספרים שמסודרים בצורות מדויקות. לסדר את הצורות נכון, ולבצע scaling ופיצול נבונים של הדאטה, זה רוב העבודה האמיתית; המודל עצמו הוא החלק הקל.",
    "blocks": [
      {
        "k": "shapes-ladder",
        "tagEn": "THE LADDER",
        "tagHe": "סולם הצורות",
        "titleEn": "Scalars, vectors, matrices, tensors",
        "titleHe": "סקלרים, וקטורים, מטריצות, טנזורים",
        "body": {
          "beginner": {
            "en": "Think of a ladder of containers: a single number is a scalar, a row of numbers is a vector, a grid (rows and columns) is a matrix, and a stack of grids is a tensor. Each rung just adds one more direction to arrange numbers in.",
            "he": "דמיינו סולם של מכלים: מספר בודד הוא סקלר, שורה של מספרים היא וקטור, רשת של שורות ועמודות היא מטריצה, וערימה של רשתות היא טנזור. כל שלב בסולם פשוט מוסיף עוד כיוון אחד שבו אפשר לסדר מספרים."
          },
          "intermediate": {
            "en": "Formally these are arrays of rank 0, 1, 2, and n: a scalar has shape (), a vector (d,), a matrix (m, n), and a tensor any shape like (a, b, c, …). Every value flowing through a neural network — inputs, weights, activations, gradients — is a tensor of some shape.",
            "he": "פורמלית אלו מערכים מ-rank 0, 1, 2 ו-n: לסקלר יש shape של (), לוקטור (d,), למטריצה (m, n) ולטנזור כל shape כמו (a, b, c, …). כל ערך שזורם דרך רשת נוירונים — inputs, weights, activations, gradients — הוא טנזור בעל shape כלשהו."
          },
          "advanced": {
            "en": "Rank (number of axes) is distinct from dimensionality of an axis and from the geometric notion of a tensor in physics — in ML a 'tensor' is just an n-dimensional array with a dtype and device. Memory layout (contiguous strides, row-major) and broadcasting rules matter enormously for performance; a reshape is free, a transpose may force a copy.",
            "he": "Rank (מספר הצירים) שונה מ-dimensionality של ציר בודד, ושונה גם מהמושג הגיאומטרי של טנזור בפיזיקה — ב-ML 'טנזור' הוא פשוט מערך n-ממדי עם dtype ו-device. ה-memory layout (strides רציפים, row-major) וכללי ה-broadcasting קריטיים לביצועים; reshape הוא חינמי, אבל transpose עלול לחייב העתקה."
          }
        }
      },
      {
        "k": "matmul",
        "tagEn": "THE ENGINE",
        "tagHe": "המנוע",
        "titleEn": "Matrix multiplication: the layer's heartbeat",
        "titleHe": "כפל מטריצות: הדופק של השכבה",
        "body": {
          "beginner": {
            "en": "A layer's main job is one big multiply-and-add over all its inputs at once, and matrix multiplication is the bookkeeping that does it. The catch is that the shapes have to fit together like puzzle pieces, or nothing connects.",
            "he": "התפקיד המרכזי של שכבה הוא כפל-וחיבור גדול אחד על כל ה-inputs בבת אחת, וכפל מטריצות הוא המנגנון שמבצע את זה. התנאי הוא שה-shapes חייבים להתאים זה לזה כמו חלקי פאזל, אחרת שום דבר לא מתחבר."
          },
          "intermediate": {
            "en": "To multiply an m×k matrix by a k×n matrix the inner dimensions must match, giving an m×n result whose (i,j) entry is the dot product of row i and column j. A linear layer is exactly this: outputs = X·W + b, where X is the [batch, features] input and W maps features to the next width.",
            "he": "כדי לכפול מטריצה m×k במטריצה k×n הממדים הפנימיים חייבים להתאים, והתוצאה היא מטריצה m×n שבה האיבר (i,j) הוא ה-dot product של שורה i ועמודה j. שכבה לינארית היא בדיוק זה: outputs = X·W + b, כאשר X הוא ה-input בצורת [batch, features] ו-W ממפה את ה-features לרוחב הבא."
          },
          "advanced": {
            "en": "GEMM (general matrix multiply) dominates the FLOP budget, so frameworks fuse it with the bias add and route it to cuBLAS/Tensor Cores; cost scales as O(m·k·n). Watch the conventions — row-vector X·W versus column-vector W·x, and whether your framework stores W as [in, out] or [out, in] — a silent transpose is a classic shape bug.",
            "he": "GEMM (general matrix multiply) שולט בתקציב ה-FLOPs, ולכן frameworks עושים לו fuse עם הוספת ה-bias ומנתבים אותו ל-cuBLAS/Tensor Cores; העלות מתנהגת כ-O(m·k·n). שימו לב לקונבנציות — X·W של row-vector מול W·x של column-vector, והאם ה-framework שומר את W כ-[in, out] או [out, in] — transpose שקט הוא באג shape קלאסי."
          }
        }
      },
      {
        "k": "batches",
        "tagEn": "BATCHES & SHAPES",
        "tagHe": "באטצ'ים וצורות",
        "titleEn": "Why we feed many examples at once",
        "titleHe": "למה מזינים הרבה דוגמאות בבת אחת",
        "body": {
          "beginner": {
            "en": "Instead of showing the model one example at a time, we hand it a whole stack at once — a batch. It is like checking out a full cart of groceries together instead of one item per trip; far less overhead.",
            "he": "במקום להראות למודל דוגמה אחת בכל פעם, נותנים לו ערימה שלמה בבת אחת — batch. זה כמו לשלם על עגלת קניות מלאה בבת אחת במקום על פריט אחד בכל נסיעה; הרבה פחות overhead."
          },
          "intermediate": {
            "en": "We add a leading batch axis so a feed-forward input has shape [batch, features] and a sequence model has [batch, seq, dim]. Processing B examples turns many small matrix-vector products into one large matrix-matrix multiply, which is far more efficient.",
            "he": "מוסיפים ציר batch מוביל, כך ש-input של feed-forward הוא בצורת [batch, features] ומודל רצף הוא בצורת [batch, seq, dim]. עיבוד של B דוגמאות הופך הרבה מכפלות matrix-vector קטנות למכפלת matrix-matrix אחת גדולה, שהיא הרבה יותר יעילה."
          },
          "advanced": {
            "en": "GPUs are throughput machines: large matmuls saturate the cores and amortize kernel-launch and memory-transfer overhead, so bigger batches mean higher utilization — up to the point where you hit memory limits or the gradient noise scale flattens out. Batch size also interacts with the learning rate (linear scaling rule) and with BatchNorm statistics, so it is not a free knob.",
            "he": "GPUs הם מכונות throughput: matmuls גדולים מרווים את ה-cores ופורסים את ה-overhead של kernel-launch ושל העברת זיכרון, ולכן batch גדול יותר משמעו utilization גבוה יותר — עד לנקודה שבה נתקלים במגבלת זיכרון או ש-gradient noise scale מתיישר. גודל ה-batch גם משפיע על ה-learning rate (linear scaling rule) ועל הסטטיסטיקות של BatchNorm, ולכן הוא לא כפתור חינמי."
          }
        }
      },
      {
        "k": "vectorization",
        "tagEn": "FEATURES",
        "tagHe": "פיצ'רים",
        "titleEn": "Vectorizing the raw world",
        "titleHe": "להפוך את העולם הגולמי לוקטורים",
        "body": {
          "beginner": {
            "en": "Text, pictures, and labels are not numbers yet, so first we translate each one into a list of numbers the model can read. A photo becomes its pixel brightnesses, a word becomes a learned list of numbers that captures its meaning.",
            "he": "טקסט, תמונות ותוויות הם עדיין לא מספרים, ולכן קודם מתרגמים כל אחד מהם לרשימת מספרים שהמודל יכול לקרוא. תמונה הופכת לערכי הבהירות של הפיקסלים שלה, ומילה הופכת לרשימת מספרים נלמדת שלוכדת את המשמעות שלה."
          },
          "intermediate": {
            "en": "Feature engineering / vectorization maps raw inputs to numeric vectors: pixels are already numeric (often scaled to [0,1]), categories become indicators, and text is tokenized into subword IDs that index into an embedding table. Each token ID looks up a learned dense vector, so a sentence becomes a [seq, dim] tensor.",
            "he": "Feature engineering / vectorization ממפה inputs גולמיים לוקטורים מספריים: פיקסלים כבר מספריים (לרוב מנורמלים לטווח [0,1]), קטגוריות הופכות ל-indicators, וטקסט עובר tokenization ל-subword IDs שמשמשים כאינדקסים לתוך embedding table. כל token ID שולף וקטור צפוף נלמד, וכך משפט הופך לטנזור בצורת [seq, dim]."
          },
          "advanced": {
            "en": "This is exactly the pipeline in the router lab: the prompt is tokenized (e.g. BPE/SentencePiece), each ID indexes an embedding matrix of shape [vocab, dim], and the resulting vectors feed the routing classifier. The choice of representation is load-bearing — embeddings give a dense, learnable, similarity-aware space, whereas bag-of-words or raw IDs throw away order and semantics; embedding dimensionality and tokenizer granularity are real hyperparameters.",
            "he": "זה בדיוק ה-pipeline במעבדת ה-router: ה-prompt עובר tokenization (למשל BPE/SentencePiece), כל ID משמש אינדקס ל-embedding matrix בצורת [vocab, dim], והוקטורים המתקבלים מוזנים ל-classifier של הניתוב. בחירת הייצוג היא קריטית — embeddings נותנים מרחב צפוף, נלמד ומודע-דמיון, בעוד ש-bag-of-words או IDs גולמיים זורקים את הסדר ואת המשמעות; ה-dimensionality של ה-embedding ורמת הפירוק של ה-tokenizer הם hyperparameters אמיתיים."
          }
        }
      },
      {
        "k": "one-hot",
        "tagEn": "ENCODING",
        "tagHe": "קידוד",
        "titleEn": "One-hot: a category as a single lit bulb",
        "titleHe": "One-hot: קטגוריה כנורה בודדת שדולקת",
        "body": {
          "beginner": {
            "en": "To feed a category like 'red / green / blue', we make a row of switches — all off except the one that matches, which is on. That way the model never thinks blue is somehow 'bigger' than red just because of how we numbered them.",
            "he": "כדי להזין קטגוריה כמו 'אדום / ירוק / כחול', בונים שורה של מתגים — כולם כבויים חוץ מזה שמתאים, שדולק. כך המודל אף פעם לא חושב שכחול הוא איכשהו 'גדול' מאדום רק בגלל הצורה שבה מיספרנו אותם."
          },
          "intermediate": {
            "en": "One-hot encoding represents a category from K classes as a length-K vector of zeros with a single 1 at the active class's index. We use it instead of integer labels precisely to avoid imposing a fake ordinal relationship (3 is not 'more' than 1) that a model would wrongly exploit.",
            "he": "One-hot encoding מייצג קטגוריה מתוך K מחלקות כוקטור באורך K של אפסים, עם 1 בודד באינדקס של המחלקה הפעילה. משתמשים בזה במקום בתוויות שלמות בדיוק כדי לא לכפות קשר אורדינלי מזויף (3 הוא לא 'יותר' מ-1) שהמודל ינצל בטעות."
          },
          "advanced": {
            "en": "For high-cardinality features (user IDs, large vocabularies) one-hot is sparse, memory-heavy, and treats every class as equidistant, so you switch to a learned embedding — which is mathematically just a one-hot vector multiplied by the embedding matrix, implemented as an O(1) row lookup. Note that softmax targets and cross-entropy are typically expressed against one-hot labels, with label smoothing as a common regularizer.",
            "he": "עבור features עם high-cardinality (user IDs, אוצר מילים גדול) one-hot הוא sparse, כבד בזיכרון, ומתייחס לכל מחלקה כשוות-מרחק, ולכן עוברים ל-embedding נלמד — שהוא מתמטית פשוט וקטור one-hot כפול ה-embedding matrix, ובמימוש הוא row lookup ב-O(1). שימו לב שמטרות ה-softmax וה-cross-entropy מבוטאות לרוב מול תוויות one-hot, כאשר label smoothing הוא regularizer נפוץ."
          }
        }
      },
      {
        "k": "normalization",
        "tagEn": "SCALING",
        "tagHe": "סקיילינג",
        "titleEn": "Normalization: putting features on one scale",
        "titleHe": "נורמליזציה: להעמיד פיצ'רים על אותו קנה מידה",
        "body": {
          "beginner": {
            "en": "If one feature is measured in millions (salary) and another in single digits (years), the big one drowns out the small one. So we rescale every feature to a comparable range, like converting everyone's height and weight to the same kind of ruler.",
            "he": "אם feature אחד נמדד במיליונים (משכורת) ואחר בספרות בודדות (שנים), הגדול מבליע את הקטן. לכן מעבירים כל feature לטווח דומה, כמו להמיר את הגובה והמשקל של כולם לאותו סוג של סרגל."
          },
          "intermediate": {
            "en": "Two standard rescalings: min-max maps each feature to [0,1] via (x − min)/(max − min), and standardization (z-score) gives zero mean and unit variance via z = (x − μ)/σ. Without this, features with large magnitudes dominate the loss surface and produce elongated, ill-conditioned contours that gradient descent struggles to descend.",
            "he": "שני rescalings סטנדרטיים: min-max ממפה כל feature לטווח [0,1] באמצעות (x − min)/(max − min), ו-standardization (z-score) נותן ממוצע אפס ושונות יחידה באמצעות z = (x − μ)/σ. בלי זה, features עם ערכים גדולים שולטים במשטח ה-loss ויוצרים קווי מתאר מוארכים ובעלי ill-conditioning ש-gradient descent מתקשה לרדת בהם."
          },
          "advanced": {
            "en": "Fit the scaler's statistics (μ, σ, min, max) on the training split only and reuse them on val/test — computing them over the full dataset is data leakage. Conditioning matters because GD's effective step depends on the Hessian's curvature; standardizing decorrelates scales and lets a single learning rate work across features, while in-network LayerNorm/BatchNorm handle the analogous problem for activations between layers.",
            "he": "חשבו את הסטטיסטיקות של ה-scaler (μ, σ, min, max) על ה-split של ה-training בלבד והשתמשו בהן שוב על val/test — חישובן על כל הדאטהסט הוא data leakage. ה-conditioning חשוב כי הצעד האפקטיבי של GD תלוי בעקמומיות של ה-Hessian; standardization מבטל את הקורלציה בין הסקיילים ומאפשר ל-learning rate בודד לעבוד על פני כל ה-features, בעוד ש-LayerNorm/BatchNorm בתוך הרשת מטפלים בבעיה המקבילה עבור activations בין השכבות."
          }
        }
      },
      {
        "k": "splits",
        "tagEn": "THE SPLIT",
        "tagHe": "הפיצול",
        "titleEn": "Train / validation / test: never grade your own homework",
        "titleHe": "Train / validation / test: לא בודקים את שיעורי הבית של עצמכם",
        "body": {
          "beginner": {
            "en": "You would not test a student on the exact questions they studied — of course they'd ace it. So we hold back data the model never trained on, and only that fresh data tells us how well it really learned.",
            "he": "לא הייתם בוחנים תלמיד בדיוק על השאלות שהוא תרגל — ברור שהוא יצליח. לכן שומרים בצד דאטה שהמודל מעולם לא התאמן עליו, ורק הדאטה הטרי הזה אומר לנו כמה טוב הוא באמת למד."
          },
          "intermediate": {
            "en": "We partition data into three disjoint sets: train (fit the weights), validation (tune hyperparameters and pick checkpoints / do early stopping), and test (one honest, final estimate of generalization). The cardinal sin is data leakage — letting any information from val/test influence training, which inflates your metrics and lies to you.",
            "he": "מחלקים את הדאטה לשלוש קבוצות זרות: train (להתאים את ה-weights), validation (לכוונן hyperparameters ולבחור checkpoints / לבצע early stopping), ו-test (אומדן יחיד, כן וסופי של generalization). החטא הקרדינלי הוא data leakage — לתת לכל מידע מ-val/test להשפיע על ה-training, מה שמנפח את המדדים ומשקר לכם."
          },
          "advanced": {
            "en": "The test set must be touched once, at the very end; every peek you optimize against quietly turns it into a second validation set and erodes its honesty. Use k-fold cross-validation when data is scarce, stratify on the label for imbalance, and split by group/time (not random rows) when samples are correlated — exactly the held-out split discipline the router lab relies on to trust its reported accuracy.",
            "he": "ב-test set נוגעים פעם אחת בלבד, ממש בסוף; כל הצצה שמולה מבצעים אופטימיזציה הופכת אותו בשקט ל-validation set שני ושוחקת את הכנות שלו. השתמשו ב-k-fold cross-validation כשהדאטה מועט, בצעו stratification על התווית במקרה של חוסר איזון, ופצלו לפי group/time (ולא לפי שורות אקראיות) כשהדגימות מתואמות — בדיוק משמעת ה-held-out split שעליה נשענת מעבדת ה-router כדי לתת אמון ב-accuracy שהיא מדווחת."
          }
        }
      }
    ]
  },
  {
    "blocks": [
      {
        "k": "regression",
        "tagEn": "REGRESSION",
        "tagHe": "רגרסיה",
        "titleEn": "Predicting a number",
        "titleHe": "לנבא מספר",
        "body": {
          "beginner": {
            "en": "Sometimes the answer is a number: how much will this house sell for, what will tomorrow's temperature be. The model spits out a single number and you check how far it landed from the truth.",
            "he": "לפעמים התשובה היא מספר: בכמה יימכר הבית הזה, מה תהיה הטמפרטורה מחר. המודל פולט מספר אחד, ואתה בודק כמה הוא רחוק מהאמת."
          },
          "intermediate": {
            "en": "For regression the output layer is a single linear neuron with no activation, so the prediction can be any real number: ŷ = w·x + b. You train it with Mean Squared Error, MSE = mean((y - ŷ)^2), or MAE = mean(|y - ŷ|).",
            "he": "ברגרסיה שכבת הפלט היא נוירון לינארי בודד ללא פונקציית אקטיבציה, כך שהתחזית יכולה להיות כל מספר ממשי: ŷ = w·x + b. מאמנים עם MSE = ממוצע של (y - ŷ)^2, או MAE = ממוצע של |y - ŷ|."
          },
          "advanced": {
            "en": "MSE penalizes large errors quadratically (sensitive to outliers, assumes Gaussian noise), while MAE is robust but has a non-smooth gradient at zero; Huber loss interpolates between them. Report R^2 and RMSE, and remember RMSE is in the units of the target.",
            "he": "MSE מעניש שגיאות גדולות בריבוע (רגיש ל-outliers, מניח רעש גאוסיאני), בעוד MAE עמיד יותר אך הגרדיאנט שלו אינו חלק באפס; Huber loss מגשר בין השניים. דווח R^2 ו-RMSE, וזכור ש-RMSE הוא ביחידות של ה-target עצמו."
          }
        }
      },
      {
        "k": "binary",
        "tagEn": "BINARY",
        "tagHe": "בינארי",
        "titleEn": "A yes / no decision",
        "titleHe": "החלטה של כן / לא",
        "body": {
          "beginner": {
            "en": "Sometimes you only need a yes or no: is this email spam, will the customer churn. The model gives a probability between 0 and 1, and you pick a cutoff to turn it into a decision.",
            "he": "לפעמים אתה צריך רק כן או לא: האם המייל הזה ספאם, האם הלקוח יעזוב. המודל נותן הסתברות בין 0 ל-1, ואתה בוחר סף שהופך אותה להחלטה."
          },
          "intermediate": {
            "en": "Binary classification uses one sigmoid output, σ(z) = 1 / (1 + e^(-z)), which squashes the score into a probability p in (0, 1). The loss is binary cross-entropy: BCE = -(y·log(p) + (1-y)·log(1-p)).",
            "he": "סיווג בינארי משתמש בפלט יחיד עם sigmoid, σ(z) = 1 / (1 + e^(-z)), שדוחס את הציון להסתברות p בתחום (0, 1). ה-loss הוא binary cross-entropy: BCE = -(y·log(p) + (1-y)·log(1-p))."
          },
          "advanced": {
            "en": "The 0.5 threshold is just a default; move it to trade precision against recall, and choose it from a PR or ROC curve rather than by reflex. For numerical stability use a logits-based loss (e.g. BCEWithLogits) that fuses sigmoid and BCE in a log-sum-exp-safe way instead of calling sigmoid then BCE separately.",
            "he": "הסף 0.5 הוא רק ברירת מחדל; הזז אותו כדי לאזן precision מול recall, ובחר אותו מתוך עקומת PR או ROC ולא מתוך הרגל. ליציבות נומרית השתמש ב-loss מבוסס logits (למשל BCEWithLogits) שמאחד sigmoid ו-BCE בצורה בטוחה מבחינת log-sum-exp, במקום להפעיל sigmoid ואז BCE בנפרד."
          }
        }
      },
      {
        "k": "multiclass",
        "tagEn": "MULTI-CLASS",
        "tagHe": "רב-מחלקתי",
        "titleEn": "Exactly one of N",
        "titleHe": "בדיוק אחד מתוך N",
        "body": {
          "beginner": {
            "en": "Now there are several boxes but the answer goes in exactly one: a request is either code, chat, reasoning, or creative, never two at once. The model hands out a slice of one whole pie across the options, and the biggest slice wins.",
            "he": "עכשיו יש כמה תאים, אבל התשובה נכנסת בדיוק לאחד: בקשה היא או קוד, או צ'אט, או reasoning, או creative, אף פעם לא שניים יחד. המודל מחלק עוגה אחת שלמה בין האפשרויות, והפרוסה הגדולה ביותר מנצחת."
          },
          "intermediate": {
            "en": "Single-label multi-class classification uses a softmax over N outputs: softmax(z)_i = e^(z_i) / Σ_j e^(z_j), so the probabilities are positive and sum to 1. Train with categorical cross-entropy, CE = -Σ_i y_i·log(ŷ_i); this is the output the router and sentiment labs use.",
            "he": "סיווג רב-מחלקתי חד-תוויתי משתמש ב-softmax על פני N פלטים: softmax(z)_i = e^(z_i) / Σ_j e^(z_j), כך שההסתברויות חיוביות ומסתכמות ל-1. מאמנים עם categorical cross-entropy, CE = -Σ_i y_i·log(ŷ_i); זה הפלט שבו משתמשים ה-router ומעבדות ה-sentiment."
          },
          "advanced": {
            "en": "Softmax couples the classes: pushing one logit up pulls the rest down, which is exactly right when classes are mutually exclusive and wrong when they are not. It is shift-invariant (softmax(z) = softmax(z + c)), so implementations subtract max(z) for stability, and the usual loss is fused softmax-plus-cross-entropy on raw logits with integer (sparse) targets.",
            "he": "Softmax כובל את המחלקות זו לזו: הגדלת logit אחד מקטינה את השאר, וזה בדיוק נכון כשהמחלקות סותרות הדדית ושגוי כשהן אינן. הוא אינווריאנטי להזזה (softmax(z) = softmax(z + c)), ולכן מימושים מחסירים את max(z) ליציבות, וה-loss הנפוץ הוא softmax-plus-cross-entropy מאוחד על logits גולמיים עם targets שלמים (sparse)."
          }
        }
      },
      {
        "k": "multilabel",
        "tagEn": "MULTI-LABEL",
        "tagHe": "רב-תוויתי",
        "titleEn": "Many tags at once",
        "titleHe": "כמה תגיות בו-זמנית",
        "body": {
          "beginner": {
            "en": "An article can be about politics AND economics AND Israel all at the same time, so the answer is a set of tags, not one box. Here each tag gets its own private yes/no switch instead of competing for a single pie.",
            "he": "כתבה יכולה לעסוק בפוליטיקה וגם בכלכלה וגם בישראל בו-זמנית, כך שהתשובה היא אוסף תגיות ולא תא יחיד. כאן לכל תגית יש מתג כן/לא משלה, במקום שכולן יתחרו על אותה עוגה אחת."
          },
          "intermediate": {
            "en": "Multi-label classification puts an independent sigmoid on EACH of the N outputs, not a softmax, so the probabilities do NOT sum to 1 and several labels can be high together. The loss is per-label binary cross-entropy summed over labels, and you threshold each label independently (e.g. at 0.5).",
            "he": "סיווג רב-תוויתי שם sigmoid עצמאי על כל אחד מ-N הפלטים, ולא softmax, כך שההסתברויות אינן מסתכמות ל-1 וכמה תוויות יכולות להיות גבוהות יחד. ה-loss הוא binary cross-entropy לכל תווית בנפרד, מסוכם על כל התוויות, ואתה מפעיל סף על כל תווית בנפרד (למשל ב-0.5)."
          },
          "advanced": {
            "en": "The whole distinction is exclusivity: softmax for mutually exclusive classes (sums to 1), a sigmoid per label for co-occurring labels (each in (0,1) independently). Tune a separate threshold per label, weight rare labels or use focal loss to fight class imbalance, and report micro/macro F1 rather than plain accuracy.",
            "he": "כל ההבחנה היא שאלת בלעדיות: softmax למחלקות סותרות הדדית (סכום 1), sigmoid לכל תווית כשהתוויות יכולות להופיע יחד (כל אחת ב-(0,1) באופן עצמאי). כוונן סף נפרד לכל תווית, תן משקל לתוויות נדירות או השתמש ב-focal loss נגד חוסר איזון בין המחלקות, ודווח micro/macro F1 ולא accuracy גולמי."
          }
        }
      },
      {
        "k": "crossentropy",
        "tagEn": "THE LOSS",
        "tagHe": "פונקציית ה-Loss",
        "titleEn": "Why cross-entropy works",
        "titleHe": "למה cross-entropy עובדת",
        "body": {
          "beginner": {
            "en": "Cross-entropy is a confidence meter with teeth: being right and sure costs almost nothing, but being sure and WRONG costs a fortune. It teaches the model to be bold only when it should be.",
            "he": "Cross-entropy היא מד-ביטחון עם שיניים: לצדוק בביטחון כמעט לא עולה כלום, אבל להיות בטוח ולטעות עולה הון. היא מלמדת את המודל להעז רק כשבאמת כדאי."
          },
          "intermediate": {
            "en": "Cross-entropy is CE = -Σ_i y_i·log(ŷ_i): because of the log, predicting a true class with probability near 0 sends the loss toward infinity. It is minimized exactly when the predicted distribution ŷ equals the true distribution y.",
            "he": "Cross-entropy היא CE = -Σ_i y_i·log(ŷ_i): בגלל ה-log, חיזוי של המחלקה הנכונה בהסתברות קרובה ל-0 שולח את ה-loss לאינסוף. היא מינימלית בדיוק כאשר התפלגות החיזוי ŷ שווה להתפלגות האמת y."
          },
          "advanced": {
            "en": "It pairs with softmax/sigmoid because the composite gradient collapses to the clean form (ŷ - y), giving large, well-scaled updates exactly where the model is confidently wrong, unlike MSE-on-probabilities whose gradient vanishes in the saturated regions. Cross-entropy is the KL divergence from y to ŷ up to the constant entropy of y, which is why minimizing it matches the distributions.",
            "he": "היא משתלבת עם softmax/sigmoid כי הגרדיאנט המשולב מתקפל לצורה הנקייה (ŷ - y), שנותנת עדכונים גדולים ומכוילים בדיוק היכן שהמודל בטוח וטועה, בניגוד ל-MSE על הסתברויות שהגרדיאנט שלו מתאפס באזורי הרוויה. Cross-entropy היא ה-KL divergence מ-y ל-ŷ עד כדי האנטרופיה הקבועה של y, ולכן מזעורה מקרב את ההתפלגויות זו לזו."
          }
        }
      },
      {
        "k": "cheatsheet",
        "tagEn": "CHEAT-SHEET",
        "tagHe": "דף עזר",
        "titleEn": "Output + loss, paired",
        "titleHe": "Output ו-Loss, בזוגות",
        "body": {
          "beginner": {
            "en": "Once you name the task, the last layer and the scoring rule come as a matched set, like a plug and its socket. Match them right and training just works; mismatch them and the model never learns.",
            "he": "ברגע שאתה נותן שם למשימה, השכבה האחרונה וכלל הניקוד מגיעים כזוג תואם, כמו תקע ושקע. תתאים נכון והאימון פשוט עובד; תטעה בהתאמה והמודל לא ילמד."
          },
          "intermediate": {
            "en": "The pairings: regression to linear output plus MSE (or MAE); binary to one sigmoid plus binary cross-entropy; single-label multi-class to softmax plus categorical cross-entropy; multi-label to a sigmoid per label plus per-label binary cross-entropy. The activation shapes the output range, the loss matches that shape.",
            "he": "ההתאמות: רגרסיה לפלט לינארי בתוספת MSE (או MAE); בינארי ל-sigmoid יחיד בתוספת binary cross-entropy; רב-מחלקתי חד-תוויתי ל-softmax בתוספת categorical cross-entropy; רב-תוויתי ל-sigmoid לכל תווית בתוספת binary cross-entropy לכל תווית. ה-activation קובע את טווח הפלט, וה-loss תואם לאותו טווח."
          },
          "advanced": {
            "en": "In practice keep the final layer linear (logits) and use a logits-aware loss (softmax-cross-entropy, BCEWithLogits) for numerical stability instead of applying the activation yourself. The decision tree is simply: continuous target to regression; one-of-N to softmax+CE; any-of-N to sigmoid-per-label+BCE; the special two-class case folds into a single sigmoid+BCE.",
            "he": "בפרקטיקה השאר את השכבה האחרונה לינארית (logits) והשתמש ב-loss מודע-logits (softmax-cross-entropy, BCEWithLogits) ליציבות נומרית, במקום להפעיל את ה-activation בעצמך. עץ ההחלטה פשוט: target רציף ל-רגרסיה; אחד-מתוך-N ל-softmax+CE; כל-תת-קבוצה-מ-N ל-sigmoid-לכל-תווית+BCE; ומקרה שתי-המחלקות מתקפל ל-sigmoid+BCE יחיד."
          }
        }
      }
    ],
    "decision": [
      {
        "wantEn": "Predict a continuous number (price, temperature, demand)",
        "wantHe": "לנבא מספר רציף (מחיר, טמפרטורה, ביקוש)",
        "useEn": "Regression · linear output · MSE (or MAE)",
        "useHe": "רגרסיה · output לינארי · MSE (או MAE)",
        "whyEn": "The target can be any real value, so no squashing activation; MSE penalizes large misses, MAE is more robust to outliers.",
        "whyHe": "ה-target יכול להיות כל ערך ממשי, ולכן בלי activation דוחס; MSE מעניש החמצות גדולות, MAE עמיד יותר ל-outliers."
      },
      {
        "wantEn": "Make a yes / no decision (spam, churn, fraud)",
        "wantHe": "לקבל החלטת כן / לא (ספאם, נטישה, הונאה)",
        "useEn": "Binary · one sigmoid · binary cross-entropy",
        "useHe": "בינארי · sigmoid יחיד · binary cross-entropy",
        "whyEn": "One probability in (0,1) plus a tunable threshold lets you trade precision against recall for the single positive class.",
        "whyHe": "הסתברות אחת בתחום (0,1) ובתוספת סף שניתן לכוונן מאפשרים לאזן precision מול recall עבור המחלקה החיובית היחידה."
      },
      {
        "wantEn": "Pick exactly one category out of N (route to code / chat / reasoning / creative)",
        "wantHe": "לבחור בדיוק קטגוריה אחת מתוך N (לנתב ל-code / chat / reasoning / creative)",
        "useEn": "Multi-class single-label · softmax · categorical cross-entropy",
        "useHe": "רב-מחלקתי חד-תוויתי · softmax · categorical cross-entropy",
        "whyEn": "Softmax forces the N probabilities to compete and sum to 1, which is correct when the classes are mutually exclusive.",
        "whyHe": "Softmax מכריח את N ההסתברויות להתחרות ולהסתכם ל-1, וזה נכון כשהמחלקות סותרות הדדית."
      },
      {
        "wantEn": "Apply many tags at once (an article tagged politics + economics + Israel)",
        "wantHe": "להצמיד כמה תגיות בו-זמנית (כתבה עם פוליטיקה + כלכלה + ישראל)",
        "useEn": "Multi-label · sigmoid per label · per-label BCE",
        "useHe": "רב-תוויתי · sigmoid לכל תווית · BCE לכל תווית",
        "whyEn": "Each label is an independent yes/no, so probabilities must NOT sum to 1; threshold every label on its own.",
        "whyHe": "כל תווית היא כן/לא עצמאי, ולכן ההסתברויות אינן צריכות להסתכם ל-1; הפעל סף על כל תווית בנפרד."
      },
      {
        "wantEn": "Classify a sentence's sentiment (negative / neutral / positive)",
        "wantHe": "לסווג sentiment של משפט (שלילי / נייטרלי / חיובי)",
        "useEn": "Multi-class single-label · softmax · categorical cross-entropy",
        "useHe": "רב-מחלקתי חד-תוויתי · softmax · categorical cross-entropy",
        "whyEn": "Each sentence gets exactly one of three mutually exclusive labels, the same recipe the sentiment lab uses.",
        "whyHe": "כל משפט מקבל בדיוק אחת משלוש תוויות סותרות הדדית, אותה מתכונת שבה משתמשת מעבדת ה-sentiment."
      },
      {
        "wantEn": "Stay numerically stable while training any classifier",
        "wantHe": "לשמור על יציבות נומרית בזמן אימון כל classifier",
        "useEn": "Keep the last layer linear (logits) · use a logits-aware loss (BCEWithLogits / softmax-cross-entropy)",
        "useHe": "השאר את השכבה האחרונה לינארית (logits) · השתמש ב-loss מודע-logits (BCEWithLogits / softmax-cross-entropy)",
        "whyEn": "Fusing the activation into the loss avoids log(0) and overflow that you hit by applying sigmoid/softmax then taking the log separately.",
        "whyHe": "איחוד ה-activation לתוך ה-loss מונע log(0) ו-overflow שנתקלים בהם כשמפעילים sigmoid/softmax ואז לוקחים log בנפרד."
      }
    ],
    "eyebrowEn": "THE ACADEMY · ML TASKS",
    "eyebrowHe": "האקדמיה · משימות ML",
    "id": "dl-tasks",
    "introEn": "Pick the task type wrong and nothing else matters — the cleverest architecture cannot recover from the wrong output layer and loss. Every task has a matching pair: name what you are predicting, and the final activation and loss function fall out almost automatically.",
    "introHe": "תטעה בבחירת סוג המשימה, וכל השאר כבר לא משנה — אפילו הארכיטקטורה הכי חכמה לא תתאושש מ-output layer ו-loss שגויים. לכל משימה יש זוג תואם: תן שם למה שאתה מנבא, וה-activation האחרון ופונקציית ה-loss כמעט נגזרים מאליהם.",
    "titleEn": "What are you predicting?",
    "titleHe": "מה אתה מנבא?",
    "tone": "content"
  }
];
