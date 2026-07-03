import { PageHeader } from "@/components/ui/PageHeader";
import { WritingStudio } from "@/components/writing/WritingStudio";

export const metadata = { title: "Writing Studio · UNIVERSE" };

export default function WritingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Say it well"
        title="Writing Studio"
        description="Ten template-driven writing tools — research emails, PhD enquiries, supervisor updates, LinkedIn posts, READMEs, abstracts and more. Fill the fields, watch the live preview, then export, copy, save, or polish with the assistant."
      />
      <WritingStudio />
    </div>
  );
}
