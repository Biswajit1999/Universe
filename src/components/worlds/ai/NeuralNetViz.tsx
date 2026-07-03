"use client";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";

/** Animated feed-forward network: layers of neurons with a travelling
 *  activation pulse along the edges. Illustrative, not a trained model. */
export function NeuralNetViz() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [hidden, setHidden] = useState(3);
  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function frame() {
      if (!ctx || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const layers = [4, hiddenRef.current * 2, hiddenRef.current * 2, 2];
      const positions: [number, number][][] = layers.map((count, li) => {
        const x = 40 + (li * (W - 80)) / (layers.length - 1);
        return Array.from({ length: count }, (_, ni) => {
          const y = (H * (ni + 1)) / (count + 1);
          return [x, y] as [number, number];
        });
      });

      // edges with pulse
      for (let li = 0; li < positions.length - 1; li++) {
        for (const a of positions[li]) {
          for (const b of positions[li + 1]) {
            const phase = (t * 0.02 - li * 0.5) % 1;
            ctx.strokeStyle = "rgba(125,211,252,0.12)";
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
            if (!reduce && phase > 0 && phase < 1) {
              const px = a[0] + (b[0] - a[0]) * phase;
              const py = a[1] + (b[1] - a[1]) * phase;
              ctx.fillStyle = "rgba(252,211,77,0.8)";
              ctx.beginPath();
              ctx.arc(px, py, 1.6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      // neurons
      for (const layer of positions) {
        for (const [x, y] of layer) {
          ctx.fillStyle = "#c4b5fd";
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(196,181,253,0.4)";
          ctx.stroke();
        }
      }
      t += 1;
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Panel>
      <PanelHeader title="Neural Network Visualiser" subtitle="Forward pass through a feed-forward net" right={<Badge mode="simulated" />} />
      <div className="overflow-hidden rounded-lg border border-edge bg-black/20">
        <canvas ref={ref} width={360} height={220} className="h-auto w-full" />
      </div>
      <div className="mt-3">
        <Slider label="Hidden layer width" value={hidden} min={1} max={6} step={1} onChange={setHidden} />
      </div>
      <p className="mt-3 text-xs text-muted">
        Each layer computes h = σ(Wx + b). The yellow pulses trace signal flowing forward; training adjusts the weights W on every edge via backpropagation.
      </p>
    </Panel>
  );
}
