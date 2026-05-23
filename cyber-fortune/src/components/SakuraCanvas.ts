import { getCurrentSeason, type Season } from "../services/season";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const PARTICLE_COLORS: Record<Season, string> = {
  spring: "#ffb7c5",
  summer: "#a8d8ea",
  autumn: "#d4a574",
  winter: "#e8eef2",
};

export class SakuraCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId = 0;
  private season: Season;
  private reducedMotion: boolean;

  constructor(container: HTMLElement) {
    this.season = getCurrentSeason();
    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    this.canvas = document.createElement("canvas");
    this.canvas.className = "sakura-canvas";
    this.canvas.setAttribute("aria-hidden", "true");

    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2d not supported");
    this.ctx = ctx;

    container.prepend(this.canvas);
    this.resize();
    window.addEventListener("resize", this.resize);

    if (!this.reducedMotion) {
      this.initParticles(55);
      this.animate();
    }
  }

  private resize = (): void => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private initParticles(count: number): void {
    this.particles = Array.from({ length: count }, () => this.createParticle(true));
  }

  private createParticle(randomY = false): Particle {
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -20,
      size: 4 + Math.random() * 6,
      speedY: 0.4 + Math.random() * 1.2,
      speedX: -0.3 + Math.random() * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -0.02 + Math.random() * 0.04,
      opacity: 0.3 + Math.random() * 0.5,
    };
  }

  private drawPetal(p: Particle): void {
    const color = PARTICLE_COLORS[this.season];
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    this.ctx.globalAlpha = p.opacity;
    this.ctx.fillStyle = color;

    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      if (p.y > this.canvas.height + 20) {
        Object.assign(p, this.createParticle());
        p.y = -10;
      }

      this.drawPetal(p);
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  destroy(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener("resize", this.resize);
    this.canvas.remove();
  }
}
