import { RecycleEmpty } from "@react95/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { APPS, isOnDesktop, type AppDef } from "../apps/registry";
import { useLongPress } from "../hooks/useLongPress";
import { useOpenApp } from "../hooks/useOpenApp";
import { useDesktop, type IconSize } from "../store/desktop";
import { restoreDefaults } from "../store/restoreDefaults";
import { useUi, type MenuEntry } from "../store/ui";

// On touch screens a double-tap is awkward, so a single tap opens.
const singleClickOpens = window.matchMedia("(pointer: coarse)").matches;

const CELL: Record<IconSize, { w: number; h: number }> = {
  small: { w: 72, h: 52 },
  medium: { w: 84, h: 72 },
  large: { w: 100, h: 96 },
};
const PAD = 8;
const MAX_RADIUS = 300;
/** Icon placed in the middle of the circle. */
const CENTER_ICON = "about";
const DRAG_THRESHOLD = 4;
/** Icons that can't be dragged to the Recycle Bin. */
const PROTECTED = new Set(["my-computer", "recycle-bin"]);
const emptyBinIcon = <RecycleEmpty variant="32x32_4" />;

interface Drag {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

/**
 * `n` points evenly spaced along an ellipse's edge (equal distance, not equal
 * angle, so an oval doesn't bunch icons together), starting at the top and
 * going clockwise. For a circle this is the same as equal angles.
 */
function evenlyAround(n: number, rx: number, ry: number): { x: number; y: number }[] {
  const SAMPLES = 720;
  const pts = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const a = -Math.PI / 2 + (i / SAMPLES) * 2 * Math.PI;
    return { x: rx * Math.cos(a), y: ry * Math.sin(a) };
  });
  const dist = [0];
  for (let i = 1; i <= SAMPLES; i++) {
    dist.push(dist[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  const total = dist[SAMPLES];
  return Array.from({ length: n }, (_, k) => {
    const target = (k / n) * total;
    let i = 0;
    while (dist[i + 1] < target) i++;
    return pts[i];
  });
}

function useDesktopSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight - 28 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

function Desktop() {
  const ref = useRef<HTMLDivElement>(null);
  const size = useDesktopSize(ref);
  const openApp = useOpenApp();
  const showContextMenu = useUi((s) => s.showContextMenu);
  const { positions, iconSize, recycled, moveIcon, arrangeIcons, setIconSize, recycle } =
    useDesktop();

  const [selected, setSelected] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const drag = useRef<Drag | null>(null);
  const pressedId = useRef<string | null>(null);

  const cell = CELL[iconSize];
  const icons = APPS.filter((app) => isOnDesktop(app) && !recycled.includes(app.id));
  // Default layout: About Me sits dead center and the other icons are spaced
  // evenly around a circle, starting at the top and going clockwise.
  const ring = icons.filter((app) => app.id !== CENTER_ICON);
  // A circle when there's room; on narrow (phone) screens it would be too
  // tight, so it stretches into a tall oval instead.
  const fitX = Math.min(MAX_RADIUS, (size.w - cell.w) / 2 - PAD);
  const fitY = Math.min(MAX_RADIUS, (size.h - cell.h) / 2 - PAD);
  const ringSpots = useMemo(() => {
    const clear = (spots: { x: number; y: number }[]) =>
      spots.every((a, i) => {
        const b = spots[(i + 1) % spots.length];
        return Math.abs(a.x - b.x) >= cell.w || Math.abs(a.y - b.y) >= cell.h;
      });
    const r = Math.min(fitX, fitY);
    const round = evenlyAround(ring.length, r, r);
    if (clear(round) || ring.length < 2) return round;
    // Too tight for a circle: keep the width, grow the height until no two
    // neighbors overlap (or we run out of screen).
    for (let ry = fitX; ry < fitY; ry += 8) {
      const oval = evenlyAround(ring.length, fitX, ry);
      if (clear(oval)) return oval;
    }
    return evenlyAround(ring.length, fitX, fitY);
  }, [ring.length, fitX, fitY, cell.w, cell.h]);

  // Whole pixels only, so the 1px pixel-art icons never land on half pixels.
  const clamp = (x: number, y: number) => ({
    x: Math.round(Math.min(Math.max(0, x), Math.max(0, size.w - cell.w))),
    y: Math.round(Math.min(Math.max(0, y), Math.max(0, size.h - cell.h))),
  });

  const positionOf = (id: string) => {
    if (dragPos?.id === id) return dragPos;
    const saved = positions[id];
    if (saved) return clamp(saved.x, saved.y);
    if (id === CENTER_ICON) return clamp(size.w / 2 - cell.w / 2, size.h / 2 - cell.h / 2);
    const spot = ringSpots[ring.findIndex((app) => app.id === id)];
    return clamp(size.w / 2 + spot.x - cell.w / 2, size.h / 2 + spot.y - cell.h / 2);
  };

  const iconMenu = (app: AppDef): MenuEntry[] => [
    { label: "Open", bold: true, onClick: () => openApp(app.id) },
    "divider",
    {
      label: "Delete",
      disabled: PROTECTED.has(app.id),
      onClick: () => recycle(app.id),
    },
  ];

  const desktopMenu: MenuEntry[] = [
    { label: "Arrange Icons", onClick: arrangeIcons },
    {
      // Nothing is stale, but a quick blink is what Refresh always "did".
      label: "Refresh",
      onClick: () => {
        setRefreshing(true);
        window.setTimeout(() => setRefreshing(false), 150);
      },
    },
    "divider",
    { label: "Large Icons", checked: iconSize === "large", onClick: () => setIconSize("large") },
    { label: "Medium Icons", checked: iconSize === "medium", onClick: () => setIconSize("medium") },
    { label: "Small Icons", checked: iconSize === "small", onClick: () => setIconSize("small") },
    "divider",
    { label: "Restore Default Desktop", onClick: restoreDefaults },
    { label: "Properties", onClick: () => openApp("display") },
  ];

  const longPress = useLongPress((x, y) => {
    const app = APPS.find((a) => a.id === pressedId.current);
    if (drag.current?.moved) return;
    drag.current = null;
    if (app) {
      setSelected(app.id);
      showContextMenu(x, y, iconMenu(app));
    } else {
      showContextMenu(x, y, desktopMenu);
    }
  });

  const onIconPointerDown = (e: React.PointerEvent, app: AppDef) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    pressedId.current = app.id;
    longPress.handlers.onPointerDown(e);
    const origin = positionOf(app.id);
    drag.current = {
      id: app.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: origin.x,
      originY: origin.y,
      moved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSelected(app.id);
  };

  const onIconPointerMove = (e: React.PointerEvent) => {
    longPress.handlers.onPointerMove(e);
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;
    setDragPos({ id: d.id, ...clamp(d.originX + dx, d.originY + dy) });
  };

  const onIconPointerUp = (e: React.PointerEvent, app: AppDef) => {
    longPress.handlers.onPointerUp();
    const d = drag.current;
    drag.current = null;
    if (!d || d.pointerId !== e.pointerId) return;
    if (d.moved && dragPos) {
      // Snap to a 4px grid so icons line up a little more neatly.
      moveIcon(d.id, { x: Math.round(dragPos.x / 4) * 4, y: Math.round(dragPos.y / 4) * 4 });
      setDragPos(null);
      return;
    }
    setDragPos(null);
    if (singleClickOpens && !longPress.fired.current) openApp(app.id);
  };

  return (
    <div
      ref={ref}
      className={`desktop icons-${iconSize}`}
      onPointerDown={(e) => {
        pressedId.current = null;
        if (e.target === e.currentTarget) {
          setSelected(null);
          longPress.handlers.onPointerDown(e);
        }
      }}
      onPointerMove={longPress.handlers.onPointerMove}
      onPointerUp={longPress.handlers.onPointerUp}
      onContextMenu={(e) => {
        e.preventDefault();
        if (e.target === e.currentTarget) showContextMenu(e.clientX, e.clientY, desktopMenu);
      }}
    >
      {!refreshing && icons.map((app) => {
        const pos = positionOf(app.id);
        const icon = app.id === "recycle-bin" && recycled.length === 0 ? emptyBinIcon : app.icon;
        return (
          <button
            key={app.id}
            className={`desktop-icon${selected === app.id ? " selected" : ""}${
              dragPos?.id === app.id ? " dragging" : ""
            }`}
            style={{ left: pos.x, top: pos.y, width: cell.w }}
            onPointerDown={(e) => onIconPointerDown(e, app)}
            onPointerMove={onIconPointerMove}
            onPointerUp={(e) => onIconPointerUp(e, app)}
            onPointerCancel={() => {
              drag.current = null;
              setDragPos(null);
            }}
            onDoubleClick={() => openApp(app.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") openApp(app.id);
              if (e.key === "Delete" && !PROTECTED.has(app.id)) recycle(app.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelected(app.id);
              showContextMenu(e.clientX, e.clientY, iconMenu(app));
            }}
          >
            {icon}
            <span>{app.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default Desktop;
