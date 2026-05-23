import { toggleNightMode } from "../services/season";
import {
  getSoundVolume,
  isSoundEnabled,
  setSoundEnabled,
  setSoundVolume,
  unlockAudio,
} from "../services/sound";

export function mountSoundControl(container: HTMLElement): void {
  const wrap = document.createElement("div");
  wrap.className = "sound-control";
  wrap.innerHTML = `
    <button type="button" class="night-toggle" aria-label="深夜神社" title="深夜神社">🌙</button>
    <button type="button" class="sound-toggle" aria-label="音效开关" title="音效">
      ${isSoundEnabled() ? "🔔" : "🔕"}
    </button>
    <input type="range" class="sound-volume" min="0" max="100" value="${Math.round(getSoundVolume() * 100)}" aria-label="音量" />
  `;

  wrap.querySelector(".night-toggle")?.addEventListener("click", () => {
    void toggleNightMode();
  });

  const toggle = wrap.querySelector<HTMLButtonElement>(".sound-toggle");
  const slider = wrap.querySelector<HTMLInputElement>(".sound-volume");

  toggle?.addEventListener("click", () => {
    unlockAudio();
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    if (toggle) toggle.textContent = next ? "🔔" : "🔕";
    if (slider) slider.disabled = !next;
  });

  slider?.addEventListener("input", () => {
    unlockAudio();
    setSoundVolume(Number(slider.value) / 100);
  });

  if (slider) slider.disabled = !isSoundEnabled();

  container.appendChild(wrap);
}
