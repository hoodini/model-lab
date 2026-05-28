"""
app.py
======
The web server. It turns our training engine into something the website can
call over HTTP. Three jobs:

  1. Serve the dataset (so the UI can show + edit it).
  2. Start a training run in the background and STREAM progress live (SSE).
  3. Run predictions with the trained model.

Run it with:   uvicorn app:app --reload --port 8000
(from inside the backend/ folder)
"""

import os
import json
import uuid
import asyncio
import threading
import traceback

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel

from data.router_seed import get_seed, LABEL_IDS
from training.router_trainer import train_router
from training import predict as predictor
from training import inspect as inspector
from training import export as exporter

app = FastAPI(title="Model Lab API")

# The website runs on http://localhost:3000 (Next.js dev server). The browser
# blocks cross-origin calls unless the server explicitly allows that origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CHECKPOINTS = os.path.join(os.path.dirname(__file__), "checkpoints")

# In-memory registry of training runs. Fine for a single-user local tool.
# job_id -> {"events": [...], "done": bool, "status": str, "model_dir": str|None}
JOBS = {}
LATEST_MODEL_DIR = {"path": None}   # remembers the most recently trained model


def _recover_latest_model():
    # On restart the in-memory pointer is gone, but trained models still live on
    # disk. Pick the most recently modified checkpoint that actually contains a
    # model, so /api/infer and /api/evals keep working without re-training.
    if not os.path.isdir(CHECKPOINTS):
        return
    candidates = []
    for name in os.listdir(CHECKPOINTS):
        d = os.path.join(CHECKPOINTS, name)
        if os.path.isfile(os.path.join(d, "config.json")):
            candidates.append((os.path.getmtime(d), d))
    if candidates:
        LATEST_MODEL_DIR["path"] = max(candidates)[1]


_recover_latest_model()


# ── Request body shapes (pydantic validates incoming JSON for us) ────────────
class Row(BaseModel):
    text: str
    label: str


class TrainRequest(BaseModel):
    rows: list[Row]
    base_model: str = "distilbert-base-multilingual-cased"
    epochs: int = 5
    lr: float = 5e-5
    batch_size: int = 8
    test_size: float = 0.2


class InferRequest(BaseModel):
    text: str


class TokenizeRequest(BaseModel):
    text: str
    base_model: str = "distilbert-base-multilingual-cased"


class InspectRequest(BaseModel):
    text: str
    base_model: str = "distilbert-base-multilingual-cased"


class HubExportRequest(BaseModel):
    token: str
    repo_id: str
    private: bool = True


# Cache tokenizers by model name so repeated calls are instant.
_TOKENIZERS = {}


def _get_tokenizer(name):
    if name not in _TOKENIZERS:
        from transformers import AutoTokenizer
        _TOKENIZERS[name] = AutoTokenizer.from_pretrained(name)
    return _TOKENIZERS[name]


# ── Health check: reports the auto-detected compute device (GPU/Apple/CPU) ───
@app.get("/api/health")
def health():
    info = {"status": "ok"}
    try:
        from training.hardware import detect, summary
        info.update(summary(detect()))
    except Exception as e:
        info["hardware_error"] = str(e)
    return info


# ── The dataset the user starts from (they can edit it in the UI) ────────────
@app.get("/api/dataset")
def dataset():
    return get_seed()


# ── Start a training run ─────────────────────────────────────────────────────
@app.post("/api/train")
def start_training(req: TrainRequest):
    job_id = uuid.uuid4().hex[:8]
    model_dir = os.path.join(CHECKPOINTS, job_id)
    JOBS[job_id] = {"events": [], "done": False, "status": "running", "model_dir": model_dir}

    def emit(ev):
        # Every progress event from the trainer lands here, gets buffered, and
        # is later streamed to the browser by the /stream endpoint below.
        JOBS[job_id]["events"].append(ev)

    def run():
        try:
            config = {
                "base_model": req.base_model,
                "epochs": req.epochs,
                "lr": req.lr,
                "batch_size": req.batch_size,
                "test_size": req.test_size,
            }
            rows = [{"text": r.text, "label": r.label} for r in req.rows]
            train_router(rows, LABEL_IDS, config, emit, model_dir)
            JOBS[job_id]["status"] = "completed"
            LATEST_MODEL_DIR["path"] = model_dir
            predictor.evict(model_dir)  # drop any stale cached version
        except Exception as e:
            emit({"type": "error", "message": str(e), "trace": traceback.format_exc()})
            JOBS[job_id]["status"] = "error"
        finally:
            JOBS[job_id]["done"] = True

    # Train OFF the web thread so the server stays responsive and can stream.
    threading.Thread(target=run, daemon=True).start()
    return {"job_id": job_id}


# ── Stream the training progress to the browser (Server-Sent Events) ─────────
@app.get("/api/train/{job_id}/stream")
async def stream(job_id: str):
    if job_id not in JOBS:
        return {"error": "unknown job"}

    async def gen():
        i = 0
        while True:
            events = JOBS[job_id]["events"]
            # Send any events we haven't sent yet. SSE format = "data: <json>\n\n".
            while i < len(events):
                yield f"data: {json.dumps(events[i], ensure_ascii=False)}\n\n"
                i += 1
            if JOBS[job_id]["done"] and i >= len(JOBS[job_id]["events"]):
                break
            await asyncio.sleep(0.1)   # poll the buffer ~10x/sec

    return StreamingResponse(gen(), media_type="text/event-stream")


# ── Use the trained model to route a new prompt ──────────────────────────────
# ── Show how text becomes tokens (the "models only see numbers" lesson) ──────
# This is the single clearest way to SEE why Hebrew is harder: tokenize the
# same idea in EN and HE and compare how many tokens each takes.
@app.post("/api/tokenize")
def tokenize(req: TokenizeRequest):
    tok = _get_tokenizer(req.base_model)
    ids = tok.encode(req.text, add_special_tokens=False)
    pieces = tok.convert_ids_to_tokens(ids)
    return {
        "count": len(ids),
        "tokens": [{"piece": p, "id": int(i)} for p, i in zip(pieces, ids)],
    }


# ── Real model internals for the "Under the Hood" visualiser ─────────────────
# Runs the actual base model and returns real token embeddings + real
# self-attention so the visualiser draws the model's true numbers, not a demo.
@app.post("/api/inspect")
def inspect(req: InspectRequest):
    return inspector.inspect(req.text, req.base_model)


@app.post("/api/infer")
def infer(req: InferRequest):
    model_dir = LATEST_MODEL_DIR["path"]
    if not model_dir or not os.path.isdir(model_dir):
        return {"error": "no trained model yet — train one first"}
    return predictor.predict(model_dir, req.text)


# ── Confusion matrix + per-class metrics from the held-out eval set ──────────
# These are computed at the END of training (see router_trainer.py) and saved
# to evals.json next to the model, so they survive a page reload. The Evals
# section in the UI reads exactly these numbers — real scikit-learn output.
@app.get("/api/evals")
def evals():
    model_dir = LATEST_MODEL_DIR["path"]
    if not model_dir or not os.path.isdir(model_dir):
        return {"error": "no trained model yet — train one first"}
    path = os.path.join(model_dir, "evals.json")
    if not os.path.isfile(path):
        return {"error": "this model has no saved evals"}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Export the trained model: download as .zip ───────────────────────────────
# Packages weights + tokenizer + config into one file you can keep, share, or
# commit to GitHub. Fully real — it's the exact folder the model loads from.
@app.get("/api/export/zip")
def export_zip():
    model_dir = LATEST_MODEL_DIR["path"]
    if not model_dir or not os.path.isdir(model_dir):
        return {"error": "no trained model yet — train one first"}
    data = exporter.zip_bytes(model_dir)
    name = f"model-lab-router-{os.path.basename(model_dir)}.zip"
    return Response(
        content=data,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )


# ── Export the trained model: push to the Hugging Face Hub ────────────────────
# A real upload to the standard model registry. The write token is used only
# for this call and is never stored or logged.
@app.post("/api/export/hf")
def export_hf(req: HubExportRequest):
    model_dir = LATEST_MODEL_DIR["path"]
    if not model_dir or not os.path.isdir(model_dir):
        return {"error": "no trained model yet — train one first"}
    return exporter.push_to_hub(model_dir, req.token, req.repo_id, req.private)
