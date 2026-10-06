import type { ComponentType, ReactElement } from "react";
import {
  Calculator as CalculatorIcon,
  Cdplayer107,
  Computer,
  Computer3,
  Desk100,
  Folder,
  FolderExe,
  FolderSettings,
  Freecell1,
  Joy102,
  Mail,
  MsDos,
  Mshearts1,
  Mspaint,
  Notepad,
  Notepad2,
  RecycleFull,
  Sol1,
  Winmine1,
  Wordpad,
} from "@react95/icons";
import AboutMe from "./AboutMe";
import Achievements from "./Achievements";
import Chess from "./chess/Chess";
import FreeCell from "./cards/FreeCell";
import Hearts from "./cards/Hearts";
import Blocks from "./arcade/Blocks";
import Pong from "./arcade/Pong";
import Snake from "./arcade/Snake";
import Calculator from "./tools/Calculator";
import CommandPrompt from "./tools/CommandPrompt";
import MusicPlayer from "./tools/MusicPlayer";
import NotepadApp from "./tools/NotepadApp";
import Paint from "./tools/Paint";
import Checkers from "./brain/Checkers";
import ConnectFour from "./brain/ConnectFour";
import Game2048 from "./brain/Game2048";
import Sudoku from "./brain/Sudoku";
import TicTacToe from "./brain/TicTacToe";
import {
  BLOCKS,
  CHECKERS,
  CONNECT_FOUR,
  GAME_2048,
  PONG,
  SNAKE,
  SUDOKU,
  TICTACTOE,
} from "./pixelIcons";
import Solitaire from "./cards/Solitaire";
import CloseProgram from "./CloseProgram";
import Contact from "./Contact";
import DisplayProperties from "./DisplayProperties";
import { AccessoriesFolder, GamesFolder } from "./FolderView";
import Minesweeper from "./Minesweeper";
import MyComputer from "./MyComputer";
import Projects from "./Projects";
import RecycleBin from "./RecycleBin";
import Resume from "./Resume";

export type FolderId = "games" | "accessories";

export interface AppDef {
  id: string;
  /** Window title. */
  title: string;
  /** Label under the desktop icon and in the start menu. */
  label: string;
  // Icons are created once here, not per render: react95's Modal re-registers
  // (and steals focus) every time its `icon` prop changes identity.
  icon: ReactElement;
  smallIcon: ReactElement;
  width: number;
  height?: number;
  component: ComponentType;
  /** System tools: only reachable from Start > Settings. */
  startMenuOnly?: boolean;
  /** Lives in the Games or Accessories folder (and Start menu submenu). */
  folder?: FolderId;
  /** Also put a shortcut on the desktop (default: only apps with no folder). */
  onDesktop?: boolean;
  /** Fixed-size windows can't be resized or maximized. */
  fixedSize?: boolean;
  /** Not on the desktop or in the Start menu: found some other way. */
  hidden?: boolean;
}

export const APPS: AppDef[] = [
  {
    id: "my-computer",
    title: "My Computer",
    label: "My Computer",
    icon: <Computer variant="32x32_4" />,
    smallIcon: <Computer variant="16x16_4" />,
    width: 420,
    component: MyComputer,
  },
  {
    id: "about",
    title: "About Me.txt - Notepad",
    label: "About Me.txt",
    icon: <Notepad variant="32x32_4" />,
    smallIcon: <Notepad variant="16x16_4" />,
    width: 560,
    height: 420,
    component: AboutMe,
  },
  {
    id: "projects",
    title: "C:\\Projects",
    label: "Projects",
    icon: <Folder variant="32x32_4" />,
    smallIcon: <Folder variant="16x16_4" />,
    width: 560,
    height: 340,
    component: Projects,
  },
  {
    id: "resume",
    title: "Resume.doc - WordPad",
    label: "Resume.doc",
    icon: <Wordpad variant="32x32_4" />,
    smallIcon: <Wordpad variant="16x16_4" />,
    width: 600,
    height: 400,
    component: Resume,
  },
  {
    id: "contact",
    title: "New Message",
    label: "Contact Me",
    icon: <Mail variant="32x32_4" />,
    smallIcon: <Mail variant="16x16_4" />,
    width: 420,
    component: Contact,
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    label: "Minesweeper",
    icon: <Winmine1 variant="32x32_4" />,
    smallIcon: <Winmine1 variant="16x16_4" />,
    width: 0, // sizes itself to the board
    component: Minesweeper,
    fixedSize: true,
    folder: "games",
    onDesktop: true,
  },
  {
    id: "chess",
    title: "Chess",
    label: "Chess",
    icon: <Joy102 variant="32x32_4" />,
    smallIcon: <Joy102 variant="16x16_4" />,
    width: 0, // sizes itself to the board
    component: Chess,
    fixedSize: true,
    folder: "games",
    onDesktop: true,
  },
  {
    id: "solitaire",
    title: "Solitaire",
    label: "Solitaire",
    icon: <Sol1 variant="32x32_4" />,
    smallIcon: <Sol1 variant="16x16_4" />,
    width: 0,
    component: Solitaire,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "freecell",
    title: "FreeCell",
    label: "FreeCell",
    icon: <Freecell1 variant="32x32_4" />,
    smallIcon: <Freecell1 variant="32x32_4" width={16} height={16} />,
    width: 0,
    component: FreeCell,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "hearts",
    title: "Hearts",
    label: "Hearts",
    icon: <Mshearts1 variant="32x32_4" />,
    smallIcon: <Mshearts1 variant="32x32_4" width={16} height={16} />,
    width: 0,
    component: Hearts,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "snake",
    title: "Snake",
    label: "Snake",
    ...SNAKE,
    width: 0,
    component: Snake,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "blocks",
    title: "Blocks",
    label: "Blocks",
    ...BLOCKS,
    width: 0,
    component: Blocks,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "pong",
    title: "Pong",
    label: "Pong",
    ...PONG,
    width: 0,
    component: Pong,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "checkers",
    title: "Checkers",
    label: "Checkers",
    ...CHECKERS,
    width: 0,
    component: Checkers,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "tictactoe",
    title: "Tic-Tac-Toe",
    label: "Tic-Tac-Toe",
    ...TICTACTOE,
    width: 0,
    component: TicTacToe,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "connect4",
    title: "Connect Four",
    label: "Connect Four",
    ...CONNECT_FOUR,
    width: 0,
    component: ConnectFour,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "2048",
    title: "2048",
    label: "2048",
    ...GAME_2048,
    width: 0,
    component: Game2048,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    label: "Sudoku",
    ...SUDOKU,
    width: 0,
    component: Sudoku,
    fixedSize: true,
    folder: "games",
  },
  {
    id: "calculator",
    title: "Calculator",
    label: "Calculator",
    icon: <CalculatorIcon variant="32x32_4" />,
    smallIcon: <CalculatorIcon variant="16x16_4" />,
    width: 0,
    component: Calculator,
    fixedSize: true,
    folder: "accessories",
  },
  {
    id: "notepad",
    title: "Notepad",
    label: "Notepad",
    icon: <Notepad2 variant="32x32_4" />,
    smallIcon: <Notepad2 variant="16x16_4" />,
    width: 460,
    height: 300,
    component: NotepadApp,
    folder: "accessories",
  },
  {
    id: "paint",
    title: "untitled - Paint",
    label: "Paint",
    icon: <Mspaint variant="32x32_4" />,
    smallIcon: <Mspaint variant="16x16_4" />,
    width: 0,
    component: Paint,
    fixedSize: true,
    folder: "accessories",
  },
  {
    id: "command",
    title: "MS-DOS Prompt",
    label: "Command Prompt",
    icon: <MsDos variant="32x32_32" />,
    smallIcon: <MsDos variant="16x16_32" />,
    width: 560,
    height: 340,
    component: CommandPrompt,
    folder: "accessories",
  },
  {
    id: "music",
    title: "Music Player",
    label: "Music Player",
    icon: <Cdplayer107 variant="32x32_4" />,
    smallIcon: <Cdplayer107 variant="16x16_4" />,
    width: 0,
    component: MusicPlayer,
    fixedSize: true,
    folder: "accessories",
  },
  {
    id: "games",
    title: "Games",
    label: "Games",
    icon: <FolderExe variant="32x32_4" />,
    smallIcon: <FolderExe variant="16x16_4" />,
    width: 440,
    height: 300,
    component: GamesFolder,
  },
  {
    id: "accessories",
    title: "Accessories",
    label: "Accessories",
    icon: <FolderSettings variant="32x32_4" />,
    smallIcon: <FolderSettings variant="16x16_4" />,
    width: 440,
    height: 260,
    component: AccessoriesFolder,
  },
  {
    id: "recycle-bin",
    title: "Recycle Bin",
    label: "Recycle Bin",
    icon: <RecycleFull variant="32x32_4" />,
    smallIcon: <RecycleFull variant="16x16_4" />,
    width: 420,
    height: 240,
    component: RecycleBin,
  },
  {
    id: "display",
    title: "Display Properties",
    label: "Display Properties",
    icon: <Desk100 variant="32x32_4" />,
    smallIcon: <Desk100 variant="16x16_4" />,
    width: 400,
    component: DisplayProperties,
    startMenuOnly: true,
    fixedSize: true,
  },
  {
    id: "achievements",
    title: "Achievements.txt - Notepad",
    label: "Achievements.txt",
    icon: <Notepad variant="32x32_4" />,
    smallIcon: <Notepad variant="16x16_4" />,
    width: 460,
    height: 400,
    component: Achievements,
    hidden: true,
  },
  {
    id: "taskmgr",
    title: "Close Program",
    label: "Close Program",
    icon: <Computer3 variant="32x32_4" />,
    smallIcon: <Computer3 variant="16x16_4" />,
    width: 340,
    component: CloseProgram,
    startMenuOnly: true,
    fixedSize: true,
  },
];

export const getApp = (id: string) => APPS.find((app) => app.id === id);

export const isOnDesktop = (app: AppDef) =>
  app.onDesktop ?? (!app.folder && !app.startMenuOnly && !app.hidden);

export const appsInFolder = (folder: FolderId) => APPS.filter((app) => app.folder === folder);
