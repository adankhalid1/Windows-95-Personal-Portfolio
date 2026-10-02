import { Button, Input } from "@react95/core";
import { Win95Modal } from "./Win95Modal";
import { Keys } from "@react95/icons";
import { profile } from "../data/profile";
import { useSession } from "../store/session";

function Login() {
  const setPhase = useSession((s) => s.setPhase);
  // Like the real thing, any password works and Cancel logs you in anyway.
  const enter = () => setPhase("desktop");

  return (
    <Win95Modal
      title="Welcome to Windows"
      className="login"
      hasWindowButton={false}
      dragOptions={{ disabled: true }}
    >
      <Win95Modal.Content>
        <form
          className="login-body"
          onSubmit={(e) => {
            e.preventDefault();
            enter();
          }}
        >
          <Keys variant="32x32_4" style={{ width: 48, height: 48 }} />
          <div className="login-fields">
            <p>Type a user name and password to log on to Windows.</p>
            <label>
              <span>
                <u>U</u>ser name:
              </span>
              <Input defaultValue={profile.handle} />
            </label>
            <label>
              <span>
                <u>P</u>assword:
              </span>
              <Input type="password" autoFocus placeholder="anything works" />
            </label>
          </div>
          <div className="login-buttons">
            <Button type="submit">OK</Button>
            <Button type="button" onClick={enter}>
              Cancel
            </Button>
          </div>
        </form>
      </Win95Modal.Content>
    </Win95Modal>
  );
}

export default Login;
