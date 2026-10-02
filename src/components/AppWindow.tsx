import { TitleBar } from "@react95/core";
import { useState } from "react";
import { Win95Modal } from "./Win95Modal";
import type { AppDef } from "../apps/registry";
import { useWindowsStore } from "../store/windows";

interface AppWindowProps {
  app: AppDef;
  /** Position in the app list, used to cascade windows like Windows does. */
  slot: number;
  zIndex: number;
}

function AppWindow({ app, slot, zIndex }: AppWindowProps) {
  const closeWindow = useWindowsStore((s) => s.closeWindow);
  const [maximized, setMaximized] = useState(false);
  const Content = app.component;
  const offset = 24 + slot * 28;
  // Cascade from the top-left, but never push the window off a narrow screen.
  // Self-sizing windows (width 0) are assumed to be about 240px wide.
  const fitWidth = app.width || 240;
  const left = `min(${offset + 96}px, max(8px, calc(100vw - ${fitWidth}px - 24px)))`;
  const canMaximize = !app.fixedSize;
  const toggleMaximized = () => canMaximize && setMaximized((m) => !m);

  return (
    <Win95Modal
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
        <Win95Modal.Minimize key="minimize" />,
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
        <Content />
      </Win95Modal.Content>
    </Win95Modal>
  );
}

export default AppWindow;
