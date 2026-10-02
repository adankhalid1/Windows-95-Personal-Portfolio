import { create } from "zustand";

// The whole machine moves through these screens in order:
// boot -> login -> desktop -> (shutdown -> boot)
export type Phase = "boot" | "login" | "desktop" | "shutdown";

interface SessionState {
  phase: Phase;
  setPhase: (phase: Phase) => void;
}

export const useSession = create<SessionState>((set) => ({
  phase: "boot",
  setPhase: (phase) => set({ phase }),
}));
