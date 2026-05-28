// Thin client for the Python training backend (FastAPI on :8000).
const BASE = process.env.NEXT_PUBLIC_API ?? "http://localhost:8000";

export type Label = {
  id: string; en: string; he: string; route_to: string; why: string;
};
export type Row = { text: string; label: string };

export async function getDataset(): Promise<{ labels: Label[]; rows: Row[] }> {
  const r = await fetch(`${BASE}/api/dataset`);
  return r.json();
}

export async function getHealth() {
  const r = await fetch(`${BASE}/api/health`);
  return r.json();
}

export type TrainConfig = {
  rows: Row[];
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

export async function infer(text: string) {
  const r = await fetch(`${BASE}/api/infer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return r.json();
}
