import { useEffect } from "react";
import { useSession } from "../store/session";
import { useUi } from "../store/ui";
import { useWindowsStore } from "../store/windows";

/**
 * The Blue Screen of Death, for visitors who type FORMAT C: into MS-DOS.
 * Any key or tap "restarts" the computer back to the BIOS screen.
 */
function Bsod() {
  useEffect(() => {
    // Ignore the Enter (or tap) that caused the crash.
    const armedAt = performance.now() + 700;
    const restart = (e: Event) => {
      if (performance.now() < armedAt) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "pointerdown") {
        // The click after this tap would land on the boot screen and skip it.
        const swallow = (c: Event) => c.stopPropagation();
        window.addEventListener("click", swallow, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 600);
      }
      useWindowsStore.getState().closeAll();
      useUi.getState().setBsod(false);
      useSession.getState().setPhase("boot");
    };
    window.addEventListener("keydown", restart, true);
    window.addEventListener("pointerdown", restart, true);
    return () => {
      window.removeEventListener("keydown", restart, true);
      window.removeEventListener("pointerdown", restart, true);
    };
  }, []);

  return (
    <div className="bsod" role="alert">
      <div className="bsod-body">
        <p className="bsod-title">
          <span>Windows</span>
        </p>
        <p>
          A fatal exception 0E has occurred at 0028:C0FFEE42 in VXD PORTFOLIO(01) + 00010E36. The current
          visitor will be terminated.
        </p>
        <p>
          * &nbsp;Press any key to terminate the current application.
          <br />* &nbsp;Press CTRL+ALT+DEL again to restart your computer. You will lose any unsaved
          information in all applications.
        </p>
        <p>Just kidding: nothing was deleted. Your drive is fine.</p>
        <p className="bsod-continue">
          Press any key{window.matchMedia("(pointer: coarse)").matches ? " or tap" : ""} to continue <span className="bsod-cursor">_</span>
        </p>
      </div>
    </div>
  );
}

export default Bsod;
