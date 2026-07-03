import { notFound } from "next/navigation";
import { WORLDS, getWorld, DEEP_WORLDS, worldHasInteractive } from "@/lib/data/worlds";
import { WorldOverview } from "@/components/worlds/WorldOverview";
import { GenericWorldModules } from "@/components/worlds/GenericWorldModules";

/** Generic world page. Deep worlds (astronomy/physics/mathematics/ai) have
 *  their own static routes which take precedence over this dynamic one, so we
 *  skip them here. */
export function generateStaticParams() {
  return WORLDS.filter((w) => !DEEP_WORLDS.has(w.slug)).map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getWorld(slug);
  return { title: w ? `${w.name} · UNIVERSE` : "World · UNIVERSE" };
}

export default async function WorldPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) notFound();
  return (
    <WorldOverview
      world={world}
      interactive={worldHasInteractive(slug) ? <GenericWorldModules slug={slug} /> : undefined}
    />
  );
}
