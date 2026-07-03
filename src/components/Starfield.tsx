"use client";
/**
 * Animated starfield background — pure canvas, no Three.js needed for the
 * ambient layer (R3F is reserved for the world hero scenes). Cheap, respects
 * reduced-motion, and covers the fixed background behind all pages.
 */
import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number; // depth for parallax + twinkle
  r: number;
}

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let t = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas || !ctx) return;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(220, Math.floor((w * h) / 7000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        r: Math.random() * 1.3 + 0.2,
      }));
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      // faint nebula wash
      const grd = ctx.createRadialGradient(w * 0.7, h * 0.25, 0, w * 0.7, h * 0.25, Math.max(w, h) * 0.8);
      grd.addColorStop(0, "rgba(124,58,237,0.06)");
      grd.addColorStop(0.5, "rgba(56,189,248,0.03)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        const twinkle = reduce ? 0.8 : 0.55 + 0.45 * Math.sin(t * 0.002 + s.z * 12);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${180 + s.z * 60}, ${210 + s.z * 30}, 255, ${twinkle * (0.4 + s.z * 0.6)})`;
        ctx.fill();
        if (!reduce) {
          s.y += (0.02 + s.z * 0.05); // slow drift
          if (s.y > h) s.y = 0;
        }
      }
      t += 16;
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
