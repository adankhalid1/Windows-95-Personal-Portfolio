// American checkers on an 8x8 board. Squares are 0..63 (row * 8 + col),
// row 0 at the top. "r" moves up the board, "b" moves down; capitals are kings.
export type Piece = "r" | "b" | "R" | "B" | null;
export type Side = "r" | "b";
export type Board = Piece[];

export interface Move {
  /** Every square the piece stands on, start to finish. */
  path: number[];
  /** Squares of the pieces jumped. */
  captures: number[];
}

export const sideOf = (p: Piece): Side | null => (p ? (p.toLowerCase() as Side) : null);
const isKing = (p: Piece) => p === "R" || p === "B";
export const isDark = (sq: number) => (Math.floor(sq / 8) + (sq % 8)) % 2 === 1;

export function startBoard(): Board {
  return Array.from({ length: 64 }, (_, sq) => {
    if (!isDark(sq)) return null;
    const row = Math.floor(sq / 8);
    return row < 3 ? "b" : row > 4 ? "r" : null;
  });
}

function directions(p: Piece): [number, number][] {
  const up: [number, number][] = [
    [-1, -1],
    [-1, 1],
  ];
  const down: [number, number][] = [
    [1, -1],
    [1, 1],
  ];
  if (isKing(p)) return [...up, ...down];
  return p === "r" ? up : down;
}

const at = (row: number, col: number) =>
  row >= 0 && row < 8 && col >= 0 && col < 8 ? row * 8 + col : -1;

/** All jump sequences from `sq`, following every branch to its end. */
function jumpsFrom(board: Board, sq: number, piece: Piece, path: number[], captured: number[]): Move[] {
  const row = Math.floor(sq / 8);
  const col = sq % 8;
  const results: Move[] = [];
  for (const [dr, dc] of directions(piece)) {
    const over = at(row + dr, col + dc);
    const land = at(row + 2 * dr, col + 2 * dc);
    if (over < 0 || land < 0) continue;
    const victim = board[over];
    if (!victim || sideOf(victim) === sideOf(piece) || captured.includes(over)) continue;
    if (board[land] !== null && land !== path[0]) continue;
    const nextPath = [...path, land];
    const nextCaptured = [...captured, over];
    // A man that reaches the far row is crowned and its turn ends.
    const crowned = !isKing(piece) && (Math.floor(land / 8) === 0 || Math.floor(land / 8) === 7);
    const further = crowned ? [] : jumpsFrom(board, land, piece, nextPath, nextCaptured);
    results.push(...(further.length ? further : [{ path: nextPath, captures: nextCaptured }]));
  }
  return results;
}

/** Legal moves for `side`. Jumping is compulsory when possible. */
export function legalMoves(board: Board, side: Side): Move[] {
  const jumps: Move[] = [];
  const steps: Move[] = [];
  board.forEach((p, sq) => {
    if (sideOf(p) !== side) return;
    jumps.push(...jumpsFrom(board, sq, p, [sq], []));
    const row = Math.floor(sq / 8);
    const col = sq % 8;
    for (const [dr, dc] of directions(p)) {
      const to = at(row + dr, col + dc);
      if (to >= 0 && board[to] === null) steps.push({ path: [sq, to], captures: [] });
    }
  });
  return jumps.length ? jumps : steps;
}

export function applyMove(board: Board, move: Move): Board {
  const next = [...board];
  const from = move.path[0];
  const to = move.path[move.path.length - 1];
  let piece = next[from];
  next[from] = null;
  for (const c of move.captures) next[c] = null;
  const row = Math.floor(to / 8);
  if (piece === "r" && row === 0) piece = "R";
  if (piece === "b" && row === 7) piece = "B";
  next[to] = piece;
  return next;
}

export type Difficulty = "easy" | "normal" | "hard";
const DEPTH: Record<Difficulty, number> = { easy: 1, normal: 4, hard: 6 };

/** Positive is good for black (the computer). */
function evaluate(board: Board): number {
  let score = 0;
  board.forEach((p, sq) => {
    if (!p) return;
    const row = Math.floor(sq / 8);
    const col = sq % 8;
    let v = isKing(p) ? 175 : 100;
    if (!isKing(p)) v += (p === "b" ? row : 7 - row) * 4; // advancing toward a crown
    if (col >= 2 && col <= 5 && row >= 2 && row <= 5) v += 6; // center control
    score += sideOf(p) === "b" ? v : -v;
  });
  return score;
}

function search(board: Board, side: Side, depth: number, alpha: number, beta: number): number {
  const moves = legalMoves(board, side);
  if (moves.length === 0) return side === "b" ? -100_000 - depth : 100_000 + depth;
  if (depth === 0) return evaluate(board);
  for (const m of moves) {
    const score = search(applyMove(board, m), side === "b" ? "r" : "b", depth - 1, alpha, beta);
    if (side === "b") alpha = Math.max(alpha, score);
    else beta = Math.min(beta, score);
    if (alpha >= beta) break;
  }
  return side === "b" ? alpha : beta;
}

/** The computer (black) picks a move. */
export function chooseMove(board: Board, difficulty: Difficulty): Move {
  const moves = legalMoves(board, "b");
  let best: Move[] = [];
  let bestScore = -Infinity;
  for (const m of moves) {
    let score = search(applyMove(board, m), "r", DEPTH[difficulty] - 1, -Infinity, Infinity);
    if (difficulty === "easy") score += (Math.random() - 0.5) * 120;
    if (score > bestScore) {
      bestScore = score;
      best = [m];
    } else if (score === bestScore) best.push(m);
  }
  return best[Math.floor(Math.random() * best.length)];
}
