import { Button, Fieldset, Modal, RadioButton, TitleBar } from "@react95/core";
import { Computer3 } from "@react95/icons";
import { useState, type ComponentType } from "react";
import { useAuth } from "../store/auth";
import Sound from "../utils/Sound";

type ShutdownOption = "shutdown" | "restart" | "restart-incompatible";

interface ShutdownProps {
  close: () => void;
}

function Shutdown({ close }: ShutdownProps) {
  const [selectedOption, setSelectedOption] =
    useState<ShutdownOption>("shutdown");
  const [playSound, setPlaySound] = useState(false);
  const logout = useAuth((state) => state.logout);

  const handleConfirm = () => {
    if (selectedOption === "shutdown") {
      setPlaySound(true);

      logout();
      close();
    } else {
      close();
    }
  };

  return (
    <>
      <SafeModal
        icon={<Computer3 variant="32x32_4" />}
        title="Shut Down Windows"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
        }}
        titleBarOptions={[<TitleBar.Close key="close" onClick={close} />]}
      >
        <Modal.Content width="400px">
          <div className="p-4">
            <div className="flex items-start">
              <Computer3 variant="32x32_4" style={{ marginRight: "1rem" }} />
              <div style={{ flexGrow: 1 }}>
                <p style={{ marginTop: 0 }}>Are you sure you want to:</p>
                <RadioButton
                  name="shutdown"
                  value="shutdown"
                  checked={selectedOption === "shutdown"}
                  onChange={() => setSelectedOption("shutdown")}
                >
                  Shut down the computer?
                </RadioButton>
                <RadioButton
                  name="shutdown"
                  value="restart"
                  checked={selectedOption === "restart"}
                  onChange={() => setSelectedOption("restart")}
                >
                  Restart the computer?
                </RadioButton>
                <RadioButton
                  name="shutdown"
                  value="restart-incompatible"
                  checked={selectedOption === "restart-incompatible"}
                  onChange={() => setSelectedOption("restart-incompatible")}
                >
                  Restart the computer in MS-DOS mode?
                </RadioButton>
              </div>
            </div>
          </div>
          <Fieldset style={{ padding: "0.5rem", margin: "0.5rem" }}>
            <div className="flex items-center justify-center gap-2">
              <Button onClick={handleConfirm} style={{ width: "90px" }}>
                Yes
              </Button>
              <Button onClick={close} style={{ width: "90px" }}>
                No
              </Button>
              <Button style={{ width: "90px" }}>Help</Button>
            </div>
          </Fieldset>
        </Modal.Content>
      </SafeModal>
      <Sound src="/shutdown.mp3" play={playSound} />
    </>
  );
}

export default Shutdown;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeModal = Modal as unknown as ComponentType<any>;
