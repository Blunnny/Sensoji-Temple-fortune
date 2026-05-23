import type { Omikuji, OmikujiWords } from "../contents";

export type FortuneTag = "love" | "career" | "health" | "travel" | "wealth";
export type FortuneTone = "auspicious" | "neutral" | "caution";

export interface OmikujiMeta {
  tags: FortuneTag[];
  tone: FortuneTone;
  shortLine: string;
}

const TAG_KEYWORDS: Record<FortuneTag, string[]> = {
  love: ["爱情", "恋情", "缘分", "婚姻", "相思"],
  career: ["事业", "工作", "仕途", "升迁", "学业"],
  health: ["疾病", "健康", "身体", "病"],
  travel: ["旅行", "出行", "远行", "搬迁"],
  wealth: ["财运", "金钱", "生意", "买卖"],
};

function deriveTags(words: OmikujiWords): FortuneTag[] {
  const keys = Object.keys(words);
  const tags: FortuneTag[] = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS) as [
    FortuneTag,
    string[],
  ][]) {
    if (keywords.some((kw) => keys.some((k) => k.includes(kw)))) {
      tags.push(tag);
    }
  }

  return tags.length > 0 ? tags : ["career"];
}

function deriveTone(grade: string): FortuneTone {
  if (grade === "凶" || grade === "大凶") return "caution";
  if (grade.includes("吉")) return "auspicious";
  return "neutral";
}

export function getOmikujiMeta(omikuji: Omikuji): OmikujiMeta {
  const shortLine =
    omikuji.original[omikuji.original.length - 1] ??
    omikuji.original[0] ??
    "";

  return {
    tags: deriveTags(omikuji.words),
    tone: deriveTone(omikuji.grade),
    shortLine,
  };
}
