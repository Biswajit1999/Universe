import { Greeting } from "@/components/command/Greeting";
import { CommandBar } from "@/components/command/CommandBar";
import { StatusCards } from "@/components/command/StatusCards";

export const metadata = { title: "Command Center · UNIVERSE" };

export default function CommandCenter() {
  return (
    <div className="space-y-8">
      <Greeting />
      <CommandBar />
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Status</h2>
        <StatusCards />
      </section>
    </div>
  );
}
