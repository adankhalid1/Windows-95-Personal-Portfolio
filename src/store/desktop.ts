import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export type IconSize = "small" | "medium" | "large";
export type ScreensaverKind = "none" | "flying" | "starfield" | "mystify" | "matrix";
export type Wallpaper = { kind: "image"; id: string } | { kind: "color"; value: string };

interface Point {
  x: number;
  y: number;
}

interface DesktopState {
  /** Icons the visitor has dragged somewhere; the rest sit in the default grid. */
  positions: Record<string, Point>;
  iconSize: IconSize;
  wallpaper: Wallpaper;
  /** Desktop icons sitting in the Recycle Bin, most recent last. */
  recycled: string[];
  screensaver: ScreensaverKind;
  /** Minutes of no activity before the screensaver starts. */
  screensaverWait: number;
  moveIcon: (id: string, to: Point) => void;
  arrangeIcons: () => void;
  setIconSize: (size: IconSize) => void;
  setWallpaper: (wallpaper: Wallpaper) => void;
  recycle: (id: string) => void;
  restore: (id: string) => void;
  restoreAll: () => void;
  resetDesktop: () => void;
  setScreensaver: (kind: ScreensaverKind, wait?: number) => void;
}

const DEFAULTS = {
  positions: {},
  iconSize: "large" as IconSize,
  wallpaper: { kind: "image", id: "bliss" } as Wallpaper,
  recycled: [],
  screensaver: "flying" as ScreensaverKind,
  screensaverWait: 1,
};

// localStorage can throw (private windows, blocked storage); fall back to
// an in-memory desktop instead of crashing.
export const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* not persisted this time */
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* nothing to remove */
    }
  },
};

export const useDesktop = create<DesktopState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      moveIcon: (id, to) => set((s) => ({ positions: { ...s.positions, [id]: to } })),
      arrangeIcons: () => set({ positions: {} }),
      setIconSize: (iconSize) => set({ iconSize, positions: {} }),
      setWallpaper: (wallpaper) => set({ wallpaper }),
      recycle: (id) =>
        set((s) => (s.recycled.includes(id) ? s : { recycled: [...s.recycled, id] })),
      restore: (id) => set((s) => ({ recycled: s.recycled.filter((r) => r !== id) })),
      restoreAll: () => set({ recycled: [] }),
      resetDesktop: () => set(DEFAULTS),
      setScreensaver: (screensaver, wait) =>
        set((s) => ({ screensaver, screensaverWait: wait ?? s.screensaverWait })),
    }),
    {
      name: "win95-desktop",
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ positions, iconSize, wallpaper, recycled, screensaver, screensaverWait }) => ({
        positions,
        iconSize,
        wallpaper,
        recycled,
        screensaver,
        screensaverWait,
      }),
    },
  ),
);
