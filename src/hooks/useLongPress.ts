import { useRef } from "react";

const LONG_PRESS_MS = 550;

/**
 * Calls `onLongPress` when a touch is held still, so phones get the same
 * menus a right-click gives on desktop (iOS never fires `contextmenu`).
 */
export function useLongPress(onLongPress: (x: number, y: number) => void) {
  const timer = useRef<number | undefined>(undefined);
  const start = useRef({ x: 0, y: 0 });
  const fired = useRef(false);

  const cancel = () => window.clearTimeout(timer.current);

  return {
    /** True if the last touch ended as a long press (so skip the tap). */
    fired,
    handlers: {
      onPointerDown: (e: React.PointerEvent) => {
        fired.current = false;
        if (e.pointerType !== "touch") return;
        start.current = { x: e.clientX, y: e.clientY };
        const { clientX, clientY } = e;
        timer.current = window.setTimeout(() => {
          fired.current = true;
          onLongPress(clientX, clientY);
        }, LONG_PRESS_MS);
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 8) cancel();
      },
      onPointerUp: cancel,
      onPointerCancel: cancel,
    },
  };
}
