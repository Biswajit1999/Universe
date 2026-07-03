import { PageHeader } from "@/components/ui/PageHeader";
import { Briefing } from "@/components/briefing/Briefing";

export const metadata = { title: "Daily Briefing · UNIVERSE" };

export default function BriefingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Start the day oriented"
        title="Daily Briefing"
        description="A single glance at space news, new papers, your activity and today's focus — then generate a full Markdown briefing you can export or save."
      />
      <Briefing />
    </div>
  );
}
