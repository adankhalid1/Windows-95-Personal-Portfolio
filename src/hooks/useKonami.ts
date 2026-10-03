import { useEffect } from "react";
import type { Wallpaper } from "../store/desktop";
import { useDesktop } from "../store/desktop";
import { useSecrets } from "../store/secrets";
import { useUi } from "../store/ui";

const CODE = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"];
const KEYS: Record<string, string> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  b: "b",
  B: "b",
  a: "a",
  A: "a",
};
const SWIPE = 30;

/** The wallpaper to go back to when cheat mode is switched off again. */
let before: Wallpaper | null = null;

function toggleCheat() {
  const { cheat, setCheat, unlock } = useSecrets.getState();
  const desktop = useDesktop.getState();
  if (!cheat) {
    before = desktop.wallpaper;
    desktop.setWallpaper({ kind: "image", id: "cheat" });
    setCheat(true);
    unlock("konami");
    useUi.getState().showNotice({
      title: "Cheat Mode",
      message:
        "Cheat mode activated! Minesweeper now shows a tiny dot on every mine, and there's a new wallpaper. Enter the code again to switch it off.",
    });
  } else {
    if (before && desktop.wallpaper.kind === "image" && desktop.wallpaper.id === "cheat") {
      desktop.setWallpaper(before);
    }
    setCheat(false);
    useUi.getState().showNotice({ title: "Cheat Mode", message: "Cheat mode deactivated. Play fair!" });
  }
}

/**
 * Listens for the Konami code: arrow keys then B, A on a keyboard, or the
 * same arrows swiped on the empty desktop and then two taps on a phone.
 */
export function useKonami(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let at = 0;
    const feed = (step: string) => {
      // A tap stands for whichever of B or A comes next.
      const want = CODE[at];
      const ok = step === want || (step === "tap" && (want === "b" || want === "a"));
      if (ok) at++;
      else at = step === CODE[0] ? 1 : 0;
      if (at === CODE.length) {
        at = 0;
        toggleCheat();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const step = KEYS[e.key];
      if (step) feed(step);
      else if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) at = 0;
    };

    let start: { x: number; y: number; id: number } | null = null;
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      start = e.pointerType !== "mouse" && target?.classList.contains("desktop") ? { x: e.clientX, y: e.clientY, id: e.pointerId } : null;
    };
    const onUp = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (Math.hypot(dx, dy) < SWIPE / 2) feed("tap");
      else if (Math.abs(dx) > Math.abs(dy)) feed(dx > 0 ? "right" : "left");
      else feed(dy > 0 ? "down" : "up");
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", onUp, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp, true);
    };
  }, [active]);
}
