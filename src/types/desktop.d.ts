interface UniverseDesktopInfo {
  platform: string;
  version: string;
  packaged: boolean;
}

interface Window {
  universeDesktop?: {
    isDesktop: true;
    getInfo: () => Promise<UniverseDesktopInfo>;
  };
}
