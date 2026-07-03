import { PageHeader } from "@/components/ui/PageHeader";
import { Settings } from "@/components/settings/Settings";

export const metadata = { title: "Settings · UNIVERSE" };

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Tune the system"
        title="Settings"
        description="Data mode, appearance, integration status and the science disclaimer that governs how UNIVERSE labels everything it shows you."
      />
      <Settings />
    </div>
  );
}
