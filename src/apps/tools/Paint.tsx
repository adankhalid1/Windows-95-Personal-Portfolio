import { useEffect, useRef, useState } from "react";
import MenuBar from "../../components/MenuBar";
import { useWindowKeys } from "../../hooks/useWindowKeys";

const W = 480;
const H = 300;
const UNDO_LIMIT = 20;

// The 28-color palette from Windows 95 Paint.
const PALETTE = [
  "#000000", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080",
  "#800080", "#808040", "#004040", "#0080ff", "#004080", "#8000ff", "#804000",
  "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff",
  "#ff00ff", "#ffff80", "#00ff80", "#80ffff", "#8080ff", "#ff0080", "#ff8040",
];

type Tool = "pencil" | "brush" | "eraser" | "spray" | "line" | "rect" | "ellipse" | "fill" | "picker";

const TOOLS: { id: Tool; icon: string; label: string }[] = [
  { id: "pencil", icon: "✏️", label: "Pencil" },
  { id: "brush", icon: "🖌️", label: "Brush" },
  { id: "eraser", icon: "🧽", label: "Eraser" },
  { id: "spray", icon: "💨", label: "Spray can" },
  { id: "line", icon: "╱", label: "Line" },
  { id: "rect", icon: "▭", label: "Rectangle" },
  { id: "ellipse", icon: "◯", label: "Ellipse" },
  { id: "fill", icon: "🪣", label: "Fill with color" },
  { id: "picker", icon: "💉", label: "Pick color" },
];

const SHAPES: Tool[] = ["line", "rect", "ellipse"];

function hexToRgba(hex: string): [number, number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

/** Scanline flood fill of the area of matching color around (x, y). */
function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, hex: string) {
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const at = (px: number, py: number) => (py * W + px) * 4;
  const start = at(x, y);
  const target = [d[start], d[start + 1], d[start + 2], d[start + 3]];
  const fill = hexToRgba(hex);
  if (target.every((v, i) => v === fill[i])) return;
  const matches = (i: number) =>
    d[i] === target[0] && d[i + 1] === target[1] && d[i + 2] === target[2] && d[i + 3] === target[3];
  const stack = [[x, y]];
  while (stack.length) {
    const [sx, sy] = stack.pop()!;
    let lx = sx;
    while (lx > 0 && matches(at(lx - 1, sy))) lx--;
    let rx = sx;
    while (rx < W - 1 && matches(at(rx + 1, sy))) rx++;
    for (let px = lx; px <= rx; px++) {
      const i = at(px, sy);
      d[i] = fill[0];
      d[i + 1] = fill[1];
      d[i + 2] = fill[2];
      d[i + 3] = 255;
      if (sy > 0 && matches(at(px, sy - 1))) stack.push([px, sy - 1]);
      if (sy < H - 1 && matches(at(px, sy + 1))) stack.push([px, sy + 1]);
    }
  }
  ctx.putImageData(img, 0, 0);
}

function Paint() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(3);
  const [filled, setFilled] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const undo = useRef<ImageData[]>([]);
  const stroke = useRef<{ x: number; y: number; startX: number; startY: number; color: string } | null>(null);

  const ctx = () => canvas.current!.getContext("2d", { willReadFrequently: true })!;

  const clear = () => {
    const c = ctx();
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
  };

  useEffect(clear, []);

  const remember = () => {
    undo.current.push(ctx().getImageData(0, 0, W, H));
    if (undo.current.length > UNDO_LIMIT) undo.current.shift();
  };

  const undoLast = () => {
    const img = undo.current.pop();
    if (img) ctx().putImageData(img, 0, 0);
  };

  useWindowKeys((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undoLast();
    }
  });

  /** Pointer position in canvas pixels (the canvas may be scaled on phones). */
  const point = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(W - 1, Math.floor(((e.clientX - r.left) / r.width) * W))),
      y: Math.max(0, Math.min(H - 1, Math.floor(((e.clientY - r.top) / r.height) * H))),
    };
  };

  const drawShape = (c: CanvasRenderingContext2D, shape: Tool, x0: number, y0: number, x1: number, y1: number, color: string, fillColor: string) => {
    c.strokeStyle = color;
    c.fillStyle = fillColor;
    c.lineWidth = Math.max(1, Math.round(size / 2));
    c.beginPath();
    if (shape === "line") {
      c.moveTo(x0 + 0.5, y0 + 0.5);
      c.lineTo(x1 + 0.5, y1 + 0.5);
    } else if (shape === "rect") {
      c.rect(Math.min(x0, x1) + 0.5, Math.min(y0, y1) + 0.5, Math.abs(x1 - x0), Math.abs(y1 - y0));
    } else {
      c.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, 0, 0, Math.PI * 2);
    }
    if (filled && shape !== "line") c.fill();
    c.stroke();
  };

  const paintSegment = (x0: number, y0: number, x1: number, y1: number, color: string) => {
    const c = ctx();
    if (tool === "spray") {
      c.fillStyle = color;
      const r = size * 3;
      for (let i = 0; i < size * 6; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * r;
        c.fillRect(Math.round(x1 + Math.cos(a) * d), Math.round(y1 + Math.sin(a) * d), 1, 1);
      }
      return;
    }
    c.strokeStyle = tool === "eraser" ? bg : color;
    c.lineWidth = tool === "pencil" ? 1 : tool === "eraser" ? size * 3 : size;
    c.lineCap = tool === "eraser" ? "square" : "round";
    c.beginPath();
    c.moveTo(x0 + 0.5, y0 + 0.5);
    c.lineTo(x1 + 0.5, y1 + 0.5);
    c.stroke();
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = point(e);
    const color = e.button === 2 ? bg : fg;
    if (tool === "picker") {
      const [r, g, b] = ctx().getImageData(x, y, 1, 1).data;
      const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
      if (e.button === 2) setBg(hex);
      else setFg(hex);
      return;
    }
    remember();
    if (tool === "fill") {
      floodFill(ctx(), x, y, color);
      return;
    }
    stroke.current = { x, y, startX: x, startY: y, color };
    if (!SHAPES.includes(tool)) paintSegment(x, y, x, y, color);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = point(e);
    setCursor(p);
    const s = stroke.current;
    if (!s) return;
    if (SHAPES.includes(tool)) {
      // Preview the shape on the overlay until the pointer is released.
      const o = overlay.current!.getContext("2d")!;
      o.clearRect(0, 0, W, H);
      drawShape(o, tool, s.startX, s.startY, p.x, p.y, s.color, s.color === fg ? bg : fg);
    } else {
      paintSegment(s.x, s.y, p.x, p.y, s.color);
    }
    s.x = p.x;
    s.y = p.y;
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stroke.current;
    stroke.current = null;
    if (!s || !SHAPES.includes(tool)) return;
    const p = point(e);
    overlay.current!.getContext("2d")!.clearRect(0, 0, W, H);
    drawShape(ctx(), tool, s.startX, s.startY, p.x, p.y, s.color, s.color === fg ? bg : fg);
  };

  const save = () => {
    const a = document.createElement("a");
    a.href = canvas.current!.toDataURL("image/png");
    a.download = "untitled.png";
    a.click();
  };

  return (
    <div className="paint">
      <MenuBar
        menus={[
          {
            label: "File",
            items: [
              { label: "New", onClick: () => { remember(); clear(); } },
              { label: "Save (download .png)", onClick: save },
            ],
          },
          {
            label: "Edit",
            items: [
              { label: "Undo (Ctrl+Z)", onClick: undoLast },
              { label: "Clear Image", onClick: () => { remember(); clear(); } },
            ],
          },
        ]}
      />
      <div className="paint-body">
        <div className="paint-tools" role="toolbar" aria-label="Tools">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`paint-tool${tool === t.id ? " on" : ""}`}
              title={t.label}
              aria-label={t.label}
              aria-pressed={tool === t.id}
              onClick={() => setTool(t.id)}
            >
              {t.icon}
            </button>
          ))}
          <div className="paint-options">
            {SHAPES.includes(tool) && tool !== "line" ? (
              <>
                <button className={!filled ? "on" : ""} onClick={() => setFilled(false)} title="Outline">□</button>
                <button className={filled ? "on" : ""} onClick={() => setFilled(true)} title="Filled">■</button>
              </>
            ) : (
              [1, 3, 5, 8].map((n) => (
                <button key={n} className={size === n ? "on" : ""} onClick={() => setSize(n)} title={`Size ${n}`}>
                  <span style={{ width: n + 1, height: n + 1 }} />
                </button>
              ))
            )}
          </div>
        </div>
        <div className="paint-canvas-wrap">
          <canvas
            ref={canvas}
            width={W}
            height={H}
            className={`paint-canvas tool-${tool}`}
            aria-label="Drawing canvas"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={() => setCursor(null)}
            onContextMenu={(e) => e.preventDefault()}
          />
          <canvas ref={overlay} width={W} height={H} className="paint-overlay" />
        </div>
      </div>
      <div className="paint-palette">
        <div className="paint-current" title="Left click picks the main color, right click the background color">
          <span className="bg" style={{ background: bg }} />
          <span className="fg" style={{ background: fg }} />
        </div>
        <div className="paint-swatches">
          {PALETTE.map((c) => (
            <button
              key={c}
              style={{ background: c }}
              aria-label={`Color ${c}`}
              onClick={() => setFg(c)}
              onContextMenu={(e) => {
                e.preventDefault();
                setBg(c);
              }}
            />
          ))}
        </div>
      </div>
      <div className="statusbar card-status">
        <span>{TOOLS.find((t) => t.id === tool)?.label}</span>
        <span>{cursor ? `${cursor.x}, ${cursor.y}` : ""}</span>
      </div>
    </div>
  );
}

export default Paint;
