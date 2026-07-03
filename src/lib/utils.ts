/** Small shared helpers. */

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** "Good morning" | "Good afternoon" | "Good evening" based on local time. */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Trigger a client-side download of a Markdown file. */
export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatNumber(n: number, digits = 3): string {
  if (!isFinite(n)) return "—";
  if (n !== 0 && (Math.abs(n) >= 1e6 || Math.abs(n) < 1e-3)) {
    return n.toExponential(digits);
  }
  return Number(n.toPrecision(digits + 2)).toLocaleString(undefined, {
    maximumFractionDigits: digits + 2,
  });
}

/** Open the Hey Universe assistant from anywhere, optionally pre-asking a question. */
export function askUniverse(prompt?: string, context?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("universe:ask", { detail: { prompt, context } }),
  );
}
