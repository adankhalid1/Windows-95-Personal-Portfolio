import { create } from "zustand";
import type { Link } from "../data/profile";

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
  /** An outside link waiting for the visitor to confirm they want to leave. */
  leaving: Link | null;
  /** Opens a profile link, asking first if it leads off this site. */
  openLink: (link: Link) => void;
  cancelLeave: () => void;
}

export const useUi = create<UiState>((set) => ({
  dialog: null,
  openDialog: (dialog) => set({ dialog }),
  contextMenu: null,
  showContextMenu: (x, y, items) => set({ contextMenu: { x, y, items } }),
  hideContextMenu: () => set({ contextMenu: null }),
  leaving: null,
  openLink: (link) => {
    // Email opens the visitor's mail app rather than another site: no warning.
    if (link.url.startsWith("mailto:")) {
      window.location.href = link.url;
      return;
    }
    set({ leaving: link });
  },
  cancelLeave: () => set({ leaving: null }),
}));
