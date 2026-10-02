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

const pad = (n: number) => String(Math.max(-99, Math.min(999, n))).padStart(3, "0");

function Minesweeper() {
  const [board, setBoard] = useState(emptyBoard);
  const [status, setStatus] = useState<Status>("ready");
  const [seconds, setSeconds] = useState(0);

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

  return (
    <div className="mines">
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
            onClick={() => open(i)}
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
    </div>
  );
}

export default Minesweeper;
