import { stepIndex, stepLabel, type PilgrimageStep } from "../app/state";

const RITUAL_STEPS: PilgrimageStep[] = [
  "gate",
  "purify",
  "wish",
  "draw",
  "reveal",
  "resolve",
];

export function renderPilgrimageProgress(current: PilgrimageStep): string {
  const currentIdx = stepIndex(current);

  const dots = RITUAL_STEPS.map((step) => {
    const idx = stepIndex(step);
    const done = idx < currentIdx;
    const active = step === current;
    const cls = ["pilgrimage-dot", done ? "done" : "", active ? "active" : ""]
      .filter(Boolean)
      .join(" ");

    return `
      <div class="${cls}" title="${stepLabel(step)}">
        <span class="pilgrimage-dot-inner"></span>
        <span class="pilgrimage-dot-label">${stepLabel(step)}</span>
      </div>
    `;
  }).join("");

  return `<nav class="pilgrimage-progress" aria-label="参拜进度">${dots}</nav>`;
}
