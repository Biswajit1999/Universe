import type { GraphNode, GraphEdge } from "@/lib/types";

/**
 * Knowledge Graph nodes. Coordinates are on a 1000×640 canvas and were laid
 * out by hand so the graph reads clearly without a physics simulation.
 */
export const GRAPH_NODES: GraphNode[] = [
  { id: "universe", label: "Universe", group: "domain", x: 500, y: 320, blurb: "The root: everything UNIVERSE connects — sciences, instruments, data and your own research.", questions: ["What can I explore here?", "How are these fields connected?"] },

  { id: "physics", label: "Physics", group: "domain", x: 300, y: 160, blurb: "The rules matter and energy obey. Underpins astronomy, engineering and chemistry.", questions: ["Explain the four fundamental forces", "Why is energy conserved?"] },
  { id: "mathematics", label: "Mathematics", group: "domain", x: 500, y: 90, blurb: "The language every other science is written in.", questions: ["Why is math so effective in physics?"] },
  { id: "astronomy", label: "Astronomy", group: "domain", x: 720, y: 160, blurb: "Applying physics to the cosmos, using light as the primary data.", questions: ["How do we measure cosmic distances?"] },
  { id: "ai", label: "AI", group: "domain", x: 780, y: 340, blurb: "Learning structure from data; now a tool across all sciences.", questions: ["How is AI used in science today?"] },
  { id: "biology", label: "Biology", group: "domain", x: 640, y: 500, blurb: "Information processing in living systems.", questions: ["What is the central dogma?"] },
  { id: "engineering", label: "Engineering", group: "domain", x: 360, y: 500, blurb: "Turning physical principles into working systems.", questions: ["How does feedback control work?"] },
  { id: "earth", label: "Earth Systems", group: "domain", x: 220, y: 340, blurb: "The coupled physics, chemistry and biology of our planet.", questions: ["Explain Earth's energy balance"] },

  { id: "exoplanets", label: "Exoplanets", group: "topic", x: 850, y: 110, blurb: "Planets around other stars — detected by transits and radial velocity.", questions: ["Explain the transit method"] },
  { id: "spectroscopy", label: "Spectroscopy", group: "topic", x: 900, y: 230, blurb: "Reading composition and motion from light split by wavelength.", questions: ["How do spectral lines reveal velocity?"] },
  { id: "blackholes", label: "Black Holes", group: "topic", x: 650, y: 60, blurb: "Regions where gravity dominates all other physics.", questions: ["What sets a black hole's size?"] },
  { id: "controlsystems", label: "Control Systems", group: "topic", x: 200, y: 560, blurb: "Steering a system to a target using feedback — e.g. PID.", questions: ["Explain a PID controller"] },
  { id: "neuralnetworks", label: "Neural Networks", group: "topic", x: 900, y: 440, blurb: "Layered learnable functions; the basis of modern AI.", questions: ["What is backpropagation?"] },
  { id: "climate", label: "Climate", group: "topic", x: 120, y: 260, blurb: "The long-run statistics of Earth's energy and carbon systems.", questions: ["How do we know the climate is warming?"] },
  { id: "dna", label: "DNA", group: "topic", x: 720, y: 580, blurb: "The molecule that stores genetic information.", questions: ["How is DNA read into proteins?"] },

  { id: "gaia", label: "Gaia", group: "instrument", x: 830, y: 40, blurb: "ESA mission mapping ~2 billion stars in 3D.", questions: ["What does Gaia measure?"] },
  { id: "tess", label: "TESS", group: "instrument", x: 960, y: 130, blurb: "NASA survey hunting transiting planets around bright stars.", questions: ["How does TESS find planets?"] },

  { id: "personal", label: "Personal Research", group: "personal", x: 470, y: 470, blurb: "Your own questions, datasets and writing — the point of the whole system.", questions: ["Help me pick a first project"] },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { from: "universe", to: "physics" },
  { from: "universe", to: "mathematics" },
  { from: "universe", to: "astronomy" },
  { from: "universe", to: "ai" },
  { from: "universe", to: "biology" },
  { from: "universe", to: "engineering" },
  { from: "universe", to: "earth" },
  { from: "universe", to: "personal" },
  { from: "mathematics", to: "physics" },
  { from: "mathematics", to: "ai" },
  { from: "physics", to: "astronomy" },
  { from: "physics", to: "engineering" },
  { from: "physics", to: "blackholes" },
  { from: "physics", to: "earth" },
  { from: "astronomy", to: "exoplanets" },
  { from: "astronomy", to: "spectroscopy" },
  { from: "astronomy", to: "blackholes" },
  { from: "astronomy", to: "gaia" },
  { from: "astronomy", to: "tess" },
  { from: "exoplanets", to: "tess" },
  { from: "exoplanets", to: "spectroscopy" },
  { from: "ai", to: "neuralnetworks" },
  { from: "engineering", to: "controlsystems" },
  { from: "engineering", to: "ai" },
  { from: "earth", to: "climate" },
  { from: "biology", to: "dna" },
  { from: "biology", to: "ai" },
  { from: "personal", to: "astronomy" },
  { from: "personal", to: "ai" },
  { from: "personal", to: "engineering" },
];

export function nodeById(id: string): GraphNode | undefined {
  return GRAPH_NODES.find((n) => n.id === id);
}
