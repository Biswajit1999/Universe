import { Greeting } from "@/components/command/Greeting";
import { CommandBar } from "@/components/command/CommandBar";
import { StatusCards } from "@/components/command/StatusCards";
import { UniverseScene } from "@/components/three/UniverseScene";

export const metadata = { title: "Command Center · UNIVERSE" };

export default function CommandCenter() {
  return (
    <div className="space-y-8">
      <section className="command-scene relative min-h-[390px] overflow-hidden rounded-2xl border border-edge bg-[#050712] shadow-2xl shadow-black/20">
        <UniverseScene />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050712] via-[#050712]/90 to-transparent" />
        <div className="relative z-10 flex min-h-[390px] items-center px-5 py-10 sm:px-9 lg:px-12">
          <div className="w-full max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />
              Spatial research interface online
            </div>
            <Greeting />
            <div className="mt-7">
              <CommandBar />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-4 right-5 hidden items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-sky-100/45 sm:flex">
          <span>WebGL telemetry</span>
          <span className="h-px w-16 bg-gradient-to-r from-sky-300/60 to-transparent" />
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Status</h2>
        <StatusCards />
      </section>
    </div>
  );
}
