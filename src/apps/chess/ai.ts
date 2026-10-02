import type { Chess, Move, PieceSymbol } from "chess.js";

export type Difficulty = "easy" | "normal" | "hard";

/** How many half-moves ahead the computer looks. */
const DEPTH: Record<Difficulty, number> = { easy: 1, normal: 2, hard: 3 };

const VALUE: Record<PieceSymbol, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

// Small bonuses for good squares, from White's side (row 0 = rank 8).
// Pawns want to advance, knights and bishops want the center, the king
// wants to stay tucked away. Rooks and queens just use material.
const PST: Partial<Record<PieceSymbol, number[][]>> = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

const MATE = 100_000;

/** Score from White's point of view: positive means White is better. */
function evaluate(game: Chess): number {
  let score = 0;
  const board = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      const table = PST[piece.type];
      // Black reads the table upside down.
      const bonus = table ? table[piece.color === "w" ? row : 7 - row][col] : 0;
      const value = VALUE[piece.type] + bonus;
      score += piece.color === "w" ? value : -value;
    }
  }
  return score;
}

/** Try captures and promotions first: it makes alpha-beta prune far more. */
function ordered(moves: Move[]): Move[] {
  const weight = (m: Move) =>
    (m.captured ? 10 * VALUE[m.captured] - VALUE[m.piece] : 0) + (m.promotion ? 800 : 0);
  return moves.sort((a, b) => weight(b) - weight(a));
}

function search(game: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0) return evaluate(game);

  const moves = game.moves({ verbose: true });
  // No legal moves: checkmate (prefer quicker mates) or stalemate.
  if (moves.length === 0) {
    if (!game.inCheck()) return 0;
    return game.turn() === "w" ? -MATE - depth : MATE + depth;
  }

  const maximizing = game.turn() === "w";
  for (const move of ordered(moves)) {
    game.move(move);
    const score = search(game, depth - 1, alpha, beta);
    game.undo();
    if (maximizing) alpha = Math.max(alpha, score);
    else beta = Math.min(beta, score);
    if (alpha >= beta) break;
  }
  return maximizing ? alpha : beta;
}

/** Picks the computer's move. Searches by playing and undoing moves on `game`, so pass a copy. */
export function chooseMove(game: Chess, difficulty: Difficulty): Move {
  const moves = ordered(game.moves({ verbose: true }));
  const white = game.turn() === "w";
  const easy = difficulty === "easy";

  let best: Move[] = [];
  let bestScore = -Infinity;
  for (const move of moves) {
    // Only ask "is this at least as good as the best so far?" (scores are
    // whole numbers, hence the -1). Anything worse is cut off early.
    const floor = easy || bestScore === -Infinity ? -Infinity : bestScore - 1;
    game.move(move);
    const raw = white
      ? search(game, DEPTH[difficulty] - 1, floor, Infinity)
      : -search(game, DEPTH[difficulty] - 1, -Infinity, -floor);
    game.undo();
    // Easy mode wobbles its judgement so it blunders now and then.
    const score = easy ? raw + (Math.random() - 0.5) * 300 : raw;
    if (score > bestScore) {
      bestScore = score;
      best = [move];
    } else if (score === bestScore) {
      best.push(move);
    }
  }
  // Among equally good moves, pick one at random so games don't repeat.
  return best[Math.floor(Math.random() * best.length)];
}
