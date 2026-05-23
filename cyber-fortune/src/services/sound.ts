const PREFS_KEY = "cyber-fortune-sound";

let audioCtx: AudioContext | null = null;
let enabled = true;
let volume = 0.25;

function loadPrefs(): void {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    const p = JSON.parse(raw) as { enabled?: boolean; volume?: number };
    if (typeof p.enabled === "boolean") enabled = p.enabled;
    if (typeof p.volume === "number") volume = Math.min(1, Math.max(0, p.volume));
  } catch {
    /* ignore */
  }
}

function savePrefs(): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ enabled, volume }));
  } catch {
    /* ignore */
  }
}

function getCtx(): AudioContext | null {
  if (!enabled) return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

/** Simple procedural tones until real audio assets are added */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.15,
): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  gainNode.gain.value = gain * volume;

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(gain * volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.start(now);
  osc.stop(now + duration);
}

export function initSound(): void {
  loadPrefs();
}

export function unlockAudio(): void {
  getCtx();
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  savePrefs();
}

export function setSoundVolume(value: number): void {
  volume = Math.min(1, Math.max(0, value));
  savePrefs();
}

export function getSoundVolume(): number {
  return volume;
}

export const sound = {
  purify: () => {
    playTone(440, 0.15);
    window.setTimeout(() => playTone(523, 0.2), 80);
  },
  offer: () => playTone(880, 0.08, "triangle", 0.12),
  draw: () => playTone(330, 0.25, "sine", 0.18),
  reveal: () => {
    playTone(392, 0.2);
    window.setTimeout(() => playTone(494, 0.35), 120);
  },
  purifyTree: () => {
    playTone(262, 0.4, "sine", 0.2);
    window.setTimeout(() => playTone(349, 0.5), 200);
  },
  click: () => playTone(600, 0.06, "triangle", 0.08),
};
