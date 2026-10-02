import { Button } from "@react95/core";
import { useState } from "react";
import { FileText } from "./icons";
import { getApp } from "./registry";
import { useDesktop } from "../store/desktop";
import { useUi } from "../store/ui";

const TRASH = [
  { name: "portfolio_final_FINAL_v3.html", size: "48 KB" },
  { name: "todo_list_from_2019.txt", size: "1 KB" },
  { name: "my_first_website.html", size: "3 KB" },
  { name: "node_modules", size: "2.1 GB" },
];

function RecycleBin() {
  const [junk, setJunk] = useState(TRASH);
  const [selected, setSelected] = useState<string | null>(null);
  const recycled = useDesktop((s) => s.recycled);
  const restore = useDesktop((s) => s.restore);
  const showContextMenu = useUi((s) => s.showContextMenu);
  const count = junk.length + recycled.length;

  // Emptying only throws out the junk; deleted desktop icons are too useful to
  // lose, so they stay until restored.
  return (
    <div className="explorer">
      <div className="explorer-toolbar">
        <Button disabled={!selected} onClick={() => selected && restore(selected)}>
          Restore
        </Button>
        <Button disabled={junk.length === 0} onClick={() => setJunk([])}>
          Empty Recycle Bin
        </Button>
      </div>
      <div className="explorer-list">
        {count === 0 && <p className="muted">The Recycle Bin is empty.</p>}
        {recycled.map((id) => {
          const app = getApp(id);
          if (!app) return null;
          return (
            <div
              key={id}
              role="button"
              tabIndex={0}
              className={`explorer-row${selected === id ? " selected" : ""}`}
              onClick={() => setSelected(id)}
              onDoubleClick={() => restore(id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelected(id);
                showContextMenu(e.clientX, e.clientY, [
                  { label: "Restore", bold: true, onClick: () => restore(id) },
                ]);
              }}
            >
              <span className="explorer-name">
                {app.smallIcon}
                {app.label}
              </span>
              <span>Shortcut</span>
              <span />
            </div>
          );
        })}
        {junk.map((item) => (
          <div key={item.name} className="explorer-row">
            <span className="explorer-name">
              {FileText}
              {item.name}
            </span>
            <span>{item.size}</span>
            <span />
          </div>
        ))}
      </div>
      <div className="statusbar">
        {count} object(s){recycled.length > 0 && " · double-click a shortcut to restore it"}
      </div>
    </div>
  );
}

export default RecycleBin;
