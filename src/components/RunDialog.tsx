import { Button, Input, TitleBar } from "@react95/core";
import { Rundll1 } from "@react95/icons";
import { useState } from "react";
import { APPS } from "../apps/registry";
import { useOpenApp } from "../hooks/useOpenApp";
import { useSession } from "../store/session";
import { useUi } from "../store/ui";
import { useWindowsStore } from "../store/windows";
import ErrorBox from "./ErrorBox";
import { Win95Modal } from "./Win95Modal";

// Classic program names, mapped to the apps on this desktop.
const ALIASES: Record<string, string> = {
  notepad: "about",
  "about me": "about",
  explorer: "projects",
  wordpad: "resume",
  write: "resume",
  winmine: "minesweeper",
  mail: "contact",
  email: "contact",
  "my computer": "my-computer",
  sysdm: "my-computer",
  "sysdm.cpl": "my-computer",
  control: "display",
  "desk.cpl": "display",
  taskmgr: "taskmgr",
  recycled: "recycle-bin",
};

function resolveApp(command: string): string | undefined {
  const name = command.replace(/\.exe$/, "");
  if (ALIASES[name]) return ALIASES[name];
  return APPS.find(
    (app) => app.id === name || app.label.toLowerCase().replace(/\.\w+$/, "") === name,
  )?.id;
}

const looksLikeUrl = (s: string) => /^(https?:\/\/|www\.)\S+$|^[\w-]+\.(com|org|net|io|dev|app)(\/\S*)?$/.test(s);

function RunDialog() {
  const [command, setCommand] = useState("");
  const [error, setError] = useState<string | null>(null);
  const close = () => useUi.getState().openDialog(null);
  const openApp = useOpenApp();

  const run = () => {
    const trimmed = command.trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed) return;

    const appId = resolveApp(lower);
    if (appId) {
      openApp(appId);
      return close();
    }
    if (lower === "shutdown" || lower === "logoff") {
      useWindowsStore.getState().closeAll();
      useSession.getState().setPhase(lower === "shutdown" ? "shutdown" : "login");
      return close();
    }
    if (looksLikeUrl(trimmed)) {
      window.open(/^https?:/.test(trimmed) ? trimmed : `https://${trimmed}`, "_blank", "noopener");
      return close();
    }
    setError(
      `Cannot find the file '${trimmed}' (or one of its components). Make sure the path and filename are correct and that all required libraries are available.`,
    );
  };

  return (
    <>
      <Win95Modal
        title="Run"
        className="run-dialog"
        hasWindowButton={false}
        titleBarOptions={[<TitleBar.Close key="close" onClick={close} />]}
      >
        <Win95Modal.Content>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run();
            }}
          >
            <div className="run-body">
              <Rundll1 variant="32x32_4" style={{ width: 32, height: 32, flex: "none" }} />
              <p>
                Type the name of a program, folder, or website, and this computer will open it
                for you. Try <code>winmine</code>, <code>notepad</code>, or <code>taskmgr</code>.
              </p>
            </div>
            <label className="run-input">
              <u>O</u>pen:
              <Input
                autoFocus
                list="run-suggestions"
                value={command}
                onChange={(e) => setCommand(e.currentTarget.value)}
              />
              <datalist id="run-suggestions">
                {[...Object.keys(ALIASES), "shutdown"].map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
            <div className="button-row end">
              <Button type="submit">OK</Button>
              <Button type="button" onClick={close}>
                Cancel
              </Button>
            </div>
          </form>
        </Win95Modal.Content>
      </Win95Modal>
      {error && <ErrorBox title={command.trim()} message={error} onClose={() => setError(null)} />}
    </>
  );
}

export default RunDialog;
