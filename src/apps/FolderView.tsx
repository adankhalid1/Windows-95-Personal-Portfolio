import { useState } from "react";
import { appsInFolder, type FolderId } from "./registry";
import { useOpenApp } from "../hooks/useOpenApp";

// On touch screens a double-tap is awkward, so a single tap opens.
const singleClickOpens = window.matchMedia("(pointer: coarse)").matches;

/** An Explorer "large icons" view of every app in a folder. */
function FolderView({ folder }: { folder: FolderId }) {
  const apps = appsInFolder(folder);
  const openApp = useOpenApp();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="explorer">
      <div className="folder-grid" onClick={() => setSelected(null)}>
        {apps.map((app) => (
          <button
            key={app.id}
            className={`folder-item${selected === app.id ? " selected" : ""}`}
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
      <div className="statusbar">
        {apps.length} object(s) &middot; {singleClickOpens ? "tap" : "double-click"} to open
      </div>
    </div>
  );
}

export const GamesFolder = () => <FolderView folder="games" />;
export const AccessoriesFolder = () => <FolderView folder="accessories" />;
