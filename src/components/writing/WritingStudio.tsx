"use client";
import { useMemo, useState } from "react";
import { Download, Copy, Check, Save, Sparkles } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Markdown } from "@/components/ui/Markdown";
import { AskButton } from "@/components/ui/AskButton";
import { useVault } from "@/lib/state/vault";
import { WRITING_TOOLS, type WritingInput } from "@/lib/templates/writing";
import { downloadMarkdown, copyToClipboard } from "@/lib/utils";

export function WritingStudio() {
  const { add } = useVault();
  const [toolId, setToolId] = useState(WRITING_TOOLS[0].id);
  const [input, setInput] = useState<WritingInput>({ topic: "", recipient: "", yourName: "Biswajit Jana", context: "" });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const tool = WRITING_TOOLS.find((t) => t.id === toolId)!;
  const output = useMemo(() => tool.generate(input), [tool, input]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Controls */}
      <div className="space-y-4">
        <Panel>
          <h3 className="mb-3 text-sm font-semibold">Choose a tool</h3>
          <div className="grid grid-cols-2 gap-2">
            {WRITING_TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setToolId(t.id)}
                className={`rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                  toolId === t.id ? "border-accent/50 bg-accent/15 text-ink" : "border-edge text-muted hover:text-ink"
                }`}
                title={t.desc}
              >
                {t.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">{tool.desc}</p>
        </Panel>

        <Panel>
          <div className="space-y-3">
            <Field label="Topic / subject" value={input.topic} onChange={(v) => setInput({ ...input, topic: v })} placeholder="e.g. exoplanet transit timing" />
            {tool.needsRecipient && (
              <Field label="Recipient name" value={input.recipient} onChange={(v) => setInput({ ...input, recipient: v })} placeholder="e.g. Smith" />
            )}
            <Field label="Your name" value={input.yourName} onChange={(v) => setInput({ ...input, yourName: v })} />
            <div>
              <label className="block text-xs text-muted">Context / details</label>
              <textarea
                value={input.context}
                onChange={(e) => setInput({ ...input, context: e.target.value })}
                rows={4}
                placeholder="Any specifics to weave in — results, your background, a rough draft to formalise…"
                className="mt-1 w-full resize-none rounded-lg border border-edge bg-white/5 px-3 py-2 text-sm text-ink placeholder:text-muted scroll-thin"
              />
            </div>
          </div>
        </Panel>
      </div>

      {/* Output */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadMarkdown(`${tool.id}`, output)} className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2 text-sm hover:bg-white/5">
            <Download size={15} /> Export
          </button>
          <button
            onClick={async () => {
              setCopied(await copyToClipboard(output));
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2 text-sm hover:bg-white/5"
          >
            {copied ? <Check size={15} className="text-good" /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => {
              add({ type: "email", title: `${tool.name} — ${input.topic || "draft"}`, content: output });
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2 text-sm hover:bg-white/5"
          >
            <Save size={15} /> {saved ? "Saved" : "Save to Vault"}
          </button>
          <AskButton label="Polish with Universe" prompt={`Improve this ${tool.name.toLowerCase()} for tone and concision without inventing facts:\n\n${output}`} context={`Writing Studio · ${tool.name}`} />
        </div>

        <Panel>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted">
            <Sparkles size={13} className="text-accent" /> Live preview — updates as you type
          </div>
          <Markdown content={output} />
        </Panel>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-edge bg-white/5 px-3 py-2 text-sm text-ink placeholder:text-muted"
      />
    </div>
  );
}
