"""Quick end-to-end check: fetch dataset -> train -> stream -> infer."""
import json, urllib.request, time

BASE = "http://localhost:8000"

def post(path, payload):
    req = urllib.request.Request(BASE + path, data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))

# 1. dataset
ds = json.load(urllib.request.urlopen(BASE + "/api/dataset"))
print(f"dataset: {len(ds['rows'])} rows, {len(ds['labels'])} labels")

# 2. train (small/fast: 2 epochs)
job = post("/api/train", {"rows": ds["rows"], "epochs": 2, "batch_size": 8})
print("job:", job)

# 3. stream
last = None
with urllib.request.urlopen(f"{BASE}/api/train/{job['job_id']}/stream") as r:
    for raw in r:
        line = raw.decode().strip()
        if line.startswith("data:"):
            ev = json.loads(line[5:])
            if ev["type"] == "log" and ev.get("loss") is not None:
                print(f"  step {ev['step']:>3}  loss={ev['loss']:.4f}")
            elif ev["type"] in ("info", "eval", "done", "error", "start"):
                print(" ", ev.get("type"), ev.get("message") or ev.get("metrics") or ev.get("total_steps") or "")
                last = ev
            if ev["type"] in ("done", "error"):
                break

# 4. infer
print("infer:", post("/api/infer", {"text": "כתוב פונקציה בפייתון שממיינת מערך"}))
print("infer:", post("/api/infer", {"text": "write a haiku about the moon"}))
