import { sound } from "../services/sound";

interface Stick {
  angle: number;
  offset: number;
  velocity: number;
}

export type ShakePotCallbacks = {
  onShakePower: (power: number) => void;
  onStickOut: (displayNumber: number) => void;
};

export class ShakePot {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sticks: Stick[] = [];
  private shakePower = 0;
  private animId = 0;
  private isDragging = false;
  private lastX = 0;
  private stickOut = false;
  private flyingStick: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    number: number;
  } | null = null;

  private container: HTMLElement;
  private callbacks: ShakePotCallbacks;
  private fortuneIdForDisplay: number;

  constructor(
    container: HTMLElement,
    callbacks: ShakePotCallbacks,
    fortuneIdForDisplay: number,
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.fortuneIdForDisplay = fortuneIdForDisplay;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "shake-pot-canvas";
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    this.ctx = ctx;
    container.appendChild(this.canvas);

    for (let i = 0; i < 24; i++) {
      this.sticks.push({
        angle: (i / 24) * Math.PI * 2,
        offset: 0,
        velocity: 0,
      });
    }

    this.resize();
    window.addEventListener("resize", this.resize);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);

    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", this.onDeviceMotion);
    }

    this.animate();
  }

  private resize = (): void => {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width || 320;
    this.canvas.height = rect.height || 220;
  };

  private onPointerDown = (e: PointerEvent): void => {
    this.isDragging = true;
    this.lastX = e.clientX;
    this.canvas.setPointerCapture(e.pointerId);
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDragging || this.stickOut) return;
    const dx = e.clientX - this.lastX;
    this.lastX = e.clientX;
    this.addShake(Math.abs(dx) * 0.08);
  };

  private onPointerUp = (): void => {
    this.isDragging = false;
  };

  private onDeviceMotion = (e: DeviceMotionEvent): void => {
    if (this.stickOut) return;
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const mag = Math.hypot(acc.x ?? 0, acc.y ?? 0, acc.z ?? 0);
    if (mag > 14) this.addShake((mag - 14) * 0.15);
  };

  private addShake(amount: number): void {
    this.shakePower = Math.min(100, this.shakePower + amount);
    this.callbacks.onShakePower(this.shakePower);

    for (const s of this.sticks) {
      s.velocity += (Math.random() - 0.5) * amount * 0.3;
    }

    if (this.shakePower >= 55 && !this.stickOut) {
      this.launchStick();
    }
  }

  /** External shake from gesture */
  addExternalShake(amount: number): void {
    this.addShake(amount);
  }

  private launchStick(): void {
    this.stickOut = true;
    sound.draw();
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height * 0.55;
    this.flyingStick = {
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 4,
      vy: -6 - Math.random() * 3,
      rotation: 0,
      number: this.fortuneIdForDisplay,
    };
    window.setTimeout(() => {
      this.callbacks.onStickOut(this.fortuneIdForDisplay);
    }, 1200);
  }

  private animate = (): void => {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height * 0.62;
    const potW = width * 0.35;
    const potH = height * 0.38;

    // Pot body (trapezoid)
    this.ctx.fillStyle = "#5c4033";
    this.ctx.beginPath();
    this.ctx.moveTo(cx - potW * 0.7, cy);
    this.ctx.lineTo(cx + potW * 0.7, cy);
    this.ctx.lineTo(cx + potW * 0.5, cy + potH);
    this.ctx.lineTo(cx - potW * 0.5, cy + potH);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = "#8b6914";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Sticks in pot
    if (!this.stickOut) {
      for (const s of this.sticks) {
        s.velocity += -s.offset * 0.08;
        s.velocity *= 0.92;
        s.offset += s.velocity;

        const x = cx + Math.sin(s.angle) * 8;
        const stickTop = cy - 30 + s.offset * 3;
        const stickH = 50;

        this.ctx.strokeStyle = "#c4a574";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x, stickTop + stickH);
        this.ctx.lineTo(x + Math.sin(s.angle) * 2, stickTop);
        this.ctx.stroke();
      }
    }

    // Flying stick
    if (this.flyingStick) {
      const fs = this.flyingStick;
      fs.x += fs.vx;
      fs.y += fs.vy;
      fs.vy += 0.25;
      fs.rotation += 0.1;

      this.ctx.save();
      this.ctx.translate(fs.x, fs.y);
      this.ctx.rotate(fs.rotation);
      this.ctx.fillStyle = "#deb887";
      this.ctx.fillRect(-3, -40, 6, 40);
      this.ctx.fillStyle = "#b72e2e";
      this.ctx.font = "bold 14px serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(String(fs.number), 0, -48);
      this.ctx.restore();
    }

    // Shake hint
    if (!this.stickOut) {
      this.ctx.fillStyle = "#888";
      this.ctx.font = "12px 'Noto Serif SC', serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        `左右拖动或摇晃手机 · ${Math.floor(this.shakePower)}%`,
        cx,
        height - 12,
      );
    }

    this.animId = requestAnimationFrame(this.animate);
  };

  destroy(): void {
    cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("devicemotion", this.onDeviceMotion);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.remove();
  }
}
