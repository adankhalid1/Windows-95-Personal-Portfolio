import { ModalEvents, useModal } from "@react95/core";
import { useEffect } from "react";
import { APPS } from "./apps/registry";
import AppWindow from "./components/AppWindow";
import BootScreen from "./components/BootScreen";
import Desktop from "./components/Desktop";
import Login from "./components/Login";
import ShutdownScreen from "./components/ShutdownScreen";
import Taskbar from "./components/Taskbar";
import { useSession } from "./store/session";
import { useWindowsStore } from "./store/windows";

function App() {
  const phase = useSession((s) => s.phase);
  const openWindows = useWindowsStore((s) => s.openWindows);
  const bringToFront = useWindowsStore((s) => s.bringToFront);
  const { subscribe } = useModal();

  // react95 only raises the focused window and leaves the rest in DOM order,
  // so keep our own back-to-front stack and hand each window its z-index.
  useEffect(
    () =>
      subscribe(ModalEvents.ModalVisibilityChanged, ({ id }) => {
        if (id) bringToFront(id);
      }),
    [subscribe, bringToFront],
  );

  if (phase === "boot") return <BootScreen />;
  if (phase === "shutdown") return <ShutdownScreen />;

  return (
    <main className="screen">
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
        </>
      )}
    </main>
  );
}

export default App;
