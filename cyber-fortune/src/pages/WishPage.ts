import { renderPilgrimageProgress } from "../components/PilgrimageProgress";
import type { SignType } from "../types/record";

export function renderWishPage(currentSignType: SignType): string {
  const types: { value: SignType; label: string }[] = [
    { value: "general", label: "综合运势" },
    { value: "love", label: "爱情签" },
    { value: "career", label: "事业签" },
    { value: "daily", label: "今日一言" },
    { value: "specified", label: "指定数字签" },
  ];

  const typeOptions = types
    .map(
      (t) =>
        `<option value="${t.value}" ${t.value === currentSignType ? "selected" : ""}>${t.label}</option>`,
    )
    .join("");

  return `
    <main class="app-shell">
      <header class="app-header">
        ${renderPilgrimageProgress("wish")}
        <h1>祈愿</h1>
        <p class="subtitle">心中默念所求，签文自有回应</p>
      </header>
      <section class="wish-section">
        <label class="wish-label" for="sign-type">签种</label>
        <select id="sign-type" class="wish-select">${typeOptions}</select>

        <div id="specified-wrap" class="specified-wrap" hidden>
          <label class="wish-label" for="specified-id">签号（1–100）</label>
          <input id="specified-id" class="wish-input" type="number" min="1" max="100" placeholder="输入签号" />
        </div>

        <label class="wish-label" for="wish-input">心愿（可选）</label>
        <textarea id="wish-input" class="wish-input" rows="3" placeholder="例：愿事业顺遂、家人安康…"></textarea>
      </section>
      <section class="page-actions">
        <button id="wish-continue" class="primary-button" type="button">前往抽签</button>
        <button id="wish-skip" class="link-button" type="button">跳过祈愿</button>
      </section>
    </main>
  `;
}

export function bindWishPage(
  root: HTMLElement,
  onContinue: (signType: SignType, wish: string, specifiedId: number | null) => void,
  onSkip: () => void,
): void {
  const signTypeSelect = root.querySelector("#sign-type") as HTMLSelectElement;
  const specifiedWrap = root.querySelector("#specified-wrap") as HTMLElement;

  const toggleSpecified = (): void => {
    const isSpecified = signTypeSelect?.value === "specified";
    if (specifiedWrap) specifiedWrap.hidden = !isSpecified;
  };

  signTypeSelect?.addEventListener("change", toggleSpecified);
  toggleSpecified();

  root.querySelector("#wish-continue")?.addEventListener("click", () => {
    const signType = signTypeSelect?.value as SignType;
    const wish =
      (root.querySelector("#wish-input") as HTMLTextAreaElement)?.value.trim() ?? "";
    const specifiedRaw = (root.querySelector("#specified-id") as HTMLInputElement)?.value;
    const specifiedId = specifiedRaw ? Number(specifiedRaw) : null;
    onContinue(signType ?? "general", wish, specifiedId);
  });

  root.querySelector("#wish-skip")?.addEventListener("click", onSkip);
}
