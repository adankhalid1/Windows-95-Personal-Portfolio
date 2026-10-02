import type { ComponentType, ReactElement } from "react";
import {
  Computer,
  Computer3,
  Desk100,
  Folder,
  Joy102,
  Mail,
  Notepad,
  RecycleFull,
  Winmine1,
  Wordpad,
} from "@react95/icons";
import AboutMe from "./AboutMe";
import Chess from "./chess/Chess";
import CloseProgram from "./CloseProgram";
import Contact from "./Contact";
import DisplayProperties from "./DisplayProperties";
import Minesweeper from "./Minesweeper";
import MyComputer from "./MyComputer";
import Projects from "./Projects";
import RecycleBin from "./RecycleBin";
import Resume from "./Resume";

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
  /** Hide from the desktop (still reachable from the start menu). */
  startMenuOnly?: boolean;
  /** Fixed-size windows can't be resized or maximized. */
  fixedSize?: boolean;
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
    width: 460,
    height: 300,
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
