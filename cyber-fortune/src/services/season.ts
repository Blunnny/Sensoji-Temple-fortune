import { getPref, setPref } from "./db";

export type Season = "spring" | "summer" | "autumn" | "winter";

const NIGHT_PREF = "nightMode";

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

const SEASON_VARS: Record<Season, Record<string, string>> = {
  spring: {
    "--season-accent": "#f4a7b9",
    "--season-particle": "#ffb7c5",
    "--season-bg-tint": "rgba(255, 183, 197, 0.08)",
  },
  summer: {
    "--season-accent": "#7eb8da",
    "--season-particle": "#a8d8ea",
    "--season-bg-tint": "rgba(126, 184, 218, 0.08)",
  },
  autumn: {
    "--season-accent": "#c97b4a",
    "--season-particle": "#d4a574",
    "--season-bg-tint": "rgba(201, 123, 74, 0.1)",
  },
  winter: {
    "--season-accent": "#9bb4c8",
    "--season-particle": "#e8eef2",
    "--season-bg-tint": "rgba(155, 180, 200, 0.1)",
  },
};

export function applySeasonTheme(): Season {
  const season = getCurrentSeason();
  const vars = SEASON_VARS[season];

  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, value);
  }

  document.documentElement.dataset.season = season;
  return season;
}

export async function applyTimeOfDayTheme(): Promise<void> {
  const manual = await getPref<boolean>(NIGHT_PREF);
  const hour = new Date().getHours();
  const isNight =
    manual === true || (manual !== false && (hour < 6 || hour >= 18));
  document.documentElement.dataset.time = isNight ? "night" : "day";
}

export async function toggleNightMode(): Promise<boolean> {
  const hour = new Date().getHours();
  const autoNight = hour < 6 || hour >= 18;
  const current = await getPref<boolean>(NIGHT_PREF);
  const next = current === null ? !autoNight : !current;
  await setPref(NIGHT_PREF, next);
  await applyTimeOfDayTheme();
  return next;
}

export async function isNightMode(): Promise<boolean> {
  return document.documentElement.dataset.time === "night";
}
