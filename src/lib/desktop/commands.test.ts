import { describe, expect, it } from "vitest";
import { matchDesktopCommand } from "./commands";

describe("allow-listed voice commands", () => {
  it("routes music and utility requests to fixed application identifiers", () => {
    expect(matchDesktopCommand("Universe, turn on some music")?.appId).toBe("spotify");
    expect(matchDesktopCommand("open YouTube Music")?.appId).toBe("youtube-music");
    expect(matchDesktopCommand("launch calculator")?.appId).toBe("calculator");
  });

  it("does not turn arbitrary commands into desktop actions", () => {
    expect(matchDesktopCommand("open PowerShell and delete a folder")).toBeNull();
    expect(matchDesktopCommand("play a simulation of orbital music")).toBeNull();
  });
});
