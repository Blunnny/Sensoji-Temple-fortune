import "./style.css";
import { drawRandomOmikuji, omikujiList, type Omikuji } from "./contents";

const app = document.querySelector<HTMLDivElement>("#app");

const HISTORY_STORAGE_KEY = "cyber-fortune-history";
const HISTORY_LIMIT = 5;

type HistoryItem = {
  id: number;
  drawnAt: string;
};

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

  const frontUrl = resolveImage(omikuji.front);
  const backUrl = resolveImage(omikuji.back);

  const wordsLines = Object.entries(omikuji.words)
    .map(
      ([key, value]) =>
        `<li><span class="word-key">${key}</span><span class="word-value">${value}</span></li>`,
    )
    .join("");

  const numberToChinese = (num: number): string => {
    const chineseNums = [
      "零",
      "一",
      "二",
      "三",
      "四",
      "五",
      "六",
      "七",
      "八",
      "九",
    ];
    const units = ["", "十", "百"];

    if (num === 100) return "一百";
    if (num < 10) return chineseNums[num];
    if (num < 20) return "十" + (num % 10 === 0 ? "" : chineseNums[num % 10]);

    const str = num.toString();
    let result = "";

    for (let i = 0; i < str.length; i++) {
      const n = parseInt(str[i]);
      const unit = units[str.length - 1 - i];
      if (n !== 0) {
        result += chineseNums[n] + unit;
      } else if (i === str.length - 1 && str[i - 1] !== "0") {
        // Handle trailing zero if needed, usually omitted in "二十"
      } else {
        // Handle internal zero logic if needed
      }
    }
    // Simple fix for 20, 30 etc to be 二十, 三十
    if (num % 10 === 0) {
      return chineseNums[num / 10] + "十";
    }

    return chineseNums[Math.floor(num / 10)] + "十" + chineseNums[num % 10];
  };

  const chineseId = numberToChinese(omikuji.id);

  container.innerHTML = `
    <div class="fortune-header">
      <div class="fortune-id-container">
        <span class="fortune-id">第${chineseId}签</span>
        <span class="fortune-grade">${omikuji.grade}</span>
      </div>
    </div>
    
    <div class="fortune-images">
      <figure class="fortune-image" onclick="window.open('${frontUrl}', '_blank')">
        <img src="${frontUrl}" alt="签的正面" loading="lazy" style="cursor: zoom-in;" />
      </figure>
      <figure class="fortune-image" onclick="window.open('${backUrl}', '_blank')">
        <img src="${backUrl}" alt="签的反面" loading="lazy" style="cursor: zoom-in;" />
      </figure>
    </div>

    <div class="fortune-poem-container">
      <h2 class="fortune-poem-title">签诗</h2>
      <ul class="fortune-poem-list">
        ${originalLines}
      </ul>
    </div>

    <div class="fortune-interpretation">
      <h3 class="fortune-subtitle">【解读】</h3>
      <div class="fortune-text">
        ${omikuji.translation}
      </div>
    </div>

    <div class="fortune-words">
      <h3 class="fortune-subtitle">【详细解读】</h3>
      <ul class="words-list">
        ${wordsLines}
      </ul>
    </div>
  `;
}

function findOmikujiById(id: number): Omikuji | undefined {
  return omikujiList.find((item) => item.id === id);
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item): item is HistoryItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as HistoryItem).id === "number" &&
          typeof (item as HistoryItem).drawnAt === "string",
      )
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    return;
  }
}

function appendToHistory(
  history: HistoryItem[],
  omikuji: Omikuji,
): HistoryItem[] {
  const nextItem: HistoryItem = {
    id: omikuji.id,
    drawnAt: new Date().toISOString(),
  };

  const filtered = history.filter((item) => item.id !== omikuji.id);
  const merged = [nextItem, ...filtered];

  return merged.slice(0, HISTORY_LIMIT);
}

function renderHistory(
  container: HTMLElement,
  history: HistoryItem[],
  card: HTMLElement | null,
): void {
  if (history.length === 0) {
    container.innerHTML =
      '<p class="history-empty">尚无历史记录，抽几签试试。</p>';
    return;
  }

  const itemsHtml = history
    .map((item) => {
      const omikuji = findOmikujiById(item.id);

      if (!omikuji) {
        return "";
      }

      const date = new Date(item.drawnAt);
      const timeLabel = Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleString("zh-CN", {
            hour12: false,
          });

      const baseText = omikuji.original.join("，");
      const needsPeriod =
        baseText.length > 0 &&
        !/[。！？!?]$/.test(baseText.charAt(baseText.length - 1));
      const fullOriginal = needsPeriod ? `${baseText}。` : baseText;

      return `
        <li class="history-item">
          <button
            type="button"
            class="history-entry"
            data-id="${omikuji.id}"
          >
            <div class="history-entry-top">
              <span class="history-entry-id">第${omikuji.id}签</span>
              <span class="history-entry-grade">${omikuji.grade}</span>
              <span class="history-entry-time">${timeLabel}</span>
            </div>
            <div class="history-entry-content">
              ${fullOriginal}
            </div>
          </button>
        </li>
      `;
    })
    .filter((html) => html.length > 0)
    .join("");

  container.innerHTML = `<ul class="history-list">${itemsHtml}</ul>`;

  if (!card) {
    return;
  }

  const buttons =
    container.querySelectorAll<HTMLButtonElement>(".history-entry");

  buttons.forEach((button) => {
    const idValue = button.dataset.id;

    if (!idValue) {
      return;
    }

    const id = Number(idValue);

    if (!Number.isFinite(id)) {
      return;
    }

    const omikuji = findOmikujiById(id);

    if (!omikuji) {
      return;
    }

    button.addEventListener("click", () => {
      renderFortune(card, omikuji);
    });
  });
}

if (app) {
  app.innerHTML = `
    <main class="app-shell">
      <header class="app-header">
        <h1>浅草缘签</h1>
        <div class="header-jp">浅草縁みくじ</div>
        <p class="subtitle">签示因缘，行由心定。</p>
        <p class="subtitle-jp">おみくじは縁を示す、結びはあなたが結ぶ。</p>
      </header>
      <section class="app-actions">
        <button id="draw-button" class="primary-button" type="button">抽一签</button>
      </section>
      <section id="fortune-card" class="fortune-card">
        <p class="placeholder">尚未抽签，将初始展示第一支测试签。</p>
      </section>
      <section id="history-panel" class="history-panel">
        <h2 class="history-title">最近抽到的签</h2>
        <div id="history-content" class="history-content">
          <p class="history-empty">尚无历史记录，抽几签试试。</p>
        </div>
      </section>
    </main>
  `;

  const card = app.querySelector<HTMLElement>("#fortune-card");
  const button = app.querySelector<HTMLButtonElement>("#draw-button");
  const historyContainer = app.querySelector<HTMLElement>("#history-content");

  const initial = omikujiList[0];
  let history = loadHistory();

  if (card && initial) {
    renderFortune(card, initial);
  }

  if (historyContainer) {
    renderHistory(historyContainer, history, card ?? null);
  }

  if (button && card) {
    button.addEventListener("click", () => {
      const result = drawRandomOmikuji();

      console.log("抽到的签：", result);

      if (!result) {
        return;
      }

      renderFortune(card, result);

      history = appendToHistory(history, result);

      if (historyContainer) {
        renderHistory(historyContainer, history, card);
      }

      saveHistory(history);
    });
  }
}
