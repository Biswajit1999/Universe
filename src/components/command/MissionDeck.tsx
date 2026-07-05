"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  BrainCircuit,
  Cloud,
  Cpu,
  Mic,
  Radio,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { UniverseScene } from "@/components/three/UniverseScene";
import { CommandBar } from "@/components/command/CommandBar";
import { useSettings } from "@/lib/state/settings";
import { UNIVERSE_AGENTS } from "@/lib/agents/registry";
import { askUniverse, greeting } from "@/lib/utils";

function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <time className="command-clock" dateTime={now?.toISOString()}>
      {now?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "--:--"}
    </time>
  );
}

function SystemSignal({ icon: Icon, label, detail }: { icon: typeof Cpu; label: string; detail: string }) {
  return (
    <div className="command-signal">
      <span className="command-signal-icon"><Icon size={14} /></span>
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}

export function MissionDeck() {
  const { userName, demoMode } = useSettings();
  const salutation = useMemo(() => greeting(), []);
  const readyAgents = UNIVERSE_AGENTS.filter((agent) => agent.status === "ready").length;
  const [desktop, setDesktop] = useState(false);

  useEffect(() => setDesktop(window.universeDesktop?.isDesktop === true), []);

  const openVoice = () => askUniverse(undefined, "Voice command nexus");

  return (
    <section className="command-canvas" aria-label="Universe personal command center">
      <div className="command-aurora" aria-hidden />

      <header className="command-topline">
        <div className="command-presence">
          <span className="command-presence-dot" />
          <span>UNIVERSE is awake</span>
        </div>
        <div className="command-topline-meta">
          <span><Radio size={12} /> {demoMode ? "Simulation" : "Live links"}</span>
          <Clock />
        </div>
      </header>

      <div className="command-stage">
        <UniverseScene compact color="#63e6ff" />
        <div className="command-depth-ring ring-a" aria-hidden />
        <div className="command-depth-ring ring-b" aria-hidden />

        <div className="command-copy">
          <p className="command-eyebrow">Personal intelligence · local first</p>
          <h1>{salutation}, <span>{userName}</span>.</h1>
          <p className="command-prompt">What shall we explore?</p>
        </div>

        <button type="button" onClick={openVoice} className="command-core" aria-label="Begin speaking with Universe">
          <span className="command-core-halo halo-outer" />
          <span className="command-core-halo halo-inner" />
          <span className="command-core-glyph"><Sparkles size={24} /></span>
          <span className="command-core-action"><Mic size={14} /> Speak</span>
        </button>

        <div className="command-signals" aria-label="System availability">
          <SystemSignal icon={desktop ? Cpu : Cloud} label={desktop ? "Local core" : "Cloud core"} detail="Available" />
          <SystemSignal icon={BrainCircuit} label={`${readyAgents} agents`} detail="Standing by" />
          <SystemSignal icon={ShieldCheck} label="Private memory" detail="Protected" />
        </div>

        <div className="command-agent-glimpse" aria-label="Available specialist agents">
          <Bot size={13} />
          {UNIVERSE_AGENTS.slice(0, 4).map((agent) => <span key={agent.id}>{agent.name}</span>)}
        </div>
      </div>

      <div className="command-channel">
        <div className="command-channel-label"><Waves size={13} /> Ask, speak, or direct Universe</div>
        <CommandBar />
      </div>
    </section>
  );
}
