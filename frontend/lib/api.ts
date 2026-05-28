// Thin client for the Python training backend (FastAPI on :8000).
const BASE = process.env.NEXT_PUBLIC_API ?? "http://localhost:8000";

export type Label = {
  id: string; en: string; he: string; route_to: string; why: string;
};
export type Row = { text: string; label: string };

export async function getDataset(task = "router"): Promise<{ labels: Label[]; rows: Row[] }> {
  const r = await fetch(`${BASE}/api/dataset?task=${encodeURIComponent(task)}`);
  return r.json();
}

export async function getHealth() {
  const r = await fetch(`${BASE}/api/health`);
  return r.json();
}

export type TrainConfig = {
  rows: Row[];
  task?: string;
  base_model: string;
  epochs: number;
  lr: number;
  batch_size: number;
  test_size: number;
};

export async function startTraining(cfg: TrainConfig): Promise<{ job_id: string }> {
  const r = await fetch(`${BASE}/api/train`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cfg),
  });
  return r.json();
}

// Open the Server-Sent-Events stream and call onEvent for each progress event.
export function streamTraining(jobId: string, onEvent: (e: any) => void): EventSource {
  const es = new EventSource(`${BASE}/api/train/${jobId}/stream`);
  es.onmessage = (m) => {
    try { onEvent(JSON.parse(m.data)); } catch {}
  };
  return es;
}

export async function tokenize(text: string, base_model?: string): Promise<{ count: number; tokens: { piece: string; id: number }[] }> {
  const r = await fetch(`${BASE}/api/tokenize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, base_model }),
  });
  return r.json();
}

export type Inspect = {
  tokens: { piece: string; id: number }[];
  embeddings: number[][];
  attention: number[][];
  heads: number[][][];
  hidden_size: number;
  num_heads: number;
  num_layers: number;
};

// Real model internals (embeddings + attention) from a live forward pass.
export async function inspect(text: string, base_model?: string): Promise<Inspect> {
  const r = await fetch(`${BASE}/api/inspect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, base_model }),
  });
  if (!r.ok) throw new Error(`inspect ${r.status}`);
  return r.json();
}

export type PerClass = {
  id: string; precision: number; recall: number; f1: number; support: number;
};
export type Evals = {
  labels: string[];
  confusion: number[][];
  per_class: PerClass[];
  accuracy: number;
  macro_f1: number;
  weighted_f1: number;
  n_eval: number;
  base_model: string;
  error?: string;
};

// Confusion matrix + per-class metrics for the latest trained model.
export async function getEvals(task = "router"): Promise<Evals> {
  const r = await fetch(`${BASE}/api/evals?task=${encodeURIComponent(task)}`);
  return r.json();
}

// Trigger a browser download of the trained model as a .zip.
export function exportZipUrl(task = "router"): string {
  return `${BASE}/api/export/zip?task=${encodeURIComponent(task)}`;
}

export type HubResult = { url?: string; repo_id?: string; user?: string; private?: boolean; error?: string };

// Push the trained model to the Hugging Face Hub. Token is sent once, not stored.
export async function exportToHub(token: string, repo_id: string, isPrivate: boolean, task = "router"): Promise<HubResult> {
  const r = await fetch(`${BASE}/api/export/hf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, repo_id, private: isPrivate, task }),
  });
  return r.json();
}

export type InferResult = {
  top?: string;
  probs?: { label: string; prob: number }[];
  by_label?: { label: string; logit: number; prob: number }[];
  error?: string;
};

export async function infer(text: string, task = "router"): Promise<InferResult> {
  const r = await fetch(`${BASE}/api/infer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, task }),
  });
  return r.json();
}
