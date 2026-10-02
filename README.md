# Adan's Windows 95 Portfolio

My personal portfolio, dressed up as a Windows 95 desktop. It boots through a
BIOS screen and splash, logs you in, and drops you on a desktop where every
icon opens a draggable window.

## What's on the desktop

| Icon | What it is |
|------|------------|
| My Computer | "System Properties" with a few real details about your browser |
| About Me.txt | Notepad-style intro |
| Projects | Explorer-style folder. Double-click a project to see details and links |
| Resume.doc | Experience, education, and skills in tabs |
| Contact Me | A mail composer that opens your mail app, plus my links |
| Minesweeper | 9x9, 10 mines. Right-click (or long-press) to flag |
| Recycle Bin | Old stuff. You can empty it |

The Start menu has every program, a "Find me on..." submenu, and Shut Down
(shut down, restart, or log off all work).

## Making it yours

Nearly everything personal lives in **`src/data/profile.ts`**: name, bio,
links, experience, education, skills, and projects. Edit that file and the
whole site updates.

To add a new window:

1. Create a component in `src/apps/`.
2. Add an entry to `APPS` in `src/apps/registry.tsx` (pick an icon from
   [`@react95/icons`](https://react95.github.io/React95/?path=/docs/all--icons)).

It shows up on the desktop and in the Start menu automatically.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

## Built with

- [React95](https://github.com/react95/react95) (`@react95/core` and `@react95/icons`) for the Win95 widgets and icons
- React 19, TypeScript, Vite
- Zustand for window and session state

## Credits

- Based on [alishirani1384/win95-portfolio](https://github.com/alishirani1384/win95-portfolio).
  The first commit in this repo is that project as-is; everything after it is my rework.
- More classic icons, if you want something React95 doesn't ship:
  [trapd00r/win95-winxp_icons](https://github.com/trapd00r/win95-winxp_icons) and
  [artage.io's Windows 95 icon pack](https://artage.io/en/icon-packs/original-windows-95-icons).

Windows 95 is a trademark of Microsoft. This is a fan-made personal site and
isn't affiliated with Microsoft.
