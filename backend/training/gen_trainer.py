"""
gen_trainer.py
==============
PROJECT 03 — GENERATIVE fine-tuning with QLoRA (e.g. Gemma 4).

This is a different machine from the classifier labs: a decoder-only LLM is
taught to WRITE responses (causal language modeling), not to pick a label. We
keep the base model frozen in 4-bit and train small LoRA adapters on top — that
is QLoRA, the only way a multi-billion-parameter model fits on one consumer GPU.

Built on the plain transformers Trainer (verified stable on this stack) rather
than a version-volatile high-level wrapper. Gemma is gated on the Hub, so a HF
token is passed in per run and used only for the download — never stored.
"""

import os
import json
import time

from .hardware import detect as detect_device, summary as device_summary

# Loaded base+adapter models cached by adapter dir for fast repeated generation.
_GEN_CACHE = {}


def _build_texts(rows, tokenizer):
    """Render each conversation to a single training string via the model's chat
    template (falls back to a simple User/Assistant format if none exists)."""
    texts = []
    has_tmpl = getattr(tokenizer, "chat_template", None)
    for r in rows:
        msgs = r.get("messages") or []
        if has_tmpl:
            try:
                texts.append(tokenizer.apply_chat_template(msgs, tokenize=False, add_generation_prompt=False))
                continue
            except Exception:
                pass
        parts = []
        for m in msgs:
            who = "User" if m["role"] == "user" else "Assistant"
            parts.append(f"{who}: {m['content']}")
        texts.append("\n".join(parts) + (tokenizer.eos_token or ""))
    return texts


def train_gen(rows, config, emit, output_dir):
    """
    rows      : list of {"messages": [{"role","content"}, ...]}
    config    : {base_model, epochs, lr, batch_size, rank, max_len, hf_token}
    emit       : function(dict) -> streams progress to the browser (SSE)
    output_dir: where the trained LoRA adapter is saved
    """
    import torch
    from transformers import (
        AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig,
        TrainingArguments, Trainer, TrainerCallback, DataCollatorForLanguageModeling,
    )
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
    from datasets import Dataset

    base_model = config.get("base_model", "google/gemma-3-270m")
    token = config.get("hf_token") or None
    max_len = int(config.get("max_len", 512))
    rank = int(config.get("rank", 16))

    dev = detect_device()
    use_4bit = dev.kind == "cuda"
    emit({"type": "device", **device_summary(dev)})
    emit({"type": "info", "message": f"Loading {base_model} ({'4-bit QLoRA' if use_4bit else 'full-precision LoRA'}) on {dev.name}"})
    if not use_4bit:
        emit({"type": "info", "message": "No CUDA GPU — training in full precision on CPU/MPS. Use a tiny model; this is slow."})

    # ── Tokenizer + chat-formatted dataset ───────────────────────────────────
    tokenizer = AutoTokenizer.from_pretrained(base_model, token=token)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    texts = _build_texts(rows, tokenizer)
    ds = Dataset.from_dict({"text": texts})

    def tok(batch):
        return tokenizer(batch["text"], truncation=True, max_length=max_len)

    ds = ds.map(tok, batched=True, remove_columns=["text"])
    collator = DataCollatorForLanguageModeling(tokenizer, mlm=False)
    emit({"type": "info", "message": f"Dataset ready: {len(ds)} conversations"})

    # ── Base model (4-bit on CUDA) ───────────────────────────────────────────
    model_kwargs = {"token": token}
    if use_4bit:
        model_kwargs["quantization_config"] = BitsAndBytesConfig(
            load_in_4bit=True, bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16, bnb_4bit_use_double_quant=True,
        )
        model_kwargs["device_map"] = "auto"
    else:
        model_kwargs["torch_dtype"] = torch.float32

    model = AutoModelForCausalLM.from_pretrained(base_model, **model_kwargs)
    model.config.use_cache = False
    if use_4bit:
        model = prepare_model_for_kbit_training(model)

    lora = LoraConfig(
        r=rank, lora_alpha=2 * rank, lora_dropout=0.05, bias="none",
        task_type="CAUSAL_LM", target_modules="all-linear",
    )
    model = get_peft_model(model, lora)
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    emit({"type": "info", "message": f"LoRA: training {trainable:,} / {total:,} params ({100*trainable/total:.2f}%)"})

    # ── Streaming progress callback ──────────────────────────────────────────
    class Stream(TrainerCallback):
        def __init__(self):
            self.t0 = time.time()

        def on_train_begin(self, args, state, control, **kw):
            emit({"type": "start", "total_steps": state.max_steps, "epochs": args.num_train_epochs})

        def on_log(self, args, state, control, logs=None, **kw):
            if not logs or "loss" not in logs:
                return
            emit({"type": "log", "step": state.global_step, "epoch": round(state.epoch or 0, 3),
                  "loss": logs.get("loss"), "learning_rate": logs.get("learning_rate"),
                  "elapsed_s": round(time.time() - self.t0, 1)})

    args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=config.get("epochs", 3),
        learning_rate=config.get("lr", 2e-4),
        per_device_train_batch_size=config.get("batch_size", 1),
        gradient_accumulation_steps=config.get("grad_accum", 4),
        logging_strategy="steps", logging_steps=1, save_strategy="no",
        report_to="none", warmup_ratio=0.05, lr_scheduler_type="cosine",
        bf16=use_4bit, fp16=False,
        optim="paged_adamw_8bit" if use_4bit else "adamw_torch",
        gradient_checkpointing=use_4bit,
        gradient_checkpointing_kwargs={"use_reentrant": False} if use_4bit else None,
        use_cpu=(dev.kind == "cpu"),
    )

    trainer = Trainer(model=model, args=args, train_dataset=ds, data_collator=collator, callbacks=[Stream()])
    trainer.train()

    # ── Save adapter + a small meta record ───────────────────────────────────
    os.makedirs(output_dir, exist_ok=True)
    model.save_pretrained(output_dir)          # LoRA adapter weights
    tokenizer.save_pretrained(output_dir)
    with open(os.path.join(output_dir, "gen_meta.json"), "w", encoding="utf-8") as f:
        json.dump({"base_model": base_model, "rank": rank, "max_len": max_len,
                   "trainable_params": trainable}, f, ensure_ascii=False, indent=2)

    evict(output_dir)
    emit({"type": "done", "output_dir": output_dir, "base_model": base_model})
    return {"output_dir": output_dir, "base_model": base_model}


def _load_for_gen(adapter_dir, token=None):
    if adapter_dir in _GEN_CACHE:
        return _GEN_CACHE[adapter_dir]
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
    from peft import PeftModel, PeftConfig

    cfg = PeftConfig.from_pretrained(adapter_dir)
    base = cfg.base_model_name_or_path
    dev = detect_device()
    tokenizer = AutoTokenizer.from_pretrained(adapter_dir, token=token)
    kwargs = {"token": token}
    if dev.kind == "cuda":
        kwargs["quantization_config"] = BitsAndBytesConfig(
            load_in_4bit=True, bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16, bnb_4bit_use_double_quant=True,
        )
        kwargs["device_map"] = "auto"
    else:
        kwargs["torch_dtype"] = torch.float32
    model = AutoModelForCausalLM.from_pretrained(base, **kwargs)
    model = PeftModel.from_pretrained(model, adapter_dir)
    model.eval()
    _GEN_CACHE[adapter_dir] = (tokenizer, model, dev.kind)
    return _GEN_CACHE[adapter_dir]


def generate(adapter_dir, prompt, token=None, max_new_tokens=160, temperature=0.7):
    """Generate a response from the fine-tuned model for a single user prompt."""
    import torch
    tokenizer, model, kind = _load_for_gen(adapter_dir, token)
    msgs = [{"role": "user", "content": prompt}]
    if getattr(tokenizer, "chat_template", None):
        enc = tokenizer.apply_chat_template(msgs, add_generation_prompt=True,
                                            return_tensors="pt", return_dict=True)
    else:
        enc = tokenizer(f"User: {prompt}\nAssistant:", return_tensors="pt")
    enc = {k: v.to(model.device) for k, v in enc.items()}
    prompt_len = enc["input_ids"].shape[-1]
    with torch.no_grad():
        out = model.generate(
            **enc, max_new_tokens=max_new_tokens, do_sample=temperature > 0,
            temperature=max(temperature, 0.01), top_p=0.9,
            pad_token_id=tokenizer.pad_token_id or tokenizer.eos_token_id,
        )
    new = out[0][prompt_len:]
    text = tokenizer.decode(new, skip_special_tokens=True).strip()
    return {"text": text}


def evict(adapter_dir=None):
    if adapter_dir is None:
        _GEN_CACHE.clear()
    else:
        _GEN_CACHE.pop(adapter_dir, None)
