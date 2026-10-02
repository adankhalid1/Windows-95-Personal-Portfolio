import { TitleBar, useModal } from "@react95/core";
import { useLayoutEffect, useRef, useState } from "react";
import { Win95Modal } from "./Win95Modal";
import type { AppDef } from "../apps/registry";
import { WindowIdContext } from "../hooks/useWindowKeys";
import { useWindowsStore } from "../store/windows";

interface AppWindowProps {
  app: AppDef;
  /** Position in the app list, used to cascade windows like Windows does. */
  slot: number;
  zIndex: number;
}

function AppWindow({ app, slot, zIndex }: AppWindowProps) {
  const closeWindow = useWindowsStore((s) => s.closeWindow);
  const { minimize, focus } = useModal();
  const [maximized, setMaximized] = useState(false);
  const Content = app.component;
  // Cascade like Windows does, wrapping back to the top so later apps in a
  // long list don't open off the bottom of the screen.
  const offset = 24 + (slot % 6) * 28;
  // Cascade from the top-left, but never push the window off a narrow screen.
  // Self-sizing windows (width 0) are assumed to be at most 320px wide.
  const fitWidth = app.width || 320;
  const [nudgedLeft, setNudgedLeft] = useState<number | null>(null);
  const left = nudgedLeft ?? `min(${offset + 96}px, max(8px, calc(100vw - ${fitWidth}px - 24px)))`;
  const frame = useRef<HTMLDivElement>(null);

  // Self-sizing windows can turn out wider than guessed: once open, slide
  // left if the window would hang off the right edge of the screen.
  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.right > window.innerWidth - 4) setNudgedLeft(Math.max(4, window.innerWidth - r.width - 4));
  }, []);
  const canMaximize = !app.fixedSize;
  const toggleMaximized = () => canMaximize && setMaximized((m) => !m);

  return (
    <Win95Modal
      ref={frame}
      id={app.id}
      icon={app.smallIcon}
      title={app.title}
      className={`app-window${maximized ? " maximized" : ""}`}
      style={{ left, top: offset, zIndex }}
      dragOptions={{ disabled: maximized }}
      onDoubleClick={(e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest(".draggable")) toggleMaximized();
      }}
      titleBarOptions={[
        // react95's own Minimize button guesses which window it's in from
        // the last focus event, which a touch drag can throw off; this one
        // always minimizes its own window.
        <TitleBar.Minimize
          key="minimize"
          onClick={() => {
            minimize(app.id);
            focus("no-id");
          }}
        />,
        ...(canMaximize
          ? [
              maximized ? (
                <TitleBar.Restore key="restore" onClick={toggleMaximized} />
              ) : (
                <TitleBar.Maximize key="maximize" onClick={toggleMaximized} />
              ),
            ]
          : []),
        <TitleBar.Close key="close" onClick={() => closeWindow(app.id)} />,
      ]}
    >
      <Win95Modal.Content
        className={`app-window-content${app.fixedSize ? "" : " resizable"}`}
        style={
          maximized
            ? undefined
            : {
                width: app.width ? `min(${app.width}px, calc(100vw - 32px))` : undefined,
                height: app.height ? `min(${app.height}px, calc(100vh - 140px))` : undefined,
              }
        }
      >
        <WindowIdContext.Provider value={app.id}>
          <Content />
        </WindowIdContext.Provider>
      </Win95Modal.Content>
    </Win95Modal>
  );
}

export default AppWindow;
