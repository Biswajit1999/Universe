import { demoData } from "@/lib/demo";
import { AU, G, M_EARTH, M_SUN, WIEN_B, orbitalPeriod } from "@/lib/simulations/models";
import type { AgentId, AgentToolResult } from "./types";
import { pluginEnabled } from "@/lib/plugins/repository";

function xmlTag(xml: string, name: string): string {
  const match = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

async function nasaApod(signal?: AbortSignal): Promise<AgentToolResult> {
  const apiKey = process.env.NASA_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`, { signal });
      if (response.ok) {
        const data = await response.json();
        return {
          tool: "nasa.apod",
          label: "NASA Astronomy Picture of the Day",
          mode: "live",
          summary: `${data.title} (${data.date}): ${String(data.explanation).slice(0, 600)}`,
          data: { title: data.title, date: data.date, url: data.url },
        };
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") throw error;
    }
  }
  return {
    tool: "nasa.apod",
    label: "NASA Astronomy Picture of the Day",
    mode: "demo",
    summary: `${demoData.apod.title}: ${demoData.apod.explanation.slice(0, 600)}`,
  };
}

async function latestArxiv(signal?: AbortSignal): Promise<AgentToolResult> {
  try {
    const response = await fetch("https://export.arxiv.org/api/query?search_query=cat:astro-ph.EP&sortBy=submittedDate&sortOrder=descending&max_results=3", { signal });
    if (response.ok) {
      const xml = await response.text();
      const papers = xml.split("<entry>").slice(1).map((entry) => ({
        title: xmlTag(entry, "title"),
        published: xmlTag(entry, "published").slice(0, 10),
        summary: xmlTag(entry, "summary").slice(0, 260),
      }));
      if (papers.length) return {
        tool: "arxiv.latest",
        label: "Latest arXiv astro-ph.EP papers",
        mode: "live",
        summary: papers.map((paper) => `${paper.title} (${paper.published})`).join("; "),
        data: papers,
      };
    }
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
  }
  return {
    tool: "arxiv.latest",
    label: "Latest arXiv astro-ph.EP papers",
    mode: "demo",
    summary: demoData.arxiv.papers.slice(0, 3).map((paper) => `${paper.title} (${paper.published})`).join("; "),
  };
}

function constants(): AgentToolResult {
  return {
    tool: "science.constants",
    label: "Verified constants registry",
    mode: "live",
    summary: `G=${G} N m² kg⁻²; AU=${AU} m; Earth mass=${M_EARTH} kg; Solar mass=${M_SUN} kg; Wien b=${WIEN_B} m K.`,
    data: { G, AU, M_EARTH, M_SUN, WIEN_B },
  };
}

const WEATHER_CODES: Record<number, string> = {
  0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
  45: "fog", 48: "freezing fog", 51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
  61: "light rain", 63: "rain", 65: "heavy rain", 71: "light snow", 73: "snow", 75: "heavy snow",
  80: "light rain showers", 81: "rain showers", 82: "heavy rain showers", 85: "snow showers", 86: "heavy snow showers",
  95: "thunderstorm", 96: "thunderstorm with hail", 99: "severe thunderstorm with hail",
};

function weatherLocation(prompt: string): string | null {
  const explicit = prompt.match(/\b(?:weather|forecast|temperature|rain|snow|wind)(?:\s+(?:today|tomorrow|this week))?\s+(?:in|for|at)\s+([a-z][a-z .'-]{1,70})/i)?.[1];
  const home = prompt.match(/home location:\s*([a-z][a-z .'-]{1,70})/i)?.[1];
  const value = (explicit ?? home)?.replace(/\b(?:today|tomorrow|this week|please)\b.*$/i, "").replace(/[.?!]+$/, "").trim();
  return value && value.length >= 2 ? value : null;
}

async function liveWeather(prompt: string, signal?: AbortSignal): Promise<AgentToolResult | null> {
  const location = weatherLocation(prompt);
  if (!location) return null;
  const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocodeUrl.search = new URLSearchParams({ name: location, count: "1", language: "en", format: "json" }).toString();
  const geocodeResponse = await fetch(geocodeUrl, { signal, cache: "no-store" });
  if (!geocodeResponse.ok) throw new Error(`Weather location lookup failed (${geocodeResponse.status}).`);
  const geocode = await geocodeResponse.json() as { results?: Array<{ name: string; country?: string; admin1?: string; latitude: number; longitude: number }> };
  const place = geocode.results?.[0];
  if (!place) return {
    tool: "weather.open-meteo",
    label: "Live weather",
    mode: "live",
    summary: `I could not find “${location}”. Try a city name or postcode.`,
  };

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.search = new URLSearchParams({
    latitude: String(place.latitude), longitude: String(place.longitude), timezone: "auto", forecast_days: "2",
    current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
  }).toString();
  const forecastResponse = await fetch(forecastUrl, { signal, cache: "no-store" });
  if (!forecastResponse.ok) throw new Error(`Weather forecast failed (${forecastResponse.status}).`);
  const forecast = await forecastResponse.json() as {
    current?: { temperature_2m?: number; apparent_temperature?: number; weather_code?: number; wind_speed_10m?: number; precipitation?: number };
    current_units?: Record<string, string>;
    daily?: { time?: string[]; temperature_2m_max?: number[]; temperature_2m_min?: number[]; precipitation_probability_max?: number[]; weather_code?: number[] };
  };
  const current = forecast.current;
  const daily = forecast.daily;
  const area = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
  const condition = WEATHER_CODES[current?.weather_code ?? -1] ?? "mixed conditions";
  const tomorrowCondition = WEATHER_CODES[daily?.weather_code?.[1] ?? -1] ?? "mixed conditions";
  const summary = `**${area}:** ${condition}, ${current?.temperature_2m ?? "—"}°C (feels like ${current?.apparent_temperature ?? "—"}°C), wind ${current?.wind_speed_10m ?? "—"} km/h. Today: ${daily?.temperature_2m_min?.[0] ?? "—"}–${daily?.temperature_2m_max?.[0] ?? "—"}°C with up to ${daily?.precipitation_probability_max?.[0] ?? "—"}% precipitation probability. Tomorrow: ${tomorrowCondition}, ${daily?.temperature_2m_min?.[1] ?? "—"}–${daily?.temperature_2m_max?.[1] ?? "—"}°C. Source: Open-Meteo live forecast.`;
  return { tool: "weather.open-meteo", label: "Live weather", mode: "live", summary, data: { place, current, daily } };
}

function astronomicalUnits(prompt: string): number | null {
  const numeric = prompt.match(/(\d+(?:\.\d+)?)\s*(?:au\b|astronomical units?)/i)?.[1];
  if (numeric) return Number(numeric);
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  const word = prompt.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+astronomical units?\b/i)?.[1].toLowerCase();
  return word ? words[word] : null;
}

function orbitalPeriodTool(prompt: string): AgentToolResult | null {
  if (!/\b(orbit|orbital|period)\b/i.test(prompt)) return null;
  const au = astronomicalUnits(prompt);
  if (!au || au <= 0 || au > 1000) return null;
  const result = orbitalPeriod(M_SUN, au * AU);
  return {
    tool: "simulation.orbital-period",
    label: "Kepler orbital-period model",
    mode: "simulated",
    summary: `At ${au} AU around a one-solar-mass star, the first-order Keplerian orbital period is ${result.years.toFixed(3)} years (${result.days.toFixed(1)} days). Assumptions: two-body orbit, negligible planet mass, semi-major axis ${au} AU, central mass 1 M☉, no relativistic or multi-body perturbations.`,
    data: { semiMajorAxisAu: au, centralMassSolar: 1, ...result },
  };
}

export async function runReadOnlyTools(agent: AgentId, prompt: string, signal?: AbortSignal): Promise<AgentToolResult[]> {
  if (agent === "system") return [{
    tool: "desktop.permission-broker",
    label: "Desktop permission broker",
    mode: "blocked",
    summary: "No local action was executed. Atlas requires an owner-approved, allow-listed desktop capability.",
  }];

  const selected: Array<Promise<AgentToolResult> | AgentToolResult> = [];
  if (agent === "data" && /\b(weather|forecast|temperature|rain|snow|wind)\b/i.test(prompt)) {
    try {
      const weather = await liveWeather(prompt, signal);
      if (weather) selected.push(weather);
    } catch (error) {
      if ((error as Error).name === "AbortError") throw error;
    }
  }
  if (agent === "data" && /\b(apod|picture of the day|today.*space|nasa image)\b/i.test(prompt) && await pluginEnabled("nasa")) selected.push(nasaApod(signal));
  if (agent === "data" && /\b(arxiv|latest paper|preprint)\b/i.test(prompt)) selected.push(latestArxiv(signal));
  if (agent === "simulation" && await pluginEnabled("science")) {
    const orbital = orbitalPeriodTool(prompt);
    if (orbital) selected.push(orbital);
    selected.push(constants());
  } else if (/\b(gravitational constant|astronomical unit|solar mass|earth mass|wien)\b/i.test(prompt) && await pluginEnabled("science")) selected.push(constants());
  return Promise.all(selected);
}
