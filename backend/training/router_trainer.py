"""
router_trainer.py
=================
This is THE FILE where a model is actually trained. Read it top to bottom —
it is written to be understood line by line, even if you've never trained a
model before.

THE BIG PICTURE (the 5 universal steps of supervised training)
--------------------------------------------------------------
Almost every "train a model" task, anywhere, is these same five steps:

  1. TOKENIZE   turn text into numbers the model can eat (token IDs).
  2. MODEL      load a network with a fresh "head" for our specific task.
  3. CONFIGURE  set the knobs (learning rate, epochs, batch size...).
  4. TRAIN      repeatedly: predict -> measure error (loss) -> nudge weights.
  5. EVALUATE   check accuracy on data the model did NOT train on.

Everything below is just those five steps, with comments explaining WHY.
"""

import os
import time
import numpy as np

# datasets.Dataset is a thin, fast wrapper around a table of examples.
# It knows how to batch, shuffle, and map a tokenizer over every row.
from datasets import Dataset

from transformers import (
    AutoTokenizer,                       # builds the right tokenizer for any model name
    AutoModelForSequenceClassification,  # a base model + a classification "head" on top
    TrainingArguments,                   # the struct that holds all the training knobs
    Trainer,                             # the loop that does predict->loss->update for us
    TrainerCallback,                     # lets us hook into the loop to stream progress
    DataCollatorWithPadding,             # pads each batch so sequences stack into one tensor
)

from sklearn.metrics import accuracy_score, f1_score

from .hardware import detect as detect_device, summary as device_summary


# ─────────────────────────────────────────────────────────────────────────────
# A small helper so the training loop can "talk" to the website in real time.
# Trainer doesn't know about our web server, so we pass it a callback object.
# Every time something interesting happens (a step finishes, evaluation runs),
# this callback fires `emit(event)`, and the web layer forwards it to the
# browser over SSE so you watch the loss curve move live.
# ─────────────────────────────────────────────────────────────────────────────
class StreamingCallback(TrainerCallback):
    def __init__(self, emit):
        self.emit = emit            # a function: emit(dict) -> None
        self._t0 = time.time()

    def on_train_begin(self, args, state, control, **kwargs):
        # state.max_steps = total number of weight-updates the whole run will do.
        # We send it so the UI can render a real progress bar (0 -> 100%).
        self.emit({
            "type": "start",
            "total_steps": state.max_steps,
            "epochs": args.num_train_epochs,
        })

    def on_log(self, args, state, control, logs=None, **kwargs):
        # `logs` is whatever Trainer just measured. During training it contains
        # "loss" (how wrong the model currently is) and "learning_rate".
        # A LOWER loss = the model is getting things MORE right. Watching this
        # number fall is the single most important signal in all of training.
        if not logs:
            return
        self.emit({
            "type": "log",
            "step": state.global_step,
            "epoch": round(state.epoch or 0, 3),
            "loss": logs.get("loss"),
            "eval_loss": logs.get("eval_loss"),
            "eval_accuracy": logs.get("eval_accuracy"),
            "eval_f1": logs.get("eval_f1"),
            "learning_rate": logs.get("learning_rate"),
            "elapsed_s": round(time.time() - self._t0, 1),
        })


def _compute_metrics(eval_pred):
    """
    After each evaluation, Trainer hands us the model's raw outputs ("logits")
    and the true answers. We turn logits into a single predicted class with
    argmax (= "which lane got the highest score?") and compare to the truth.

      accuracy = fraction of prompts routed to the correct lane.
      f1       = a balanced score that also cares about rare classes.
    """
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1": f1_score(labels, preds, average="weighted"),
    }


def train_router(rows, label_ids, config, emit, output_dir):
    """
    rows      : list of {"text": str, "label": str}
    label_ids : ordered list like ["code","simple_chat","reasoning","creative"]
    config    : dict of knobs from the UI (base_model, epochs, lr, batch_size, test_size)
    emit      : function(dict) to stream progress to the browser
    output_dir: where to save the trained model so we can use it for predictions

    Returns the final evaluation metrics.
    """

    # ── Map label names <-> integer ids ─────────────────────────────────────
    # Neural networks only deal in numbers, so "code" must become 0, etc.
    # We keep both directions: label2id to encode, id2label to decode later.
    label2id = {name: i for i, name in enumerate(label_ids)}
    id2label = {i: name for i, name in enumerate(label_ids)}
    num_labels = len(label_ids)

    base_model = config.get("base_model", "distilbert-base-multilingual-cased")

    # ── Pick the best hardware automatically (GPU / Apple / CPU) ─────────────
    # No configuration needed — the same code runs anywhere and uses whatever
    # the machine has. The UI shows what was chosen so you SEE it.
    dev = detect_device()
    emit({"type": "device", **device_summary(dev)})
    emit({"type": "info",
          "message": f"Compute: {dev.name} · dtype {dev.dtype}"
                     + (" · mixed precision ON" if (dev.bf16 or dev.fp16) else "")})

    emit({"type": "info", "message": f"Loading tokenizer + model: {base_model}"})

    # ── STEP 1: TOKENIZE ────────────────────────────────────────────────────
    # The tokenizer is the model's dictionary. It splits text into "tokens"
    # (sub-word pieces) and maps each to an integer id. A MULTILINGUAL tokenizer
    # was trained on many languages including Hebrew, so Hebrew words become a
    # few sensible tokens instead of being shredded character by character.
    tokenizer = AutoTokenizer.from_pretrained(base_model)

    texts = [r["text"] for r in rows]
    labels = [label2id[r["label"]] for r in rows]
    ds = Dataset.from_dict({"text": texts, "label": labels})

    def tokenize(batch):
        # truncation=True  -> cut prompts longer than the model's max length.
        # We intentionally do NOT pad here; the data collator below pads each
        # batch to the longest item in THAT batch (dynamic padding = faster).
        return tokenizer(batch["text"], truncation=True, max_length=128)

    ds = ds.map(tokenize, batched=True)

    # The collator stacks examples into a batch. Different prompts have different
    # lengths, so it pads the short ones with a special [PAD] token so they all
    # become the same length and fit into one tensor. Without this, the Trainer
    # crashes with "expected sequence of length N (got M)".
    data_collator = DataCollatorWithPadding(tokenizer)

    # ── Split into train / test so we can measure HONEST performance ─────────
    # The model must be graded on prompts it has NEVER seen, otherwise it could
    # just memorize. test_size=0.2 means 20% is held out for evaluation.
    split = ds.train_test_split(test_size=config.get("test_size", 0.2), seed=42)
    train_ds, eval_ds = split["train"], split["test"]
    emit({"type": "info",
          "message": f"Dataset ready: {len(train_ds)} train / {len(eval_ds)} eval examples"})

    # ── STEP 2: MODEL ───────────────────────────────────────────────────────
    # We take a base model that already "understands language" from pre-training
    # and bolt a fresh, untrained classification head on top sized to OUR labels.
    # Training will mostly teach that head (and gently adjust the rest) to route.
    model = AutoModelForSequenceClassification.from_pretrained(
        base_model,
        num_labels=num_labels,
        id2label=id2label,
        label2id=label2id,
    )

    # ── STEP 3: CONFIGURE (the knobs you'll learn to tune) ───────────────────
    args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=config.get("epochs", 5),          # how many full passes over the data
        learning_rate=config.get("lr", 5e-5),              # how big each "nudge" to the weights is
        per_device_train_batch_size=config.get("batch_size", 8),   # examples per step
        per_device_eval_batch_size=16,
        eval_strategy="epoch",      # run evaluation after every epoch
        save_strategy="no",         # we'll save once at the end ourselves
        logging_strategy="steps",
        logging_steps=1,            # log every single step -> a smooth live loss curve
        report_to="none",           # don't phone home to wandb/tensorboard
        seed=42,
        # Mixed precision: train in 16-bit where it's safe to halve memory and
        # speed things up. These flags are chosen by hardware.detect() to match
        # whatever GPU (if any) is present, so they're correct on every machine.
        bf16=dev.bf16,
        fp16=dev.fp16,
        use_cpu=(dev.kind == "cpu"),
    )

    # ── STEP 4: TRAIN ────────────────────────────────────────────────────────
    # Trainer wires everything together and runs the core loop for us:
    #   for each batch:  forward pass -> compute loss -> backprop -> optimizer step
    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        compute_metrics=_compute_metrics,
        data_collator=data_collator,
        callbacks=[StreamingCallback(emit)],
    )

    trainer.train()        # <- this is where the GPU lights up and learning happens

    # ── STEP 5: EVALUATE (final, honest score) ───────────────────────────────
    metrics = trainer.evaluate()
    emit({"type": "eval", "metrics": metrics})

    # ── Save the trained model so we can make predictions with it later ──────
    os.makedirs(output_dir, exist_ok=True)
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    emit({"type": "done", "output_dir": output_dir, "metrics": metrics})

    return metrics
