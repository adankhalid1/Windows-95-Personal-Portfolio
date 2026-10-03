// Sudoku generation: fill a random solved grid, then remove clues one at a
// time, keeping only removals that leave exactly one solution.

export type Grid = number[]; // 81 cells, 0 = empty

export type Difficulty = "easy" | "medium" | "hard";
const CLUES: Record<Difficulty, number> = { easy: 40, medium: 32, hard: 26 };

const box = (i: number) => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3);

/** Digits (1-9) that could go in cell `i`. */
export function candidates(g: Grid, i: number): number[] {
  const used = new Set<number>();
  const r = Math.floor(i / 9);
  const c = i % 9;
  const b = box(i);
  for (let k = 0; k < 81; k++) {
    if (g[k] && (Math.floor(k / 9) === r || k % 9 === c || box(k) === b)) used.add(g[k]);
  }
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !used.has(d));
}

function shuffled<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Counts solutions, stopping early once `limit` is reached. */
function countSolutions(g: Grid, limit: number): number {
  // Pick the empty cell with the fewest options: makes the search fast.
  let best = -1;
  let bestOptions: number[] = [];
  for (let i = 0; i < 81; i++) {
    if (g[i]) continue;
    const opts = candidates(g, i);
    if (opts.length === 0) return 0;
    if (best < 0 || opts.length < bestOptions.length) {
      best = i;
      bestOptions = opts;
      if (opts.length === 1) break;
    }
  }
  if (best < 0) return 1;
  let total = 0;
  for (const d of bestOptions) {
    g[best] = d;
    total += countSolutions(g, limit - total);
    g[best] = 0;
    if (total >= limit) break;
  }
  return total;
}

function fill(g: Grid): boolean {
  const i = g.indexOf(0);
  if (i < 0) return true;
  for (const d of shuffled(candidates(g, i))) {
    g[i] = d;
    if (fill(g)) return true;
  }
  g[i] = 0;
  return false;
}

export function generate(difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
  const solution: Grid = Array(81).fill(0);
  fill(solution);
  const puzzle = [...solution];
  let clues = 81;
  for (const i of shuffled([...Array(81).keys()])) {
    if (clues <= CLUES[difficulty]) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (countSolutions([...puzzle], 2) !== 1) puzzle[i] = keep;
    else clues--;
  }
  return { puzzle, solution };
}

/** Cells whose digit clashes with another in its row, column or box. */
export function conflicts(g: Grid): Set<number> {
  const bad = new Set<number>();
  for (let i = 0; i < 81; i++) {
    if (!g[i]) continue;
    for (let k = i + 1; k < 81; k++) {
      if (g[k] !== g[i]) continue;
      if (Math.floor(k / 9) === Math.floor(i / 9) || k % 9 === i % 9 || box(k) === box(i)) {
        bad.add(i);
        bad.add(k);
      }
    }
  }
  return bad;
}

export const sameUnit = (a: number, b: number) =>
  Math.floor(a / 9) === Math.floor(b / 9) || a % 9 === b % 9 || box(a) === box(b);
