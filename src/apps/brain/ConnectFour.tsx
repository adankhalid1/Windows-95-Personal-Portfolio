import { useEffect, useState } from "react";
import MenuBar from "../../components/MenuBar";

const COLS = 7;
const ROWS = 6;
type Cell = "R" | "Y" | null; // you are red, the computer is yellow
type Grid = Cell[]; // row-major, row 0 at the top
type Difficulty = "easy" | "normal" | "hard";
const DEPTH: Record<Difficulty, number> = { easy: 2, normal: 4, hard: 6 };

const idx = (r: number, c: number) => r * COLS + c;
const empty = (): Grid => Array(ROWS * COLS).fill(null);

/** Row a piece dropped in `col` would land on, or -1 if the column is full. */
function landingRow(g: Grid, col: number) {
  for (let r = ROWS - 1; r >= 0; r--) if (!g[idx(r, col)]) return r;
  return -1;
}

function drop(g: Grid, col: number, who: Cell): Grid {
  const next = [...g];
  next[idx(landingRow(g, col), col)] = who;
  return next;
}

/** Every line of four on the board. */
const WINDOWS: number[][] = (() => {
  const out: number[][] = [];
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      for (const [dr, dc] of dirs) {
        const cells = [0, 1, 2, 3].map((k) => [r + dr * k, c + dc * k]);
        if (cells.every(([rr, cc]) => rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS))
          out.push(cells.map(([rr, cc]) => idx(rr, cc)));
      }
  return out;
})();

function winner(g: Grid): { who: Cell; cells: number[] } | null {
  for (const w of WINDOWS) {
    const first = g[w[0]];
    if (first && w.every((i) => g[i] === first)) return { who: first, cells: w };
  }
  return null;
}

/** Heuristic for the computer (yellow): count open threes and twos. */
function evaluate(g: Grid): number {
  let score = 0;
  for (let r = 0; r < ROWS; r++) if (g[idx(r, 3)] === "Y") score += 3; // center column
  for (const w of WINDOWS) {
    const ys = w.filter((i) => g[i] === "Y").length;
    const rs = w.filter((i) => g[i] === "R").length;
    if (ys && rs) continue;
    if (ys === 3) score += 5;
    else if (ys === 2) score += 2;
    if (rs === 3) score -= 4;
    else if (rs === 2) score -= 1;
  }
  return score;
}

const ORDER = [3, 2, 4, 1, 5, 0, 6]; // try the center first: better pruning

function search(g: Grid, depth: number, alpha: number, beta: number, yellow: boolean): number {
  const w = winner(g);
  if (w) return w.who === "Y" ? 100_000 + depth : -100_000 - depth;
  const cols = ORDER.filter((c) => landingRow(g, c) >= 0);
  if (cols.length === 0) return 0;
  if (depth === 0) return evaluate(g);
  for (const c of cols) {
    const s = search(drop(g, c, yellow ? "Y" : "R"), depth - 1, alpha, beta, !yellow);
    if (yellow) alpha = Math.max(alpha, s);
    else beta = Math.min(beta, s);
    if (alpha >= beta) break;
  }
  return yellow ? alpha : beta;
}

function chooseColumn(g: Grid, difficulty: Difficulty): number {
  let best = -Infinity;
  let choices: number[] = [];
  for (const c of ORDER) {
    if (landingRow(g, c) < 0) continue;
    let s = search(drop(g, c, "Y"), DEPTH[difficulty] - 1, -Infinity, Infinity, false);
    if (difficulty === "easy") s += (Math.random() - 0.5) * 8;
    if (s > best) {
      best = s;
      choices = [c];
    } else if (s === best) choices.push(c);
  }
  return choices[Math.floor(Math.random() * choices.length)];
}

function ConnectFour() {
  const [grid, setGrid] = useState<Grid>(empty);
  const [yourTurn, setYourTurn] = useState(true);
  const [youStart, setYouStart] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [hover, setHover] = useState<number | null>(null);
  const [lastDrop, setLastDrop] = useState<number | null>(null);
  const [tally, setTally] = useState({ you: 0, cpu: 0, draw: 0 });
  const [showHelp, setShowHelp] = useState(false);

  const win = winner(grid);
  const full = grid.every(Boolean);
  const over = Boolean(win) || full;

  const place = (col: number, who: "R" | "Y") => {
    const row = landingRow(grid, col);
    const next = drop(grid, col, who);
    setGrid(next);
    setLastDrop(idx(row, col));
    const w = winner(next);
    if (w) setTally((t) => (w.who === "R" ? { ...t, you: t.you + 1 } : { ...t, cpu: t.cpu + 1 }));
    else if (next.every(Boolean)) setTally((t) => ({ ...t, draw: t.draw + 1 }));
    setYourTurn(who === "Y");
  };

  useEffect(() => {
    if (yourTurn || over) return;
    const t = setTimeout(() => place(chooseColumn(grid, difficulty), "Y"), 400);
    return () => clearTimeout(t);
    // `place` only reads `grid`, which is already a dependency.
  }, [yourTurn, over, grid, difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  const newGame = () => {
    const starts = !youStart;
    setYouStart(starts);
    setGrid(empty());
    setYourTurn(starts);
    setLastDrop(null);
    setShowHelp(false);
  };

  const status = win
    ? win.who === "R"
      ? "You win! 🎉"
      : "The computer wins."
    : full
      ? "It's a draw."
      : yourTurn
        ? "Your turn: drop a red disc."
        : "Computer is thinking...";

  return (
    <div className="board-game">
      <MenuBar
        menus={[
          {
            label: "Game",
            items: [
              { label: "New Game", onClick: newGame },
              "divider",
              ...(["easy", "normal", "hard"] as Difficulty[]).map((d) => ({
                label: d[0].toUpperCase() + d.slice(1),
                checked: difficulty === d,
                onClick: () => setDifficulty(d),
              })),
            ],
          },
          { label: "Help", items: [{ label: "How to Play", onClick: () => setShowHelp(true) }] },
        ]}
      />
      {showHelp ? (
        <div className="game-help">
          <h3>How to Play Connect Four</h3>
          <ul>
            <li>You are red, the computer is yellow. Take turns dropping discs into a column.</li>
            <li>Discs fall to the lowest empty spot.</li>
            <li>Get four of your discs in a row (across, down, or diagonally) to win.</li>
            <li>Click (or tap) anywhere in a column to drop your disc there.</li>
            <li>You take turns going first. Pick a difficulty in the Game menu.</li>
          </ul>
          <div className="button-row center">
            <button className="win-btn" onClick={() => setShowHelp(false)}>
              OK
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="c4-board" role="grid" aria-label="Connect Four board" onMouseLeave={() => setHover(null)}>
            {Array.from({ length: COLS }, (_, c) => (
              <button
                key={c}
                className={`c4-column${hover === c && yourTurn && !over ? " hover" : ""}`}
                disabled={!yourTurn || over || landingRow(grid, c) < 0}
                onMouseEnter={() => setHover(c)}
                onClick={() => place(c, "R")}
                aria-label={`Drop in column ${c + 1}`}
              >
                {Array.from({ length: ROWS }, (_, r) => {
                  const i = idx(r, c);
                  return (
                    <span
                      key={r}
                      className={[
                        "c4-hole",
                        grid[i] === "R" && "red",
                        grid[i] === "Y" && "yellow",
                        win?.cells.includes(i) && "win",
                        lastDrop === i && "dropped",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={lastDrop === i ? ({ "--fall": `${(r + 1) * -100}%` } as React.CSSProperties) : undefined}
                    />
                  );
                })}
              </button>
            ))}
          </div>
          {over && (
            <div className="button-row center">
              <button className="win-btn" onClick={newGame}>
                Play again
              </button>
            </div>
          )}
          <div className="statusbar card-status" role="status">
            <span>{status}</span>
            <span>
              W {tally.you} · L {tally.cpu} · D {tally.draw}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default ConnectFour;
