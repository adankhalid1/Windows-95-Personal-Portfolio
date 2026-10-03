import { useCallback, useEffect, useRef, useState } from "react";
import { useDesktop, type ScreensaverKind } from "../store/desktop";
import { useUi } from "../store/ui";

const ACTIVITY = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** Windows logos streaming toward you out of the dark, like the Win95 original. */
function flyingWindows(): Draw {
  const flags = Array.from({ length: 30 }, () => ({
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
    z: Math.random(),
  }));
  const colors = ["#ff2a1a", "#22c322", "#2a5cff", "#ffd21a"];
  return (ctx, w, h) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    flags.sort((a, b) => b.z - a.z);
    for (const f of flags) {
      f.z -= 0.006;
      if (f.z <= 0.02) {
        f.x = (Math.random() - 0.5) * 2;
        f.y = (Math.random() - 0.5) * 2;
        f.z = 1;
      }
      const sx = w / 2 + (f.x / f.z) * (w / 4);
      const sy = h / 2 + (f.y / f.z) * (h / 4);
      const size = Math.max(2, 9 / f.z);
      // Four slightly skewed panes, waving as the flag flies.
      const wave = Math.sin((1 - f.z) * 12) * size * 0.08;
      colors.forEach((c, i) => {
        ctx.fillStyle = c;
        const px = sx + (i % 2) * (size * 0.55);
        const py = sy + Math.floor(i / 2) * (size * 0.5) + (i % 2 ? wave : -wave);
        ctx.fillRect(px, py, size * 0.5, size * 0.45);
      });
    }
  };
}

function starfield(): Draw {
  const stars = Array.from({ length: 220 }, () => ({
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
    z: Math.random(),
  }));
  return (ctx, w, h) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    for (const s of stars) {
      s.z -= 0.008;
      if (s.z <= 0.01) {
        s.x = (Math.random() - 0.5) * 2;
        s.y = (Math.random() - 0.5) * 2;
        s.z = 1;
      }
      const sx = w / 2 + (s.x / s.z) * (w / 3);
      const sy = h / 2 + (s.y / s.z) * (h / 3);
      const size = Math.max(1, 2.5 * (1 - s.z));
      ctx.fillStyle = `rgba(255,255,255,${1 - s.z})`;
      ctx.fillRect(sx, sy, size, size);
    }
  };
}

/** Two bouncing four-sided shapes leaving trails, slowly changing color. */
function mystify(): Draw {
  const shapes = [0, 1].map((n) => ({
    points: Array.from({ length: 4 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.006,
      vy: (Math.random() - 0.5) * 0.006,
    })),
    trail: [] as { x: number; y: number }[][],
    hue: n * 180,
  }));
  return (ctx, w, h) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    for (const s of shapes) {
      for (const p of s.points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx = -p.vx;
        if (p.y < 0 || p.y > 1) p.vy = -p.vy;
      }
      s.trail.unshift(s.points.map((p) => ({ x: p.x * w, y: p.y * h })));
      if (s.trail.length > 8) s.trail.pop();
      s.hue = (s.hue + 0.4) % 360;
      s.trail.forEach((poly, i) => {
        ctx.strokeStyle = `hsla(${s.hue}, 100%, 60%, ${1 - i / 8})`;
        ctx.beginPath();
        poly.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.stroke();
      });
    }
  };
}

/** Green code raining down the screen. Unlocked by MATRIX in the Command Prompt. */
function matrix(): Draw {
  const CELL = 16;
  const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789ABCDEF<>/*+=";
  let drops: number[] = [];
  let tick = 0;
  return (ctx, w, h) => {
    const cols = Math.ceil(w / CELL);
    if (drops.length !== cols) drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -40));
    // Draw every other frame: the classic effect is a little choppy.
    if (tick++ % 2) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${CELL}px monospace`;
    drops.forEach((row, i) => {
      const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      ctx.fillStyle = Math.random() < 0.08 ? "#d8ffd8" : "#22ff44";
      ctx.fillText(ch, i * CELL, row * CELL);
      drops[i] = row * CELL > h && Math.random() > 0.96 ? 0 : row + 1;
    });
  };
}

const MAKERS: Record<Exclude<ScreensaverKind, "none">, () => Draw> = {
  flying: flyingWindows,
  starfield,
  mystify,
  matrix,
};

/**
 * The saver disappears on pointerdown, so the click that follows would land
 * on whatever was underneath (a tap could change a setting or open an app).
 * Waking up should be all that tap does.
 */
function swallowNextClick() {
  const swallow = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
  window.addEventListener("click", swallow, { capture: true, once: true });
  setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 600);
}

function Saver({ kind, onWake }: { kind: Exclude<ScreensaverKind, "none">; onWake: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = MAKERS[kind]();
    let frame = 0;
    const loop = () => {
      draw(ctx, c.width, c.height);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    // Wake on any real input. A short grace period stops the click or key
    // that started a preview from closing it straight away.
    const armedAt = performance.now() + 500;
    let origin: { x: number; y: number } | null = null;
    const wake = (e: Event) => {
      if (performance.now() < armedAt) return;
      if (e instanceof PointerEvent && e.type === "pointermove") {
        origin ??= { x: e.clientX, y: e.clientY };
        if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) < 8) return; // ignore jitter
      }
      if (e.type === "pointerdown" || e.type === "touchstart") swallowNextClick();
      onWake();
    };
    ACTIVITY.forEach((t) => window.addEventListener(t, wake, true));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      ACTIVITY.forEach((t) => window.removeEventListener(t, wake, true));
    };
  }, [kind, onWake]);

  return <canvas ref={canvas} className="screensaver" aria-label="Screensaver: move the mouse or press a key" />;
}

/** Starts the chosen screensaver after the desktop has been idle for a while. */
function Screensaver() {
  const kind = useDesktop((s) => s.screensaver);
  const wait = useDesktop((s) => s.screensaverWait);
  const now = useUi((s) => s.screensaverNow);
  const setNow = useUi((s) => s.setScreensaverNow);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (kind === "none" || idle) return;
    let timer = window.setTimeout(() => setIdle(true), wait * 60_000);
    const reset = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), wait * 60_000);
    };
    ACTIVITY.forEach((t) => window.addEventListener(t, reset, true));
    return () => {
      clearTimeout(timer);
      ACTIVITY.forEach((t) => window.removeEventListener(t, reset, true));
    };
  }, [kind, wait, idle]);

  // A specific kind asked for right now (the Matrix) beats the chosen one.
  const showKind = typeof now === "string" ? now : kind;
  const showing = (idle || now !== false) && showKind !== "none";
  const onWake = useCallback(() => {
    setIdle(false);
    setNow(false);
  }, [setNow]);

  if (!showing) return null;
  return <Saver kind={showKind as Exclude<ScreensaverKind, "none">} onWake={onWake} />;
}

export default Screensaver;
