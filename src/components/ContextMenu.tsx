import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useUi } from "../store/ui";

function ContextMenu() {
  const menu = useUi((s) => s.contextMenu);
  const hide = useUi((s) => s.hideContextMenu);
  const ref = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Keep the menu on screen, flipping it up/left near the edges.
  useLayoutEffect(() => {
    if (!menu || !ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    setPos({
      x: menu.x + width > window.innerWidth ? Math.max(0, menu.x - width) : menu.x,
      y: menu.y + height > window.innerHeight - 28 ? Math.max(0, menu.y - height) : menu.y,
    });
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) hide();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", hide);
    };
  }, [menu, hide]);

  if (!menu) return null;

  return (
    <ul
      ref={ref}
      className="context-menu"
      role="menu"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menu.items.map((item, i) =>
        item === "divider" ? (
          <li key={i} className="context-divider" role="separator" />
        ) : (
          <li key={i} role="menuitem" aria-disabled={item.disabled}>
            <button
              disabled={item.disabled}
              className={item.bold ? "bold" : undefined}
              onClick={() => {
                hide();
                item.onClick?.();
              }}
            >
              <span className="context-check">{item.checked ? "✓" : ""}</span>
              {item.label}
            </button>
          </li>
        ),
      )}
    </ul>
  );
}

export default ContextMenu;
