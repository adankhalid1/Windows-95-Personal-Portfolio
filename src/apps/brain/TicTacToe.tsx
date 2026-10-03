import { useEffect, useState } from "react";
import MenuBar from "../../components/MenuBar";

type Mark = "X" | "O" | null;
type Difficulty = "easy" | "hard";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winLine(b: Mark[]): number[] | null {
  return LINES.find(([a, c, d]) => b[a] && b[a] === b[c] && b[a] === b[d]) ?? null;
}

/** Perfect play: score from O's (the computer's) point of view. */
function minimax(b: Mark[], turn: "X" | "O", depth: number): number {
  const line = winLine(b);
  if (line) return b[line[0]] === "O" ? 10 - depth : depth - 10;
  if (b.every(Boolean)) return 0;
  const scores = b.flatMap((m, i) => {
    if (m) return [];
    const next = [...b];
    next[i] = turn;
    return [minimax(next, turn === "O" ? "X" : "O", depth + 1)];
  });
  return turn === "O" ? Math.max(...scores) : Math.min(...scores);
}

function computerMove(b: Mark[], difficulty: Difficulty): number {
  const empty = b.flatMap((m, i) => (m ? [] : [i]));
  // Easy: plays randomly half the time.
  if (difficulty === "easy" && Math.random() < 0.5) return empty[Math.floor(Math.random() * empty.length)];
  let best = -Infinity;
  let choices: number[] = [];
  for (const i of empty) {
    const next = [...b];
    next[i] = "O";
    const s = minimax(next, "X", 1);
    if (s > best) {
      best = s;
      choices = [i];
    } else if (s === best) choices.push(i);
  }
  return choices[Math.floor(Math.random() * choices.length)];
}

function TicTacToe() {
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [youStart, setYouStart] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [tally, setTally] = useState({ you: 0, cpu: 0, draw: 0 });
  const [showHelp, setShowHelp] = useState(false);

  const line = winLine(board);
  const full = board.every(Boolean);
  const over = Boolean(line) || full;
  const xCount = board.filter((m) => m === "X").length;
  const oCount = board.filter((m) => m === "O").length;
  // You're always X. Whoever started has the extra mark on odd turns.
  const yourTurn = !over && (youStart ? xCount === oCount : oCount > xCount);

  /** Places a mark, and records the result if that ends the game. */
  const commit = (next: Mark[]) => {
    setBoard(next);
    const l = winLine(next);
    if (l) setTally((t) => (next[l[0]] === "X" ? { ...t, you: t.you + 1 } : { ...t, cpu: t.cpu + 1 }));
    else if (next.every(Boolean)) setTally((t) => ({ ...t, draw: t.draw + 1 }));
  };

  useEffect(() => {
    if (over || yourTurn) return;
    const t = setTimeout(() => {
      const next = [...board];
      next[computerMove(board, difficulty)] = "O";
      commit(next);
    }, 350);
    return () => clearTimeout(t);
  }, [over, yourTurn, difficulty, board]);

  const newGame = () => {
    setBoard(Array(9).fill(null));
    setYouStart((s) => !s); // take turns going first
    setShowHelp(false);
  };

  const status = line
    ? board[line[0]] === "X"
      ? "You win! 🎉"
      : "The computer wins."
    : full
      ? "It's a draw."
      : yourTurn
        ? "Your turn (X)."
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
              { label: "Easy", checked: difficulty === "easy", onClick: () => setDifficulty("easy") },
              {
                label: "Unbeatable",
                checked: difficulty === "hard",
                onClick: () => setDifficulty("hard"),
              },
            ],
          },
          { label: "Help", items: [{ label: "How to Play", onClick: () => setShowHelp(true) }] },
        ]}
      />
      {showHelp ? (
        <div className="game-help">
          <h3>How to Play Tic-Tac-Toe</h3>
          <ul>
            <li>You are X, the computer is O. Take turns placing your mark in an empty square.</li>
            <li>Get three in a row (across, down, or diagonally) to win.</li>
            <li>You take turns going first each game.</li>
            <li>
              On <b>Unbeatable</b> the computer plays perfectly: the best you can do is a draw.
              Try <b>Easy</b> if you want to win.
            </li>
          </ul>
          <div className="button-row center">
            <button className="win-btn" onClick={() => setShowHelp(false)}>
              OK
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="ttt-board" role="grid" aria-label="Tic-tac-toe board">
            {board.map((m, i) => (
              <button
                key={i}
                className={`ttt-cell${line?.includes(i) ? " win" : ""}${m ? ` ${m}` : ""}`}
                disabled={!yourTurn || m !== null}
                onClick={() => {
                  const next = [...board];
                  next[i] = "X";
                  commit(next);
                }}
                aria-label={m ?? `empty square ${i + 1}`}
              >
                {m}
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

export default TicTacToe;
