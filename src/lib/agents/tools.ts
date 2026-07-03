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
  if (agent === "data" && /\b(apod|picture of the day|today.*space|nasa image)\b/i.test(prompt) && await pluginEnabled("nasa")) selected.push(nasaApod(signal));
  if (agent === "data" && /\b(arxiv|latest paper|preprint)\b/i.test(prompt)) selected.push(latestArxiv(signal));
  if (agent === "simulation" && await pluginEnabled("science")) {
    const orbital = orbitalPeriodTool(prompt);
    if (orbital) selected.push(orbital);
    selected.push(constants());
  } else if (/\b(gravitational constant|astronomical unit|solar mass|earth mass|wien)\b/i.test(prompt) && await pluginEnabled("science")) selected.push(constants());
  return Promise.all(selected);
}
