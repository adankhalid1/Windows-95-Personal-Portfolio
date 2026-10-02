import { useState } from "react";

export interface MenuItem {
  label: string;
  onClick: () => void;
  checked?: boolean;
  disabled?: boolean;
}

export interface Menu {
  /** Menu title; its first letter is underlined like a Win95 access key. */
  label: string;
  items: (MenuItem | "divider")[];
}

/** A classic in-window menu bar (Game, Help, ...) with drop-down menus. */
function MenuBar({ menus }: { menus: Menu[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="menubar" onMouseLeave={() => setOpen(null)}>
      {menus.map((menu) => (
        <div key={menu.label} className="menubar-menu">
          <button
            className={open === menu.label ? "open" : undefined}
            aria-haspopup="menu"
            aria-expanded={open === menu.label}
            onClick={() => setOpen(open === menu.label ? null : menu.label)}
          >
            <u>{menu.label[0]}</u>
            {menu.label.slice(1)}
          </button>
          {open === menu.label && (
            <div className="menubar-dropdown" role="menu">
              {menu.items.map((item, i) =>
                item === "divider" ? (
                  <hr key={i} className="menubar-divider" />
                ) : (
                  <button
                    key={item.label}
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      setOpen(null);
                      item.onClick();
                    }}
                  >
                    <span className="menubar-check">{item.checked ? "✓" : ""}</span>
                    {item.label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default MenuBar;
