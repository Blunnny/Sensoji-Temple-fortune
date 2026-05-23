import { mountFortuneCard } from "../components/FortuneCard";
import { renderHistoryList } from "../components/HistoryList";
import { mountOmikujiTree } from "../components/OmikujiTree";
import { renderPilgrimageProgress } from "../components/PilgrimageProgress";
import { findOmikujiById } from "../services/fortune";
import { sound } from "../services/sound";
import type { ShareTemplate } from "../services/share";
import { isBadFortune } from "../utils/grade";
import type { AppState } from "../app/state";
import type { Omikuji } from "../contents";

export function renderResultPage(
  _omikuji: Omikuji,
  showResolve: boolean,
  step: "reveal" | "resolve",
  isCollected: boolean,
): string {
  return `
    <main class="app-shell">
      <header class="app-header">
        ${renderPilgrimageProgress(step)}
        <h1>浅草缘签</h1>
        <p class="subtitle">${step === "resolve" ? "系签解厄" : "揭签 · 签文已现"}</p>
      </header>
      <section id="fortune-card" class="fortune-card-wrap"></section>
      ${showResolve && step === "resolve" ? '<div id="tree-mount"></div>' : ""}
      <section class="share-section">
        <h2 class="stats-heading">分享签文</h2>
        <div class="share-actions">
          <button type="button" class="secondary-button share-btn" data-template="simple">简约卡片</button>
          <button type="button" class="secondary-button share-btn" data-template="ink">水墨卡片</button>
          <button type="button" class="secondary-button share-btn" data-template="festive">华丽卡片</button>
          <button type="button" class="link-button" id="copy-fortune">复制文案</button>
          <button type="button" class="link-button" id="toggle-collect">${isCollected ? "取消收藏" : "收藏签文"}</button>
        </div>
        <p class="permalink-hint">分享链接：<code id="permalink"></code></p>
      </section>
      <section id="history-panel" class="history-panel">
        <h2 class="history-title">最近抽到的签</h2>
        <div id="history-content" class="history-content"></div>
      </section>
      <section class="result-actions">
        ${
          showResolve && step === "reveal"
            ? '<button id="go-resolve" class="primary-button" type="button">前往系签解厄</button>'
            : ""
        }
        <button id="draw-again" class="primary-button" type="button">再抽一签</button>
        <button id="back-gate" class="link-button" type="button">返回山门</button>
      </section>
    </main>
  `;
}

export function bindResultPage(
  root: HTMLElement,
  state: AppState,
  handlers: {
    onPurified: () => void;
    onDrawAgain: () => void;
    onBackGate: () => void;
    onGoResolve: () => void;
    onHistorySelect: (id: number) => void;
    onToggleCollect: () => void;
    onShare: (template: ShareTemplate) => void;
    onCopyText: () => void;
  },
): void {
  const omikuji = state.currentFortune;
  if (!omikuji) return;

  const cardEl = root.querySelector<HTMLElement>("#fortune-card");
  if (cardEl) {
    mountFortuneCard(cardEl, omikuji, true);
    sound.reveal();
  }

  const permalink = root.querySelector("#permalink");
  if (permalink) {
    const url = `${window.location.origin}${window.location.pathname}?id=${omikuji.id}`;
    permalink.textContent = url;
  }

  const historyEl = root.querySelector<HTMLElement>("#history-content");
  if (historyEl) {
    renderHistoryList(historyEl, state.records, (id) => {
      const found = findOmikujiById(id);
      if (found && cardEl) mountFortuneCard(cardEl, found, false);
      handlers.onHistorySelect(id);
    });
  }

  if (state.step === "resolve" && isBadFortune(omikuji.grade)) {
    const treeMount = root.querySelector<HTMLElement>("#tree-mount");
    if (treeMount) {
      mountOmikujiTree(treeMount, handlers.onPurified);
    }
  }

  root.querySelectorAll<HTMLButtonElement>(".share-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const template = btn.dataset.template as ShareTemplate;
      handlers.onShare(template);
    });
  });

  root.querySelector("#copy-fortune")?.addEventListener("click", handlers.onCopyText);
  root.querySelector("#toggle-collect")?.addEventListener("click", handlers.onToggleCollect);
  root.querySelector("#go-resolve")?.addEventListener("click", handlers.onGoResolve);
  root.querySelector("#draw-again")?.addEventListener("click", handlers.onDrawAgain);
  root.querySelector("#back-gate")?.addEventListener("click", handlers.onBackGate);
}
