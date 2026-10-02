import { Logo } from "@react95/icons";
import { useEffect, useState } from "react";
import { profile } from "../data/profile";
import { useSession } from "../store/session";

const POST_LINES = [
  "Award Modular BIOS v4.51PG, An Energy Star Ally",
  `Copyright (C) 1984-95, ${profile.name.toUpperCase()} PORTFOLIO SYSTEMS`,
  "",
  "PENTIUM-S CPU at 133MHz",
  "Memory Test :  65536K OK",
  "",
  "Detecting IDE Primary Master   ... PROJECTS.SYS",
  "Detecting IDE Primary Slave    ... RESUME.DOC",
  "Detecting IDE Secondary Master ... COFFEE.EXE",
  "",
  "Starting Windows 95...",
];

const LINE_MS = 160;
const SPLASH_MS = 2200;

function BootScreen() {
  const setPhase = useSession((s) => s.setPhase);
  const [lines, setLines] = useState(0);
  const postDone = lines >= POST_LINES.length;

  useEffect(() => {
    if (postDone) {
      const t = setTimeout(() => setPhase("login"), SPLASH_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLines((n) => n + 1), LINE_MS);
    return () => clearTimeout(t);
  }, [lines, postDone, setPhase]);

  // Any key or click skips straight to the login screen.
  useEffect(() => {
    const skip = () => setPhase("login");
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [setPhase]);

  if (postDone) {
    return (
      <div className="splash">
        <div className="splash-logo">
          <Logo variant="32x32_4" className="splash-flag" aria-hidden />
          <div>
            <small>{profile.name}'s</small>
            <strong>
              Windows<sup>95</sup>
            </strong>
          </div>
        </div>
        <div className="splash-bar" />
      </div>
    );
  }

  return (
    <div className="bios">
      <pre>{POST_LINES.slice(0, lines).join("\n")}</pre>
      <p className="bios-hint">Press any key to skip</p>
    </div>
  );
}

export default BootScreen;
