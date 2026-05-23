import { renderPilgrimageProgress } from "../components/PilgrimageProgress";
import { sound } from "../services/sound";

export function renderPurifyPage(): string {
  return `
    <main class="app-shell">
      <header class="app-header">
        ${renderPilgrimageProgress("purify")}
        <h1>净手</h1>
        <p class="subtitle">入寺前先净手净心</p>
      </header>
      <section class="purify-section">
        <div class="water-basin" id="water-basin">
          <div class="water-ripple"></div>
          <div class="water-ripple water-ripple-2"></div>
          <span class="basin-label">手水舍</span>
        </div>
        <p class="purify-hint">点击手水舍完成净手</p>
        <p class="purify-count" id="purify-count">0 / 3</p>
      </section>
      <section class="page-actions">
        <button id="purify-skip" class="link-button" type="button">跳过</button>
      </section>
    </main>
  `;
}

export function bindPurifyPage(
  root: HTMLElement,
  onComplete: () => void,
  onSkip: () => void,
): void {
  let count = 0;
  const basin = root.querySelector<HTMLElement>("#water-basin");
  const counter = root.querySelector<HTMLElement>("#purify-count");

  basin?.addEventListener("click", () => {
    count = Math.min(3, count + 1);
    sound.purify();
    basin.classList.add("basin-active");
    window.setTimeout(() => basin.classList.remove("basin-active"), 400);

    if (counter) counter.textContent = `${count} / 3`;

    if (count >= 3) {
      window.setTimeout(onComplete, 500);
    }
  });

  root.querySelector("#purify-skip")?.addEventListener("click", onSkip);
}
