import { MissionDeck } from "@/components/command/MissionDeck";
import { StatusCards } from "@/components/command/StatusCards";

export const metadata = { title: "Command Nexus · UNIVERSE" };

export default function CommandCenter() {
  return (
    <div className="space-y-7">
      <MissionDeck />
      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/55">
            Live intelligence feeds
          </h2>
          <span className="h-px flex-1 bg-gradient-to-r from-cyan-300/20 to-transparent" />
        </div>
        <StatusCards />
      </section>
    </div>
  );
}
