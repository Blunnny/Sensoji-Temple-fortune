import { renderPilgrimageProgress } from "../components/PilgrimageProgress";
import { sound, unlockAudio } from "../services/sound";

export function renderGatePage(): string {
  return `
    <main class="app-shell">
      <header class="app-header gate-header">
        ${renderPilgrimageProgress("gate")}
        <div class="torii-gate" aria-hidden="true">
          <div class="torii-pillar torii-left"></div>
          <div class="torii-pillar torii-right"></div>
          <div class="torii-lintel"></div>
          <div class="torii-lintel torii-lintel-secondary"></div>
        </div>
        <h1>浅草缘签</h1>
        <div class="header-jp">浅草縁みくじ</div>
        <p class="subtitle">签示因缘，行由心定。</p>
        <p class="subtitle-jp">おみくじは縁を示す、結びはあなたが結ぶ。</p>
      </header>
      <section class="omikuji-intro">
        <h2 class="omikuji-intro-title">浅草寺观音灵签</h2>
        <p class="omikuji-intro-text">
          欢迎来到数字浅草寺。完整参拜包含净手、祈愿、摇签与择屉，亦可快速抽签。
        </p>
      </section>
      <section class="gate-actions">
        <button id="start-pilgrimage" class="primary-button" type="button">开始参拜之旅</button>
        <button id="quick-draw" class="secondary-button" type="button">快速抽签</button>
      </section>
      <nav class="gate-nav">
        <button type="button" class="gate-nav-btn" id="nav-stats">签运统计</button>
        <button type="button" class="gate-nav-btn" id="nav-atlas">百签图鉴</button>
        <button type="button" class="gate-nav-btn" id="nav-duo">双人合盘</button>
      </nav>
    </main>
  `;
}

export function bindGatePage(
  root: HTMLElement,
  onStartPilgrimage: () => void,
  onQuickDraw: () => void,
  onStats: () => void,
  onAtlas: () => void,
  onDuo: () => void,
): void {
  root.querySelector("#start-pilgrimage")?.addEventListener("click", () => {
    unlockAudio();
    sound.click();
    onStartPilgrimage();
  });

  root.querySelector("#quick-draw")?.addEventListener("click", () => {
    unlockAudio();
    sound.click();
    onQuickDraw();
  });

  root.querySelector("#nav-stats")?.addEventListener("click", onStats);
  root.querySelector("#nav-atlas")?.addEventListener("click", onAtlas);
  root.querySelector("#nav-duo")?.addEventListener("click", onDuo);
}
