import { PageHeader } from "@/components/ui/PageHeader";
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";

export const metadata = { title: "Knowledge Graph · UNIVERSE" };

export default function GraphPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Everything connects"
        title="Knowledge Graph"
        description="A living map of how UNIVERSE's domains, topics, instruments and your own research relate. Click any node to open it and ask a question."
      />
      <KnowledgeGraph />
    </div>
  );
}
