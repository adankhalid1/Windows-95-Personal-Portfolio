import { Chess as ChessGame, type Color, type PieceSymbol, type Square } from "chess.js";
import { useEffect, useRef, useState } from "react";
import MenuBar from "../../components/MenuBar";
import type { Difficulty } from "./ai";
import { think } from "./think";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

// The solid glyphs for both sides (colored with CSS); U+FE0E stops phones
// from turning the pawn into an emoji.
const GLYPH: Record<PieceSymbol, string> = {
  k: "♚︎",
  q: "♛︎",
  r: "♜︎",
  b: "♝︎",
  n: "♞︎",
  p: "♟︎",
};
const NAME: Record<PieceSymbol, string> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};
const START_COUNT: Record<PieceSymbol, number> = { k: 1, q: 1, r: 2, b: 2, n: 2, p: 8 };
const PROMOTIONS: PieceSymbol[] = ["q", "r", "b", "n"];
const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "normal", label: "Normal" },
  { value: "hard", label: "Hard" },
];

const other = (c: Color): Color => (c === "w" ? "b" : "w");

/** Pieces of `color` that have been captured, most valuable first. */
function captured(game: ChessGame, color: Color): PieceSymbol[] {
  const left: Record<string, number> = {};
  for (const row of game.board())
    for (const p of row) if (p?.color === color) left[p.type] = (left[p.type] ?? 0) + 1;
  return (["q", "r", "b", "n", "p"] as PieceSymbol[]).flatMap((t) =>
    Array(Math.max(0, START_COUNT[t] - (left[t] ?? 0))).fill(t),
  );
}

function statusText(game: ChessGame, player: Color, thinking: boolean): string {
  if (game.isCheckmate())
    return game.turn() === player ? "Checkmate. The computer wins." : "Checkmate! You win! 🎉";
  if (game.isStalemate()) return "Stalemate: it's a draw.";
  if (game.isThreefoldRepetition()) return "Draw by repetition.";
  if (game.isInsufficientMaterial()) return "Draw: not enough pieces left to checkmate.";
  if (game.isDraw()) return "Draw by the 50-move rule.";
  if (thinking) return "Computer is thinking...";
  if (game.turn() !== player) return "Computer's move.";
  return game.inCheck() ? "Your move. You're in check!" : "Your move.";
}

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="chess-help">
      <h3>How to Play Chess</h3>
      <p>
        <b>Goal:</b> checkmate the computer&apos;s king, meaning it is under attack and has no
        way to escape.
      </p>
      <ul>
        <li>
          <b>Moving:</b> click (or tap) one of your pieces. Dots show where it can go; click
          one to move there. Click the piece again to cancel.
        </li>
        <li>
          <b>King</b> moves one square any direction. <b>Queen</b> any distance in any straight
          line or diagonal. <b>Rook</b> straight lines. <b>Bishop</b> diagonals.{" "}
          <b>Knight</b> jumps in an L shape. <b>Pawns</b> move forward one square (two on their
          first move) and capture diagonally.
        </li>
        <li>
          <b>Castling:</b> move your king two squares toward a rook; the rook hops over it.
        </li>
        <li>
          <b>Promotion:</b> a pawn reaching the far side becomes a queen, rook, bishop, or
          knight. You choose.
        </li>
        <li>
          <b>Check:</b> your king glows red when attacked. You must get it out of danger.
        </li>
        <li>
          <b>Game menu:</b> new game as White or Black, undo a move, and pick the difficulty.
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

function Chess() {
  const gameRef = useRef(new ChessGame());
  const game = gameRef.current;
  // Bumped after every change to `game` (which is mutable) to re-render.
  const [, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);

  const [player, setPlayer] = useState<Color>("w");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // Changes on New Game / Undo, so a late answer from the computer is ignored.
  const generation = useRef(0);

  const over = game.isGameOver();
  const computerToMove = !over && game.turn() !== player;
  const fen = game.fen();

  useEffect(() => {
    if (!computerToMove) return;
    const gen = generation.current;
    let cancelled = false;
    setThinking(true);
    // A short pause so its reply doesn't feel instant.
    const started = Date.now();
    think(fen, difficulty).then((move) => {
      const delay = Math.max(0, 350 - (Date.now() - started));
      setTimeout(() => {
        if (cancelled || gen !== generation.current) return;
        gameRef.current.move(move);
        setThinking(false);
        refresh();
      }, delay);
    });
    return () => {
      cancelled = true;
    };
  }, [computerToMove, fen, difficulty]);

  const history = game.history({ verbose: true });
  const lastMove = history.at(-1);
  const targets = selected ? game.moves({ square: selected, verbose: true }) : [];
  const canAct = !over && !thinking && game.turn() === player && !promotion;

  const newGame = (as: Color) => {
    generation.current++;
    game.reset();
    setPlayer(as);
    setSelected(null);
    setPromotion(null);
    setThinking(false);
    setShowHelp(false);
    refresh();
  };

  const playerMoves = history.filter((m) => m.color === player).length;
  const undo = () => {
    generation.current++;
    // Take back to just before your last move (and the computer's reply).
    do game.undo();
    while (game.history().length > 0 && game.turn() !== player);
    setSelected(null);
    setThinking(false);
    refresh();
  };

  const move = (from: Square, to: Square, promo?: PieceSymbol) => {
    game.move({ from, to, promotion: promo });
    setSelected(null);
    setPromotion(null);
    refresh();
  };

  const onSquare = (square: Square) => {
    if (!canAct) return;
    const piece = game.get(square);
    if (piece?.color === player) {
      setSelected(selected === square ? null : square);
      return;
    }
    const target = targets.find((m) => m.to === square);
    if (selected && target) {
      if (target.promotion) setPromotion({ from: selected, to: square });
      else move(selected, square);
      return;
    }
    setSelected(null);
  };

  const menuBar = (
    <MenuBar
      menus={[
        {
          label: "Game",
          items: [
            { label: "New Game as White", onClick: () => newGame("w") },
            { label: "New Game as Black", onClick: () => newGame("b") },
            "divider",
            { label: "Undo Move", onClick: undo, disabled: playerMoves === 0 || thinking },
            "divider",
            ...DIFFICULTIES.map((d) => ({
              label: d.label,
              checked: difficulty === d.value,
              onClick: () => setDifficulty(d.value),
            })),
          ],
        },
        { label: "Help", items: [{ label: "How to Play", onClick: () => setShowHelp(true) }] },
      ]}
    />
  );

  if (showHelp) {
    return (
      <div className="chess">
        {menuBar}
        <HowToPlay onClose={() => setShowHelp(false)} />
      </div>
    );
  }

  const ranks = player === "w" ? RANKS : [...RANKS].reverse();
  const files = player === "w" ? FILES : [...FILES].reverse();
  const checkedKing =
    game.inCheck() &&
    game
      .board()
      .flat()
      .find((p) => p?.type === "k" && p.color === game.turn())?.square;

  const tray = (color: Color) => (
    <div className="chess-tray" aria-label={`Captured ${color === "w" ? "white" : "black"} pieces`}>
      {captured(game, color).map((t, i) => (
        <span key={i} className={`chess-piece piece-${color}`}>
          {GLYPH[t]}
        </span>
      ))}
    </div>
  );

  return (
    <div className="chess">
      {menuBar}
      {tray(player)}
      <div className="chess-board" role="grid" aria-label="Chess board">
        {ranks.map((rank, r) =>
          files.map((file, f) => {
            const square = `${file}${rank}` as Square;
            const piece = game.get(square);
            const target = targets.find((m) => m.to === square);
            const classes = [
              "chess-square",
              (r + f) % 2 === 0 ? "light" : "dark",
              selected === square && "selected",
              (lastMove?.from === square || lastMove?.to === square) && "last",
              checkedKing === square && "check",
              target && (target.captured ? "capture" : "target"),
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={square}
                className={classes}
                onClick={() => onSquare(square)}
                aria-label={piece ? `${square} ${piece.color === "w" ? "white" : "black"} ${NAME[piece.type]}` : square}
              >
                {f === 0 && <span className="chess-coord rank">{rank}</span>}
                {r === 7 && <span className="chess-coord file">{file}</span>}
                {piece && (
                  <span className={`chess-piece piece-${piece.color}`}>{GLYPH[piece.type]}</span>
                )}
              </button>
            );
          }),
        )}
        {promotion && (
          <div className="chess-promotion" role="dialog" aria-label="Promote pawn">
            <p>Promote pawn to:</p>
            <div>
              {PROMOTIONS.map((t) => (
                <button key={t} onClick={() => move(promotion.from, promotion.to, t)} aria-label={NAME[t]}>
                  <span className={`chess-piece piece-${player}`}>{GLYPH[t]}</span>
                </button>
              ))}
            </div>
            <button className="win-btn" onClick={() => setPromotion(null)}>
              Cancel
            </button>
          </div>
        )}
      </div>
      {tray(other(player))}
      <div className={`statusbar chess-status${over ? " over" : ""}`} role="status">
        {statusText(game, player, thinking)}
      </div>
    </div>
  );
}

export default Chess;
