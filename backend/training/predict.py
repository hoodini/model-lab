"""
predict.py
==========
Once a model is trained and saved, THIS is how we use it: take a new prompt,
run it through the network ONCE (no learning), and read out the probabilities
for each lane. This step is called "inference" (the model infers an answer).

Training is expensive and rare; inference is cheap and happens constantly —
every time a user types a prompt, we do exactly what's below.
"""

import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Loading a model from disk is slow, so we cache loaded models in memory keyed
# by their folder. The first prediction after training pays the load cost; the
# rest are instant.
_CACHE = {}


def _load(model_dir):
    if model_dir not in _CACHE:
        tokenizer = AutoTokenizer.from_pretrained(model_dir)
        model = AutoModelForSequenceClassification.from_pretrained(model_dir)
        # Switch the network to inference mode (turns off dropout etc.).
        # NOTE: this is PyTorch's nn.Module.eval() — NOT Python's eval().
        # It evaluates nothing; it just flips a "we are not training" flag.
        model.train(False)
        # Use the GPU if available — same hardware that trained it.
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model.to(device)
        _CACHE[model_dir] = (tokenizer, model, device)
    return _CACHE[model_dir]


def predict(model_dir, text):
    tokenizer, model, device = _load(model_dir)

    # Same tokenization as training — the model only understands token IDs.
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    # torch.no_grad() = "don't track gradients" — we're predicting, not learning,
    # so we skip the bookkeeping that training needs. Faster + less memory.
    with torch.no_grad():
        logits = model(**inputs).logits          # raw scores, one per lane
        probs = F.softmax(logits, dim=-1)[0]      # turn scores into probabilities that sum to 1

    # id2label was saved with the model, so we can name the winning lane.
    id2label = model.config.id2label
    ranked = sorted(
        [{"label": id2label[i], "prob": float(p)} for i, p in enumerate(probs)],
        key=lambda x: x["prob"],
        reverse=True,
    )
    return {"top": ranked[0]["label"], "probs": ranked}


def evict(model_dir=None):
    """Free cached models (e.g. after re-training the same folder)."""
    if model_dir is None:
        _CACHE.clear()
    else:
        _CACHE.pop(model_dir, None)
