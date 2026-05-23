import {
  omikujiList,
  type Omikuji,
  drawRandomOmikuji as drawRandom,
} from "../contents";
import { getOmikujiMeta, type FortuneTag } from "./meta";
import type { SignType } from "../types/record";

export { omikujiList, type Omikuji };
export { drawRandomOmikuji } from "../contents";

export function findOmikujiById(id: number): Omikuji | undefined {
  return omikujiList.find((item) => item.id === id);
}

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

export function drawBySignType(
  signType: SignType,
  wish?: string,
  specifiedId?: number,
): Omikuji | null {
  if (signType === "specified") {
    if (specifiedId && specifiedId >= 1 && specifiedId <= 100) {
      return drawSpecified(specifiedId);
    }
    return drawRandom();
  }

  if (signType === "daily") {
    const withShort = omikujiList.filter((o) => getOmikujiMeta(o).shortLine);
    return pickRandom(withShort.length ? withShort : omikujiList);
  }

  if (signType === "general") {
    if (wish && wish.trim()) {
      return drawWithWishBias(wish.trim());
    }
    return drawRandom();
  }

  const tagMap: Record<Exclude<SignType, "general" | "daily" | "specified">, FortuneTag> = {
    love: "love",
    career: "career",
  };

  const tag = tagMap[signType as "love" | "career"];
  const pool = omikujiList.filter((o) => getOmikujiMeta(o).tags.includes(tag));
  return pickRandom(pool.length > 0 ? pool : omikujiList);
}

function drawWithWishBias(wish: string): Omikuji | null {
  const keywords: Record<FortuneTag, string[]> = {
    love: ["爱", "情", "恋", "婚", "缘"],
    career: ["事业", "工作", "学", "职", "业"],
    health: ["健康", "病", "身体"],
    travel: ["旅行", "出行", "远"],
    wealth: ["财", "钱", "富", "运"],
  };

  const matchedTags: FortuneTag[] = [];
  for (const [tag, words] of Object.entries(keywords) as [FortuneTag, string[]][]) {
    if (words.some((w) => wish.includes(w))) matchedTags.push(tag);
  }

  if (matchedTags.length === 0) return drawRandom();

  const pool = omikujiList.filter((o) =>
    getOmikujiMeta(o).tags.some((t) => matchedTags.includes(t)),
  );
  return pickRandom(pool.length > 0 ? pool : omikujiList);
}

export function drawSpecified(id: number): Omikuji | null {
  const found = findOmikujiById(id);
  return found ?? null;
}
