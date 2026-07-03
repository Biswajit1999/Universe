import { WorldOverview } from "@/components/worlds/WorldOverview";
import { getWorld } from "@/lib/data/worlds";
import { SimulatorCard } from "@/components/simulations/SimulatorCard";
import { BlackHoleExplainer } from "@/components/worlds/physics/BlackHoleExplainer";
import { SIMULATORS } from "@/lib/simulations";

export const metadata = { title: "Physics · UNIVERSE" };

export default function PhysicsWorld() {
  const world = getWorld("physics")!;
  const pick = (id: string) => SIMULATORS.find((s) => s.id === id)!;
  return (
    <WorldOverview
      world={world}
      interactive={
        <div className="grid gap-4 lg:grid-cols-2">
          <SimulatorCard sim={pick("gravity")} />
          <SimulatorCard sim={pick("orbital")} />
          <SimulatorCard sim={pick("pid")} />
          <SimulatorCard sim={pick("cooling")} />
          <BlackHoleExplainer />
          <SimulatorCard sim={pick("blackbody")} />
        </div>
      }
    />
  );
}
