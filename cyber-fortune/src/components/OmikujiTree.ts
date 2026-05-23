import { sound } from "../services/sound";

export function renderOmikujiTreeHtml(): string {
  return `
    <section class="omikuji-tree-section">
      <h2 class="omikuji-tree-title">系签解厄</h2>
      <p class="omikuji-tree-desc">
        浅草寺的传统：抽到凶签，可将厄运留在寺中。请把签文拖向签树，愿心诚则安。
      </p>
      <div class="omikuji-tree-area" id="omikuji-tree-area">
        <div class="omikuji-tree-visual" aria-hidden="true">
          <div class="tree-trunk"></div>
          <div class="tree-canopy"></div>
          <div class="tree-fence"></div>
        </div>
        <div class="omikuji-tree-drop" id="omikuji-tree-drop">
          <span>拖至此处系签</span>
        </div>
      </div>
      <div id="fortune-drag-card" class="fortune-drag-card" draggable="true">
        <span class="drag-card-label">凶签 · 拖我向签树</span>
      </div>
      <p class="omikuji-tree-hint" id="tree-hint"></p>
    </section>
  `;
}

export function mountOmikujiTree(
  container: HTMLElement,
  onPurified: () => void,
): void {
  container.innerHTML = renderOmikujiTreeHtml();

  const dragCard = container.querySelector<HTMLElement>("#fortune-drag-card");
  const dropZone = container.querySelector<HTMLElement>("#omikuji-tree-drop");
  const hint = container.querySelector<HTMLElement>("#tree-hint");

  if (!dragCard || !dropZone) return;

  let dragging = false;

  dragCard.addEventListener("dragstart", (e) => {
    dragging = true;
    dragCard.classList.add("dragging");
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "fortune");
    }
  });

  dragCard.addEventListener("dragend", () => {
    dragging = false;
    dragCard.classList.remove("dragging");
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    dropZone.classList.add("drop-active");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drop-active");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drop-active");

    if (!dragging) return;

    sound.purifyTree();
    dropZone.classList.add("drop-success");
    dragCard.style.display = "none";

    if (hint) {
      hint.textContent = "签文已系于树上，厄运随香火消散。愿您此后顺遂。";
      hint.classList.add("tree-hint-success");
    }

    dropZone.innerHTML = '<span class="tree-success">✓ 已系签</span>';

    window.setTimeout(onPurified, 600);
  });

  // Touch-friendly: tap drop zone after tapping card
  let cardSelected = false;
  dragCard.addEventListener("click", () => {
    cardSelected = !cardSelected;
    dragCard.classList.toggle("card-selected", cardSelected);
    if (hint) {
      hint.textContent = cardSelected
        ? "请点击下方「拖至此处系签」区域完成系签"
        : "";
    }
  });

  dropZone.addEventListener("click", () => {
    if (!cardSelected) return;
    sound.purifyTree();
    dropZone.classList.add("drop-success");
    dragCard.style.display = "none";
    if (hint) {
      hint.textContent = "签文已系于树上，厄运随香火消散。愿您此后顺遂。";
      hint.classList.add("tree-hint-success");
    }
    dropZone.innerHTML = '<span class="tree-success">✓ 已系签</span>';
    window.setTimeout(onPurified, 600);
  });
}
