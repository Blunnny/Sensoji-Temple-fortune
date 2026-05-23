import type { Omikuji } from "../contents";
import { gradeTone } from "../utils/grade";

export interface DuoResult {
  a: Omikuji;
  b: Omikuji;
  summary: string;
  compatibility: "excellent" | "good" | "neutral" | "challenging";
}

const COMPAT_MESSAGES: Record<DuoResult["compatibility"], string[]> = {
  excellent: [
    "双吉相合，如日月同辉，彼此扶持则万事可成。",
    "两支吉签相遇，缘分深厚，宜共同进取。",
  ],
  good: [
    "一吉一平，相辅相成，以诚相待则渐入佳境。",
    "运势互补，一方稳重一方进取，合作可期。",
  ],
  neutral: [
    "吉凶参半，需多沟通包容，方能在波折中同行。",
    "签意各执一端，宜慢而行，勿急求成。",
  ],
  challenging: [
    "双凶相遇，非缘浅而是考验。共历风雨后或见彩虹。",
    "当下时运皆阻，唯有关怀与耐心可破此局。",
  ],
};

export function compareFortunes(a: Omikuji, b: Omikuji): DuoResult {
  const scoreA = gradeTone(a.grade);
  const scoreB = gradeTone(b.grade);
  const combined = scoreA + scoreB;

  let compatibility: DuoResult["compatibility"];
  if (combined >= 4) compatibility = "excellent";
  else if (combined >= 2) compatibility = "good";
  else if (combined >= -1) compatibility = "neutral";
  else compatibility = "challenging";

  const messages = COMPAT_MESSAGES[compatibility];
  const summary = messages[Math.floor(Math.random() * messages.length)] ?? messages[0];

  return { a, b, summary, compatibility };
}
