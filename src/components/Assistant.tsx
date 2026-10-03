import { useEffect, useState } from "react";
import { profile } from "../data/profile";
import { useOpenApp } from "../hooks/useOpenApp";
import { getApp } from "../apps/registry";
import { unlock } from "../store/secrets";
import { useUi } from "../store/ui";
import { useWindowsStore } from "../store/windows";

const IDLE_MS = 30_000;
const SEEN_KEY = "win95-assistant-seen";
const OFF_KEY = "win95-assistant-off";
const ACTIVITY = ["pointerdown", "pointermove", "keydown", "wheel"] as const;

const read = (store: () => Storage, key: string) => {
  try {
    return store().getItem(key) === "1";
  } catch {
    return false;
  }
};
const write = (store: () => Storage, key: string) => {
  try {
    store().setItem(key, "1");
  } catch {
    /* asks again next time, no harm */
  }
};

const first = profile.name.split(" ")[0];
const TIPS = [
  "Did you know? You can drag desktop icons anywhere. Right-click (or long-press) the desktop and pick Arrange Icons to tidy them up again.",
  "There are 12 secrets hidden on this PC. Achievements.txt in My Computer keeps track of the ones you've found.",
  "Bored? The Games folder has 13 games. Can you beat the computer at Chess?",
  "Try typing HELP in the Command Prompt. Not every command is on the list...",
  `Want ${first}'s details without clicking around? Type RESUME or LINKS in the Command Prompt.`,
];

/** A certain helpful paperclip. Pops up once per visit after 30 idle seconds. */
function Assistant() {
  const [visible, setVisible] = useState(false);
  const [tip, setTip] = useState(-1);
  const clippyNow = useUi((s) => s.clippyNow);
  const setClippyNow = useUi((s) => s.setClippyNow);
  const openApp = useOpenApp();

  // Wait for the visitor to sit still for a while.
  useEffect(() => {
    if (visible || read(() => localStorage, OFF_KEY) || read(() => sessionStorage, SEEN_KEY)) return;
    // Never interrupt a game or an app in use (thinking about a chess move
    // counts as idle): wait for another quiet spell instead.
    const busy = () => useWindowsStore.getState().openWindows.some((id) => getApp(id)?.folder);
    const fire = () => (busy() ? reset() : setVisible(true));
    let timer = window.setTimeout(fire, IDLE_MS);
    function reset() {
      clearTimeout(timer);
      timer = window.setTimeout(fire, IDLE_MS);
    }
    ACTIVITY.forEach((t) => window.addEventListener(t, reset, true));
    return () => {
      clearTimeout(timer);
      ACTIVITY.forEach((t) => window.removeEventListener(t, reset, true));
    };
  }, [visible]);

  // Summoned on purpose (Run or Command Prompt "clippy").
  useEffect(() => {
    if (!clippyNow) return;
    setTip(-1);
    setVisible(true);
    setClippyNow(false);
  }, [clippyNow, setClippyNow]);

  useEffect(() => {
    if (!visible) return;
    write(() => sessionStorage, SEEN_KEY);
    unlock("clippy");
  }, [visible]);

  if (!visible) return null;

  const close = () => setVisible(false);
  const nextTip = () => setTip((t) => (t + 1) % TIPS.length);
  const go = (app: string) => {
    openApp(app);
    close();
  };

  return (
    <div className="assistant" role="dialog" aria-label="Assistant">
      <div className="assistant-bubble">
        {tip < 0 ? (
          <>
            <p>It looks like you&apos;re trying to hire a developer. Would you like help?</p>
            <ul className="assistant-options">
              <li>
                <button onClick={() => go("resume")}>Show me {first}&apos;s résumé</button>
              </li>
              <li>
                <button onClick={() => go("contact")}>Get in touch with {first}</button>
              </li>
              <li>
                <button onClick={nextTip}>Just looking around</button>
              </li>
            </ul>
          </>
        ) : (
          <>
            <p>{TIPS[tip]}</p>
            <div className="assistant-actions">
              <button className="win-btn" onClick={nextTip}>
                Next tip
              </button>
              <button className="win-btn" onClick={close}>
                Close
              </button>
            </div>
          </>
        )}
        <button
          className="assistant-off"
          onClick={() => {
            write(() => localStorage, OFF_KEY);
            close();
          }}
        >
          Don&apos;t show me this again
        </button>
      </div>
      <button className="assistant-clip" onClick={nextTip} aria-label="Paperclip assistant (click for a tip)">
        <svg viewBox="0 0 64 100" width="64" height="100" aria-hidden>
          <path
            d="M24 44 V80 a10 10 0 0 0 20 0 V22 a15 15 0 0 0 -30 0 V74"
            fill="none"
            stroke="#5a5a5a"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M24 44 V80 a10 10 0 0 0 20 0 V22 a15 15 0 0 0 -30 0 V74"
            fill="none"
            stroke="#d4d4d4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <g className="assistant-eyes">
            <ellipse cx="20" cy="34" rx="7" ry="8" fill="#fff" stroke="#000" strokeWidth="1.5" />
            <ellipse cx="38" cy="34" rx="7" ry="8" fill="#fff" stroke="#000" strokeWidth="1.5" />
            <circle cx="22" cy="36" r="3" fill="#000" />
            <circle cx="40" cy="36" r="3" fill="#000" />
          </g>
          <path d="M12 22 q8 -6 14 0 M31 22 q7 -6 14 0" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default Assistant;
