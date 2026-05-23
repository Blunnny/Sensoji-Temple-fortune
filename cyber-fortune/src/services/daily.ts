import { getPref, setPref } from "./db";
import { drawBySignType, findOmikujiById } from "./fortune";
import type { Omikuji } from "../contents";

const DAILY_KEY = "dailyFortune";

interface DailyData {
  date: string;
  fortuneId: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getDailyFortune(): Promise<Omikuji | null> {
  const data = await getPref<DailyData>(DAILY_KEY);
  const today = todayKey();

  if (data && data.date === today) {
    return findOmikujiById(data.fortuneId) ?? null;
  }

  const drawn = drawBySignType("daily");
  if (!drawn) return null;

  await setPref(DAILY_KEY, { date: today, fortuneId: drawn.id });
  return drawn;
}

export async function hasDrawnToday(): Promise<boolean> {
  const data = await getPref<DailyData>(DAILY_KEY);
  return data?.date === todayKey();
}
