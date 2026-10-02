import { TitleBar } from "@react95/core";
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
  const Content = app.component;
  const offset = 24 + slot * 28;
  // Cascade from the top-left, but never push the window off a narrow screen.
  const left = app.width
    ? `min(${offset + 96}px, max(8px, calc(100vw - ${app.width}px - 24px)))`
    : `${offset + 96}px`;

  return (
    <Win95Modal
      id={app.id}
      icon={app.smallIcon}
      title={app.title}
      className="app-window"
      style={{ left, top: offset, zIndex }}
      titleBarOptions={[
        <Win95Modal.Minimize key="minimize" />,
        <TitleBar.Close key="close" onClick={() => closeWindow(app.id)} />,
      ]}
    >
      <Win95Modal.Content
        className="app-window-content"
        style={{
          width: app.width ? `min(${app.width}px, calc(100vw - 32px))` : undefined,
          height: app.height
            ? `min(${app.height}px, calc(100vh - 140px))`
            : undefined,
        }}
      >
        <Content />
      </Win95Modal.Content>
    </Win95Modal>
  );
}

export default AppWindow;
