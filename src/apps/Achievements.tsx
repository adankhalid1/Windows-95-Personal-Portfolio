import MenuBar from "../components/MenuBar";
import { SECRETS } from "../data/secrets";
import { useSecrets } from "../store/secrets";

/** Achievements.txt: which easter eggs the visitor has found, with hints for the rest. */
function Achievements() {
  const found = useSecrets((s) => s.found);
  const reset = useSecrets((s) => s.reset);
  const count = SECRETS.filter((s) => found.includes(s.id)).length;
  const all = count === SECRETS.length;

  return (
    <div className="notepad-app achievements">
      <MenuBar
        menus={[
          {
            label: "File",
            items: [{ label: "Reset Progress", onClick: reset }],
          },
        ]}
      />
      <div className="achievements-page notepad-area" tabIndex={0}>
        <p>ACHIEVEMENTS.TXT</p>
        <p>================</p>
        <p>
          Secrets found: {count} of {SECRETS.length}
        </p>
        <div className="achievements-bar" role="progressbar" aria-valuenow={count} aria-valuemax={SECRETS.length}>
          {SECRETS.map((s, i) => (
            <span key={s.id} className={i < count ? "on" : ""} />
          ))}
        </div>
        {all && <p className="achievements-done">You found every secret. You are a true Windows 95 power user!</p>}
        <ol className="achievements-list">
          {SECRETS.map((s) => {
            const got = found.includes(s.id);
            return (
              <li key={s.id} className={got ? "found" : ""}>
                <span className="achievements-check">{got ? "[x]" : "[ ]"}</span>
                <span>
                  <b>{got ? s.title : "???"}</b>
                  <br />
                  {got ? s.found : `Hint: ${s.hint}`}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="statusbar card-status">
        <span>Achievements.txt</span>
        <span>
          {count}/{SECRETS.length} found
        </span>
      </div>
    </div>
  );
}

export default Achievements;
