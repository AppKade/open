const canvas = document.querySelector<HTMLCanvasElement>("#space");
const context = canvas?.getContext("2d");
const toggle = document.querySelector<HTMLButtonElement>("#motion-toggle");
const preference = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
let paused = preference.matches;
let frame = 0;
let previous = 0;
let elapsed = 0;
let width = innerWidth;
let height = innerHeight;
const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
const stars = Array.from({ length: 100 }, () => ({
  x: Math.random(),
  y: Math.random(),
  depth: 0.25 + Math.random() * 0.75,
  phase: Math.random() * Math.PI * 2,
}));

function paint(time = 0) {
  if (!canvas || !context) return;
  context.clearRect(0, 0, width, height);
  for (const star of stars) {
    const x =
      (((star.x * width + pointer.x * star.depth) % width) + width) % width;
    const y =
      (((star.y * height + pointer.y * star.depth) % height) + height) % height;
    context.globalAlpha =
      0.2 + star.depth * 0.45 + Math.sin(time * 0.65 + star.phase) * 0.12;
    context.fillStyle = "#d2f9e4";
    context.beginPath();
    context.arc(x, y, 0.5 + star.depth * 0.9, 0, Math.PI * 2);
    context.fill();
  }
  // A short, occasional meteor keeps the background quiet between passes.
  const meteor = time % 11;
  if (!paused && meteor > 8 && meteor < 9.2) {
    const progress = (meteor - 8) / 1.2;
    const x = width * (0.2 + progress * 0.65),
      y = height * progress * 0.45;
    const trail = context.createLinearGradient(x - 100, y - 45, x, y);
    trail.addColorStop(0, "transparent");
    trail.addColorStop(1, "#b3fbdc");
    context.globalAlpha = Math.sin(progress * Math.PI) * 0.6;
    context.strokeStyle = trail;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x - 100, y - 45);
    context.lineTo(x, y);
    context.stroke();
  }
  context.globalAlpha = 1;
}
function tick(now: number) {
  frame = 0;
  if (paused || document.hidden) return;
  const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
  previous = now;
  elapsed += delta;
  pointer.x += (pointer.targetX - pointer.x) * 0.035;
  pointer.y += (pointer.targetY - pointer.y) * 0.035;
  for (const star of stars)
    star.y = (star.y - delta * (0.003 + star.depth * 0.008) + 1) % 1;
  paint(elapsed);
  frame = requestAnimationFrame(tick);
}
function resize() {
  if (!canvas || !context) return;
  width = innerWidth;
  height = innerHeight;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  paint(elapsed);
}
function sync() {
  cancelAnimationFrame(frame);
  frame = 0;
  previous = 0;
  document.documentElement.dataset.motion = paused ? "off" : "on";
  if (toggle) {
    toggle.textContent = paused ? "Play motion" : "Pause motion";
    toggle.setAttribute("aria-pressed", String(paused));
  }
  if (paused)
    document.getAnimations().forEach((animation) => {
      if (animation.effect?.getComputedTiming().iterations !== Infinity)
        animation.finish();
    });
  paint(elapsed);
  if (!paused && !document.hidden && context)
    frame = requestAnimationFrame(tick);
}
toggle?.addEventListener("click", () => {
  paused = !paused;
  sync();
});
preference.addEventListener("change", () => {
  paused = preference.matches;
  sync();
});
document.addEventListener("visibilitychange", sync);
window.addEventListener("resize", resize, { passive: true });

// Native cursor with local lighting, matching the reference's spotlight behavior.
document.addEventListener(
  "pointermove",
  (event) => {
    if (paused || !finePointer.matches || event.pointerType === "touch") return;
    pointer.targetX = (event.clientX / width - 0.5) * 30;
    pointer.targetY = (event.clientY / height - 0.5) * 30;
    const card = (event.target as Element).closest<HTMLElement>(
      ".project-card, .community-panel, .steps article",
    );
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - bounds.top}px`);
  },
  { passive: true },
);

const revealTargets = document.querySelectorAll<HTMLElement>(
  ".hero-badge, .hero h1, .hero .intro, .hero .actions, .section-head, .project-card, .steps article, .community-panel, .closing",
);
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (paused) continue;
      const element = entry.target as HTMLElement;
      const index = [...element.parentElement!.children].indexOf(element);
      element.animate(
        [
          {
            opacity: 0,
            transform: `translateY(${element.closest(".hero") ? "-16" : "24"}px)`,
          },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 850,
          delay: Math.min(index * 100, 400),
          easing: "cubic-bezier(.22,1,.36,1)",
          fill: "backwards",
        },
      );
    }
  },
  { threshold: 0.12 },
);
revealTargets.forEach((element) => observer.observe(element));
resize();
sync();
