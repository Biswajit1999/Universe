import { PageHeader } from "@/components/ui/PageHeader";
import { Vault } from "@/components/vault/Vault";

export const metadata = { title: "Personal Vault · UNIVERSE" };

export default function VaultPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Yours to keep"
        title="Personal Vault"
        description="Keep explicit encrypted memories, notes, generated reports, datasets, simulations and drafts. Long-term memory stays off until you choose what Universe may remember."
      />
      <Vault />
    </div>
  );
}
