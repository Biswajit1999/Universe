"use client";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/** Route-level error boundary — keeps the cinematic shell instead of a white screen. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production you'd forward this to your telemetry sink.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
        <AlertTriangle size={26} className="text-amber-300" />
      </div>
      <h1 className="text-xl font-semibold">A subsystem hit an anomaly</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Something failed while rendering this view. The rest of UNIVERSE is unaffected — you can retry, or head back to
        the Command Center.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent/20 px-5 py-2.5 text-sm font-semibold hover:bg-accent/30"
      >
        <RotateCcw size={15} /> Retry
      </button>
    </div>
  );
}
