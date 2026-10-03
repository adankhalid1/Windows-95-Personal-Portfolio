import { APPS } from "./registry";

// Classic program names (as typed into Run or the Command Prompt), mapped
// to the apps on this desktop.
export const ALIASES: Record<string, string> = {
  "about me": "about",
  explorer: "projects",
  wordpad: "resume",
  write: "resume",
  winmine: "minesweeper",
  mail: "contact",
  email: "contact",
  "my computer": "my-computer",
  sysdm: "my-computer",
  "sysdm.cpl": "my-computer",
  control: "display",
  "desk.cpl": "display",
  taskmgr: "taskmgr",
  recycled: "recycle-bin",
  sol: "solitaire",
  mshearts: "hearts",
  tetris: "blocks",
  ttt: "tictactoe",
  "tic-tac-toe": "tictactoe",
  "connect four": "connect4",
  calc: "calculator",
  mspaint: "paint",
  pbrush: "paint",
  cmd: "command",
  "command.com": "command",
  "ms-dos": "command",
  winamp: "music",
  mplayer: "music",
};

/** Finds the app a typed name refers to: an alias, an app id, or its label. */
export function resolveApp(command: string): string | undefined {
  const name = command.trim().toLowerCase().replace(/\.exe$/, "");
  if (ALIASES[name]) return ALIASES[name];
  return APPS.find(
    (app) => app.id === name || app.label.toLowerCase().replace(/\.\w+$/, "") === name,
  )?.id;
}
