"use client";
import { Icon } from "@/components/nav/icons";
import { UniverseScene } from "@/components/three/UniverseScene";

export function WorldHero({ icon, color, name }: { icon: string; color: string; name: string }) {
  return (
    <div
      className="group relative flex h-52 items-center justify-center overflow-hidden rounded-xl border border-edge bg-[#050712] sm:h-64"
      style={{ boxShadow: `inset 0 0 80px ${color}12, 0 24px 80px rgba(0,0,0,0.24)` }}
    >
      <UniverseScene color={color} compact />

      <div
        className="pointer-events-none relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border bg-[#07101d]/75 backdrop-blur-md transition duration-500 group-hover:scale-105 sm:h-24 sm:w-24"
        style={{ borderColor: `${color}66`, boxShadow: `0 0 55px ${color}38, inset 0 0 30px ${color}12`, color }}
      >
        <Icon name={icon} size={38} />
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-3 z-10 flex items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{name}</span>
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]" style={{ color }}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: color }} />
          Interactive spatial model
        </span>
      </div>
    </div>
  );
}
