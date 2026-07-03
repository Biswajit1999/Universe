import { WorldOverview } from "@/components/worlds/WorldOverview";
import { getWorld } from "@/lib/data/worlds";
import { FractalExplorer } from "@/components/worlds/math/FractalExplorer";
import { EquationVisualiser } from "@/components/worlds/math/EquationVisualiser";
import { Tesseract } from "@/components/worlds/math/Tesseract";
import { ProbabilitySim } from "@/components/worlds/math/ProbabilitySim";

export const metadata = { title: "Mathematics · UNIVERSE" };

export default function MathWorld() {
  const world = getWorld("mathematics")!;
  return (
    <WorldOverview
      world={world}
      interactive={
        <div className="grid gap-4 lg:grid-cols-2">
          <EquationVisualiser />
          <FractalExplorer />
          <Tesseract />
          <ProbabilitySim />
        </div>
      }
    />
  );
}
