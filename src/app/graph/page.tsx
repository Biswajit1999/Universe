import { PageHeader } from "@/components/ui/PageHeader";
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";

export const metadata = { title: "Knowledge Graph · UNIVERSE" };

export default function GraphPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Everything connects"
        title="Knowledge Graph"
        description="A living 3D constellation of how UNIVERSE's domains, topics, instruments and your own research relate. Focus a node to trace its links and open an intelligence channel."
      />
      <KnowledgeGraph />
    </div>
  );
}
