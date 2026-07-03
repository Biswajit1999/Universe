"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Mic,
  MicOff,
  Radio,
  Save,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { askAI } from "@/lib/ai/provider";
import {
  isSpeechSupported,
  isVoiceSupported,
  speakText,
  startVoice,
  stopSpeech,
  type SpeechSession,
  type VoiceSession,
} from "@/lib/voice";
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

type VoicePhase = "idle" | "listening" | "thinking" | "speaking" | "error";

const VOICE_STATUS: Record<VoicePhase, { title: string; detail: string }> = {
  idle: { title: "Voice link ready", detail: "Tap the core and ask Universe anything" },
  listening: { title: "Listening", detail: "Speak naturally — your question sends automatically" },
  thinking: { title: "Analysing", detail: "Universe is resolving your request" },
  speaking: { title: "Universe responding", detail: "Tap the core to stop playback" },
  error: { title: "Voice link interrupted", detail: "Check microphone permission and try again" },
};

export function Assistant() {
  const { demoMode } = useSettings();
  const { add } = useVault();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pendingContext, setPendingContext] = useState<string | undefined>();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [playingMessage, setPlayingMessage] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const voiceRef = useRef<VoiceSession | null>(null);
  const speechRef = useRef<SpeechSession | null>(null);

  useEffect(() => setVoiceAvailable(isVoiceSupported() && isSpeechSupported()), []);

  const stopVoiceActivity = useCallback(() => {
    voiceRef.current?.stop();
    voiceRef.current = null;
    speechRef.current?.cancel();
    speechRef.current = null;
    stopSpeech();
    setPlayingMessage(null);
    setVoicePhase("idle");
  }, []);

  const speakResponse = useCallback((text: string, messageIndex: number | null = null) => {
    speechRef.current?.cancel();
    setPlayingMessage(messageIndex);
    const session = speakText(text, {
      onStart: () => setVoicePhase("speaking"),
      onEnd: () => {
        setPlayingMessage(null);
        setVoicePhase("idle");
      },
      onError: () => {
        setPlayingMessage(null);
        setVoicePhase("error");
      },
    });
    if (!session) {
      setPlayingMessage(null);
      setVoicePhase("error");
      return;
    }
    speechRef.current = session;
  }, []);

  const send = useCallback(
    async (text: string, context?: string, forceVoice = false) => {
      const question = text.trim();
      if (!question || thinking) return;
      const history = messages;
      setMessages((current) => [...current, { role: "user", content: question }]);
      setInput("");
      setThinking(true);
      const useVoice = voiceMode || forceVoice;
      if (useVoice) setVoicePhase("thinking");

      const voiceContext = useVoice
        ? `${context ? `${context}. ` : ""}Voice conversation: answer naturally in under 180 words unless the user asks for detail.`
        : context;
      const response = await askAI({ prompt: question, context: voiceContext, history }, { demoMode });
      const messageIndex = history.length + 1;
      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.text, mode: response.mode },
      ]);
      setThinking(false);
      if (useVoice && autoSpeak) speakResponse(response.text, messageIndex);
      else setVoicePhase("idle");
    },
    [autoSpeak, demoMode, messages, speakResponse, thinking, voiceMode],
  );

  const beginListening = useCallback(() => {
    if (!voiceAvailable || thinking) return;
    speechRef.current?.cancel();
    stopSpeech();
    setPlayingMessage(null);
    setVoiceTranscript("");
    setInput("");
    setVoicePhase("listening");
    let received = false;
    let failed = false;
    const session = startVoice({
      onText: (text) => {
        received = true;
        setVoiceTranscript(text);
        setInput(text);
        setVoicePhase("thinking");
        setTimeout(() => void send(text, pendingContext, true), 0);
      },
      onEnd: () => {
        voiceRef.current = null;
        if (!received && !failed) setVoicePhase("idle");
      },
      onError: () => {
        failed = true;
        voiceRef.current = null;
        setVoicePhase("error");
      },
    });
    if (!session) {
      setVoicePhase("error");
      return;
    }
    voiceRef.current = session;
  }, [pendingContext, send, thinking, voiceAvailable]);

  const handleVoiceCore = useCallback(() => {
    if (voicePhase === "listening") {
      voiceRef.current?.stop();
      voiceRef.current = null;
      setVoicePhase("idle");
      return;
    }
    if (voicePhase === "speaking") {
      speechRef.current?.cancel();
      stopSpeech();
      setPlayingMessage(null);
      setVoicePhase("idle");
      return;
    }
    beginListening();
  }, [beginListening, voicePhase]);

  const closeAssistant = useCallback(() => {
    stopVoiceActivity();
    setOpen(false);
  }, [stopVoiceActivity]);

  useEffect(() => {
    function onAsk(event: Event) {
      const detail = (event as CustomEvent).detail as { prompt?: string; context?: string } | undefined;
      setOpen(true);
      setPendingContext(detail?.context);
      if (detail?.prompt) setTimeout(() => void send(detail.prompt!, detail.context), 50);
      else setTimeout(() => inputRef.current?.focus(), 120);
    }
    window.addEventListener("universe:ask", onAsk);
    return () => window.removeEventListener("universe:ask", onAsk);
  }, [send]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 120);
      } else if (event.key === "Escape") {
        closeAssistant();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAssistant]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(
    () => () => {
      voiceRef.current?.stop();
      speechRef.current?.cancel();
      stopSpeech();
    },
    [],
  );

  const voiceStatus = VOICE_STATUS[voicePhase];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Hey Universe assistant"
        className="assistant-launcher fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-sky-300/25 px-4 py-3 text-sm font-semibold text-ink shadow-2xl backdrop-blur-xl transition hover:scale-[1.03] hover:border-sky-300/55"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_14px_#67e8f9]" />
        </span>
        Hey Universe
        <kbd className="ml-1 hidden rounded border border-sky-300/20 bg-black/20 px-1.5 py-0.5 text-[10px] text-sky-100/65 sm:inline">⌘K</kbd>
      </button>

      <div
        className={cn("fixed inset-0 z-50 transition", open ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          className={cn("absolute inset-0 bg-[#02040b]/70 backdrop-blur-sm transition-opacity", open ? "opacity-100" : "opacity-0")}
          onClick={closeAssistant}
        />
        <aside
          role="dialog"
          aria-label="Hey Universe assistant"
          className={cn(
            "assistant-console absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-sky-300/15 bg-[#050712]/95 shadow-[-32px_0_90px_rgba(0,0,0,0.5)] transition-transform duration-500",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="assistant-console-grid pointer-events-none absolute inset-0" />
          <header className="relative z-10 flex items-center justify-between border-b border-sky-300/15 bg-[#07101d]/75 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_24px_rgba(103,232,249,0.12)]">
                <Sparkles size={17} className="text-cyan-300" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide">HEY UNIVERSE</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-sky-200/45">Scientific intelligence link</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {voiceAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    if (voiceMode) stopVoiceActivity();
                    setVoiceMode((value) => !value);
                  }}
                  aria-pressed={voiceMode}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition",
                    voiceMode
                      ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-200"
                      : "border-edge text-muted hover:border-cyan-300/30 hover:text-ink",
                  )}
                >
                  {voiceMode ? <Volume2 size={12} /> : <MessageCircle size={12} />}
                  {voiceMode ? "Voice link" : "Text link"}
                </button>
              )}
              <span className="hidden items-center gap-1 text-[10px] text-muted sm:flex">
                <Radio size={11} className={demoMode ? "text-sky-300" : "text-emerald-300"} />
                {demoMode ? "Demo" : "Live"}
              </span>
              <button onClick={closeAssistant} aria-label="Close" className="rounded-lg p-1.5 text-muted transition hover:bg-white/5 hover:text-ink">
                <X size={18} />
              </button>
            </div>
          </header>

          {pendingContext && (
            <div className="relative z-10 border-b border-sky-300/10 bg-cyan-300/[0.035] px-4 py-2 text-[10px] uppercase tracking-wider text-sky-100/50">
              Context channel · {pendingContext}
            </div>
          )}

          {voiceMode && (
            <section className="assistant-voice-stage relative z-10 border-b border-sky-300/10 px-5 py-5 text-center">
              <div className="assistant-voice-horizon" />
              <button
                type="button"
                onClick={handleVoiceCore}
                disabled={voicePhase === "thinking"}
                aria-label={voicePhase === "listening" ? "Stop listening" : voicePhase === "speaking" ? "Stop speaking" : "Speak to Universe"}
                className={cn("assistant-voice-core mx-auto", `is-${voicePhase}`)}
              >
                <span className="assistant-voice-ring ring-one" />
                <span className="assistant-voice-ring ring-two" />
                <span className="assistant-voice-ring ring-three" />
                <span className="assistant-voice-center">
                  {voicePhase === "listening" ? <MicOff size={25} /> : voicePhase === "speaking" ? <VolumeX size={25} /> : <Mic size={25} />}
                </span>
              </button>
              <div className={cn("assistant-waveform mx-auto mt-5", voicePhase === "listening" || voicePhase === "speaking" ? "is-active" : "")} aria-hidden>
                {Array.from({ length: 15 }, (_, index) => <span key={index} style={{ animationDelay: `${index * -0.07}s` }} />)}
              </div>
              <div className="mt-3" role="status" aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">{voiceStatus.title}</p>
                <p className="mt-1 text-[11px] text-muted">{voiceTranscript && voicePhase !== "idle" ? `“${voiceTranscript}”` : voiceStatus.detail}</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoSpeak((value) => !value)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-edge px-2.5 py-1 text-[10px] text-muted transition hover:text-ink"
                aria-pressed={autoSpeak}
              >
                {autoSpeak ? <Volume2 size={11} /> : <VolumeX size={11} />}
                Spoken replies {autoSpeak ? "on" : "off"}
              </button>
            </section>
          )}

          <div ref={scrollRef} className="scroll-thin relative z-10 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 && !voiceMode && (
              <div className="rounded-2xl border border-sky-300/10 bg-white/[0.025] p-4">
                <p className="text-sm leading-relaxed text-muted">
                  Ask for an explanation, research plan, scientific calculation, or a structured “what if” analysis.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => void send(suggestion)}
                      className="rounded-full border border-edge bg-white/[0.02] px-3 py-1.5 text-xs text-ink transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.06]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={cn("flex flex-col gap-1.5", message.role === "user" ? "items-end" : "items-start")}>
                {message.role === "user" ? (
                  <div className="max-w-[88%] rounded-2xl rounded-br-sm border border-cyan-300/15 bg-cyan-300/[0.09] px-3.5 py-2.5 text-sm text-ink shadow-[0_10px_35px_rgba(0,0,0,0.14)]">
                    {message.content}
                  </div>
                ) : (
                  <div className="assistant-response w-full rounded-2xl rounded-bl-sm border border-sky-300/12 bg-[#0b1020]/85 px-4 py-3 shadow-[0_14px_45px_rgba(0,0,0,0.18)]">
                    <div className="mb-2 flex items-center justify-between gap-2 border-b border-sky-300/10 pb-2">
                      <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/75">
                        <Sparkles size={12} /> Universe response
                      </span>
                      <Badge mode={message.mode ?? "demo"} />
                    </div>
                    <Markdown content={message.content} />
                    <div className="mt-3 flex justify-end gap-2 border-t border-sky-300/10 pt-2">
                      {voiceAvailable && (
                        <button
                          type="button"
                          onClick={() => {
                            if (playingMessage === index) {
                              speechRef.current?.cancel();
                              stopSpeech();
                              setPlayingMessage(null);
                              setVoicePhase("idle");
                            } else speakResponse(message.content, index);
                          }}
                          className="flex items-center gap-1 rounded-md border border-edge px-2 py-1 text-[11px] text-muted transition hover:border-cyan-300/30 hover:text-ink"
                        >
                          {playingMessage === index ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          {playingMessage === index ? "Stop" : "Listen"}
                        </button>
                      )}
                      <button
                        onClick={() => add({ type: "answer", title: message.content.slice(0, 60), content: message.content })}
                        className="flex items-center gap-1 rounded-md border border-edge px-2 py-1 text-[11px] text-muted transition hover:text-ink"
                      >
                        <Save size={12} /> Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {thinking && (
              <div className="flex items-center gap-3 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.035] px-3 py-2.5 text-xs uppercase tracking-[0.14em] text-cyan-100/60">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" />
                </span>
                Resolving scientific context
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input, pendingContext);
            }}
            className="relative z-10 border-t border-sky-300/12 bg-[#060a15]/90 p-3 backdrop-blur-xl"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-sky-300/12 bg-white/[0.025] p-1.5 focus-within:border-cyan-300/35">
              {voiceAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    setVoiceMode(true);
                    setTimeout(beginListening, 0);
                  }}
                  aria-label="Start voice conversation"
                  title="Start voice conversation"
                  className="rounded-xl p-2.5 text-cyan-200/70 transition hover:bg-cyan-300/10 hover:text-cyan-200"
                >
                  <Mic size={18} />
                </button>
              )}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send(input, pendingContext);
                  }
                }}
                rows={1}
                placeholder={voicePhase === "listening" ? "Listening…" : "Transmit a question to Universe…"}
                className="scroll-thin max-h-32 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
              <button
                type="submit"
                disabled={thinking || !input.trim()}
                aria-label="Send"
                className="rounded-xl bg-cyan-300/15 p-2.5 text-cyan-200 transition hover:bg-cyan-300/25 disabled:opacity-30"
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
