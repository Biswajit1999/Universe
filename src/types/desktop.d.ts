interface UniverseDesktopInfo {
  platform: string;
  version: string;
  packaged: boolean;
  dataDirectory: string;
}

interface UniverseSecretStatus {
  name: "GEMINI_API_KEY" | "NASA_API_KEY" | "GITHUB_TOKEN";
  configured: boolean;
}

interface UniverseDesktopResult {
  ok: boolean;
  restartRequired: boolean;
}

interface Window {
  universeDesktop?: {
    isDesktop: true;
    getInfo: () => Promise<UniverseDesktopInfo>;
    secrets: {
      list: () => Promise<UniverseSecretStatus[]>;
      set: (name: UniverseSecretStatus["name"], value: string) => Promise<UniverseDesktopResult>;
      remove: (name: UniverseSecretStatus["name"]) => Promise<UniverseDesktopResult>;
    };
    diagnostics: {
      recent: () => Promise<Array<{ at: string; event: string; detail: unknown }>>;
    };
    operator: {
      status: () => Promise<{ enabled: boolean; updatedAt: number }>;
      setEnabled: (enabled: boolean) => Promise<{ enabled: boolean; changed: boolean; updatedAt?: number }>;
      pickTextFile: () => Promise<null | { token: string; name: string; extension: string; bytes: number; modifiedAt: number }>;
      readTextFile: (token: string) => Promise<{ content: string; bytes: number; modifiedAt: number }>;
      writeTextFile: (token: string, content: string) => Promise<{ written: boolean; cancelled: boolean; bytes?: number; backupName?: string }>;
      applications: () => Promise<Array<{ id: string; name: string }>>;
      launchApplication: (id: string) => Promise<{ launched: boolean; cancelled: boolean }>;
    };
  };
}
