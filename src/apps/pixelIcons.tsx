// Hand-drawn 16x16 pixel icons for apps Windows 95 never had an icon for,
// in the same chunky style as the react95 set. Each icon is a list of
// rows; every character is one pixel, looked up in the palette ('.' = clear).
// This file only exports icon elements (no components), so React Fast
// Refresh has nothing to preserve here.
/* eslint-disable react-refresh/only-export-components */
import type { ReactElement } from "react";

type Palette = Record<string, string>;

function draw(rows: string[], palette: Palette, size: number): ReactElement {
  const rects: ReactElement[] = [];
  rows.forEach((row, y) => {
    // Merge runs of the same color into one rect to keep the SVG small.
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      if (ch !== "." && palette[ch]) {
        rects.push(<rect key={`${x},${y}`} x={x} y={y} width={end - x} height={1} fill={palette[ch]} />);
      }
      x = end;
    }
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {rects}
    </svg>
  );
}

/** Builds the 32px and 16px versions of one icon. */
function icon(rows: string[], palette: Palette) {
  return { icon: draw(rows, palette, 32), smallIcon: draw(rows, palette, 16) };
}

const K = "#000000";
const W = "#ffffff";

export const SNAKE = icon(
  [
    "................",
    ".RR.............",
    ".RRL............",
    "................",
    "..GGGGGGGGGGG...",
    "..GHHHHHHHHHGK..",
    "..KKKKKKKKKHGK..",
    "...........HGK..",
    "...GGGGGGGGGGK..",
    "...GHHHHHHHHHK..",
    "...GHKKKKKKKKK..",
    "...GHK..........",
    "...GHGGGGGGWKG..",
    "...GHHHHHHHKKGG.",
    "....KKKKKKKKKK..",
    "................",
  ],
  { R: "#ff0000", L: "#00a000", G: "#00c000", H: "#008000", K, W },
);

export const BLOCKS = icon(
  [
    "....PPPP........",
    "....PppP........",
    "....PppP........",
    "....PPPP........",
    "PPPPPPPPPPPP....",
    "PppPPppPPppP....",
    "PppPPppPPppP....",
    "PPPPPPPPPPPP....",
    "CCCCCCCCOOOOOOOO",
    "CccCCccCOooOOooO",
    "CccCCccCOooOOooO",
    "CCCCCCCCOOOOOOOO",
    "CCCCCCCCYYYYOOOO",
    "CccCCccCYyyYOooO",
    "CccCCccCYyyYOooO",
    "CCCCCCCCYYYYOOOO",
  ],
  {
    P: "#800080", p: "#c040c0",
    C: "#008080", c: "#00c0c0",
    O: "#c06000", o: "#ff9020",
    Y: "#a0a000", y: "#ffff00",
  },
);

export const PONG = icon(
  [
    "KKKKKKKKKKKKKKKK",
    "KKKKKKKWKKKKKKKK",
    "KKKKKKKKKKKKKKKK",
    "KWWKKKKWKKKKKKKK",
    "KWWKKKKKKKKKKKKK",
    "KWWKKKKWKKKKKKKK",
    "KWWKKKKKKKKWWKKK",
    "KWWKKKKWKKKWWKKK",
    "KKKKKKKKKKKKKWWK",
    "KKKKKKKWKKKKKWWK",
    "KKKKKKKKKKKKKWWK",
    "KKKKKKKWKKKKKWWK",
    "KKKKKKKKKKKKKWWK",
    "KKKKKKKWKKKKKKKK",
    "KKKKKKKKKKKKKKKK",
    "KKKKKKKKKKKKKKKK",
  ],
  { K, W },
);

export const CHECKERS = icon(
  [
    "LLLLDDDDLLLLDDDD",
    "LLLLDRRDLLLLDRRD",
    "LLLLRrrRLLLLRrrR",
    "LLLLDRRDLLLLDRRD",
    "DDDDLLLLDDDDLLLL",
    "DRRDLLLLDDDDLLLL",
    "RrrRLLLLDDDDLLLL",
    "DRRDLLLLDDDDLLLL",
    "LLLLDDDDLLLLDDDD",
    "LLLLDKKDLLLLDKKD",
    "LLLLKggKLLLLKggK",
    "LLLLDKKDLLLLDKKD",
    "DDDDLLLLDDDDLLLL",
    "DKKDLLLLDKKDLLLL",
    "KggKLLLLKggKLLLL",
    "DKKDLLLLDKKDLLLL",
  ],
  { L: "#e0c890", D: "#8a5a2a", R: "#c00000", r: "#ff4040", K, g: "#606060" },
);

export const TICTACTOE = icon(
  [
    "................",
    ".R..R.K.....K...",
    "..RR..K..BB.K...",
    "..RR..K.B..BK...",
    ".R..R.K..BB.K...",
    "KKKKKKKKKKKKKKKK",
    "......K.R..RK...",
    "..BB..K..RR.K...",
    ".B..B.K..RR.K...",
    "..BB..K.R..RK...",
    "KKKKKKKKKKKKKKKK",
    "......K.....K...",
    "......K.....K...",
    ".R..R.K..BB.K...",
    "..RR..K.B..BK...",
    "..RR..K..BB.K...",
  ],
  { K, R: "#c00000", B: "#0000c0" },
);

export const CONNECT_FOUR = icon(
  [
    "................",
    "BBBBBBBBBBBBBBBB",
    "B.BB.BB.BB.BB.BB",
    "B.BB.BB.BB.BB.BB",
    "BBBBBBBBBBBBBBBB",
    "B.BB.BBYBB.BB.BB",
    "B.BB.BBYBB.BB.BB",
    "BBBBBBBBBBBBBBBB",
    "B.BBYBBRBB.BB.BB",
    "B.BBYBBRBB.BB.BB",
    "BBBBBBBBBBBBBBBB",
    "BRBBRBBYBBRBB.BB",
    "BRBBRBBYBBRBB.BB",
    "BBBBBBBBBBBBBBBB",
    "BB............BB",
    "BB............BB",
  ],
  { B: "#0030c0", Y: "#ffd000", R: "#e00000" },
);

export const SUDOKU = icon(
  [
    "KKKKKKKKKKKKKKKK",
    "KWWWWKWWWWKWWWWK",
    "KW5WWKWWWWKWW3WK",
    "KWWWWKWW7WKWWWWK",
    "KWWWWKWWWWKWWWWK",
    "KKKKKKKKKKKKKKKK",
    "KWWWWKWWWWKWWWWK",
    "KWW9WKW1WWKWWWWK",
    "KWWWWKWWWWKW4WWK",
    "KWWWWKWWWWKWWWWK",
    "KKKKKKKKKKKKKKKK",
    "KW2WWKWWWWKWWWWK",
    "KWWWWKWW8WKWWWWK",
    "KWWWWKWWWWKWW6WK",
    "KWWWWKWWWWKWWWWK",
    "KKKKKKKKKKKKKKKK",
  ],
  // The "digits" are single dark-blue pixels: hints, not legible numbers.
  { K, W, ...Object.fromEntries("123456789".split("").map((d) => [d, "#000080"])) },
);

export const GAME_2048 = icon(
  [
    "................",
    ".AAAAAA..BBBBBB.",
    ".AaaaaA..BbbbbB.",
    ".AaAAaA..BBBbBB.",
    ".AaaaaA..BbbbbB.",
    ".AAAAAA..BBBBBB.",
    "................",
    "................",
    ".CCCCCC..DDDDDD.",
    ".CcCcCC..DdddDD.",
    ".CcccCC..DdDdDD.",
    ".CCCcCC..DdddDD.",
    ".CCCCCC..DDDDDD.",
    "................",
    "................",
    "................",
  ],
  {
    A: "#eee4da", a: "#776e65",
    B: "#f2b179", b: "#ffffff",
    C: "#f59563", c: "#ffffff",
    D: "#edc22e", d: "#ffffff",
  },
);
