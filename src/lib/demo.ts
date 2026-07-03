/**
 * Single source of truth for bundled demo datasets.
 * The JSON files live in /public/demo-data so the owner can inspect and
 * extend them; importing them here bundles them for API routes and components.
 *
 * RULE: demo data is always labelled `mode: "demo"` in the payload and shown
 * with a visible "Demo" badge in the UI. Live data must come from a real API.
 */
import apod from "../../public/demo-data/apod.json";
import exoplanets from "../../public/demo-data/exoplanets.json";
import neo from "../../public/demo-data/neo.json";
import arxiv from "../../public/demo-data/arxiv.json";
import spaceWeather from "../../public/demo-data/space-weather.json";
import githubActivity from "../../public/demo-data/github-activity.json";

export const demoData = {
  apod,
  exoplanets,
  neo,
  arxiv,
  spaceWeather,
  githubActivity,
} as const;
