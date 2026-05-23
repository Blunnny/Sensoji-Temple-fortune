import { omikujiList } from "../services/fortune";
import { collectedFortuneIds } from "../services/stats";
import { ACHIEVEMENTS } from "../services/achievements";
import type { DrawRecord } from "../types/record";

export function renderAtlasPage(
  records: DrawRecord[],
  collections: number[],
  unlockedAchievements: string[],
): string {
  const collected = collectedFortuneIds(records);
  const count = collected.size;

  const grid = omikujiList
    .map((o) => {
      const has = collected.has(o.id);
      const fav = collections.includes(o.id);
      return `
        <div class="atlas-cell ${has ? "unlocked" : "locked"}" data-id="${o.id}" title="${has ? `第${o.id}签 ${o.grade}` : "未抽到"}">
          <span class="atlas-num">${o.id}</span>
          ${has ? `<span class="atlas-grade">${o.grade}</span>` : ""}
          ${fav ? '<span class="atlas-fav">★</span>' : ""}
        </div>
      `;
    })
    .join("");

  const achievements = ACHIEVEMENTS.map((a) => {
    const unlocked = unlockedAchievements.includes(a.id);
    return `
      <li class="achievement-item ${unlocked ? "unlocked" : ""}">
        <span class="achievement-name">${a.name}</span>
        <span class="achievement-desc">${a.description}</span>
        ${unlocked ? '<span class="achievement-badge">✓</span>' : ""}
      </li>
    `;
  }).join("");

  return `
    <main class="app-shell atlas-shell">
      <header class="app-header">
        <h1>百签图鉴</h1>
        <p class="subtitle">已收集 ${count} / 100</p>
        <div class="atlas-progress"><div class="atlas-progress-fill" style="width:${count}%"></div></div>
      </header>
      <section class="atlas-grid-section">
        <div class="atlas-grid">${grid}</div>
      </section>
      <section class="achievements-section">
        <h2 class="stats-heading">成就</h2>
        <ul class="achievements-list">${achievements}</ul>
      </section>
      <section class="page-actions">
        <button id="atlas-back" class="primary-button" type="button">返回山门</button>
      </section>
    </main>
  `;
}

export function bindAtlasPage(
  root: HTMLElement,
  onBack: () => void,
  onCellClick: (id: number) => void,
): void {
  root.querySelector("#atlas-back")?.addEventListener("click", onBack);
  root.querySelectorAll<HTMLElement>(".atlas-cell.unlocked").forEach((cell) => {
    cell.addEventListener("click", () => {
      const id = Number(cell.dataset.id);
      if (Number.isFinite(id)) onCellClick(id);
    });
  });
}
