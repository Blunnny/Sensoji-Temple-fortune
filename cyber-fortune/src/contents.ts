import omikujiData from "./contents.json";

export type OmikujiOriginal = string[];

export type OmikujiWords = Record<string, string>;

export interface Omikuji {
  front: string;
  back: string;
  id: number;
  grade: string;
  original: OmikujiOriginal;
  translation: string[];
  words: OmikujiWords;
}

export const omikujiList: Omikuji[] = omikujiData as unknown as Omikuji[];

export function drawRandomOmikuji(): Omikuji | null {
  if (omikujiList.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * omikujiList.length);
  return omikujiList[index];
}
