/** Quick-command definitions for the Command Center. */
export interface QuickCommand {
  id: string;
  label: string;
  hint: string;
  icon: string;
  /** "ask" opens the assistant with a prompt; "nav" routes to a page. */
  action: { kind: "ask"; prompt: string } | { kind: "nav"; href: string };
}

export const QUICK_COMMANDS: QuickCommand[] = [
  { id: "explain", label: "Explain a scientific concept", hint: "e.g. the transit method", icon: "lightbulb", action: { kind: "ask", prompt: "Explain the transit method for detecting exoplanets, with the key equation and its limits." } },
  { id: "space-data", label: "Search live space data", hint: "APOD, NEOs, exoplanets", icon: "satellite", action: { kind: "nav", href: "/worlds/astronomy" } },
  { id: "idea", label: "Generate a research idea", hint: "tractable and open", icon: "sparkles", action: { kind: "ask", prompt: "Generate a concrete, tractable research idea I could start this month using public astronomy data." } },
  { id: "summary", label: "Create a paper summary", hint: "structured breakdown", icon: "fileText", action: { kind: "ask", prompt: "Give me a structured template to summarise a scientific paper, then explain how to fill each part." } },
  { id: "email", label: "Draft an email", hint: "research / PhD / update", icon: "mail", action: { kind: "nav", href: "/writing" } },
  { id: "simulate", label: "Simulate a scenario", hint: "what if…?", icon: "flaskConical", action: { kind: "nav", href: "/simulations" } },
  { id: "roadmap", label: "Build a study roadmap", hint: "6-week plan", icon: "map", action: { kind: "ask", prompt: "Build me a 6-week study roadmap to become competent in exoplanet data analysis, with a weekly deliverable each week." } },
];
