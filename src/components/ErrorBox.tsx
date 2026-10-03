import { Button, TitleBar } from "@react95/core";
import { Win95Modal } from "./Win95Modal";

interface ErrorBoxProps {
  title: string;
  message: string;
  onClose: () => void;
  /** An "i" information icon instead of the red error cross. */
  info?: boolean;
}

function ErrorBox({ title, message, onClose, info }: ErrorBoxProps) {
  return (
    <Win95Modal
      title={title}
      className="error-box"
      hasWindowButton={false}
      titleBarOptions={[<TitleBar.Close key="close" onClick={onClose} />]}
    >
      <Win95Modal.Content>
        <div className="error-body" role={info ? "status" : "alert"}>
          <span className={`error-icon${info ? " info" : ""}`} aria-hidden>
            {info ? "i" : "✕"}
          </span>
          <p>{message}</p>
        </div>
        <div className="button-row center">
          <Button autoFocus onClick={onClose}>
            OK
          </Button>
        </div>
      </Win95Modal.Content>
    </Win95Modal>
  );
}

export default ErrorBox;
