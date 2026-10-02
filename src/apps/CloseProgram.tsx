import { Button } from "@react95/core";
import { useState } from "react";
import { getApp } from "./registry";
import { useOpenApp } from "../hooks/useOpenApp";
import { useWindowsStore } from "../store/windows";

// Windows 95's Ctrl+Alt+Del "Close Program" box: the original task manager.
function CloseProgram() {
  const openWindows = useWindowsStore((s) => s.openWindows);
  const closeWindow = useWindowsStore((s) => s.closeWindow);
  const openApp = useOpenApp();
  const running = [...openWindows.filter((id) => id !== "taskmgr")].reverse();
  const [selected, setSelected] = useState<string | null>(null);
  const current = selected && running.includes(selected) ? selected : running[0];

  return (
    <div className="close-program">
      <ul className="pick-list tall" role="listbox">
        {running.length === 0 && <li className="muted">No programs are running.</li>}
        {running.map((id) => (
          <li key={id}>
            <button
              role="option"
              aria-selected={id === current}
              onClick={() => setSelected(id)}
              onDoubleClick={() => openApp(id)}
            >
              {getApp(id)?.title ?? id}
            </button>
          </li>
        ))}
      </ul>
      <p className="muted">
        WARNING: Pressing CTRL+ALT+DEL again will... do nothing. This is a website.
      </p>
      <div className="button-row center">
        <Button disabled={!current} onClick={() => current && closeWindow(current)}>
          End Task
        </Button>
        <Button disabled={!current} onClick={() => current && openApp(current)}>
          Switch To
        </Button>
        <Button onClick={() => closeWindow("taskmgr")}>Cancel</Button>
      </div>
    </div>
  );
}

export default CloseProgram;
