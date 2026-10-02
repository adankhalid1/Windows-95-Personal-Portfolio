import { ModalEvents, useModal } from "@react95/core";
import { useEffect } from "react";
import { APPS } from "./apps/registry";
import AppWindow from "./components/AppWindow";
import BootScreen from "./components/BootScreen";
import ContextMenu from "./components/ContextMenu";
import Desktop from "./components/Desktop";
import Login from "./components/Login";
import RunDialog from "./components/RunDialog";
import ShutdownDialog from "./components/ShutdownDialog";
import ShutdownScreen from "./components/ShutdownScreen";
import Taskbar from "./components/Taskbar";
import WelcomeBalloon from "./components/WelcomeBalloon";
import { useOpenApp } from "./hooks/useOpenApp";
import { wallpaperCss } from "./data/wallpapers";
import { useDesktop } from "./store/desktop";
import { useSession } from "./store/session";
import { useUi } from "./store/ui";
import { useWindowsStore } from "./store/windows";

function App() {
  const phase = useSession((s) => s.phase);
  const openWindows = useWindowsStore((s) => s.openWindows);
  const bringToFront = useWindowsStore((s) => s.bringToFront);
  const { subscribe } = useModal();
  const wallpaper = useDesktop((s) => s.wallpaper);
  const dialog = useUi((s) => s.dialog);
  const openDialog = useUi((s) => s.openDialog);
  const openApp = useOpenApp();

  // react95 only raises the focused window and leaves the rest in DOM order,
  // so keep our own back-to-front stack and hand each window its z-index.
  useEffect(
    () =>
      subscribe(ModalEvents.ModalVisibilityChanged, ({ id }) => {
        if (id) bringToFront(id);
      }),
    [subscribe, bringToFront],
  );

  // Ctrl+Alt+Del (or Ctrl+Shift+Esc) opens Close Program, where the browser lets us.
  useEffect(() => {
    if (phase !== "desktop") return;
    const onKey = (e: KeyboardEvent) => {
      const del = e.ctrlKey && e.altKey && (e.key === "Delete" || e.key === "Backspace");
      const esc = e.ctrlKey && e.shiftKey && e.key === "Escape";
      if (del || esc) {
        e.preventDefault();
        openApp("taskmgr");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, openApp]);

  if (phase === "boot") return <BootScreen />;
  if (phase === "shutdown") return <ShutdownScreen />;

  return (
    <main className="screen" style={{ background: wallpaperCss(wallpaper) }}>
      {phase === "login" && <Login />}
      {phase === "desktop" && (
        <>
          <Desktop />
          {APPS.map(
            (app, slot) =>
              openWindows.includes(app.id) && (
                <AppWindow
                  key={app.id}
                  app={app}
                  slot={slot}
                  zIndex={10 + openWindows.indexOf(app.id)}
                />
              ),
          )}
          <Taskbar />
          <WelcomeBalloon />
          <ContextMenu />
          {dialog === "run" && <RunDialog />}
          {dialog === "shutdown" && <ShutdownDialog close={() => openDialog(null)} />}
        </>
      )}
    </main>
  );
}

export default App;
