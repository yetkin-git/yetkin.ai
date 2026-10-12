/**
 * Etkinlik tam puan konfetisi.
 * Tuval yerelde çizilir. Dış kütüphane ve ağ çağrısı yoktur.
 */

const COLORS = ["#f472b6", "#38bdf8", "#facc15", "#34d399", "#a78bfa", "#fb7185", "#fdba74"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  spin: number;
  life: number;
};

function burstFrom(particles: Particle[], x: number, y: number, count: number): void {
  for (let index = 0; index < count; index += 1) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15;
    const speed = 5 + Math.random() * 8;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 7 + Math.random() * 7,
      color: COLORS[index % COLORS.length] ?? "#facc15",
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.28,
      life: 1,
    });
  }
}

export function burstJuniorActivityConfetti(): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  document.querySelector("[data-junior-activity-confetti]")?.remove();
  const canvas = document.createElement("canvas");
  canvas.setAttribute("data-junior-activity-confetti", "");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "60";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  const fit = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  fit();
  const particles: Particle[] = [];
  burstFrom(particles, canvas.width * 0.5, canvas.height * 0.38, 70);
  burstFrom(particles, canvas.width * 0.18, canvas.height * 0.62, 36);
  burstFrom(particles, canvas.width * 0.82, canvas.height * 0.62, 36);

  let frame = 0;
  const tick = () => {
    frame += 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const particle of particles) {
      particle.vy += 0.16;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.992;
      particle.rot += particle.spin;
      particle.life -= 0.007;
      if (particle.life <= 0) {
        continue;
      }
      alive = true;
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rot);
      ctx.globalAlpha = Math.max(particle.life, 0);
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 5, particle.size, particle.size / 2.4);
      ctx.restore();
    }
    if (alive && frame < 240 && canvas.isConnected) {
      window.requestAnimationFrame(tick);
      return;
    }
    canvas.remove();
  };
  window.requestAnimationFrame(tick);
}
