import type { ReactNode } from "react";
import { WorldHero } from "./WorldHero";
import { ModuleGrid } from "./ModuleGrid";
import { AskButton } from "@/components/ui/AskButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { askUniverse } from "@/lib/utils";
import type { WorldDef } from "@/lib/types";
import { SuggestedQuestions } from "./SuggestedQuestions";

/** Shared layout for every world page. `interactive` slot renders the deep
 *  world's live modules above the standard overview. */
export function WorldOverview({ world, interactive }: { world: WorldDef; interactive?: ReactNode }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Science World"
        title={world.name}
        description={world.summary}
        right={<AskButton prompt={`Give me an orientation to ${world.name} as a field: the big questions, the key methods, and where a newcomer should start.`} context={`${world.name} world`} />}
      />

      <WorldHero icon={world.icon} color={world.color} name={world.name} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass p-5 lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold">Key concepts</h3>
          <div className="flex flex-wrap gap-2">
            {world.concepts.map((c) => (
              <span key={c} className="rounded-full border border-edge bg-white/[0.02] px-3 py-1 text-xs text-ink">
                {c}
              </span>
            ))}
          </div>
        </div>
        <SuggestedQuestions questions={world.questions} worldName={world.name} />
      </div>

      {interactive && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Interactive modules</h2>
          {interactive}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">All modules</h2>
        <ModuleGrid modules={world.modules} />
      </section>
    </div>
  );
}

/** Re-export so consumers importing from WorldOverview get the helper too. */
export { askUniverse };
