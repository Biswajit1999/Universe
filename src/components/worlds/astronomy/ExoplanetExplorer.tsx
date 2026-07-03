"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLines } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { AskButton } from "@/components/ui/AskButton";
import { useSettings } from "@/lib/state/settings";
import { fetchExoplanets, type Exoplanet, type ExoplanetResult } from "@/lib/api/exoplanets";
import type { DataMode } from "@/lib/types";

type SortKey = "discoveryYear" | "radiusEarth" | "orbitalPeriodDays" | "distanceLy";

export function ExoplanetExplorer() {
  const { demoMode } = useSettings();
  const [data, setData] = useState<ExoplanetResult | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("All");
  const [sort, setSort] = useState<SortKey>("discoveryYear");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchExoplanets(!demoMode)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  const methods = useMemo(() => {
    const s = new Set(data?.planets.map((p) => p.method));
    return ["All", ...Array.from(s)];
  }, [data]);

  const rows = useMemo(() => {
    let r: Exoplanet[] = data?.planets ?? [];
    if (method !== "All") r = r.filter((p) => p.method === method);
    return [...r].sort((a, b) => (b[sort] as number) - (a[sort] as number));
  }, [data, method, sort]);

  const scatter = rows
    .filter((p) => p.orbitalPeriodDays > 0 && p.radiusEarth > 0)
    .map((p) => ({ x: p.orbitalPeriodDays, y: p.radiusEarth, z: p.eqTempK || 200, name: p.name }));

  return (
    <Panel>
      <PanelHeader
        title="Exoplanet Explorer"
        subtitle={data?.source}
        right={data && <Badge mode={data.mode as DataMode} />}
      />

      {loading && <SkeletonLines lines={6} />}
      {error && <ErrorState message="Exoplanet data unavailable." />}

      {data && !loading && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="rounded-md border border-edge bg-white/5 px-2 py-1 text-xs text-ink"
              aria-label="Filter by discovery method"
            >
              {methods.map((m) => (
                <option key={m} value={m} className="bg-bg">
                  {m}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-edge bg-white/5 px-2 py-1 text-xs text-ink"
              aria-label="Sort by"
            >
              <option value="discoveryYear" className="bg-bg">Newest first</option>
              <option value="radiusEarth" className="bg-bg">Largest radius</option>
              <option value="orbitalPeriodDays" className="bg-bg">Longest period</option>
              <option value="distanceLy" className="bg-bg">Farthest</option>
            </select>
            <span className="text-xs text-muted">{rows.length} planets</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 8, right: 8, bottom: 20, left: 0 }}>
                <CartesianGrid strokeOpacity={0.1} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Period"
                  scale="log"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "var(--muted)" }}
                  label={{ value: "Orbital period (days, log)", position: "insideBottom", offset: -8, fontSize: 10, fill: "var(--muted)" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Radius"
                  tick={{ fontSize: 10, fill: "var(--muted)" }}
                  label={{ value: "Radius (R⊕)", angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--muted)" }}
                />
                <ZAxis type="number" dataKey="z" range={[40, 240]} name="Teq" />
                <Tooltip
                  contentStyle={{ background: "#0b0e1c", border: "1px solid var(--edge)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, n: string) => [v, n]}
                  labelFormatter={() => ""}
                />
                <Scatter data={scatter} fill="var(--accent)" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 max-h-64 overflow-auto scroll-thin">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-bg/90 text-muted">
                <tr>
                  <th className="py-1.5 pr-2">Planet</th>
                  <th className="py-1.5 pr-2">Method</th>
                  <th className="py-1.5 pr-2">R⊕</th>
                  <th className="py-1.5 pr-2">Period (d)</th>
                  <th className="py-1.5 pr-2">Year</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.name} className="border-t border-edge">
                    <td className="py-1.5 pr-2 font-medium">{p.name}</td>
                    <td className="py-1.5 pr-2 text-muted">{p.method}</td>
                    <td className="py-1.5 pr-2">{p.radiusEarth || "—"}</td>
                    <td className="py-1.5 pr-2">{p.orbitalPeriodDays || "—"}</td>
                    <td className="py-1.5 pr-2 text-muted">{p.discoveryYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <AskButton
              size="sm"
              label="Explain this population"
              prompt="Looking at a scatter of exoplanet radius vs orbital period, what physical trends and selection effects should I notice?"
              context="Exoplanet Explorer scatter (radius vs period)"
            />
          </div>
        </>
      )}
    </Panel>
  );
}
