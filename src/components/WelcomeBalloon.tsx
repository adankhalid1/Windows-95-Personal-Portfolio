import { useEffect, useState } from "react";
import { profile } from "../data/profile";

const SEEN_KEY = "win95-welcome-seen";

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** A tray balloon that greets visitors once per browser session. */
function WelcomeBalloon() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alreadySeen()) return;
    const show = setTimeout(() => {
      setVisible(true);
      // Marked only once actually shown, so a remount before then still greets.
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* shows again next time, no harm */
      }
    }, 900);
    const hide = setTimeout(() => setVisible(false), 12000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="balloon" role="status">
      <button className="balloon-close" onClick={() => setVisible(false)} aria-label="Close">
        ✕
      </button>
      <b>Welcome to {profile.name.split(" ")[0]}&apos;s PC!</b>
      <p>Double-click an icon to get started. Icons can be dragged around, and right-clicking (or long-pressing) the desktop shows more options.</p>
    </div>
  );
}

export default WelcomeBalloon;
