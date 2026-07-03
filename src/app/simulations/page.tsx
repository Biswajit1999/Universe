import { PageHeader } from "@/components/ui/PageHeader";
import { SimulatorCard } from "@/components/simulations/SimulatorCard";
import { AskButton } from "@/components/ui/AskButton";
import { SIMULATORS } from "@/lib/simulations";

export const metadata = { title: "Simulation Lab · UNIVERSE" };

export default function SimulationLab() {
  return (
    <div>
      <PageHeader
        eyebrow="Reason quantitatively"
        title="Simulation Lab"
        description="Turn “what if?” into numbers. Each simulator uses a transparent first-order physics model — great for intuition, clearly labelled Simulated, not mission-grade."
        right={
          <AskButton
            label="How do I frame a what-if?"
            prompt="How should I turn a vague 'what if' question into concrete parameter changes I can put through a physics simulator?"
            context="Simulation Lab"
          />
        }
      />

      <div className="mb-6 glass p-4 text-sm text-muted">
        <p className="font-medium text-ink">Try scenarios like:</p>
        <p className="mt-1">
          &ldquo;What if Earth orbited at 2 AU?&rdquo; (Orbital) · &ldquo;What if gravity were 5% weaker?&rdquo; (Gravity, set G scaling to 0.95) ·
          &ldquo;What if the star were cooler?&rdquo; (Blackbody) · &ldquo;What if a signal had more noise?&rdquo; (SNR) ·
          &ldquo;What if telescope temperature drift increased?&rdquo; (Thermal Drift)
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {SIMULATORS.map((sim) => (
          <SimulatorCard key={sim.id} sim={sim} />
        ))}
      </div>
    </div>
  );
}
