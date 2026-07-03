"use client";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLines } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useSettings } from "@/lib/state/settings";
import { fetchNeoFeed, type NeoFeed as NeoFeedData } from "@/lib/api/nasa";
import type { DataMode } from "@/lib/types";

export function NeoFeed() {
  const { demoMode } = useSettings();
  const [data, setData] = useState<NeoFeedData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchNeoFeed(!demoMode)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  return (
    <Panel>
      <PanelHeader
        title="Near-Earth Objects"
        subtitle={data ? `${data.count} close approaches · ${data.date}` : "NASA NeoWs feed"}
        right={data && <Badge mode={data.mode as DataMode} />}
      />
      {loading && <SkeletonLines lines={5} />}
      {error && <ErrorState message="NEO feed unavailable — check NASA_API_KEY or use Demo Mode." />}
      {data && !loading && (
        <ul className="space-y-2">
          {data.objects.map((o) => (
            <li key={o.name} className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-white/[0.02] px-3 py-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  {o.isPotentiallyHazardous && <AlertTriangle size={13} className="text-amber-400" />}
                  {o.name}
                </p>
                <p className="text-[11px] text-muted">
                  ⌀ {o.estDiameterMinM}–{o.estDiameterMaxM} m · {o.relativeVelocityKps} km/s
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium">{o.missDistanceLunar} LD</p>
                <p className="text-[11px] text-muted">{o.closeApproachDate}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-muted">LD = lunar distances (1 LD ≈ 384,400 km).</p>
    </Panel>
  );
}
