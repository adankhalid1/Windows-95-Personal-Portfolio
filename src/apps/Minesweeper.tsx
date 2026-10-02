import { useEffect, useState } from "react";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
}

type Status = "ready" | "playing" | "won" | "lost";

const emptyBoard = (): Cell[] =>
  Array.from({ length: ROWS * COLS }, () => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  }));

function neighbors(index: number): number[] {
  const r = Math.floor(index / COLS);
  const c = index % COLS;
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      if ((dr || dc) && nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        result.push(nr * COLS + nc);
      }
    }
  }
  return result;
}

/** Lays mines anywhere except the first-clicked cell and its neighbors. */
function plantMines(board: Cell[], safeIndex: number): Cell[] {
  const safe = new Set([safeIndex, ...neighbors(safeIndex)]);
  const next = board.map((cell) => ({ ...cell }));
  let planted = 0;
  while (planted < MINES) {
    const i = Math.floor(Math.random() * next.length);
    if (!safe.has(i) && !next[i].mine) {
      next[i].mine = true;
      planted++;
    }
  }
  next.forEach((cell, i) => {
    cell.adjacent = neighbors(i).filter((n) => next[n].mine).length;
  });
  return next;
}

/** Reveals a cell, flooding outward through cells with no adjacent mines. */
function reveal(board: Cell[], start: number): Cell[] {
  const next = board.map((cell) => ({ ...cell }));
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    const cell = next[i];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adjacent === 0 && !cell.mine) stack.push(...neighbors(i));
  }
  return next;
}

const FACES: Record<Status, string> = {
  ready: "🙂",
  playing: "🙂",
  won: "😎",
  lost: "😵",
};

// Phones can't right-click (and iOS has no long-press menu), so touch
// screens get a flag-mode toggle instead.
const isTouch = window.matchMedia("(pointer: coarse)").matches;

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="mines-help">
      <h3>How to Play</h3>
      <p>
        <b>Goal:</b> uncover every square that <i>isn't</i> a mine. There are {MINES} mines
        hidden on the {ROWS}x{COLS} board.
      </p>
      <ul>
        <li>
          <b>Uncover a square:</b> {isTouch ? "tap it" : "left-click it"}. Your first click is
          always safe.
        </li>
        <li>
          <b>Numbers</b> tell you how many mines touch that square, including diagonals. A
          blank square has none, so its neighbors open up automatically.
        </li>
        <li>
          <b>Flag a mine:</b>{" "}
          {isTouch
            ? "turn on 🚩 flag mode below the board, then tap a square. Tap it again to remove the flag."
            : "right-click a square you think hides a mine. Right-click again to remove it."}
        </li>
        <li>
          <b>Counters:</b> the left one shows mines left to flag, the right one is your time
          in seconds.
        </li>
        <li>
          <b>Win</b> by uncovering every safe square (😎). Hit a mine and it&apos;s game over
          (😵).
        </li>
        <li>
          <b>New game:</b> click the smiley face, or Game &gt; New.
        </li>
      </ul>
      <p className="muted">
        Tip: if a 1 already touches a flagged mine, every other square around it is safe.
      </p>
      <div className="button-row center">
        <button className="mines-ok" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

const pad = (n: number) => String(Math.max(-99, Math.min(999, n))).padStart(3, "0");

function Minesweeper() {
  const [board, setBoard] = useState(emptyBoard);
  const [status, setStatus] = useState<Status>("ready");
  const [seconds, setSeconds] = useState(0);
  const [menu, setMenu] = useState<"game" | "help" | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [flagMode, setFlagMode] = useState(false);

  useEffect(() => {
    if (status !== "playing") return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const reset = () => {
    setBoard(emptyBoard());
    setStatus("ready");
    setSeconds(0);
  };

  const open = (index: number) => {
    if (status === "won" || status === "lost") return;
    if (board[index].flagged || board[index].revealed) return;

    const armed = status === "ready" ? plantMines(board, index) : board;
    if (armed[index].mine) {
      setBoard(armed.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell)));
      setStatus("lost");
      return;
    }

    const next = reveal(armed, index);
    setBoard(next);
    const cleared = next.every((cell) => cell.mine || cell.revealed);
    setStatus(cleared ? "won" : "playing");
  };

  const toggleFlag = (index: number) => {
    if (status === "won" || status === "lost" || board[index].revealed) return;
    setBoard(board.map((cell, i) => (i === index ? { ...cell, flagged: !cell.flagged } : cell)));
  };

  const flags = board.filter((cell) => cell.flagged).length;

  const menuBar = (
    <div className="mines-menubar" onMouseLeave={() => setMenu(null)}>
      {(["game", "help"] as const).map((name) => (
        <div key={name} className="mines-menu">
          <button
            className={menu === name ? "open" : undefined}
            onClick={() => setMenu(menu === name ? null : name)}
          >
            {name === "game" ? (
              <>
                <u>G</u>ame
              </>
            ) : (
              <>
                <u>H</u>elp
              </>
            )}
          </button>
          {menu === name && (
            <div className="mines-dropdown" role="menu">
              {name === "game" ? (
                <button
                  role="menuitem"
                  onClick={() => {
                    reset();
                    setShowHelp(false);
                    setMenu(null);
                  }}
                >
                  New
                </button>
              ) : (
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowHelp(true);
                    setMenu(null);
                  }}
                >
                  How to Play
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (showHelp) {
    return (
      <div className="mines">
        {menuBar}
        <HowToPlay onClose={() => setShowHelp(false)} />
      </div>
    );
  }

  return (
    <div className="mines">
      {menuBar}
      <div className="mines-header">
        <span className="mines-counter">{pad(MINES - flags)}</span>
        <button className="mines-face" onClick={reset} aria-label="New game">
          {FACES[status]}
        </button>
        <span className="mines-counter">{pad(seconds)}</span>
      </div>
      <div
        className="mines-grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 20px)` }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            className={`mines-cell${cell.revealed ? " revealed" : ""}${
              cell.revealed && cell.mine ? " boom" : ""
            }`}
            data-n={cell.revealed && !cell.mine ? cell.adjacent : undefined}
            onClick={() => (flagMode ? toggleFlag(i) : open(i))}
            onContextMenu={() => toggleFlag(i)}
          >
            {cell.flagged && !cell.revealed
              ? "🚩"
              : cell.revealed
                ? cell.mine
                  ? "💣"
                  : cell.adjacent || ""
                : ""}
          </button>
        ))}
      </div>
      {isTouch && (
        <button
          className={`mines-flag-toggle${flagMode ? " on" : ""}`}
          aria-pressed={flagMode}
          onClick={() => setFlagMode((f) => !f)}
        >
          🚩 Flag mode: {flagMode ? "ON" : "OFF"}
        </button>
      )}
    </div>
  );
}

export default Minesweeper;
