import { useEffect, useMemo, useState } from "react";
import MenuBar from "../../components/MenuBar";
import {
  applyMove,
  chooseMove,
  isDark,
  legalMoves,
  sideOf,
  startBoard,
  type Board,
  type Difficulty,
  type Move,
} from "./checkersRules";

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="game-help">
      <h3>How to Play Checkers</h3>
      <p>
        <b>Goal:</b> capture all of the computer&apos;s black pieces, or leave it with no
        moves. You play red and move first.
      </p>
      <ul>
        <li>
          <b>Moving:</b> pieces move one square diagonally forward. Click a piece, then click a
          highlighted square.
        </li>
        <li>
          <b>Jumping:</b> hop over an enemy piece into the empty square behind it to capture
          it. If you can jump, you must. If another jump is possible after landing, it keeps
          going: click the final square and the whole chain is made.
        </li>
        <li>
          <b>Kings:</b> reach the far side to be crowned (♛). Kings move and jump backward too.
        </li>
        <li>
          <b>Game menu:</b> new game, undo, and difficulty.
        </li>
      </ul>
      <div className="button-row center">
        <button className="win-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

function Checkers() {
  const [board, setBoard] = useState<Board>(startBoard);
  const [turn, setTurn] = useState<"r" | "b">("r");
  const [selected, setSelected] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [history, setHistory] = useState<Board[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const moves = useMemo(() => legalMoves(board, turn), [board, turn]);
  const over = moves.length === 0;
  const mustJump = moves.length > 0 && moves[0].captures.length > 0;

  // The computer's turn.
  useEffect(() => {
    if (turn !== "b" || over) return;
    const t = setTimeout(() => {
      const m = chooseMove(board, difficulty);
      setBoard(applyMove(board, m));
      setLastMove(m);
      setTurn("r");
    }, 450);
    return () => clearTimeout(t);
  }, [turn, over, board, difficulty]);

  const myMovesFrom = (sq: number) => moves.filter((m) => m.path[0] === sq);
  const targets = selected === null ? [] : myMovesFrom(selected);

  const onSquare = (sq: number) => {
    if (turn !== "r" || over) return;
    const move = targets.find((m) => m.path[m.path.length - 1] === sq);
    if (move) {
      setHistory([...history, board]);
      setBoard(applyMove(board, move));
      setLastMove(move);
      setSelected(null);
      setTurn("b");
      return;
    }
    setSelected(sideOf(board[sq]) === "r" && myMovesFrom(sq).length ? sq : null);
  };

  const newGame = () => {
    setBoard(startBoard());
    setTurn("r");
    setSelected(null);
    setHistory([]);
    setLastMove(null);
    setShowHelp(false);
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setBoard(prev);
    setHistory(history.slice(0, -1));
    setTurn("r");
    setSelected(null);
    setLastMove(null);
  };

  const count = (side: "r" | "b") => board.filter((p) => sideOf(p) === side).length;
  const status = over
    ? turn === "r"
      ? "No moves left. The computer wins."
      : "You win! 🎉"
    : turn === "b"
      ? "Computer is thinking..."
      : mustJump
        ? "Your move. You must jump!"
        : "Your move.";

  return (
    <div className="board-game">
      <MenuBar
        menus={[
          {
            label: "Game",
            items: [
              { label: "New Game", onClick: newGame },
              { label: "Undo Move", onClick: undo, disabled: history.length === 0 || turn !== "r" },
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
        <HowToPlay onClose={() => setShowHelp(false)} />
      ) : (
        <>
          <div className="checkers-board" role="grid" aria-label="Checkers board">
            {board.map((p, sq) => {
              const target = targets.some((m) => m.path[m.path.length - 1] === sq);
              const last = lastMove?.path.includes(sq);
              const movable = turn === "r" && sideOf(p) === "r" && myMovesFrom(sq).length > 0;
              return (
                <button
                  key={sq}
                  className={[
                    "checkers-square",
                    isDark(sq) ? "dark" : "light",
                    selected === sq && "selected",
                    target && "target",
                    last && "last",
                    movable && "movable",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSquare(sq)}
                  disabled={!isDark(sq)}
                  aria-label={`row ${Math.floor(sq / 8) + 1} column ${(sq % 8) + 1}${p ? ` ${sideOf(p) === "r" ? "red" : "black"}${p === p.toUpperCase() ? " king" : ""}` : ""}`}
                >
                  {p && (
                    <span className={`checker ${sideOf(p)}`}>{p === p.toUpperCase() ? "♛" : ""}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="statusbar card-status" role="status">
            <span>{status}</span>
            <span>
              🔴 {count("r")} · ⚫ {count("b")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default Checkers;
