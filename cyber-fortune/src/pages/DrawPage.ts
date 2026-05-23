import { ShakePot } from "../components/ShakePot";
import { renderPilgrimageProgress } from "../components/PilgrimageProgress";
import { startGestureOnDrawer, stopGestureCamera } from "../services/gesture";
import { sound } from "../services/sound";
import type { DrawPhase } from "../app/state";
import type { DrawMethod } from "../types/record";

const ELEGANT_NUMERALS = ["壱", "弐", "参", "肆", "伍", "陆", "柒", "捌", "玖"];
const DRAWER_COUNT = 9;

let activeShakePot: ShakePot | null = null;

export function renderDrawPage(
  method: DrawMethod,
  phase: DrawPhase,
  highlightedDrawer: number | null,
): string {
  const isGesture = method === "gesture";

  if (phase === "shake") {
    return `
      <main class="app-shell">
        <header class="app-header">
          ${renderPilgrimageProgress("draw")}
          <h1>摇签筒</h1>
          <p class="subtitle">摇动签筒，待签棒飞出后再择屉确认</p>
        </header>
        <section class="shake-section">
          <div id="shake-pot-mount" class="shake-pot-mount"></div>
          <p class="shake-hint">左右拖动签筒，或摇晃手机</p>
          <button id="skip-shake" class="link-button" type="button">跳过摇签，直接选屉</button>
        </section>
        <div class="drawer-actions">
          <button id="draw-back" class="link-button" type="button">返回</button>
        </div>
      </main>
    `;
  }

  const drawersHtml = Array.from({ length: DRAWER_COUNT }, (_, index) => {
    const label = ELEGANT_NUMERALS[index] ?? String(index + 1);
    const isDestined = highlightedDrawer === index;
    return `
      <button type="button" class="drawer-box drawer-stagger ${isDestined ? "drawer-destined" : ""}" data-index="${index}" style="animation-delay: ${index * 80}ms">
        <span class="drawer-label">${label}</span>
        ${isDestined ? '<span class="drawer-destined-badge">缘</span>' : ""}
      </button>
    `;
  }).join("");

  return `
    <main class="app-shell">
      <header class="app-header">
        ${renderPilgrimageProgress("draw")}
        <h1>择屉问缘</h1>
        <p class="subtitle">请点击高亮「缘」字抽屉确认</p>
        <p class="subtitle-jp drawer-hint">签文已由摇签定下，择屉仅为仪式确认。</p>
      </header>
      <section class="drawer-page">
        <div class="method-picker">
          <button type="button" class="method-tab ${!isGesture ? "active" : ""}" data-method="touch">点击</button>
          <button type="button" class="method-tab ${isGesture ? "active" : ""}" data-method="gesture">手势</button>
        </div>
        <div class="drawer-container">
          <div class="drawer-grid">${drawersHtml}</div>
          <div id="drawer-overlay" class="drawer-overlay">正在换批…</div>
        </div>
        <div id="camera-section" class="camera-section" ${isGesture ? "" : 'style="display:none"'}>
          <h3 class="camera-title">手势抽签</h3>
          <p class="camera-description">合十祈祷后，移动选屉；捏合 2 秒确认。拇指中指轻捏换批。</p>
          <div id="camera-preview" class="camera-preview"></div>
        </div>
        <div class="drawer-actions">
          <button id="draw-back" class="link-button" type="button">返回</button>
        </div>
      </section>
    </main>
  `;
}

export type DrawPageHandlers = {
  onSelect: (drawerIndex: number) => void;
  onBack: () => void;
  onMethodChange: (method: DrawMethod) => void;
  onSkipShake: () => void;
  onShakeReady: () => void;
  onExternalShake: (power: number) => void;
  fortuneIdForShake: number;
};

export function bindDrawPage(
  root: HTMLElement,
  method: DrawMethod,
  phase: DrawPhase,
  highlightedDrawer: number | null,
  handlers: DrawPageHandlers,
): void {
  const isRefreshingRef = { current: false };

  root.querySelector("#draw-back")?.addEventListener("click", () => {
    cleanupDrawPage();
    handlers.onBack();
  });

  if (phase === "shake") {
    const mount = root.querySelector<HTMLElement>("#shake-pot-mount");
    root.querySelector("#skip-shake")?.addEventListener("click", () => {
      cleanupDrawPage();
      handlers.onSkipShake();
    });

    if (mount) {
      activeShakePot = new ShakePot(
        mount,
        {
          onShakePower: () => {},
          onStickOut: () => {
            cleanupDrawPage();
            handlers.onShakeReady();
          },
        },
        handlers.fortuneIdForShake,
      );
    }
    return;
  }

  const boxes = Array.from(root.querySelectorAll<HTMLButtonElement>(".drawer-box"));
  const drawerContainer = root.querySelector<HTMLElement>(".drawer-container");
  const overlay = root.querySelector<HTMLElement>("#drawer-overlay");

  const setHover = (index: number) => {
    boxes.forEach((btn, i) => {
      btn.classList.toggle("drawer-box-hover", i === index);
    });
  };

  const clearHover = () => {
    boxes.forEach((btn) => {
      btn.classList.remove("drawer-box-hover", "drawer-box-selected");
    });
  };

  const setSelected = (index: number) => {
    boxes.forEach((btn, i) => {
      btn.classList.toggle("drawer-box-selected", i === index);
    });
  };

  const confirmDrawer = (index: number) => {
    if (highlightedDrawer !== null && index !== highlightedDrawer) {
      const box = boxes[index];
      box?.classList.add("drawer-wrong");
      window.setTimeout(() => box?.classList.remove("drawer-wrong"), 400);
      return;
    }
    boxes[index]?.classList.add("drawer-opening");
    sound.draw();
    window.setTimeout(() => handlers.onSelect(index), 400);
  };

  boxes.forEach((box, index) => {
    box.addEventListener("click", () => confirmDrawer(index));
  });

  root.querySelectorAll<HTMLButtonElement>(".method-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const m = tab.dataset.method as DrawMethod;
      if (m && m !== method) handlers.onMethodChange(m);
    });
  });

  if (method === "gesture") {
    const preview = root.querySelector<HTMLElement>("#camera-preview");
    if (preview) {
      void startGestureOnDrawer(
        preview,
        DRAWER_COUNT,
        {
          onHover: setHover,
          onClearHover: clearHover,
          onSelectStart: setSelected,
          onSelectEnd: () => clearHover(),
          onConfirm: () => {
            if (highlightedDrawer !== null) confirmDrawer(highlightedDrawer);
          },
          onRefresh: () => {
            drawerContainer?.classList.add("refreshing");
            if (overlay) overlay.style.opacity = "1";
            window.setTimeout(() => {
              drawerContainer?.classList.remove("refreshing");
              if (overlay) overlay.style.opacity = "";
            }, 1500);
          },
          onShake: handlers.onExternalShake,
          onPray: () => sound.purify(),
          showSkeleton: true,
        },
        isRefreshingRef,
      );
    }
  }
}

export function cleanupDrawPage(): void {
  stopGestureCamera();
  activeShakePot?.destroy();
  activeShakePot = null;
}

export function addShakeToPot(power: number): void {
  activeShakePot?.addExternalShake(power * 0.1);
}
