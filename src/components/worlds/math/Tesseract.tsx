"use client";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";

/** Rotating tesseract (4-cube) projected 4D → 3D → 2D. Pure canvas + math. */
export function Tesseract() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 16 vertices of a 4-cube
    const verts: number[][] = [];
    for (let i = 0; i < 16; i++) {
      verts.push([(i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1, (i & 8) ? 1 : -1]);
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) if (verts[i][k] !== verts[j][k]) diff++;
        if (diff === 1) edges.push([i, j]);
      }
    }

    let raf = 0;
    let a = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function rot(p: number[], i: number, j: number, ang: number) {
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const q = [...p];
      q[i] = p[i] * c - p[j] * s;
      q[j] = p[i] * s + p[j] * c;
      return q;
    }

    function frame() {
      if (!ctx || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      a += 0.01 * speedRef.current;
      const proj = verts.map((v) => {
        let p = rot(v, 0, 3, a);
        p = rot(p, 1, 2, a * 0.7);
        // 4D → 3D
        const w = 2.2 / (2.2 - p[3]);
        const x3 = p[0] * w;
        const y3 = p[1] * w;
        const z3 = p[2] * w;
        // 3D → 2D
        const d = 3 / (3 - z3);
        return [W / 2 + x3 * d * 55, H / 2 + y3 * d * 55];
      });
      ctx.lineWidth = 1;
      for (const [i, j] of edges) {
        ctx.strokeStyle = "rgba(196,181,253,0.5)";
        ctx.beginPath();
        ctx.moveTo(proj[i][0], proj[i][1]);
        ctx.lineTo(proj[j][0], proj[j][1]);
        ctx.stroke();
      }
      for (const p of proj) {
        ctx.fillStyle = "#7dd3fc";
        ctx.beginPath();
        ctx.arc(p[0], p[1], 2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Panel>
      <PanelHeader title="Hypercube (Tesseract)" subtitle="A 4-cube projected into 2D" right={<Badge mode="simulated" />} />
      <div className="overflow-hidden rounded-lg border border-edge bg-black/20">
        <canvas ref={ref} width={360} height={240} className="h-auto w-full" />
      </div>
      <div className="mt-3">
        <Slider label="Rotation speed" unit="×" value={speed} min={0} max={4} step={0.25} onChange={setSpeed} />
      </div>
      <p className="mt-3 text-xs text-muted">
        The tesseract has 16 vertices and 32 edges. We rotate it in two 4D planes, then project 4D→3D→2D — the &ldquo;cube inside a cube&rdquo; is that shadow.
      </p>
    </Panel>
  );
}
