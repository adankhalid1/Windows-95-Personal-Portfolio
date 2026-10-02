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
| Minesweeper | 9x9, 10 mines. Right-click to flag (🚩 flag mode on phones). Help > How to Play explains the rules |
| Chess | Play the computer as White or Black on Easy, Normal or Hard. Undo, pawn promotion, and Help > How to Play |
| Games (folder) | Solitaire (with the bouncing-cards win), FreeCell (the original numbered deals), Hearts vs three computer players, plus Minesweeper and Chess |
| Accessories (folder) | Handy little programs |
| Recycle Bin | Old stuff. You can empty it |

The Start menu has every program (with Games and Accessories submenus), a "Find me on..." submenu, Settings,
Run..., and Shut Down (shut down, restart, or log off all work).

### Desktop tricks

- Icons start out **arranged in a circle**, with About Me.txt in the middle.
- **Drag icons** anywhere (mouse or touch). Positions are remembered;
  right-click the desktop > Arrange Icons puts them back in the circle.
- **Right-click** (or long-press on a phone) the desktop for Arrange Icons,
  icon size, and Properties; right-click an icon to open or delete it.
- **Deleted icons** go to the Recycle Bin. Double-click one there to restore it.
- **Display Properties** (desktop right-click > Properties, or Start > Settings)
  changes the wallpaper (image, preset color, or any custom color) and icon size.
- **Run...** opens programs by their classic names: `winmine`, `notepad`,
  `wordpad`, `explorer`, `taskmgr`, `control`, or any website address.
  Anything else gets the classic "Cannot find the file" error.
- **Ctrl+Alt+Del** (or Ctrl+Shift+Esc) opens Close Program to end or switch tasks.
- **Click the clock** for a calendar; hover it for the full date.
- **Maximize** windows from the title bar button or by double-clicking the
  title bar, and resize them from the bottom-right corner.

Desktop settings live in the visitor's browser (localStorage), so each visitor
gets their own arrangement.

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
- [chess.js](https://github.com/jhlywa/chess.js) (BSD-2-Clause) for chess rules; the board and computer opponent are written for this site

## Credits

- Based on [alishirani1384/win95-portfolio](https://github.com/alishirani1384/win95-portfolio).
  The first commit in this repo is that project as-is; everything after it is my rework.
- Draggable icons, right-click menus, the Recycle Bin restore, wallpaper and
  icon-size settings, the Run dialog, the clock calendar, and the welcome
  notification were inspired by
  [Yuteoctober/wins95Portfolio](https://github.com/Yuteoctober/wins95Portfolio)
  (MIT). They were written from scratch here, not copied.
- More classic icons, if you want something React95 doesn't ship:
  [trapd00r/win95-winxp_icons](https://github.com/trapd00r/win95-winxp_icons) and
  [artage.io's Windows 95 icon pack](https://artage.io/en/icon-packs/original-windows-95-icons).

Windows 95 is a trademark of Microsoft. This is a fan-made personal site and
isn't affiliated with Microsoft.
