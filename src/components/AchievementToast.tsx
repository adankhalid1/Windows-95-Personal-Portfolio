import { useEffect } from "react";
import { SECRETS } from "../data/secrets";
import { useOpenApp } from "../hooks/useOpenApp";
import { useSecrets } from "../store/secrets";

/** "Achievement unlocked" pop-up at the top of the screen. */
function AchievementToast() {
  const justFound = useSecrets((s) => s.justFound);
  const count = useSecrets((s) => s.found.length);
  const dismiss = useSecrets((s) => s.dismiss);
  const openApp = useOpenApp();

  useEffect(() => {
    if (!justFound) return;
    const t = setTimeout(dismiss, 5000);
    return () => clearTimeout(t);
  }, [justFound, dismiss]);

  const secret = SECRETS.find((s) => s.id === justFound);
  if (!secret) return null;

  return (
    <button
      key={secret.id}
      className="achievement-toast"
      role="status"
      onClick={() => {
        dismiss();
        openApp("achievements");
      }}
    >
      <span className="achievement-toast-title">Achievement Unlocked</span>
      <span className="achievement-toast-body">
        <span className="achievement-trophy" aria-hidden>
          🏆
        </span>
        <span>
          <b>{secret.title}</b>
          <br />
          {count} of {SECRETS.length} secrets found
        </span>
      </span>
    </button>
  );
}

export default AchievementToast;
