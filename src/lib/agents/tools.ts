import { demoData } from "@/lib/demo";
import { AU, G, M_EARTH, M_SUN, WIEN_B } from "@/lib/simulations/models";
import type { AgentId, AgentToolResult } from "./types";

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

export async function runReadOnlyTools(agent: AgentId, prompt: string, signal?: AbortSignal): Promise<AgentToolResult[]> {
  if (agent === "system") return [{
    tool: "desktop.permission-broker",
    label: "Desktop permission broker",
    mode: "blocked",
    summary: "No local action was executed. Atlas requires an owner-approved, allow-listed desktop capability.",
  }];

  const selected: Array<Promise<AgentToolResult> | AgentToolResult> = [];
  if (agent === "data" && /\b(apod|picture of the day|today.*space|nasa image)\b/i.test(prompt)) selected.push(nasaApod(signal));
  if (agent === "data" && /\b(arxiv|latest paper|preprint)\b/i.test(prompt)) selected.push(latestArxiv(signal));
  if (agent === "simulation" || /\b(gravitational constant|astronomical unit|solar mass|earth mass|wien)\b/i.test(prompt)) selected.push(constants());
  return Promise.all(selected);
}
