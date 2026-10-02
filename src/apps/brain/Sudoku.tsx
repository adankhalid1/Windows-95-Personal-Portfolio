import { useEffect, useMemo, useState } from "react";
import MenuBar from "../../components/MenuBar";
import { useWindowKeys } from "../../hooks/useWindowKeys";
import { conflicts, generate, sameUnit, type Difficulty, type Grid } from "./sudokuGen";

const LEVELS: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Sudoku() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [game, setGame] = useState(() => generate("easy"));
  const [grid, setGrid] = useState<Grid>(() => [...game.puzzle]);
  const [notes, setNotes] = useState<Set<number>[]>(() => Array.from({ length: 81 }, () => new Set()));
  const [noteMode, setNoteMode] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const clashes = useMemo(() => conflicts(grid), [grid]);
  const solved = grid.every((v, i) => v === game.solution[i]);

  useEffect(() => {
    if (solved) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [solved]);

  const newGame = (level = difficulty) => {
    const g = generate(level);
    setDifficulty(level);
    setGame(g);
    setGrid([...g.puzzle]);
    setNotes(Array.from({ length: 81 }, () => new Set()));
    setSelected(null);
    setSeconds(0);
    setShowHelp(false);
  };

  const enter = (digit: number) => {
    if (selected === null || game.puzzle[selected] || solved) return;
    if (noteMode && digit) {
      const next = notes.map((s) => new Set(s));
      if (next[selected].has(digit)) next[selected].delete(digit);
      else next[selected].add(digit);
      setNotes(next);
      return;
    }
    const g = [...grid];
    g[selected] = digit;
    setGrid(g);
    if (digit) {
      // Placing a digit clears that pencil mark from its row, column and box.
      setNotes(notes.map((s, i) => {
        if (i === selected) return new Set();
        if (!sameUnit(i, selected) || !s.has(digit)) return s;
        const n = new Set(s);
        n.delete(digit);
        return n;
      }));
    }
  };

  useWindowKeys((e) => {
    if (/^[1-9]$/.test(e.key)) enter(Number(e.key));
    else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") enter(0);
    else if (e.key.toLowerCase() === "n") setNoteMode((m) => !m);
    else if (selected !== null && e.key.startsWith("Arrow")) {
      e.preventDefault();
      const r = Math.floor(selected / 9);
      const c = selected % 9;
      const [dr, dc] = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key] ?? [0, 0];
      setSelected(((r + dr + 9) % 9) * 9 + ((c + dc + 9) % 9));
    }
  });

  const reveal = () => {
    if (selected === null || game.puzzle[selected]) return;
    const g = [...grid];
    g[selected] = game.solution[selected];
    setGrid(g);
  };

  const selDigit = selected !== null ? grid[selected] : 0;

  return (
    <div className="board-game">
      <MenuBar
        menus={[
          {
            label: "Game",
            items: [
              { label: "New Puzzle", onClick: () => newGame() },
              { label: "Restart Puzzle", onClick: () => { setGrid([...game.puzzle]); setNotes(Array.from({ length: 81 }, () => new Set())); } },
              { label: "Hint (fill selected cell)", onClick: reveal, disabled: selected === null || Boolean(game.puzzle[selected]) },
              "divider",
              ...LEVELS.map((l) => ({
                label: l.label,
                checked: difficulty === l.value,
                onClick: () => newGame(l.value),
              })),
            ],
          },
          { label: "Help", items: [{ label: "How to Play", onClick: () => setShowHelp(true) }] },
        ]}
      />
      {showHelp ? (
        <div className="game-help">
          <h3>How to Play Sudoku</h3>
          <p>
            <b>Goal:</b> fill every empty square with a digit from 1 to 9 so that every row,
            every column, and every 3 x 3 box contains each digit exactly once.
          </p>
          <ul>
            <li>Click a square, then type a digit or use the number buttons. Delete clears it.</li>
            <li>Digits that clash with another in the same row, column or box turn red.</li>
            <li>
              <b>Notes</b> (or press N) switches to pencil marks for jotting down possibilities.
            </li>
            <li>Arrow keys move around. Stuck? Game &gt; Hint fills in the selected square.</li>
            <li>Every puzzle has exactly one solution. Pick Easy, Medium or Hard in the Game menu.</li>
          </ul>
          <div className="button-row center">
            <button className="win-btn" onClick={() => setShowHelp(false)}>
              OK
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="sudoku-board" role="grid" aria-label="Sudoku grid">
            {grid.map((v, i) => {
              const given = Boolean(game.puzzle[i]);
              const related = selected !== null && sameUnit(i, selected);
              return (
                <button
                  key={i}
                  className={[
                    "sudoku-cell",
                    given && "given",
                    selected === i && "selected",
                    related && selected !== i && "related",
                    v && v === selDigit && selected !== i && "same",
                    clashes.has(i) && "clash",
                    i % 9 === 2 || i % 9 === 5 ? "edge-r" : "",
                    Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5 ? "edge-b" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelected(i)}
                  aria-label={`row ${Math.floor(i / 9) + 1} column ${(i % 9) + 1}: ${v || "empty"}`}
                >
                  {v ? (
                    v
                  ) : notes[i].size ? (
                    <span className="sudoku-notes">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                        <span key={d}>{notes[i].has(d) ? d : ""}</span>
                      ))}
                    </span>
                  ) : (
                    ""
                  )}
                </button>
              );
            })}
            {solved && (
              <div className="arcade-message">
                <b>Solved in {time(seconds)}! 🎉</b>
                <button className="win-btn" onClick={() => newGame()}>
                  New puzzle
                </button>
              </div>
            )}
          </div>
          <div className="sudoku-pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button key={d} className="win-btn" onClick={() => enter(d)}>
                {d}
              </button>
            ))}
            <button className="win-btn" onClick={() => enter(0)} aria-label="Erase">
              ⌫
            </button>
            <button
              className={`win-btn notes-toggle${noteMode ? " on" : ""}`}
              aria-pressed={noteMode}
              onClick={() => setNoteMode((m) => !m)}
            >
              ✎ Notes
            </button>
          </div>
          <div className="statusbar card-status">
            <span>{LEVELS.find((l) => l.value === difficulty)?.label}</span>
            <span>{time(seconds)}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default Sudoku;
