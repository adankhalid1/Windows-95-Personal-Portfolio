import { create } from "zustand";

interface WindowStore {
  /** Open window ids, back-to-front: the last one is drawn on top. */
  openWindows: string[];
  openWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  closeWindow: (id: string) => void;
  closeAll: () => void;
}

export const useWindowsStore = create<WindowStore>((set) => ({
  openWindows: [],
  openWindow: (id) =>
    set((state) => ({
      openWindows: [...state.openWindows.filter((w) => w !== id), id],
    })),
  bringToFront: (id) =>
    set((state) =>
      state.openWindows.includes(id) && state.openWindows.at(-1) !== id
        ? { openWindows: [...state.openWindows.filter((w) => w !== id), id] }
        : state,
    ),
  closeWindow: (id) =>
    set((state) => ({
      openWindows: state.openWindows.filter((w) => w !== id),
    })),
  closeAll: () => set({ openWindows: [] }),
}));
