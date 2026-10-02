import { Button, RadioButton, TitleBar } from "@react95/core";
import { Win95Modal } from "./Win95Modal";
import { Computer3 } from "@react95/icons";
import { useState } from "react";
import { useSession, type Phase } from "../store/session";
import { useWindowsStore } from "../store/windows";

const OPTIONS: { label: string; next: Phase }[] = [
  { label: "Shut down the computer?", next: "shutdown" },
  { label: "Restart the computer?", next: "boot" },
  { label: "Close all programs and log on as a different user?", next: "login" },
];

function ShutdownDialog({ close }: { close: () => void }) {
  const [choice, setChoice] = useState(0);
  const setPhase = useSession((s) => s.setPhase);
  const closeAll = useWindowsStore((s) => s.closeAll);

  const confirm = () => {
    closeAll();
    close();
    setPhase(OPTIONS[choice].next);
  };

  return (
    <>
      <div className="dim" onClick={close} />
      <Win95Modal
        title="Shut Down Windows"
        className="shutdown-dialog"
        hasWindowButton={false}
        dragOptions={{ disabled: true }}
        titleBarOptions={[<TitleBar.Close key="close" onClick={close} />]}
      >
        <Win95Modal.Content>
          <div className="shutdown-body">
            <Computer3 variant="32x32_4" style={{ width: 48, height: 48 }} />
            <div>
              <p>Are you sure you want to:</p>
              {OPTIONS.map((option, i) => (
                <RadioButton
                  key={option.next}
                  name="shutdown"
                  checked={choice === i}
                  onChange={() => setChoice(i)}
                >
                  {option.label}
                </RadioButton>
              ))}
            </div>
          </div>
          <div className="button-row center">
            <Button onClick={confirm}>Yes</Button>
            <Button onClick={close}>No</Button>
          </div>
        </Win95Modal.Content>
      </Win95Modal>
    </>
  );
}

export default ShutdownDialog;
