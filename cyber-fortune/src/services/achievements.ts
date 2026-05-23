import type { DrawRecord } from "../types/record";
import { getUnlockedAchievements, unlockAchievement } from "./db";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  records: DrawRecord[];
  collections: number[];
  totalUnique: number;
  hasPurified: boolean;
  gestureDraws: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_draw",
    name: "初参",
    description: "完成第一次抽签",
    check: (c) => c.records.length >= 1,
  },
  {
    id: "collector_10",
    name: "签迷",
    description: "收集 10 种不同签文",
    check: (c) => c.totalUnique >= 10,
  },
  {
    id: "collector_50",
    name: "半百缘",
    description: "收集 50 种不同签文",
    check: (c) => c.totalUnique >= 50,
  },
  {
    id: "collector_100",
    name: "百签满愿",
    description: "集齐全部 100 签",
    check: (c) => c.totalUnique >= 100,
  },
  {
    id: "purifier",
    name: "解厄者",
    description: "完成一次系签解厄",
    check: (c) => c.hasPurified,
  },
  {
    id: "gesture_master",
    name: "手势大师",
    description: "用手势模式抽签 5 次",
    check: (c) => c.gestureDraws >= 5,
  },
  {
    id: "collector_fav",
    name: "珍藏家",
    description: "收藏 3 支签文",
    check: (c) => c.collections.length >= 3,
  },
];

export async function evaluateAchievements(ctx: AchievementContext): Promise<string[]> {
  const unlocked = await getUnlockedAchievements();
  const newly: string[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (unlocked.includes(ach.id)) continue;
    if (ach.check(ctx)) {
      await unlockAchievement(ach.id);
      newly.push(ach.id);
    }
  }

  return newly;
}

export function buildAchievementContext(
  records: DrawRecord[],
  collections: number[],
): AchievementContext {
  const unique = new Set(records.map((r) => r.fortuneId));
  return {
    records,
    collections,
    totalUnique: unique.size,
    hasPurified: records.some((r) => r.purified),
    gestureDraws: records.filter((r) => r.method === "gesture").length,
  };
}
