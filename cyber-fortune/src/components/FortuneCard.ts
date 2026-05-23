import type { Omikuji } from "../contents";
import { gradeCssClass } from "../utils/grade";
import { resolveImage } from "../utils/images";
import { numberToChinese } from "../utils/numbers";

export function renderFortuneCardHtml(
  omikuji: Omikuji,
  options: { reveal?: boolean } = {},
): string {
  const revealClass = options.reveal ? "fortune-reveal-active" : "";
  const chineseId = numberToChinese(omikuji.id);
  const gradeClass = gradeCssClass(omikuji.grade);

  const frontUrl = resolveImage(omikuji.front);
  const backUrl = resolveImage(omikuji.back);

  const poemColumns = omikuji.original
    .map(
      (line, i) =>
        `<li class="poem-line" style="animation-delay: ${0.4 + i * 0.35}s">${line}</li>`,
    )
    .join("");

  const wordsEntries = Object.entries(omikuji.words);
  const wordsHtml = wordsEntries
    .map(
      ([key, value], i) => `
        <details class="word-accordion" style="animation-delay: ${1.2 + i * 0.08}s">
          <summary class="word-accordion-summary">${key}</summary>
          <p class="word-accordion-body">${value}</p>
        </details>
      `,
    )
    .join("");

  return `
    <div class="fortune-scroll ${revealClass}">
      <div class="scroll-rod scroll-rod-top"></div>
      <div class="scroll-body">
        <div class="fortune-grade-banner ${gradeClass}">
          <span class="fortune-grade-display">${omikuji.grade}</span>
        </div>
        <div class="fortune-header">
          <span class="fortune-id">第${chineseId}签</span>
        </div>

        <div class="fortune-images">
          <figure class="fortune-image fortune-flip">
            <img src="${frontUrl}" alt="签的正面" loading="lazy" class="flip-front" />
            <img src="${backUrl}" alt="签的反面" loading="lazy" class="flip-back" />
          </figure>
        </div>

        <div class="fortune-poem-vertical">
          <h2 class="fortune-poem-title">签诗</h2>
          <ul class="fortune-poem-columns">${poemColumns}</ul>
        </div>

        <div class="fortune-interpretation">
          <h3 class="fortune-subtitle">【解读】</h3>
          <div class="fortune-text fortune-text-reveal">${omikuji.translation}</div>
        </div>

        <div class="fortune-words">
          <h3 class="fortune-subtitle">【详细解读】</h3>
          <div class="words-accordions">${wordsHtml}</div>
        </div>
      </div>
      <div class="scroll-rod scroll-rod-bottom"></div>
    </div>
  `;
}

export function mountFortuneCard(
  container: HTMLElement,
  omikuji: Omikuji,
  animateReveal = true,
): void {
  container.innerHTML = renderFortuneCardHtml(omikuji, { reveal: animateReveal });

  const flip = container.querySelector<HTMLElement>(".fortune-flip");
  flip?.addEventListener("click", () => {
    flip.classList.toggle("flipped");
  });

  if (animateReveal) {
    requestAnimationFrame(() => {
      container.querySelector(".fortune-scroll")?.classList.add("fortune-reveal-active");
    });
  }
}
