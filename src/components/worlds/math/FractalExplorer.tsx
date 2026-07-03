"use client";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";

/** Mandelbrot set renderer on a canvas. Escape-time colouring. */
export function FractalExplorer() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [maxIter, setMaxIter] = useState(80);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const img = ctx.createImageData(W, H);
    const cx = -0.6;
    const cy = 0;
    const scale = 3 / zoom;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x0 = cx + (px / W - 0.5) * scale;
        const y0 = cy + (py / H - 0.5) * scale * (H / W);
        let x = 0;
        let y = 0;
        let iter = 0;
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xt = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xt;
          iter++;
        }
        const idx = (py * W + px) * 4;
        if (iter === maxIter) {
          img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = 6;
        } else {
          const t = iter / maxIter;
          img.data[idx] = Math.floor(60 + 195 * t); // R
          img.data[idx + 1] = Math.floor(120 * t + 40); // G
          img.data[idx + 2] = Math.floor(180 + 75 * (1 - t)); // B
        }
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [maxIter, zoom]);

  return (
    <Panel>
      <PanelHeader title="Fractal Explorer" subtitle="The Mandelbrot set, rendered live" right={<Badge mode="simulated" />} />
      <div className="overflow-hidden rounded-lg border border-edge">
        <canvas ref={ref} width={360} height={240} className="h-auto w-full" />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="Max iterations" value={maxIter} min={20} max={300} step={10} onChange={setMaxIter} />
        <Slider label="Zoom" unit="×" value={zoom} min={0.5} max={8} step={0.5} onChange={setZoom} />
      </div>
      <p className="mt-3 text-xs text-muted">
        Each pixel c is coloured by how quickly zₙ₊₁ = zₙ² + c escapes to infinity. Black points never escape — that boundary is the fractal.
      </p>
    </Panel>
  );
}
