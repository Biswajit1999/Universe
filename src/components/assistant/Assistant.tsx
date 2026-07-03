"use client";
/**
 * "Hey Universe" assistant — a global slide-over panel.
 * Opens from the floating button or from anywhere via askUniverse() / the
 * "universe:ask" window event. Uses the AI abstraction (live Gemini or the
 * labelled offline mock) and can save any answer to the Vault.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Save, Radio } from "lucide-react";
import { askAI } from "@/lib/ai/provider";
import { useSettings } from "@/lib/state/settings";
import { useVault } from "@/lib/state/vault";
import { Badge } from "@/components/ui/Badge";
import { Markdown } from "@/components/ui/Markdown";
import type { AIMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Explain the transit method",
  "Generate a research idea",
  "Draft a supervisor update",
  "What if gravity were 5% weaker?",
];

export function Assistant() {
  const { demoMode } = useSettings();
  const { add } = useVault();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pendingContext, setPendingContext] = useState<string | undefined>();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const send = useCallback(
    async (text: string, context?: string) => {
      const q = text.trim();
      if (!q || thinking) return;
      const history = messages;
      setMessages((m) => [...m, { role: "user", content: q }]);
      setInput("");
      setThinking(true);
      const res = await askAI({ prompt: q, context, history }, { demoMode });
      setMessages((m) => [...m, { role: "assistant", content: res.text, mode: res.mode }]);
      setThinking(false);
    },
    [messages, thinking, demoMode],
  );

  // Global open + optional pre-ask.
  useEffect(() => {
    function onAsk(e: Event) {
      const detail = (e as CustomEvent).detail as { prompt?: string; context?: string } | undefined;
      setOpen(true);
      setPendingContext(detail?.context);
      if (detail?.prompt) {
        setTimeout(() => send(detail.prompt!, detail.context), 50);
      } else {
        setTimeout(() => inputRef.current?.focus(), 120);
      }
    }
    window.addEventListener("universe:ask", onAsk);
    return () => window.removeEventListener("universe:ask", onAsk);
  }, [send]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  return (
    <>
      {/* Floating "Hey Universe" button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Hey Universe assistant"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-edge bg-panel px-4 py-3 text-sm font-medium text-ink shadow-lg backdrop-blur-lg transition hover:scale-[1.03] hover:border-accent/50"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        Hey Universe
      </button>

      {/* Slide-over panel */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          role="dialog"
          aria-label="Hey Universe assistant"
          className={cn(
            "glass-strong absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-edge transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <header className="flex items-center justify-between border-b border-edge px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <div>
                <p className="text-sm font-semibold">Hey Universe</p>
                <p className="text-[11px] text-muted">Research copilot</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <Radio size={12} className={demoMode ? "text-sky-300" : "text-emerald-300"} />
                {demoMode ? "Demo AI" : "Live-first"}
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
          </header>

          {pendingContext && (
            <div className="border-b border-edge bg-white/5 px-4 py-2 text-[11px] text-muted">
              Context: {pendingContext}
            </div>
          )}

          <div ref={scrollRef} className="scroll-thin flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  I&apos;m a calm, scientific research copilot. Ask me to explain a concept, draft a
                  document, plan a study path, or reason about a &ldquo;what if&rdquo; scenario.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-edge px-3 py-1.5 text-xs text-ink transition hover:border-accent/50 hover:bg-white/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent/15 px-3.5 py-2 text-sm text-ink">
                    {m.content}
                  </div>
                ) : (
                  <div className="w-full rounded-2xl rounded-bl-sm border border-edge bg-white/[0.03] px-3.5 py-2.5">
                    <div className="mb-1 flex items-center gap-2">
                      <Sparkles size={12} className="text-accent" />
                      <Badge mode={m.mode ?? "demo"} />
                    </div>
                    <Markdown content={m.content} />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() =>
                          add({ type: "answer", title: m.content.slice(0, 60), content: m.content })
                        }
                        className="flex items-center gap-1 rounded-md border border-edge px-2 py-1 text-[11px] text-muted transition hover:text-ink"
                      >
                        <Save size={12} /> Save to Vault
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {thinking && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
                </span>
                Reasoning…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input, pendingContext);
            }}
            className="border-t border-edge p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input, pendingContext);
                  }
                }}
                rows={1}
                placeholder="Ask Universe…"
                className="scroll-thin max-h-32 flex-1 resize-none rounded-xl border border-edge bg-white/5 px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/50"
              />
              <button
                type="submit"
                disabled={thinking || !input.trim()}
                aria-label="Send"
                className="rounded-xl bg-accent/20 p-2.5 text-accent transition hover:bg-accent/30 disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </aside>
      </div>
    </>
  );
}
