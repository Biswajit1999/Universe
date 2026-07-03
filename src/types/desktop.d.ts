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
  };
}
