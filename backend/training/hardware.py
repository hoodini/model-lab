"""
hardware.py
===========
One job: look at whatever machine this is running on and pick the best place to
do the math — with zero configuration from the user. You should NOT need to know
whether you have a gaming GPU, an Apple laptop, or just a CPU. The code finds out.

Three kinds of compute device, in order of preference:

  1. CUDA  — an NVIDIA GPU (gaming/workstation/datacenter). Fastest by far.
  2. MPS   — Apple Silicon (M1/M2/M3...) GPU via Metal. Great on Macs.
  3. CPU   — always available, slowest. Training still works, just slower.

We also pick a numeric PRECISION (dtype):

  - bfloat16 ("bf16") on modern NVIDIA (Ampere+/RTX 30xx, 40xx, A100, H100) and
    on CPUs that support it. Half the memory of float32, almost no accuracy loss.
  - float16 ("fp16") on older CUDA GPUs that lack bf16.
  - float32 everywhere else (the safe default).

Lower precision = less memory + faster training. That is what "Mixed Precision"
means: keep the heavy matrix multiplies in 16-bit, keep the sensitive bits in
32-bit. The Trainer does the mixing for us once we tell it which to use.
"""

from dataclasses import dataclass


@dataclass
class Device:
    kind: str          # "cuda" | "mps" | "cpu"
    name: str          # human-readable, e.g. "NVIDIA GeForce RTX 4090" or "Apple M2"
    dtype: str         # "bfloat16" | "float16" | "float32"
    bf16: bool         # pass to TrainingArguments(bf16=...)
    fp16: bool         # pass to TrainingArguments(fp16=...)
    total_memory_gb: float | None  # device VRAM if known


def detect() -> Device:
    """Inspect the machine and return the best Device. Never raises — falls back
    to CPU/float32 if torch isn't importable or anything looks off."""
    try:
        import torch
    except Exception:
        return Device("cpu", "CPU (torch unavailable)", "float32", False, False, None)

    # ── 1. NVIDIA GPU ────────────────────────────────────────────────────────
    if torch.cuda.is_available():
        name = torch.cuda.get_device_name(0)
        props = torch.cuda.get_device_properties(0)
        total_gb = round(props.total_memory / (1024 ** 3), 1)
        # bf16 needs compute capability >= 8.0 (Ampere and newer).
        supports_bf16 = bool(getattr(torch.cuda, "is_bf16_supported", lambda: False)())
        if supports_bf16:
            return Device("cuda", name, "bfloat16", True, False, total_gb)
        return Device("cuda", name, "float16", False, True, total_gb)

    # ── 2. Apple Silicon GPU (Metal) ─────────────────────────────────────────
    mps = getattr(torch.backends, "mps", None)
    if mps is not None and mps.is_available():
        # fp16/bf16 autocast on MPS is still flaky in many torch versions, so we
        # train in float32 on Apple GPUs for correctness. Still much faster than CPU.
        return Device("mps", "Apple Silicon GPU (MPS)", "float32", False, False, None)

    # ── 3. CPU fallback ──────────────────────────────────────────────────────
    # Some CPUs accelerate bfloat16, but for predictable behavior we stay fp32.
    import platform
    cpu_name = platform.processor() or platform.machine() or "CPU"
    return Device("cpu", f"CPU ({cpu_name})", "float32", False, False, None)


def summary(dev: Device) -> dict:
    """A small JSON-friendly dict for the /api/health endpoint and the UI."""
    return {
        "device": dev.kind,
        "device_name": dev.name,
        "dtype": dev.dtype,
        "mixed_precision": dev.bf16 or dev.fp16,
        "total_memory_gb": dev.total_memory_gb,
    }


def _system_ram_gb():
    """Best-effort total system RAM in GB, cross-platform, never raises."""
    try:
        import psutil
        return round(psutil.virtual_memory().total / (1024 ** 3), 1)
    except Exception:
        pass
    try:
        import platform, os
        if platform.system() == "Windows":
            import ctypes

            class _MS(ctypes.Structure):
                _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong),
                            ("ullTotalPhys", ctypes.c_ulonglong), ("ullAvailPhys", ctypes.c_ulonglong),
                            ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                            ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong),
                            ("ullAvailExtendedVirtual", ctypes.c_ulonglong)]

            m = _MS()
            m.dwLength = ctypes.sizeof(_MS)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))
            return round(m.ullTotalPhys / (1024 ** 3), 1)
        return round(os.sysconf("SC_PHYS_PAGES") * os.sysconf("SC_PAGE_SIZE") / (1024 ** 3), 1)
    except Exception:
        return None


def full_report() -> dict:
    """Everything the 'will it run here?' advisor needs: device, VRAM, RAM, CPU.
    VRAM is the GPU budget (CUDA); on Apple Silicon memory is unified so the GPU
    budget is the system RAM; on CPU there's no GPU budget."""
    import os, platform
    dev = detect()
    ram = _system_ram_gb()
    if dev.kind == "cuda":
        gpu_budget = dev.total_memory_gb
    elif dev.kind == "mps":
        gpu_budget = ram  # unified memory
    else:
        gpu_budget = None
    return {
        **summary(dev),
        "vram_gb": dev.total_memory_gb,
        "ram_gb": ram,
        "gpu_budget_gb": gpu_budget,
        "cpu": platform.processor() or platform.machine() or "CPU",
        "cores": os.cpu_count(),
    }
