import { AlertTriangle } from "lucide-react";

/** Graceful, honest error state. */
export function ErrorState({
  message = "Something went wrong loading this data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 p-4 text-sm">
      <div className="flex items-center gap-2 text-amber-300">
        <AlertTriangle size={16} />
        <span className="font-medium">Couldn&apos;t load</span>
      </div>
      <p className="text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-md border border-edge px-3 py-1 text-xs text-ink hover:bg-white/5"
        >
          Retry
        </button>
      )}
    </div>
  );
}
