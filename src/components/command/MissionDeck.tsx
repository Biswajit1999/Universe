"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  Bot,
  BrainCircuit,
  Cpu,
  Database,
  HardDrive,
  LockKeyhole,
  Mic,
  Orbit,
  Radio,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { UniverseScene } from "@/components/three/UniverseScene";
import { CommandBar } from "@/components/command/CommandBar";
import { useSettings } from "@/lib/state/settings";
import { UNIVERSE_AGENTS, UNIVERSE_PLUGINS } from "@/lib/agents/registry";
import { askUniverse, cn, greeting } from "@/lib/utils";

function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="text-right font-mono">
      <p className="text-[9px] tracking-[0.22em] text-cyan-100/45">LOCAL TIME</p>
      <p className="text-xs font-semibold tracking-[0.16em] text-cyan-100">
        {now?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) ?? "--:--:--"}
      </p>
    </div>
  );
}

function Gauge({ label, value, detail }: { label: string; value: number; detail: string }) {
  const style = { "--gauge": `${value * 3.6}deg` } as CSSProperties;
  return (
    <div className="hud-gauge-row">
      <div className="hud-mini-gauge" style={style}>
        <span>{value}</span>
      </div>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">{label}</p>
        <p className="mt-0.5 text-[9px] text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function TelemetryLine({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-cyan-300/10 bg-cyan-300/[0.025] px-2.5 py-2">
      <Icon size={13} className="text-cyan-300/70" />
      <div className="min-w-0 flex-1">
        <p className="text-[8px] uppercase tracking-[0.16em] text-slate-600">{label}</p>
        <p className="truncate font-mono text-[9px] text-cyan-50/80">{value}</p>
      </div>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#6ee7b7]" />
    </div>
  );
}

function Telemetry({ desktop }: { desktop: boolean }) {
  return (
    <aside className="hud-side-panel hud-clip-left">
      <div className="hud-panel-heading">
        <Activity size={13} />
        <span>Core telemetry</span>
      </div>
      <div className="space-y-3 py-3">
        <Gauge label="Intelligence" value={92} detail="Gemini reasoning link" />
        <Gauge label="Knowledge" value={78} detail="Scientific context loaded" />
        <Gauge label="Privacy" value={100} detail="Private repository" />
      </div>
      <div className="hud-divider" />
      <div className="space-y-2 pt-3">
        <TelemetryLine icon={Cpu} label="Runtime" value={desktop ? "DESKTOP CORE" : "WEB CORE"} />
        <TelemetryLine icon={HardDrive} label="Memory" value="LOCAL VAULT" />
        <TelemetryLine icon={Database} label="Data bus" value="LIVE / DEMO" />
        <TelemetryLine icon={ShieldCheck} label="Secrets" value="SERVER SIDE" />
      </div>
    </aside>
  );
}

function AgentMatrix() {
  return (
    <aside className="hud-side-panel hud-clip-right">
      <div className="hud-panel-heading">
        <BrainCircuit size={13} />
        <span>Agent constellation</span>
      </div>
      <div className="space-y-2 py-3">
        {UNIVERSE_AGENTS.map((agent) => (
          <div key={agent.id} className="hud-agent-row">
            <span className="hud-agent-node" style={{ borderColor: agent.accent, color: agent.accent }}>
              {agent.status === "locked" ? <LockKeyhole size={11} /> : <Bot size={11} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold text-cyan-50">{agent.name}</p>
                <span className={cn(
                  "text-[7px] uppercase tracking-[0.14em]",
                  agent.status === "ready" ? "text-emerald-300" : agent.status === "locked" ? "text-rose-300" : "text-amber-200",
                )}>
                  {agent.status}
                </span>
              </div>
              <p className="truncate text-[8px] text-slate-500">{agent.role}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="hud-divider" />
      <div className="pt-3">
        <p className="mb-2 text-[8px] uppercase tracking-[0.2em] text-cyan-100/45">Plugin bus</p>
        <div className="grid grid-cols-2 gap-1.5">
          {UNIVERSE_PLUGINS.map((plugin) => (
            <div key={plugin.id} className="rounded border border-cyan-300/10 bg-black/20 px-2 py-2">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  plugin.state === "connected" ? "bg-emerald-300" : plugin.state === "desktop-only" ? "bg-rose-300" : "bg-cyan-300",
                )} />
                <p className="truncate text-[8px] text-slate-300">{plugin.name}</p>
              </div>
              <p className="mt-1 text-[7px] uppercase tracking-wider text-slate-600">{plugin.scope}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function MissionDeck() {
  const { userName, demoMode } = useSettings();
  const salutation = useMemo(() => greeting(), []);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => setDesktop(window.universeDesktop?.isDesktop === true), []);

  return (
    <section className="hud-deck" aria-label="Universe personal command center">
      <div className="hud-corner corner-tl" />
      <div className="hud-corner corner-tr" />
      <div className="hud-corner corner-bl" />
      <div className="hud-corner corner-br" />

      <header className="hud-deck-header">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
          </span>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan-100/80">Universe personal intelligence</p>
            <p className="mt-0.5 text-[8px] uppercase tracking-[0.17em] text-slate-600">Secure command nexus · node BJ-01</p>
          </div>
        </div>
        <div className="hidden items-center gap-5 sm:flex">
          <span className="flex items-center gap-1.5 rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] px-2.5 py-1 text-[8px] uppercase tracking-wider text-cyan-100/60">
            <Radio size={10} className={demoMode ? "text-sky-300" : "text-emerald-300"} />
            {demoMode ? "Simulation data" : "Live data links"}
          </span>
          <Clock />
        </div>
      </header>

      <div className="hud-deck-grid">
        <Telemetry desktop={desktop} />

        <div className="hud-core-stage">
          <UniverseScene compact color="#45e6ff" />
          <div className="hud-radar-sweep" />
          <div className="relative z-10 flex h-full flex-col items-center justify-between py-5 text-center">
            <div>
              <p className="text-[9px] uppercase tracking-[0.34em] text-cyan-100/45">Cognitive core online</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {salutation}, <span className="text-gradient">{userName}</span>.
              </h1>
            </div>

            <button
              type="button"
              onClick={() => askUniverse(undefined, "Voice command nexus")}
              className="hud-core-activation"
              aria-label="Open voice link to Universe"
            >
              <span className="hud-core-label">
                <Sparkles size={15} />
                UNIVERSE
              </span>
            </button>

            <button
              type="button"
              onClick={() => askUniverse(undefined, "Voice command nexus")}
              className="group flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.06] px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/10"
            >
              <Mic size={13} className="text-cyan-300 transition group-hover:scale-110" />
              Initiate voice link
              <Waves size={13} className="text-cyan-300/60" />
            </button>
          </div>
        </div>

        <AgentMatrix />
      </div>

      <div className="hud-command-dock">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.2em] text-cyan-100/45">
            <Orbit size={10} /> Natural language command channel
          </span>
          <span className="font-mono text-[8px] text-emerald-300/65">AUTHENTICATED · BISWAJIT</span>
        </div>
        <CommandBar />
      </div>
    </section>
  );
}
