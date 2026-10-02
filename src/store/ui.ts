import { create } from "zustand";

/** Shell dialogs that aren't app windows. */
type Dialog = "run" | "shutdown" | null;

interface ContextMenuItem {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  checked?: boolean;
  bold?: boolean;
}

export type MenuEntry = ContextMenuItem | "divider";

interface UiState {
  dialog: Dialog;
  openDialog: (dialog: Dialog) => void;
  contextMenu: { x: number; y: number; items: MenuEntry[] } | null;
  showContextMenu: (x: number, y: number, items: MenuEntry[]) => void;
  hideContextMenu: () => void;
}

export const useUi = create<UiState>((set) => ({
  dialog: null,
  openDialog: (dialog) => set({ dialog }),
  contextMenu: null,
  showContextMenu: (x, y, items) => set({ contextMenu: { x, y, items } }),
  hideContextMenu: () => set({ contextMenu: null }),
}));
