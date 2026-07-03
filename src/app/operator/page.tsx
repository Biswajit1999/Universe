import { OperatorConsole } from "@/components/operator/OperatorConsole";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Atlas Operator · UNIVERSE" };

export default function OperatorPage() {
  return (
    <div>
      <PageHeader eyebrow="Permissioned local tools" title="Atlas Operator" description="Select exact files, preview changes, approve writes and launch only allow-listed Windows applications. Every action is visible and auditable." />
      <OperatorConsole />
    </div>
  );
}
