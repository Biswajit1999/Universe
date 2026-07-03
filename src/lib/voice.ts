/** Browser-native speech input and output with graceful feature detection. */

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
}

type SRConstructor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const browserWindow = window as unknown as {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  };
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

export function isVoiceSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export interface VoiceSession {
  stop: () => void;
}

export interface SpeechSession {
  cancel: () => void;
}

/** Start one-shot dictation and return the final transcript. */
export function startVoice(handlers: {
  onText: (text: string) => void;
  onPartial?: (text: string) => void;
  onEnd?: () => void;
  onError?: () => void;
}): VoiceSession | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = "en-GB";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.onresult = (event) => {
    const transcript = Array.from(
      { length: event.results.length },
      (_, index) => event.results[index][0].transcript,
    ).join(" ");
    const last = event.results[event.results.length - 1];
    if (last?.isFinal === false) handlers.onPartial?.(transcript.trim());
    else handlers.onText(transcript.trim());
  };
  recognition.onerror = () => handlers.onError?.();
  recognition.onend = () => handlers.onEnd?.();
  try {
    recognition.start();
  } catch {
    return null;
  }
  return { stop: () => (recognition.abort ? recognition.abort() : recognition.stop()) };
}

/** Convert visual Markdown and common LaTeX into calmer speech-friendly text. */
export function toSpeechText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " A code or diagram example is displayed on screen. ")
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1 divided by $2")
    .replace(/\\text\{([^{}]+)\}/g, "$1")
    .replace(/\\(approx|sim)/g, " approximately ")
    .replace(/\\times/g, " times ")
    .replace(/\\cdot/g, " multiplied by ")
    .replace(/\\sqrt\{([^{}]+)\}/g, " square root of $1 ")
    .replace(/\^\{([^{}]+)\}/g, " to the power $1 ")
    .replace(/_\{([^{}]+)\}/g, " sub $1 ")
    .replace(/\$+/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\*\*|__|~~|`/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\n{2,}/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Speak a response using the best available local English system voice. */
export function speakText(
  markdown: string,
  handlers: { onStart?: () => void; onEnd?: () => void; onError?: () => void } = {},
): SpeechSession | null {
  if (!isSpeechSupported()) return null;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(toSpeechText(markdown));
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  utterance.voice = englishVoices.find((voice) => voice.localService) ?? englishVoices[0] ?? null;
  utterance.lang = utterance.voice?.lang ?? "en-GB";
  utterance.rate = 0.96;
  utterance.pitch = 0.92;
  utterance.volume = 1;
  utterance.onstart = () => handlers.onStart?.();
  utterance.onend = () => handlers.onEnd?.();
  utterance.onerror = () => handlers.onError?.();
  window.speechSynthesis.speak(utterance);
  return { cancel: () => window.speechSynthesis.cancel() };
}

export function stopSpeech(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
