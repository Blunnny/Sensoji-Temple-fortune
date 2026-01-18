import "./style.css";
import { drawRandomOmikuji, omikujiList, type Omikuji } from "./contents";

const app = document.querySelector<HTMLDivElement>("#app");

function resolveImage(path: string): string {
  try {
    return new URL(path, import.meta.url).href;
  } catch {
    return path;
  }
}

function renderFortune(container: HTMLElement, omikuji: Omikuji): void {
  const originalLines = omikuji.original
    .map((line) => `<li>${line}</li>`)
    .join("");

  const translationLines = `<li>${omikuji.translation}</li>`;

  const frontUrl = resolveImage(omikuji.front);
  const backUrl = resolveImage(omikuji.back);

  const wordsLines = Object.entries(omikuji.words)
    .map(
      ([key, value]) =>
        `<li><span class="word-key">${key}</span><span class="word-value">${value}</span></li>`,
    )
    .join("");

  container.innerHTML = `
    <div class="fortune-header">
      <span class="fortune-id">第 ${omikuji.id} 签</span>
      <span class="fortune-grade">${omikuji.grade}</span>
    </div>
    <div class="fortune-images">
      <figure class="fortune-image">
        <img src="${frontUrl}" alt="签的正面" loading="lazy" />
        <figcaption>正面</figcaption>
      </figure>
      <figure class="fortune-image">
        <img src="${backUrl}" alt="签的反面" loading="lazy" />
        <figcaption>反面</figcaption>
      </figure>
    </div>
    <div class="fortune-body">
      <div class="fortune-column">
        <h2 class="fortune-title">签诗</h2>
        <ul class="fortune-list">
          ${originalLines}
        </ul>
      </div>
      <div class="fortune-column">
        <h2 class="fortune-title">解读</h2>
        <ul class="fortune-list">
          ${translationLines}
        </ul>
      </div>
    </div>
    <div class="fortune-words">
      <h2 class="fortune-title">详细解读</h2>
      <ul class="words-list">
        ${wordsLines}
      </ul>
    </div>
  `;
}

if (app) {
  app.innerHTML = `
    <main class="app-shell">
      <header class="app-header">
        <h1>Cyber Fortune</h1>
        <p class="subtitle">赛博占卜体验即将来到这里。</p>
      </header>
      <section class="app-actions">
        <button id="draw-button" class="primary-button" type="button">抽一签</button>
      </section>
      <section id="fortune-card" class="fortune-card">
        <p class="placeholder">尚未抽签，将初始展示第一支测试签。</p>
      </section>
    </main>
  `;

  const card = app.querySelector<HTMLElement>("#fortune-card");
  const button = app.querySelector<HTMLButtonElement>("#draw-button");

  const initial = omikujiList[0];

  if (card && initial) {
    renderFortune(card, initial);
  }

  if (button && card) {
    button.addEventListener("click", () => {
      const result = drawRandomOmikuji();

      console.log("抽到的签：", result);

      if (!result) {
        return;
      }

      renderFortune(card, result);
    });
  }
}
