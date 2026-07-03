"use client";
import { useState } from "react";
import { Sunrise, Rocket, FileText, Cpu, Github, ListChecks, GraduationCap, Hammer, Download, Save } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { AskButton } from "@/components/ui/AskButton";
import { useVault } from "@/lib/state/vault";
import { demoData } from "@/lib/demo";
import { downloadMarkdown, greeting } from "@/lib/utils";

/** Composes a morning briefing from bundled demo feeds + rotating suggestions. */
function buildBriefingMarkdown(): string {
  const apod = demoData.apod;
  const papers = demoData.arxiv.papers.slice(0, 3);
  const gh = demoData.githubActivity.events.slice(0, 2);
  const learn = SUGGEST_LEARN[new Date().getDate() % SUGGEST_LEARN.length];
  const build = SUGGEST_BUILD[new Date().getDate() % SUGGEST_BUILD.length];
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return `# Morning Briefing — ${date}

## Today in space (Demo)
**${apod.title}** — ${apod.explanation.slice(0, 180)}…

## Latest science papers (Demo)
${papers.map((p) => `- **${p.title}** — ${p.authors[0]} et al. (${p.published})`).join("\n")}

## AI / technology
- Track new model releases and safety research; keep a running note of one technique to try.

## Your GitHub activity (Demo)
${gh.map((e) => `- ${e.repo}: ${e.detail} (${e.when})`).join("\n")}

## Research tasks
- [ ] One deep-work block on your current primary project
- [ ] Read one paper end-to-end and log the key claim
- [ ] Commit something, however small

## Suggested learning topic
${learn}

## Suggested build idea
${build}
`;
}

const SUGGEST_LEARN = [
  "Bayesian inference for parameter estimation — start with a coin-flip example, then a transit fit.",
  "The Fourier transform in practice — periodograms for time-series.",
  "Gaussian processes for detrending noisy signals.",
  "Attention mechanisms — read the annotated transformer.",
  "Robust statistics — why the median beats the mean under outliers.",
];
const SUGGEST_BUILD = [
  "A tiny CLI that downloads a TESS light curve and plots it.",
  "A Streamlit/Next app that queries the Exoplanet Archive and charts radius vs period.",
  "A PID tuning playground with a live plant simulation.",
  "A Markdown → arXiv-style PDF template with one command.",
  "A daily cron that emails you the newest astro-ph.EP abstracts.",
];

export function Briefing() {
  const { add } = useVault();
  const [generated, setGenerated] = useState(false);
  const [md, setMd] = useState("");
  const [greet, setGreet] = useState("Good morning");

  function generate() {
    setGreet(greeting());
    setMd(buildBriefingMarkdown());
    setGenerated(true);
  }

  const cards = [
    { icon: Rocket, title: "Today in space", body: demoData.apod.title, mode: "demo" as const },
    { icon: FileText, title: "Latest papers", body: `${demoData.arxiv.papers.length} new astro-ph.EP preprints`, mode: "demo" as const },
    { icon: Cpu, title: "AI / tech", body: "Track releases + one technique to try", mode: "estimated" as const },
    { icon: Github, title: "GitHub activity", body: demoData.githubActivity.events[0].detail, mode: "demo" as const },
    { icon: ListChecks, title: "Research tasks", body: "3 focus tasks queued", mode: "live" as const },
    { icon: GraduationCap, title: "Learn today", body: SUGGEST_LEARN[new Date().getDate() % SUGGEST_LEARN.length], mode: "estimated" as const },
    { icon: Hammer, title: "Build idea", body: SUGGEST_BUILD[new Date().getDate() % SUGGEST_BUILD.length], mode: "estimated" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={generate}
          className="inline-flex items-center gap-2 rounded-lg bg-accent/20 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent/30"
        >
          <Sunrise size={16} /> Generate morning briefing
        </button>
        {generated && (
          <>
            <button onClick={() => downloadMarkdown("morning-briefing", md)} className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2.5 text-sm hover:bg-white/5">
              <Download size={15} /> Export
            </button>
            <button onClick={() => add({ type: "report", title: `Briefing — ${new Date().toLocaleDateString()}`, content: md })} className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2.5 text-sm hover:bg-white/5">
              <Save size={15} /> Save to Vault
            </button>
            <AskButton label="Summarise my day" prompt="Based on my morning briefing, what are the three highest-leverage things to focus on today?" context="Daily Briefing" />
          </>
        )}
      </div>

      {generated && <p className="text-sm text-muted">{greet}, Biswajit — here is your briefing.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Panel key={c.title}>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <c.icon size={15} className="text-accent" /> {c.title}
              </span>
              <Badge mode={c.mode} />
            </div>
            <p className="text-xs text-muted">{c.body}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
