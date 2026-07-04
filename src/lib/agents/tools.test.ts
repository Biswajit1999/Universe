import { afterEach, describe, expect, it, vi } from "vitest";
import { runReadOnlyTools } from "./tools";

afterEach(() => vi.unstubAllGlobals());

describe("general assistant tools", () => {
  it("returns an honestly labelled live weather summary", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [{ name: "London", country: "United Kingdom", admin1: "England", latitude: 51.5, longitude: -0.12 }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        current: { temperature_2m: 19, apparent_temperature: 18, weather_code: 2, wind_speed_10m: 12, precipitation: 0 },
        daily: { temperature_2m_max: [21, 22], temperature_2m_min: [13, 14], precipitation_probability_max: [20, 30], weather_code: [2, 61] },
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const [result] = await runReadOnlyTools("data", "What is the weather? Home location: London.");
    expect(result).toMatchObject({ tool: "weather.open-meteo", mode: "live" });
    expect(result.summary).toContain("London, England, United Kingdom");
    expect(result.summary).toContain("19°C");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not guess a location", async () => {
    vi.stubGlobal("fetch", vi.fn());
    await expect(runReadOnlyTools("data", "What is the weather?")).resolves.toEqual([]);
  });
});
