import { useRef, useState } from "react";
import MenuBar from "../../components/MenuBar";
import { useWindowKeys } from "../../hooks/useWindowKeys";
import { isTouch, useHighScore } from "../arcade/highScore";

const N = 4;
type Grid = number[]; // 0 = empty, row-major
type Dir = "left" | "right" | "up" | "down";

function addTile(g: Grid): Grid {
  const empty = g.flatMap((v, i) => (v ? [] : [i]));
  if (!empty.length) return g;
  const next = [...g];
  next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

const fresh = () => addTile(addTile(Array(N * N).fill(0)));

/** Slides one row toward its start, merging equal neighbours once. */
function slideRow(row: number[]): { row: number[]; gained: number } {
  const tiles = row.filter(Boolean);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      out.push(tiles[i] * 2);
      gained += tiles[i] * 2;
      i++;
    } else out.push(tiles[i]);
  }
  while (out.length < N) out.push(0);
  return { row: out, gained };
}

function slide(g: Grid, dir: Dir): { grid: Grid; gained: number; moved: boolean } {
  const next = Array(N * N).fill(0);
  let gained = 0;
  for (let k = 0; k < N; k++) {
    // Read each row/column in the direction of travel.
    const cells = Array.from({ length: N }, (_, j) => {
      if (dir === "left") return k * N + j;
      if (dir === "right") return k * N + (N - 1 - j);
      if (dir === "up") return j * N + k;
      return (N - 1 - j) * N + k;
    });
    const { row, gained: g2 } = slideRow(cells.map((i) => g[i]));
    gained += g2;
    cells.forEach((i, j) => (next[i] = row[j]));
  }
  return { grid: next, gained, moved: next.some((v, i) => v !== g[i]) };
}

const canMove = (g: Grid) => (["left", "right", "up", "down"] as Dir[]).some((d) => slide(g, d).moved);

function Game2048() {
  const [grid, setGrid] = useState<Grid>(fresh);
  const [score, setScore] = useState(0);
  const [keepGoing, setKeepGoing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const { best, submit } = useHighScore("2048");
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const won = grid.some((v) => v >= 2048);
  const over = !canMove(grid);

  const move = (dir: Dir) => {
    if (over || (won && !keepGoing)) return;
    const { grid: next, gained, moved } = slide(grid, dir);
    if (!moved) return;
    const withTile = addTile(next);
    const total = score + gained;
    setGrid(withTile);
    setScore(total);
    if (!canMove(withTile)) setNewBest(submit(total));
  };

  const newGame = () => {
    if (!over) submit(score);
    setGrid(fresh());
    setScore(0);
    setKeepGoing(false);
    setNewBest(false);
    setShowHelp(false);
    box.current?.focus();
  };

  const keys: Record<string, Dir> = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    a: "left",
    d: "right",
    w: "up",
    s: "down",
  };

  useWindowKeys((e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (keys[k] && !showHelp) {
      e.preventDefault();
      move(keys[k]);
    }
  });

  return (
    <div className="board-game">
      <MenuBar
        menus={[
          { label: "Game", items: [{ label: "New Game", onClick: newGame }] },
          { label: "Help", items: [{ label: "How to Play", onClick: () => setShowHelp(true) }] },
        ]}
      />
      {showHelp ? (
        <div className="game-help">
          <h3>How to Play 2048</h3>
          <ul>
            <li>
              {isTouch ? "Swipe" : "Use the arrow keys (or W A S D)"} to slide every tile on the
              board in that direction.
            </li>
            <li>Two tiles with the same number merge into one: 2 + 2 = 4, 4 + 4 = 8, and so on.</li>
            <li>A new 2 (or sometimes a 4) appears after every move.</li>
            <li>Make a <b>2048</b> tile to win. You can keep going for a higher score.</li>
            <li>The game ends when the board is full and nothing can merge.</li>
            <li>Tip: keep your biggest tile in a corner.</li>
          </ul>
          <div className="button-row center">
            <button className="win-btn" onClick={() => setShowHelp(false)}>
              OK
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={box}
            className="g2048-board"
            tabIndex={0}
            autoFocus
            role="grid"
            aria-label="2048 board"
            onPointerDown={(e) => {
              e.currentTarget.focus();
              swipe.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              const s = swipe.current;
              swipe.current = null;
              if (!s) return;
              const dx = e.clientX - s.x;
              const dy = e.clientY - s.y;
              if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
              move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
            }}
          >
            {grid.map((v, i) => (
              <div key={i} className={`g2048-tile${v ? ` t${Math.min(v, 4096)}` : ""}`}>
                {v || ""}
              </div>
            ))}
            {(over || (won && !keepGoing)) && (
              <div className="arcade-message">
                <b>{over ? (newBest ? "New high score! 🎉" : "Game over") : "You made 2048! 🎉"}</b>
                <div className="button-row center">
                  {!over && (
                    <button className="win-btn" onClick={() => setKeepGoing(true)}>
                      Keep going
                    </button>
                  )}
                  <button className="win-btn" onClick={newGame}>
                    New game
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="statusbar card-status">
            <span>Score: {score}</span>
            <span>Best: {Math.max(best, score)}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default Game2048;
