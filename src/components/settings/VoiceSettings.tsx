"use client";

import { useEffect, useState } from "react";
import { MapPin, Play, Radio, Waves } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { useSettings } from "@/lib/state/settings";
import { getEnglishVoices, speakText, type VoiceOption } from "@/lib/voice";

export function VoiceSettings() {
  const settings = useSettings();
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  useEffect(() => {
    const load = () => setVoices(getEnglishVoices());
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);

  return (
    <Panel>
      <div className="flex items-start justify-between gap-4 border-b border-edge pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Waves size={16} className="text-accent" /> Voice personality</h3>
          <p className="mt-1 max-w-2xl text-xs text-muted">Choose an installed Windows voice and keep the conversation listening between turns.</p>
        </div>
        <button type="button" onClick={() => speakText("Hello Biswajit. Universe voice link is ready.", {}, { voiceURI: settings.voiceURI, rate: settings.voiceRate, pitch: settings.voicePitch })}
          className="inline-flex items-center gap-2 border border-cyan-300/25 bg-cyan-300/[0.06] px-3 py-2 text-[10px] uppercase tracking-wider text-cyan-100">
          <Play size={12} /> Test voice
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="text-[10px] uppercase tracking-[0.14em] text-muted">Windows voice
          <select value={settings.voiceURI} onChange={(event) => settings.setVoiceURI(event.target.value)} className="mt-1.5 w-full border border-edge bg-[#080c17] px-3 py-2.5 text-xs normal-case tracking-normal text-ink">
            <option value="auto">Best natural English voice automatically</option>
            {voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}
          </select>
        </label>
        <label className="text-[10px] uppercase tracking-[0.14em] text-muted"><MapPin size={11} className="mr-1 inline" /> Home city for “weather”
          <input value={settings.homeCity} onChange={(event) => settings.setHomeCity(event.target.value)} placeholder="e.g. London" className="mt-1.5 w-full border border-edge bg-[#080c17] px-3 py-2.5 text-xs normal-case tracking-normal text-ink" />
        </label>
        <label className="text-[10px] uppercase tracking-[0.14em] text-muted">Speaking speed · {settings.voiceRate.toFixed(2)}×
          <input type="range" min="0.7" max="1.35" step="0.05" value={settings.voiceRate} onChange={(event) => settings.setVoiceRate(Number(event.target.value))} className="mt-3 w-full accent-cyan-300" />
        </label>
        <label className="text-[10px] uppercase tracking-[0.14em] text-muted">Voice tone · {settings.voicePitch.toFixed(2)}
          <input type="range" min="0.7" max="1.3" step="0.05" value={settings.voicePitch} onChange={(event) => settings.setVoicePitch(Number(event.target.value))} className="mt-3 w-full accent-cyan-300" />
        </label>
      </div>

      <button type="button" role="switch" aria-checked={settings.handsFree} onClick={() => settings.setHandsFree(!settings.handsFree)}
        className={`mt-4 inline-flex items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-wider ${settings.handsFree ? "border-emerald-300/30 bg-emerald-300/[0.07] text-emerald-200" : "border-edge text-muted"}`}>
        <Radio size={12} /> Continuous conversation {settings.handsFree ? "on" : "off"}
      </button>
    </Panel>
  );
}
