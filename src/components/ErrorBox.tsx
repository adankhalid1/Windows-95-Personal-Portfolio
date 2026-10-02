import { Button, TitleBar } from "@react95/core";
import { Win95Modal } from "./Win95Modal";

interface ErrorBoxProps {
  title: string;
  message: string;
  onClose: () => void;
}

function ErrorBox({ title, message, onClose }: ErrorBoxProps) {
  return (
    <Win95Modal
      title={title}
      className="error-box"
      hasWindowButton={false}
      titleBarOptions={[<TitleBar.Close key="close" onClick={onClose} />]}
    >
      <Win95Modal.Content>
        <div className="error-body" role="alert">
          <span className="error-icon" aria-hidden>
            ✕
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
