/**
 * Thin wrapper over the Web Speech API (SpeechRecognition). Degrades cleanly:
 * `isVoiceSupported()` is false on browsers without it, and the assistant hides
 * the mic button rather than pretending to listen.
 */

// Minimal typings — the DOM lib doesn't ship SpeechRecognition types.
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
}

type SRConstructor = new () => SpeechRecognitionLike;

function getCtor(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isVoiceSupported(): boolean {
  return getCtor() !== null;
}

export interface VoiceSession {
  stop: () => void;
}

/** Start a one-shot dictation. Calls onText with the final transcript. */
export function startVoice(handlers: {
  onText: (text: string) => void;
  onEnd?: () => void;
  onError?: () => void;
}): VoiceSession | null {
  const Ctor = getCtor();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.continuous = false;
  rec.onresult = (e) => {
    const transcript = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join(" ");
    handlers.onText(transcript.trim());
  };
  rec.onerror = () => handlers.onError?.();
  rec.onend = () => handlers.onEnd?.();
  try {
    rec.start();
  } catch {
    return null;
  }
  return { stop: () => rec.stop() };
}
