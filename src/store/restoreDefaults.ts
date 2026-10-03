import { useDesktop } from "./desktop";
import { useSecrets } from "./secrets";
import { useUi } from "./ui";
import { useWindowsStore } from "./windows";

/**
 * Puts the whole desktop back the way it looked on a first visit: icons
 * restored and back in their circle, default wallpaper, icon size and
 * screensaver, every window closed and cheat mode off. Found achievements
 * are kept (they can be reset from Achievements.txt).
 */
export function restoreDefaults() {
  useWindowsStore.getState().closeAll();
  useDesktop.getState().resetDesktop();
  useSecrets.getState().setCheat(false);
  useUi.getState().showNotice({
    title: "Restore Defaults",
    message: "Your desktop is back to how it looked when you first arrived.",
  });
}
