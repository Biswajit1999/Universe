import { PageHeader } from "@/components/ui/PageHeader";
import { Vault } from "@/components/vault/Vault";

export const metadata = { title: "Personal Vault · UNIVERSE" };

export default function VaultPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Yours to keep"
        title="Personal Vault"
        description="Save notes, ideas, generated reports, favourite datasets, simulations, AI answers and drafts. Signed in with Firebase, it syncs to Firestore; otherwise it stays in this browser (Demo Mode)."
      />
      <Vault />
    </div>
  );
}
