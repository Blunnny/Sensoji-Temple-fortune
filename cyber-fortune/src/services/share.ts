import type { Omikuji } from "../contents";
import { numberToChinese } from "../utils/numbers";

export type ShareTemplate = "simple" | "ink" | "festive";

export async function generateShareCard(
  omikuji: Omikuji,
  template: ShareTemplate = "simple",
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  const palettes: Record<ShareTemplate, { bg: string; accent: string; text: string }> = {
    simple: { bg: "#faf6ee", accent: "#b72e2e", text: "#333" },
    ink: { bg: "#f0ebe0", accent: "#222", text: "#222" },
    festive: { bg: "#fff5f5", accent: "#d4a017", text: "#3d2020" },
  };

  const p = palettes[template];

  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  ctx.fillStyle = p.accent;
  ctx.font = "bold 48px 'Noto Serif SC', serif";
  ctx.textAlign = "center";
  ctx.fillText(omikuji.grade, canvas.width / 2, 120);

  ctx.fillStyle = p.text;
  ctx.font = "24px 'Noto Serif SC', serif";
  ctx.fillText(`第${numberToChinese(omikuji.id)}签`, canvas.width / 2, 170);

  // Poem vertical-ish layout
  ctx.font = "bold 28px 'Noto Serif SC', serif";
  let y = 240;
  for (const line of omikuji.original) {
    ctx.fillText(line, canvas.width / 2, y);
    y += 48;
  }

  ctx.font = "18px 'Noto Serif SC', serif";
  ctx.fillStyle = "#666";
  const summary = omikuji.translation.slice(0, 80) + (omikuji.translation.length > 80 ? "…" : "");
  wrapText(ctx, summary, 48, y + 40, canvas.width - 96, 28);

  ctx.font="16px sans-serif";
  ctx.fillStyle = "#999";
  ctx.fillText("浅草缘签 · Sensoji Cyber Fortune", canvas.width / 2, canvas.height - 48);

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const chars = text.split("");
  let line = "";
  let cy = y;

  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x + maxWidth / 2, cy);
      line = ch;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x + maxWidth / 2, cy);
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function copyFortuneText(omikuji: Omikuji): Promise<void> {
  const text = [
    `【浅草缘签】第${omikuji.id}签 · ${omikuji.grade}`,
    "",
    omikuji.original.join("\n"),
    "",
    omikuji.translation,
  ].join("\n");

  return navigator.clipboard.writeText(text);
}

export function parsePermalinkFortuneId(): number | null {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  if (Number.isFinite(id) && id >= 1 && id <= 100) return id;
  return null;
}
