import { PageHeader } from "@/components/ui/PageHeader";
import { ResearchCopilot } from "@/components/research/ResearchCopilot";

export const metadata = { title: "Research Copilot · UNIVERSE" };

export default function ResearchPage() {
  return (
    <div>
      <PageHeader
        eyebrow="From idea to plan"
        title="Research Copilot"
        description="Enter a topic and get a complete, editable research plan — question, background, datasets, methods, figures, limitations, repo structure, README, abstract and a LinkedIn post. Export to Markdown or save to your Vault."
      />
      <ResearchCopilot />
    </div>
  );
}
