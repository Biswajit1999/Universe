import { WorldOverview } from "@/components/worlds/WorldOverview";
import { getWorld } from "@/lib/data/worlds";
import { ExoplanetExplorer } from "@/components/worlds/astronomy/ExoplanetExplorer";
import { NeoFeed } from "@/components/worlds/astronomy/NeoFeed";
import { LightCurveLab } from "@/components/worlds/astronomy/LightCurveLab";

export const metadata = { title: "Astronomy · UNIVERSE" };

export default function AstronomyWorld() {
  const world = getWorld("astronomy")!;
  return (
    <WorldOverview
      world={world}
      interactive={
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <ExoplanetExplorer />
          </div>
          <LightCurveLab />
          <NeoFeed />
        </div>
      }
    />
  );
}
