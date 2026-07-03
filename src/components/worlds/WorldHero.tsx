"use client";
/**
 * Symbolic animated hero visual for each world. Pure SVG/CSS (no Three.js in
 * the MVP hero to keep bundle + build light); the icon and motion vary per
 * world via the `icon` and `color` fields. R3F scenes can drop in here in v2.
 */
import { Icon } from "@/components/nav/icons";

export function WorldHero({ icon, color, name }: { icon: string; color: string; name: string }) {
  return (
    <div
      className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border border-edge sm:h-56"
      style={{ background: `radial-gradient(120% 100% at 70% 20%, ${color}22, transparent 60%)` }}
    >
      {/* orbital rings */}
      <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 400 240" aria-hidden>
        <g fill="none" stroke={color} strokeOpacity="0.35">
          <ellipse cx="200" cy="120" rx="150" ry="52" className="animate-spin-slow" style={{ transformOrigin: "200px 120px" }} />
          <ellipse cx="200" cy="120" rx="110" ry="88" strokeOpacity="0.2" />
          <ellipse cx="200" cy="120" rx="170" ry="30" strokeOpacity="0.15" transform="rotate(28 200 120)" />
        </g>
        <circle cx="350" cy="120" r="3" fill={color} className="animate-pulse-slow" />
        <circle cx="70" cy="90" r="2" fill="#e8ecf8" />
        <circle cx="300" cy="60" r="2" fill={color} />
        <circle cx="120" cy="180" r="2" fill="#e8ecf8" />
      </svg>

      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-2xl border"
        style={{ borderColor: `${color}55`, background: `${color}18`, boxShadow: `0 0 40px ${color}33` }}
      >
        <Icon name={icon} size={34} />
      </div>
      <span className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        {name}
      </span>
    </div>
  );
}
