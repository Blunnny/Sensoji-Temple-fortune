import {
  computeCalendarStats,
  computeGradeStats,
  computeTrendScores,
} from "../services/stats";
import type { DrawRecord } from "../types/record";

export function renderStatsPage(records: DrawRecord[]): string {
  const grades = computeGradeStats(records);
  const calendar = computeCalendarStats(records);
  const trend = computeTrendScores(records);
  const total = records.length;

  const maxGrade = Math.max(...grades.map((g) => g.count), 1);
  const gradeBars = grades
    .map(
      (g) => `
      <div class="stat-bar-row">
        <span class="stat-bar-label">${g.grade}</span>
        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${(g.count / maxGrade) * 100}%"></div></div>
        <span class="stat-bar-count">${g.count}</span>
      </div>
    `,
    )
    .join("");

  const maxTrend = Math.max(...trend.map((t) => Math.abs(t.score)), 1);
  const trendBars = trend
    .map((t) => {
      const h = (Math.abs(t.score) / maxTrend) * 100;
      const cls = t.score >= 0 ? "trend-good" : "trend-bad";
      return `<div class="trend-bar ${cls}" style="height:${h}%" title="${t.score}"></div>`;
    })
    .join("");

  const calCells = buildCalendarCells(calendar);

  return `
    <main class="app-shell stats-shell">
      <header class="app-header">
        <h1>签运统计</h1>
        <p class="subtitle">共抽签 ${total} 次</p>
      </header>
      <section class="stats-section">
        <h2 class="stats-heading">吉凶分布</h2>
        <div class="stat-bars">${gradeBars || '<p class="history-empty">暂无数据</p>'}</div>
      </section>
      <section class="stats-section">
        <h2 class="stats-heading">近次运势趋势</h2>
        <div class="trend-chart">${trendBars || '<p class="history-empty">暂无</p>'}</div>
      </section>
      <section class="stats-section">
        <h2 class="stats-heading">吉凶日历（近 35 日）</h2>
        <div class="fortune-calendar">${calCells}</div>
        <p class="calendar-legend">
          <span class="cal-dot cal-good"></span> 吉
          <span class="cal-dot cal-neutral"></span> 平
          <span class="cal-dot cal-bad"></span> 凶
        </p>
      </section>
      <section class="page-actions">
        <button id="stats-back" class="primary-button" type="button">返回山门</button>
      </section>
    </main>
  `;
}

function buildCalendarCells(
  calendar: ReturnType<typeof computeCalendarStats>,
): string {
  const map = new Map(calendar.map((c) => [c.date, c]));
  const cells: string[] = [];

  for (let i = 34; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const stat = map.get(key);
    let cls = "cal-empty";
    if (stat) {
      if (stat.tone >= 2) cls = "cal-good";
      else if (stat.tone < 0) cls = "cal-bad";
      else cls = "cal-neutral";
    }
    cells.push(`<div class="cal-cell ${cls}" title="${key} ${stat?.grade ?? ""}"></div>`);
  }

  return cells.join("");
}

export function bindStatsPage(root: HTMLElement, onBack: () => void): void {
  root.querySelector("#stats-back")?.addEventListener("click", onBack);
}
