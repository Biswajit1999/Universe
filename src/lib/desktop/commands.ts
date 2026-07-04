export interface DesktopVoiceCommand {
  appId: "spotify" | "youtube-music" | "calculator" | "notepad";
  label: string;
}

const COMMANDS: Array<{ pattern: RegExp; command: DesktopVoiceCommand }> = [
  { pattern: /\b(?:play|start|open|turn on)\s+(?:some\s+)?(?:music|spotify)\b/i, command: { appId: "spotify", label: "Spotify" } },
  { pattern: /\b(?:open|start|play)\s+youtube music\b/i, command: { appId: "youtube-music", label: "YouTube Music" } },
  { pattern: /\b(?:open|launch|start)\s+(?:the\s+)?calculator\b/i, command: { appId: "calculator", label: "Calculator" } },
  { pattern: /\b(?:open|launch|start)\s+(?:the\s+)?notepad\b/i, command: { appId: "notepad", label: "Notepad" } },
];

export function matchDesktopCommand(prompt: string): DesktopVoiceCommand | null {
  return COMMANDS.find((candidate) => candidate.pattern.test(prompt))?.command ?? null;
}
