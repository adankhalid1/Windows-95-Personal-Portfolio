import { useState } from "react";
import { APPS } from "../apps/registry";
import { useOpenApp } from "../hooks/useOpenApp";

// On touch screens a double-tap is awkward, so a single tap opens.
const singleClickOpens = window.matchMedia("(pointer: coarse)").matches;

function Desktop() {
  const [selected, setSelected] = useState<string | null>(null);
  const openApp = useOpenApp();

  return (
    <div className="desktop" onClick={() => setSelected(null)}>
      {APPS.filter((app) => !app.startMenuOnly).map((app) => (
        <button
          key={app.id}
          className={`desktop-icon${selected === app.id ? " selected" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setSelected(app.id);
            if (singleClickOpens) openApp(app.id);
          }}
          onDoubleClick={() => openApp(app.id)}
          onKeyDown={(e) => e.key === "Enter" && openApp(app.id)}
        >
          {app.icon}
          <span>{app.label}</span>
        </button>
      ))}
    </div>
  );
}

export default Desktop;
