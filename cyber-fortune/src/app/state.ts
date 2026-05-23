import type { Omikuji } from "../contents";
import type { DrawMethod, DrawRecord, SignType } from "../types/record";

export type PilgrimageStep =
  | "gate"
  | "purify"
  | "wish"
  | "draw"
  | "reveal"
  | "resolve"
  | "exit";

export type AppView = "pilgrimage" | "stats" | "atlas" | "duo";

export type DrawPhase = "shake" | "drawer";

export interface AppState {
  view: AppView;
  step: PilgrimageStep;
  drawPhase: DrawPhase;
  method: DrawMethod | null;
  signType: SignType;
  specifiedId: number | null;
  wish: string;
  pendingFortune: Omikuji | null;
  highlightedDrawer: number | null;
  currentFortune: Omikuji | null;
  currentRecordId: string | null;
  records: DrawRecord[];
  collections: number[];
  skipRitual: boolean;
}

const STEP_ORDER: PilgrimageStep[] = [
  "gate",
  "purify",
  "wish",
  "draw",
  "reveal",
  "resolve",
  "exit",
];

export function createInitialState(
  records: DrawRecord[],
  collections: number[] = [],
): AppState {
  return {
    view: "pilgrimage",
    step: "gate",
    drawPhase: "shake",
    method: null,
    signType: "general",
    specifiedId: null,
    wish: "",
    pendingFortune: null,
    highlightedDrawer: null,
    currentFortune: null,
    currentRecordId: null,
    records,
    collections,
    skipRitual: false,
  };
}

export function stepIndex(step: PilgrimageStep): number {
  return STEP_ORDER.indexOf(step);
}

export function stepLabel(step: PilgrimageStep): string {
  const labels: Record<PilgrimageStep, string> = {
    gate: "山门",
    purify: "净手",
    wish: "祈愿",
    draw: "抽签",
    reveal: "揭签",
    resolve: "解厄",
    exit: "离寺",
  };
  return labels[step];
}

export function nextStepAfterPurify(state: AppState): PilgrimageStep {
  return state.skipRitual ? "draw" : "wish";
}

export function shouldShowResolve(state: AppState): boolean {
  if (!state.currentFortune) return false;
  return state.currentFortune.grade === "凶" || state.currentFortune.grade === "大凶";
}
