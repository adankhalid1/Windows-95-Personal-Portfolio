import { Button } from "@react95/core";
import { FileText } from "./icons";
import { useState } from "react";

const TRASH = [
  { name: "portfolio_final_FINAL_v3.html", size: "48 KB" },
  { name: "todo_list_from_2019.txt", size: "1 KB" },
  { name: "my_first_website.html", size: "3 KB" },
  { name: "node_modules", size: "2.1 GB" },
];

function RecycleBin() {
  const [items, setItems] = useState(TRASH);

  return (
    <div className="explorer">
      <div className="explorer-toolbar">
        <Button disabled={items.length === 0} onClick={() => setItems([])}>
          Empty Recycle Bin
        </Button>
      </div>
      <div className="explorer-list">
        {items.length === 0 && <p className="muted">The Recycle Bin is empty.</p>}
        {items.map((item) => (
          <div key={item.name} className="explorer-row">
            <span className="explorer-name">
              {FileText}
              {item.name}
            </span>
            <span>{item.size}</span>
          </div>
        ))}
      </div>
      <div className="statusbar">{items.length} object(s)</div>
    </div>
  );
}

export default RecycleBin;
