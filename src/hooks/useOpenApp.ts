import { useCallback } from "react";
import { useModal } from "@react95/core";
import { useWindowsStore } from "../store/windows";

/** Opens an app window, or brings it back to the front if it is already open. */
export function useOpenApp() {
  const openWindow = useWindowsStore((s) => s.openWindow);
  const { restore, focus } = useModal();

  return useCallback(
    (id: string) => {
      if (useWindowsStore.getState().openWindows.includes(id)) {
        restore(id);
        focus(id);
      } else {
        openWindow(id);
      }
    },
    [openWindow, restore, focus],
  );
}
