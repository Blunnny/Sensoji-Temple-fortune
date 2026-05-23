import { drawRandomOmikuji } from "../services/fortune";
import { compareFortunes } from "../services/duo";
import type { Omikuji } from "../contents";

export function renderDuoPage(): string {
  return `
    <main class="app-shell duo-shell">
      <header class="app-header">
        <h1>双人合盘</h1>
        <p class="subtitle">两人各抽一签，览缘分共参</p>
      </header>
      <section class="duo-players">
        <div class="duo-player">
          <h3>甲</h3>
          <button type="button" class="secondary-button" id="duo-draw-a">抽签</button>
          <div id="duo-card-a" class="duo-card"></div>
        </div>
        <div class="duo-player">
          <h3>乙</h3>
          <button type="button" class="secondary-button" id="duo-draw-b">抽签</button>
          <div id="duo-card-b" class="duo-card"></div>
        </div>
      </section>
      <section id="duo-result" class="duo-result" hidden></section>
      <section class="page-actions">
        <button id="duo-back" class="primary-button" type="button">返回山门</button>
      </section>
    </main>
  `;
}

function renderMiniCard(omikuji: Omikuji): string {
  return `
    <p class="duo-grade">${omikuji.grade}</p>
    <p class="duo-id">第${omikuji.id}签</p>
    <p class="duo-poem">${omikuji.original.join(" · ")}</p>
  `;
}

export function bindDuoPage(root: HTMLElement, onBack: () => void): void {
  let fortuneA: Omikuji | null = null;
  let fortuneB: Omikuji | null = null;

  const cardA = root.querySelector<HTMLElement>("#duo-card-a");
  const cardB = root.querySelector<HTMLElement>("#duo-card-b");
  const resultEl = root.querySelector<HTMLElement>("#duo-result");

  const tryCompare = (): void => {
    if (!fortuneA || !fortuneB || !resultEl) return;
    const result = compareFortunes(fortuneA, fortuneB);
    resultEl.hidden = false;
    resultEl.innerHTML = `
      <h2 class="duo-result-title">合盘结果 · ${result.compatibility}</h2>
      <p class="duo-result-summary">${result.summary}</p>
    `;
  };

  root.querySelector("#duo-draw-a")?.addEventListener("click", () => {
    fortuneA = drawRandomOmikuji();
    if (fortuneA && cardA) cardA.innerHTML = renderMiniCard(fortuneA);
    tryCompare();
  });

  root.querySelector("#duo-draw-b")?.addEventListener("click", () => {
    fortuneB = drawRandomOmikuji();
    if (fortuneB && cardB) cardB.innerHTML = renderMiniCard(fortuneB);
    tryCompare();
  });

  root.querySelector("#duo-back")?.addEventListener("click", onBack);
}
