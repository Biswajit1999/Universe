"use client";
/**
 * Command Center status cards. Each fetches its own data through an API route
 * that respects Demo/Live mode, shows a loading skeleton, degrades to an error
 * state, and carries an honest provenance Badge.
 */
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wind, Image as ImageIcon, FileText, Github, NotebookPen, ExternalLink } from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLines, Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { AskButton } from "@/components/ui/AskButton";
import { useSettings } from "@/lib/state/settings";
import { useVault } from "@/lib/state/vault";
import { fetchApod, type ApodData } from "@/lib/api/nasa";
import { fetchArxiv, type ArxivResult } from "@/lib/api/arxiv";
import { demoData } from "@/lib/demo";
import type { DataMode } from "@/lib/types";

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const run = useCallback(() => {
    setLoading(true);
    setError(false);
    fn()
      .then((d) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(run, [run]);
  return { data, error, loading, retry: run };
}

function SpaceWeatherCard() {
  const sw = demoData.spaceWeather;
  return (
    <Panel>
      <PanelHeader
        title={<span className="flex items-center gap-2"><Wind size={15} className="text-accent" /> Space Weather</span>}
        subtitle="NOAA SWPC-shaped snapshot"
        right={<Badge mode="demo" />}
      />
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Kp index" value={`${sw.kpIndex} · ${sw.kpLabel}`} />
        <Stat label="Solar wind" value={`${sw.solarWindSpeedKps} km/s`} />
        <Stat label="X-ray flux" value={sw.xrayFluxClass} />
        <Stat label="Sunspots" value={String(sw.sunspotNumber)} />
      </div>
      <p className="mt-3 text-xs text-muted">{sw.auroraChance}</p>
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-edge bg-white/[0.02] px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 font-medium text-ink">{value}</p>
    </div>
  );
}

function ApodCard() {
  const { demoMode } = useSettings();
  const { data, error, loading, retry } = useAsync<ApodData>(() => fetchApod(!demoMode), [demoMode]);
  return (
    <Panel>
      <PanelHeader
        title={<span className="flex items-center gap-2"><ImageIcon size={15} className="text-accent" /> NASA APOD</span>}
        subtitle="Astronomy Picture of the Day"
        right={data && <Badge mode={data.mode as DataMode} />}
      />
      {loading && <Skeleton className="h-40 w-full" />}
      {error && <ErrorState onRetry={retry} message="APOD unavailable — check NASA_API_KEY or use Demo Mode." />}
      {data && !loading && (
        <div>
          {data.media_type === "image" ? (
            <div className="relative h-40 w-full overflow-hidden rounded-lg border border-edge">
              {/* Uses next/image with remotePatterns; unoptimized keeps it key-free */}
              <Image src={data.url} alt={data.title} fill unoptimized className="object-cover" />
            </div>
          ) : (
            <a href={data.url} target="_blank" rel="noreferrer" className="text-sm text-accent underline">
              View media ↗
            </a>
          )}
          <p className="mt-2 text-sm font-medium">{data.title}</p>
          <p className="mt-1 line-clamp-3 text-xs text-muted">{data.explanation}</p>
          <div className="mt-3">
            <AskButton size="sm" label="Explain this image" prompt={`Explain this astronomy image: ${data.title}. ${data.explanation.slice(0, 200)}`} context="NASA APOD card" />
          </div>
        </div>
      )}
    </Panel>
  );
}

function ArxivCard() {
  const { demoMode } = useSettings();
  const { data, error, loading, retry } = useAsync<ArxivResult>(() => fetchArxiv(!demoMode, "astro-ph.EP"), [demoMode]);
  return (
    <Panel>
      <PanelHeader
        title={<span className="flex items-center gap-2"><FileText size={15} className="text-accent" /> arXiv — latest</span>}
        subtitle="astro-ph.EP preprints"
        right={data && <Badge mode={data.mode as DataMode} />}
      />
      {loading && <SkeletonLines lines={4} />}
      {error && <ErrorState onRetry={retry} />}
      {data && !loading && (
        <ul className="space-y-2.5">
          {data.papers.slice(0, 3).map((p) => (
            <li key={p.id} className="border-b border-edge pb-2 last:border-0">
              <a
                href={p.id ? `https://arxiv.org/abs/${p.id}` : "#"}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium leading-snug hover:text-accent"
              >
                {p.title}
              </a>
              <p className="mt-0.5 text-[11px] text-muted">
                {p.authors.slice(0, 3).join(", ")}
                {p.authors.length > 3 ? " et al." : ""} · {p.published}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function GithubCard() {
  const gh = demoData.githubActivity;
  return (
    <Panel>
      <PanelHeader
        title={<span className="flex items-center gap-2"><Github size={15} className="text-accent" /> GitHub Activity</span>}
        subtitle={`@${gh.username}`}
        right={<Badge mode="demo" />}
      />
      <ul className="space-y-2 text-sm">
        {gh.events.slice(0, 4).map((e, i) => (
          <li key={i} className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="font-medium text-ink">{e.repo}</span>{" "}
              <span className="text-muted">— {e.detail}</span>
            </span>
            <span className="shrink-0 text-[11px] text-muted">{e.when}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted">
        Live GitHub feed planned for v2 · see <Link href="/data" className="underline">Data Explorer</Link>.
      </p>
    </Panel>
  );
}

function NotesCard() {
  const { items } = useVault();
  const notes = items.filter((i) => i.type === "note" || i.type === "idea").slice(0, 4);
  return (
    <Panel>
      <PanelHeader
        title={<span className="flex items-center gap-2"><NotebookPen size={15} className="text-accent" /> Research Notes</span>}
        subtitle="From your Personal Vault"
        right={<Badge mode="live" />}
      />
      {notes.length === 0 ? (
        <p className="text-sm text-muted">
          No notes yet.{" "}
          <Link href="/vault" className="text-accent underline">
            Open the Vault
          </Link>{" "}
          to save ideas, or ask Universe and save its answers.
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {notes.map((n) => (
            <li key={n.id} className="truncate border-b border-edge pb-1.5 last:border-0">
              <span className="text-muted">[{n.type}]</span> {n.title}
            </li>
          ))}
        </ul>
      )}
      <Link href="/vault" className="mt-3 inline-flex items-center gap-1 text-xs text-accent">
        Manage vault <ExternalLink size={12} />
      </Link>
    </Panel>
  );
}

export function StatusCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <ApodCard />
      <SpaceWeatherCard />
      <ArxivCard />
      <GithubCard />
      <NotesCard />
    </div>
  );
}
