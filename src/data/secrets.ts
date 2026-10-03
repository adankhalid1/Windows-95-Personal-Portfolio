/** Every easter egg on the site, in the order Achievements.txt lists them. */
export interface Secret {
  id: string;
  title: string;
  /** Shown once found. */
  found: string;
  /** Shown while it's still hidden. */
  hint: string;
}

export const SECRETS: Secret[] = [
  {
    id: "konami",
    title: "Cheat Mode",
    found: "Entered the famous cheat code. Minesweeper will never be the same.",
    hint: "Up, up, down, down, left, right, left, right, B, A. (On a phone, swipe it on the desktop, then tap twice.)",
  },
  {
    id: "bsod",
    title: "Fatal Exception",
    found: "Crashed the whole computer. Nothing was harmed.",
    hint: "Some commands should never be typed into MS-DOS. Formatting your drive, for one.",
  },
  {
    id: "clippy",
    title: "Paperclip Pal",
    found: "Met the friendliest paperclip in computing.",
    hint: "Sit still on the desktop for a little while and someone may offer to help.",
  },
  {
    id: "sudo",
    title: "Not in the Sudoers File",
    found: "Tried to get admin rights. The incident has been reported.",
    hint: "Ask the Command Prompt for superuser powers.",
  },
  {
    id: "rmrf",
    title: "Nice Try",
    found: "Tried to delete everything, Linux style.",
    hint: "Try the most dangerous Linux command in the Command Prompt.",
  },
  {
    id: "matrix",
    title: "Follow the White Rabbit",
    found: "Saw the code behind it all. It's now a screensaver, too.",
    hint: "Wake up, Neo... the Command Prompt has you.",
  },
  {
    id: "coffee",
    title: "Coffee Break",
    found: "Brewed a cup in the Command Prompt.",
    hint: "Every developer runs on it. Ask the Command Prompt for some.",
  },
  {
    id: "ping",
    title: "Pong!",
    found: "Checked whether Adan was online.",
    hint: "PING someone in the Command Prompt.",
  },
  {
    id: "hello",
    title: "Hello, World",
    found: "Said hi to the computer. It said hi back.",
    hint: "Be polite to the Command Prompt.",
  },
  {
    id: "secret",
    title: "Nothing to See Here",
    found: "Found the secret file. There was no secret.",
    hint: "There's a secret file hiding in C:\\WINDOWS.",
  },
  {
    id: "minesweeper",
    title: "Sweeper",
    found: "Cleared a Minesweeper board without blowing up.",
    hint: "Win a game of Minesweeper.",
  },
  {
    id: "solitaire",
    title: "Card Shark",
    found: "Won Solitaire and got the bouncing cards.",
    hint: "Win a game of Solitaire.",
  },
];
