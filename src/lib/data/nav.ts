/** Primary navigation definition — the ten sections of UNIVERSE. */
export interface NavItem {
  href: string;
  label: string;
  icon: string; // lucide icon key resolved in Nav
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/command", label: "Command Center", icon: "layoutDashboard" },
  { href: "/worlds", label: "Science Worlds", icon: "globe2" },
  { href: "/research", label: "Research Copilot", icon: "flaskConical" },
  { href: "/data", label: "Data Explorer", icon: "database" },
  { href: "/simulations", label: "Simulation Lab", icon: "atom" },
  { href: "/graph", label: "Knowledge Graph", icon: "share2" },
  { href: "/briefing", label: "Daily Briefing", icon: "sunrise" },
  { href: "/writing", label: "Writing Studio", icon: "penLine" },
  { href: "/vault", label: "Personal Vault", icon: "lock" },
  { href: "/settings", label: "Settings", icon: "settings" },
];
