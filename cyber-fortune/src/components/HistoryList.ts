import type { DrawRecord } from "../types/record";
import { findOmikujiById } from "../services/fortune";

export function renderHistoryList(
  container: HTMLElement,
  records: DrawRecord[],
  onSelect: (fortuneId: number) => void,
): void {
  if (records.length === 0) {
    container.innerHTML =
      '<p class="history-empty">尚无历史记录，完成参拜抽签后即可在此回顾。</p>';
    return;
  }

  const itemsHtml = records
    .map((record) => {
      const omikuji = findOmikujiById(record.fortuneId);
      if (!omikuji) return "";

      const date = new Date(record.drawnAt);
      const timeLabel = Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleString("zh-CN", { hour12: false });

      const baseText = omikuji.original.join("，");
      const purified = record.purified ? '<span class="history-purified">已系签</span>' : "";

      return `
        <li class="history-item">
          <button type="button" class="history-entry" data-id="${omikuji.id}">
            <div class="history-entry-top">
              <span class="history-entry-id">第${omikuji.id}签</span>
              <span class="history-entry-grade">${omikuji.grade}</span>
              ${purified}
              <span class="history-entry-time">${timeLabel}</span>
            </div>
            <div class="history-entry-content">${baseText}</div>
          </button>
        </li>
      `;
    })
    .filter(Boolean)
    .join("");

  container.innerHTML = `<ul class="history-list">${itemsHtml}</ul>`;

  container.querySelectorAll<HTMLButtonElement>(".history-entry").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (Number.isFinite(id)) onSelect(id);
    });
  });
}
