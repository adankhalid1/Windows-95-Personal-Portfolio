import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { profile, type Project } from "../../data/profile";
import { useOpenApp } from "../../hooks/useOpenApp";
import { WindowIdContext } from "../../hooks/useWindowKeys";
import { unlock } from "../../store/secrets";
import { useUi } from "../../store/ui";
import { useWindowsStore } from "../../store/windows";
import { resolveApp } from "../aliases";
import { appsInFolder } from "../registry";

// A pretend C: drive, built from the profile, for visitors to poke around.
type Node =
  | { kind: "dir"; children: Record<string, Node> }
  | { kind: "file"; content: string }
  | { kind: "exe"; app: string };

/** "My Cool Project" -> "MYCOOLPR", like old 8.3 filenames. */
const dosName = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "FILE";

function buildDrive(): Node {
  const about = [
    `${profile.name}`,
    `${profile.title} · ${profile.location}`,
    "",
    ...profile.about.flatMap((p) => [p, ""]),
  ].join("\n");

  const jobs = (title: string, list: typeof profile.experience) =>
    [title, "-".repeat(title.length), ...list.flatMap((j) => [`${j.role} @ ${j.place} (${j.period})`, ...j.points.map((p) => `  * ${p}`), ""])].join("\n");
  const resume = [
    jobs("EXPERIENCE", profile.experience),
    jobs("EDUCATION", profile.education),
    "SKILLS",
    "------",
    ...profile.skills.map((g) => `${g.name}: ${g.skills.join(", ")}`),
  ].join("\n");

  const contact = profile.links.map((l) => `${l.label.padEnd(10)} ${l.url.replace(/^mailto:/, "")}`).join("\n");

  const projects: Record<string, Node> = {};
  for (const p of profile.projects as Project[]) {
    projects[`${dosName(p.name)}.TXT`] = {
      kind: "file",
      content: [
        p.name,
        `${p.type}, ${p.year}`,
        "",
        p.summary,
        "",
        `Built with: ${p.tech.join(", ")}`,
        ...(p.repo ? [`Source: ${p.repo}`] : []),
        ...(p.demo ? [`Demo: ${p.demo}`] : []),
      ].join("\n"),
    };
  }

  const games: Record<string, Node> = {};
  for (const app of appsInFolder("games")) games[`${dosName(app.label)}.EXE`] = { kind: "exe", app: app.id };
  const accessories: Record<string, Node> = {};
  for (const app of appsInFolder("accessories")) accessories[`${dosName(app.label)}.EXE`] = { kind: "exe", app: app.id };

  return {
    kind: "dir",
    children: {
      "ABOUT.TXT": { kind: "file", content: about },
      "RESUME.TXT": { kind: "file", content: resume },
      "CONTACT.TXT": { kind: "file", content: contact },
      "AUTOEXEC.BAT": { kind: "file", content: "@ECHO OFF\nPROMPT $P$G\nECHO Welcome! Type HELP to see what you can do." },
      PROJECTS: { kind: "dir", children: projects },
      GAMES: { kind: "dir", children: games },
      ACCESS: { kind: "dir", children: accessories },
      WINDOWS: {
        kind: "dir",
        children: {
          "WIN.INI": { kind: "file", content: "[windows]\nload=\nrun=\n; nothing to see here" },
          "SECRET.TXT": { kind: "file", content: "You found it! There is no secret. Thanks for exploring. :)" },
        },
      },
    },
  };
}

const HELP = `Commands:
  HELP           Show this list
  DIR            List files in the current folder
  CD <folder>    Change folder (CD .. goes up, CD \\ to the top)
  TYPE <file>    Show a text file (try TYPE ABOUT.TXT)
  TREE           Show every folder
  START <app>    Open a program (START SOLITAIRE, START CALC...)
  <name>.EXE     Run a program in the current folder
  ABOUT, RESUME, PROJECTS, LINKS   Shortcuts to my info
  WHOAMI, VER, DATE, TIME, ECHO <text>, COLOR <0a>, CLS, EXIT
  ACHIEVEMENTS   See which secrets you've found

...and a few commands that aren't on this list.`;

const COFFEE = [
  "        ( (",
  "         ) )",
  "      ........",
  "      |      |]",
  "      \\      /",
  "       `----'",
  "",
  "Here's your coffee. Fuel for the next commit.",
];

const COLORS: Record<string, string> = {
  "0": "#000000", "1": "#000080", "2": "#008000", "3": "#008080", "4": "#800000", "5": "#800080",
  "6": "#808000", "7": "#c0c0c0", "8": "#808080", "9": "#0000ff", a: "#00ff00", b: "#00ffff",
  c: "#ff0000", d: "#ff00ff", e: "#ffff00", f: "#ffffff",
};

function CommandPrompt() {
  const drive = useMemo(buildDrive, []);
  const [cwd, setCwd] = useState<string[]>([]);
  const [lines, setLines] = useState<string[]>([
    "Microsoft(R) Windows 95",
    "   (C)Copyright Microsoft Corp 1981-1995.",
    "",
    `Welcome to ${profile.name.split(" ")[0]}'s PC. Type HELP and press Enter.`,
    "",
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyAt, setHistoryAt] = useState(-1);
  const [colors, setColors] = useState({ bg: "#000000", fg: "#c0c0c0" });
  const screen = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const openApp = useOpenApp();
  const windowId = useContext(WindowIdContext);
  const closeWindow = useWindowsStore((s) => s.closeWindow);

  useEffect(() => {
    screen.current?.scrollTo(0, screen.current.scrollHeight);
  }, [lines]);

  const prompt = `C:\\${cwd.join("\\")}>`;

  const nodeAt = (path: string[]): Node | null => {
    let node: Node = drive;
    for (const part of path) {
      if (node.kind !== "dir") return null;
      const next: Node | undefined = node.children[part.toUpperCase()];
      if (!next) return null;
      node = next;
    }
    return node;
  };

  /** Resolves "..", "\" and relative names to an absolute path. */
  const resolvePath = (arg: string): string[] => {
    const parts = arg.replace(/\//g, "\\").split("\\");
    let path = arg.startsWith("\\") ? [] : [...cwd];
    for (const part of parts) {
      if (!part || part === ".") continue;
      if (part === "..") path = path.slice(0, -1);
      else path.push(part.toUpperCase());
    }
    return path;
  };

  const run = (raw: string): string[] => {
    const text = raw.trim();
    if (!text) return [];
    const [cmdRaw, ...rest] = text.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const arg = rest.join(" ");

    switch (cmd) {
      case "help":
      case "?":
        return HELP.split("\n");
      case "cls":
      case "clear":
        setLines([]);
        return [];
      case "dir":
      case "ls": {
        const path = arg ? resolvePath(arg) : cwd;
        const node = nodeAt(path);
        if (!node || node.kind !== "dir") return ["File Not Found"];
        const entries = Object.entries(node.children);
        const files = entries.filter(([, n]) => n.kind !== "dir");
        const bytes = files.reduce((t, [, n]) => t + (n.kind === "file" ? n.content.length : 4096), 0);
        return [
          " Volume in drive C is PORTFOLIO",
          ` Directory of C:\\${path.join("\\")}`,
          "",
          ...(path.length ? [".            <DIR>", "..           <DIR>"] : []),
          ...entries.map(([name, n]) =>
            n.kind === "dir"
              ? `${name.padEnd(13)}<DIR>`
              : `${name.padEnd(13)}${String(n.kind === "file" ? n.content.length : 4096).padStart(8)}`,
          ),
          `${String(files.length).padStart(9)} file(s)  ${bytes.toLocaleString()} bytes`,
        ];
      }
      case "cd":
      case "chdir": {
        if (!arg) return [prompt.slice(0, -1)];
        const path = resolvePath(arg);
        const node = nodeAt(path);
        if (!node || node.kind !== "dir") return ["Invalid directory"];
        setCwd(path);
        return [];
      }
      case "type":
      case "cat":
      case "more": {
        if (!arg) return ["Required parameter missing"];
        const node = nodeAt(resolvePath(arg));
        if (!node) return ["File not found"];
        if (node.kind === "dir") return ["Access denied (that's a folder, try DIR)"];
        if (node.kind === "exe") return ["This program cannot be displayed. Try running it instead."];
        if (node === nodeAt(["WINDOWS", "SECRET.TXT"])) unlock("secret");
        return node.content.split("\n");
      }
      case "tree": {
        const out = ["C:\\"];
        const walk = (n: Node, indent: string) => {
          if (n.kind !== "dir") return;
          const dirs = Object.entries(n.children).filter(([, c]) => c.kind === "dir");
          dirs.forEach(([name, child], i) => {
            const last = i === dirs.length - 1;
            out.push(`${indent}${last ? "└──" : "├──"}${name}`);
            walk(child, indent + (last ? "   " : "│  "));
          });
        };
        walk(drive, "");
        return out;
      }
      case "about":
        return run("type \\ABOUT.TXT");
      case "resume":
        return run("type \\RESUME.TXT");
      case "links":
      case "contact":
        return run("type \\CONTACT.TXT");
      case "projects":
        setCwd(["PROJECTS"]);
        return [...run("dir \\PROJECTS"), "", "Tip: TYPE a file name to read about a project."];
      case "whoami":
        return [`${profile.handle} (${profile.name}, ${profile.title})`];
      case "ver":
        return ["", "Windows 95. [Version 4.00.950] (portfolio edition)", ""];
      case "date":
        return [`Current date is ${new Date().toLocaleDateString([], { weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" })}`];
      case "time":
        return [`Current time is ${new Date().toLocaleTimeString()}`];
      case "echo":
        return [arg];
      case "color": {
        const code = arg.toLowerCase();
        if (!/^[0-9a-f]{2}$/.test(code) || code[0] === code[1]) {
          return ["Usage: COLOR <background><text>, e.g. COLOR 0A for green on black.", "Codes: 0 black 1 blue 2 green 3 aqua 4 red 5 purple 6 yellow 7 white 8 gray 9-F bright"];
        }
        setColors({ bg: COLORS[code[0]], fg: COLORS[code[1]] });
        return [];
      }
      // ---- Easter eggs
      case "format":
      case "deltree":
        // FORMAT C: (or anything like it) crashes the whole computer.
        unlock("bsod");
        useUi.getState().setBsod(true);
        return [];
      case "del":
      case "erase": {
        if (/\*\.\*|^[a-z]:\\?$|^\\$/i.test(arg)) {
          unlock("bsod");
          useUi.getState().setBsod(true);
          return [];
        }
        return arg ? ["Access denied. These files belong to the portfolio."] : ["Required parameter missing"];
      }
      case "rm":
        if (/-\w*r\w*f|-\w*f\w*r/i.test(arg)) {
          unlock("rmrf");
          return ["Nice try. This isn't Linux, and nothing here is getting deleted. :)"];
        }
        return ["'rm' is a Linux thing. Here we say DEL (but please don't)."];
      case "sudo":
        unlock("sudo");
        return [`${profile.handle} is not in the sudoers file. This incident will be reported.`];
      case "matrix":
        unlock("matrix");
        useUi.getState().setScreensaverNow("matrix");
        return ["Wake up, Neo...", "(Move the mouse or press a key to leave the Matrix.)"];
      case "coffee":
      case "java":
        unlock("coffee");
        return COFFEE;
      case "ping": {
        const who = arg.toLowerCase().replace(/^@/, "");
        const me = [profile.name.split(" ")[0].toLowerCase(), profile.handle.toLowerCase(), profile.name.toLowerCase()];
        if (!who) return ["Usage: PING <name>. Try PING ADAN."];
        if (!me.some((m) => who.includes(m))) return [`Pinging ${arg}...`, "Request timed out.", "Request timed out.", "(Try PING ADAN.)"];
        unlock("ping");
        return [
          `Pinging ${profile.name} [127.0.0.1] with 32 bytes of data:`,
          "Reply from adan: bytes=32 time=1ms TTL=128 (probably drinking coffee)",
          "Reply from adan: bytes=32 time=1ms TTL=128 (open to new opportunities)",
          "Reply from adan: bytes=32 time=1ms TTL=128 (type CONTACT to say hi)",
          "",
          "Ping statistics: Sent = 3, Received = 3, Lost = 0 (0% loss). Adan is online!",
        ];
      }
      case "hello":
      case "hi":
      case "hey":
        unlock("hello");
        return [`Hello! Thanks for stopping by ${profile.name.split(" ")[0]}'s PC. Type HELP to see what you can do.`];
      case "xyzzy":
        return ["Nothing happens.", "(Wrong cheat code. Try a more famous one, on the desktop.)"];
      case "clippy":
        useUi.getState().setClippyNow(true);
        return ["It looks like you're trying to summon a paperclip."];
      case "achievements":
        openApp("achievements");
        return [];
      case "exit":
        if (windowId) closeWindow(windowId);
        return [];
      case "start": {
        const app = resolveApp(arg);
        if (!app) return [`Cannot find '${arg}'. Try START SOLITAIRE or START CALC.`];
        openApp(app);
        return [];
      }
      default: {
        // Running a program by name, from the current folder or anywhere.
        const node = nodeAt(resolvePath(cmdRaw.toUpperCase().endsWith(".EXE") ? cmdRaw : `${cmdRaw}.EXE`));
        const app = node?.kind === "exe" ? node.app : resolveApp(cmdRaw);
        if (app) {
          openApp(app);
          return [];
        }
        return ["Bad command or file name"];
      }
    }
  };

  const submit = () => {
    const output = run(input);
    const cleared = input.trim().toLowerCase() === "cls" || input.trim().toLowerCase() === "clear";
    setLines((prev) => (cleared ? [] : [...prev, `${prompt}${input}`, ...output, ...(output.length ? [""] : [])]));
    if (input.trim()) setHistory((h) => [...h, input]);
    setHistoryAt(-1);
    setInput("");
  };

  return (
    <div
      ref={screen}
      className="cmd-screen"
      style={{ background: colors.bg, color: colors.fg }}
      onClick={() => field.current?.focus()}
    >
      {lines.map((line, i) => (
        <div key={i} className="cmd-line">
          {line || " "}
        </div>
      ))}
      <div className="cmd-line cmd-input-line">
        <span>{prompt}</span>
        <input
          ref={field}
          className="cmd-input"
          style={{ color: colors.fg }}
          value={input}
          autoFocus
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Command"
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              if (!history.length) return;
              const at =
                e.key === "ArrowUp"
                  ? historyAt < 0
                    ? history.length - 1
                    : Math.max(0, historyAt - 1)
                  : historyAt < 0
                    ? -1
                    : historyAt + 1;
              if (at >= history.length || at < 0) {
                setHistoryAt(-1);
                setInput("");
              } else {
                setHistoryAt(at);
                setInput(history[at]);
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default CommandPrompt;
