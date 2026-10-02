import { useCallback, useEffect, useRef, useState } from "react";
import MenuBar from "../../components/MenuBar";
import { useWindowKeys } from "../../hooks/useWindowKeys";
import { isTouch, useHighScore } from "./highScore";

const COLS = 10;
const ROWS = 20;
const CELL = 16;

type Kind = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
type Board = (string | null)[][];

const SHAPES: Record<Kind, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const COLORS: Record<Kind, string> = {
  I: "#00c0c0",
  O: "#e0c000",
  T: "#a000c0",
  S: "#00b000",
  Z: "#d00000",
  J: "#0040e0",
  L: "#e07000",
};

/** Points for clearing 1-4 lines at once, times the level. */
const LINE_POINTS = [0, 100, 300, 500, 800];

interface Piece {
  kind: Kind;
  shape: number[][];
  x: number;
  y: number;
}

const rotate = (m: number[][]) => m[0].map((_, i) => m.map((row) => row[i]).reverse());
const emptyBoard = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const gravityMs = (level: number) => Math.max(70, 800 - (level - 1) * 70);

/** "7-bag": every piece once, shuffled, so droughts can't happen. */
function makeBag(): Kind[] {
  const bag: Kind[] = ["I", "O", "T", "S", "Z", "J", "L"];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function collides(board: Board, p: Piece, dx = 0, dy = 0, shape = p.shape) {
  return shape.some((row, r) =>
    row.some((filled, c) => {
      if (!filled) return false;
      const x = p.x + c + dx;
      const y = p.y + r + dy;
      return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x] !== null);
    }),
  );
}

function spawn(kind: Kind): Piece {
  const shape = SHAPES[kind];
  return { kind, shape, x: Math.floor((COLS - shape[0].length) / 2), y: kind === "I" ? -1 : 0 };
}

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="game-help">
      <h3>How to Play Blocks</h3>
      <p>
        <b>Goal:</b> fit the falling pieces together to fill complete rows. Full rows vanish
        and score points. The game ends when the pile reaches the top.
      </p>
      <ul>
        <li>
          <b>← →</b> move, <b>↑</b> or <b>X</b> rotate, <b>Z</b> rotate the other way.
        </li>
        <li>
          <b>↓</b> drops faster, <b>Space</b> drops all the way.
        </li>
        <li>
          <b>P</b> pauses.{isTouch ? " On a phone, use the buttons under the board." : ""}
        </li>
        <li>
          Clearing several rows at once scores much more: 1 row 100, 2 rows 300, 3 rows 500,
          4 rows 800 (times your level).
        </li>
        <li>Every 10 rows you level up and pieces fall faster.</li>
        <li>The faint outline shows where the piece will land.</li>
      </ul>
      <div className="button-row center">
        <button className="win-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

type Status = "ready" | "playing" | "paused" | "over";

function Blocks() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const board = useRef<Board>(emptyBoard());
  // Set up the first two pieces once (not on every render).
  const [first] = useState(() => {
    const b = makeBag();
    return { bag: b, piece: b.pop()!, next: b.pop()! };
  });
  const bag = useRef<Kind[]>(first.bag);
  const piece = useRef<Piece>(spawn(first.piece));
  const next = useRef<Kind>(first.next);
  const takeNext = () => {
    if (bag.current.length === 0) bag.current = makeBag();
    return bag.current.pop()!;
  };
  const stats = useRef({ score: 0, lines: 0, level: 1 });

  const [status, setStatus] = useState<Status>("ready");
  const [display, setDisplay] = useState(stats.current);
  const [showHelp, setShowHelp] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const { best, submit } = useHighScore("blocks");

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const cell = (x: number, y: number, color: string, size = CELL, c = ctx) => {
      c.fillStyle = color;
      c.fillRect(x * size, y * size, size, size);
      c.fillStyle = "rgba(255,255,255,0.45)";
      c.fillRect(x * size, y * size, size, 2);
      c.fillRect(x * size, y * size, 2, size);
      c.fillStyle = "rgba(0,0,0,0.35)";
      c.fillRect(x * size, y * size + size - 2, size, 2);
      c.fillRect(x * size + size - 2, y * size, 2, size);
    };
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    board.current.forEach((row, y) => row.forEach((color, x) => color && cell(x, y, color)));

    const p = piece.current;
    if (status !== "over") {
      // Ghost: where a hard drop would land.
      let drop = 0;
      while (!collides(board.current, p, 0, drop + 1)) drop++;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      p.shape.forEach((row, r) =>
        row.forEach((f, c) => {
          if (f && p.y + r + drop >= 0)
            ctx.strokeRect((p.x + c) * CELL + 1.5, (p.y + r + drop) * CELL + 1.5, CELL - 3, CELL - 3);
        }),
      );
      p.shape.forEach((row, r) =>
        row.forEach((f, c) => f && p.y + r >= 0 && cell(p.x + c, p.y + r, COLORS[p.kind])),
      );
    }

    const pc = preview.current?.getContext("2d");
    if (pc) {
      pc.fillStyle = "#000";
      pc.fillRect(0, 0, 56, 42);
      // Center the next piece's filled cells in a 4 x 3 box.
      const filled = SHAPES[next.current].flatMap((row, r) => row.flatMap((f, c) => (f ? [[c, r]] : [])));
      const xs = filled.map(([c]) => c);
      const ys = filled.map(([, r]) => r);
      const ox = (4 - (Math.max(...xs) - Math.min(...xs) + 1)) / 2 - Math.min(...xs);
      const oy = (3 - (Math.max(...ys) - Math.min(...ys) + 1)) / 2 - Math.min(...ys);
      filled.forEach(([c, r]) => cell(c + ox, r + oy, COLORS[next.current], 14, pc));
    }
  }, [status]);

  const lockAndContinue = useCallback(() => {
    const p = piece.current;
    const b = board.current;
    let toppedOut = false;
    p.shape.forEach((row, r) =>
      row.forEach((f, c) => {
        if (!f) return;
        if (p.y + r < 0) toppedOut = true;
        else b[p.y + r][p.x + c] = COLORS[p.kind];
      }),
    );
    const kept = b.filter((row) => row.some((c) => c === null));
    const cleared = ROWS - kept.length;
    board.current = [...Array.from({ length: cleared }, () => Array(COLS).fill(null)), ...kept];

    const s = stats.current;
    if (cleared) {
      s.score += LINE_POINTS[cleared] * s.level;
      s.lines += cleared;
      s.level = Math.floor(s.lines / 10) + 1;
    }
    piece.current = spawn(next.current);
    next.current = takeNext();
    setDisplay({ ...s });
    if (toppedOut || collides(board.current, piece.current)) {
      setStatus("over");
      setNewBest(submit(s.score));
    }
  }, [submit]);

  // Gravity.
  useEffect(() => {
    draw();
    if (status !== "playing") return;
    const t = setInterval(() => {
      if (!collides(board.current, piece.current, 0, 1)) piece.current = { ...piece.current, y: piece.current.y + 1 };
      else lockAndContinue();
      draw();
    }, gravityMs(display.level));
    return () => clearInterval(t);
  }, [status, display.level, draw, lockAndContinue]);

  const act = (action: "left" | "right" | "down" | "rotate" | "rotateBack" | "drop") => {
    if (status === "ready") setStatus("playing");
    else if (status !== "playing") return;
    const p = piece.current;
    const b = board.current;
    if (action === "left" && !collides(b, p, -1)) piece.current = { ...p, x: p.x - 1 };
    if (action === "right" && !collides(b, p, 1)) piece.current = { ...p, x: p.x + 1 };
    if (action === "down") {
      if (!collides(b, p, 0, 1)) {
        piece.current = { ...p, y: p.y + 1 };
        stats.current.score += 1;
        setDisplay({ ...stats.current });
      } else lockAndContinue();
    }
    if (action === "rotate" || action === "rotateBack") {
      let shape = rotate(p.shape);
      if (action === "rotateBack") shape = rotate(rotate(shape));
      // Wall kicks: nudge sideways if the turn would hit something.
      const kick = [0, -1, 1, -2, 2].find((dx) => !collides(b, p, dx, 0, shape));
      if (kick !== undefined) piece.current = { ...p, shape, x: p.x + kick };
    }
    if (action === "drop") {
      let d = 0;
      while (!collides(b, p, 0, d + 1)) d++;
      piece.current = { ...p, y: p.y + d };
      stats.current.score += 2 * d;
      lockAndContinue();
    }
    draw();
  };

  const restart = () => {
    board.current = emptyBoard();
    bag.current = makeBag();
    piece.current = spawn(takeNext());
    next.current = takeNext();
    stats.current = { score: 0, lines: 0, level: 1 };
    setDisplay(stats.current);
    setNewBest(false);
    setStatus("ready");
    canvas.current?.focus();
  };

  useWindowKeys((e) => {
    const map: Record<string, Parameters<typeof act>[0]> = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowDown: "down",
      ArrowUp: "rotate",
      x: "rotate",
      z: "rotateBack",
      " ": "drop",
    };
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (map[key]) {
      e.preventDefault();
      act(map[key]);
    } else if (key === "p") {
      if (status === "playing") setStatus("paused");
      else if (status === "paused") setStatus("playing");
    }
  });

  const message =
    status === "ready"
      ? isTouch
        ? "Tap a button to start"
        : "Press any arrow key to start"
      : status === "paused"
        ? "Paused"
        : status === "over"
          ? newBest
            ? "New high score! 🎉"
            : "Game over"
          : null;

  return (
    <div className="arcade">
      <MenuBar
        menus={[
          {
            label: "Game",
            items: [
              { label: "New Game", onClick: restart },
              {
                label: status === "paused" ? "Resume" : "Pause",
                onClick: () => setStatus(status === "paused" ? "playing" : "paused"),
                disabled: status !== "playing" && status !== "paused",
              },
            ],
          },
          { label: "Help", items: [{ label: "How to Play", onClick: () => setShowHelp(true) }] },
        ]}
      />
      {showHelp ? (
        <HowToPlay onClose={() => setShowHelp(false)} />
      ) : (
        <>
          <div className="blocks-layout">
            <div className="arcade-stage">
              <canvas
                ref={canvas}
                width={COLS * CELL}
                height={ROWS * CELL}
                tabIndex={0}
                autoFocus
                className="arcade-canvas"
                aria-label="Blocks board"
                onPointerDown={(e) => e.currentTarget.focus()}
              />
              {message && (
                <div className="arcade-message">
                  <b>{message}</b>
                  {status === "over" && (
                    <button className="win-btn" onClick={restart}>
                      Play again
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="blocks-side">
              <fieldset>
                <legend>Next</legend>
                <canvas ref={preview} width={56} height={42} />
              </fieldset>
              <p>
                Score
                <b>{display.score}</b>
              </p>
              <p>
                Lines
                <b>{display.lines}</b>
              </p>
              <p>
                Level
                <b>{display.level}</b>
              </p>
              <p>
                Best
                <b>{Math.max(best, display.score)}</b>
              </p>
            </div>
          </div>
          {isTouch && (
            <div className="touch-row">
              <button className="win-btn" onClick={() => act("left")} aria-label="Left">◀</button>
              <button className="win-btn" onClick={() => act("rotate")} aria-label="Rotate">⟳</button>
              <button className="win-btn" onClick={() => act("right")} aria-label="Right">▶</button>
              <button className="win-btn" onClick={() => act("down")} aria-label="Down">▼</button>
              <button className="win-btn" onClick={() => act("drop")} aria-label="Drop">⤓</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Blocks;
