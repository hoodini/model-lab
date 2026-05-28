"use client";

// A bespoke SVG line chart for the live loss curve. Built by hand (no chart
// library) so it exactly matches the Fly High palette and updates smoothly as
// SSE events stream in. Training loss = purple line; eval loss = yellow dots.

export type Point = { step: number; loss?: number; evalLoss?: number };

export function LossChart({ points }: { points: Point[] }) {
  const W = 640, H = 280, PAD = 40;
  const losses = points.filter((p) => p.loss != null) as Required<Pick<Point, "step" | "loss">>[];
  const evals = points.filter((p) => p.evalLoss != null);

  const allY = [
    ...losses.map((p) => p.loss!),
    ...evals.map((p) => p.evalLoss!),
  ];
  const maxStep = Math.max(1, ...points.map((p) => p.step));
  const maxY = Math.max(0.1, ...allY);
  const minY = 0;

  const x = (step: number) => PAD + (step / maxStep) * (W - 2 * PAD);
  const y = (val: number) => H - PAD - ((val - minY) / (maxY - minY)) * (H - 2 * PAD);

  const linePath = losses
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.step).toFixed(1)} ${y(p.loss!).toFixed(1)}`)
    .join(" ");

  // Horizontal gridlines (charcoal, low opacity — design system rule).
  const ticks = 4;
  const gridY = Array.from({ length: ticks + 1 }, (_, i) => minY + ((maxY - minY) * i) / ticks);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", background: "#fff", border: "2px solid #000" }}>
      {gridY.map((g, i) => (
        <g key={i}>
          <line x1={PAD} x2={W - PAD} y1={y(g)} y2={y(g)} stroke="#000" strokeOpacity={0.12} strokeWidth={1} />
          <text x={8} y={y(g) + 4} fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#000" fillOpacity={0.6}>
            {g.toFixed(2)}
          </text>
        </g>
      ))}

      {/* training loss line */}
      {losses.length > 1 && (
        <path d={linePath} fill="none" stroke="#5E17EB" strokeWidth={2.5} />
      )}

      {/* eval loss markers */}
      {evals.map((p, i) => (
        <circle key={i} cx={x(p.step)} cy={y(p.evalLoss!)} r={5} fill="#FFEC00" stroke="#000" strokeWidth={1.5} />
      ))}

      {/* axis labels */}
      <text x={W / 2} y={H - 8} fontSize={12} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fill="#000" fillOpacity={0.7}>
        training step →
      </text>
    </svg>
  );
}
