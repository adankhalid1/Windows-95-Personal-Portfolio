import { Button, TitleBar } from "@react95/core";
import { Globe } from "@react95/icons";
import { profile } from "../data/profile";
import { useUi } from "../store/ui";
import { Win95Modal } from "./Win95Modal";

const firstName = profile.name.split(" ")[0];

/** "www.instagram.com/adan.kld/" -> "instagram.com/adan.kld" */
const prettyUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function LeaveDialog() {
  const link = useUi((s) => s.leaving);
  const cancel = useUi((s) => s.cancelLeave);
  if (!link) return null;

  const go = () => {
    // Opened from this click, so popup blockers allow it.
    window.open(link.url, "_blank", "noopener,noreferrer");
    cancel();
  };

  return (
    <>
      <div className="dim" onClick={cancel} />
      <Win95Modal
        title={`Leaving ${firstName}'s PC`}
        className="leave-dialog"
        hasWindowButton={false}
        dragOptions={{ disabled: true }}
        titleBarOptions={[<TitleBar.Close key="close" onClick={cancel} />]}
        onKeyDown={(e: React.KeyboardEvent) => e.key === "Escape" && cancel()}
      >
        <Win95Modal.Content>
          <div className="leave-body">
            <Globe variant="32x32_4" style={{ width: 32, height: 32, flex: "none" }} />
            <div>
              <p>
                You&apos;re about to leave this website and visit <b>{link.label}</b>:
              </p>
              <p className="leave-url">{prettyUrl(link.url)}</p>
              <p>It will open in a new tab, so this desktop stays right where you left it.</p>
            </div>
          </div>
          <div className="button-row center">
            <Button onClick={go} autoFocus>
              Continue
            </Button>
            <Button onClick={cancel}>Stay here</Button>
          </div>
        </Win95Modal.Content>
      </Win95Modal>
    </>
  );
}

export default LeaveDialog;
