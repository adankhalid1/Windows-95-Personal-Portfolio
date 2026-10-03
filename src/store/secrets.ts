import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SECRETS } from "../data/secrets";
import { safeStorage } from "./desktop";

interface SecretsState {
  /** Ids of the easter eggs this visitor has found. */
  found: string[];
  /** The one just found, shown as a pop-up for a few seconds. */
  justFound: string | null;
  /** Konami code: Minesweeper shows its mines. Lasts until the page reloads. */
  cheat: boolean;
  unlock: (id: string) => void;
  dismiss: () => void;
  setCheat: (on: boolean) => void;
  reset: () => void;
}

export const useSecrets = create<SecretsState>()(
  persist(
    (set, get) => ({
      found: [],
      justFound: null,
      cheat: false,
      unlock: (id) => {
        if (get().found.includes(id) || !SECRETS.some((s) => s.id === id)) return;
        set((s) => ({ found: [...s.found, id], justFound: id }));
      },
      dismiss: () => set({ justFound: null }),
      setCheat: (cheat) => set({ cheat }),
      reset: () => set({ found: [], justFound: null }),
    }),
    {
      name: "win95-secrets",
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ found }) => ({ found }),
    },
  ),
);

/** Unlocks an easter egg from outside React (event handlers, commands). */
export const unlock = (id: string) => useSecrets.getState().unlock(id);
