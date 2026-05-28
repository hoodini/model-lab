"""
inspect.py
==========
Real model internals for the "Under the Hood" visualiser — NOT a simulation.

Given a piece of text, we run it through the actual base model and read out:
  - the real input embeddings (the learned 768-number vector per token), and
  - the real self-attention weights (per head + averaged) from a forward pass.

The frontend draws exactly these numbers. So when you see colored cells, you
are looking at the model's real weights, not a pretty random pattern.

We use the *base* pretrained model (e.g. distilbert-base-multilingual-cased)
rather than a fine-tuned router, because this section teaches how ANY encoder
turns text into geometry — it should work before you've trained anything.
"""

import torch

from .hardware import detect as detect_device

# Loading a model is slow; cache by name so repeated calls are instant.
_CACHE = {}


def _load(name):
    if name not in _CACHE:
        from transformers import AutoTokenizer, AutoModel

        tokenizer = AutoTokenizer.from_pretrained(name)
        # output_attentions=True makes the forward pass also return the real
        # attention weight matrices for every layer and head.
        model = AutoModel.from_pretrained(name, output_attentions=True)
        model.train(False)  # inference mode (PyTorch nn.Module.train(False))
        device = detect_device().kind
        model.to(device)
        _CACHE[name] = (tokenizer, model, device)
    return _CACHE[name]


def inspect(text, name, max_tokens=12, dims=16, max_heads=4):
    """
    Returns REAL values from the model:
      tokens       : [{piece, id}]                 (first max_tokens)
      embeddings   : max_tokens × dims raw floats  (the input embedding lookup)
      attention    : n × n  (last layer, averaged over heads; 0..1 per row)
      heads        : max_heads × n × n  (last layer, individual heads; 0..1)
      hidden_size, num_heads, num_layers
    """
    if not text or not text.strip():
        return {"tokens": [], "embeddings": [], "attention": [], "heads": [],
                "hidden_size": 0, "num_heads": 0, "num_layers": 0}

    tokenizer, model, device = _load(name)

    enc = tokenizer(text, return_tensors="pt", truncation=True, max_length=64,
                    add_special_tokens=False)
    ids = enc["input_ids"][0].tolist()
    pieces = tokenizer.convert_ids_to_tokens(ids)
    enc = {k: v.to(device) for k, v in enc.items()}

    with torch.no_grad():
        # Real input embeddings: the learned vector each token id maps to.
        emb_layer = model.get_input_embeddings()
        embs = emb_layer(enc["input_ids"])[0]            # [seq, hidden]
        out = model(**enc)
        attentions = out.attentions                       # tuple(layers): [b, heads, seq, seq]

    seq = len(ids)
    n = min(seq, max_tokens)
    hidden = int(embs.shape[-1])

    last = attentions[-1][0]                              # [heads, seq, seq]
    num_heads = int(last.shape[0])
    mean_attn = last.mean(0)                              # [seq, seq]

    emb_disp = embs[:n, :dims].detach().cpu().tolist()    # raw real floats
    attn_disp = mean_attn[:n, :n].detach().cpu().tolist()
    heads_disp = [last[h, :n, :n].detach().cpu().tolist()
                  for h in range(min(num_heads, max_heads))]

    return {
        "tokens": [{"piece": p, "id": int(i)} for p, i in zip(pieces[:n], ids[:n])],
        "embeddings": emb_disp,
        "attention": attn_disp,
        "heads": heads_disp,
        "hidden_size": hidden,
        "num_heads": num_heads,
        "num_layers": len(attentions),
    }
