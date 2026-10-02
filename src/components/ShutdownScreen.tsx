import { useSession } from "../store/session";

function ShutdownScreen() {
  const setPhase = useSession((s) => s.setPhase);
  return (
    <button className="safe-to-turn-off" onClick={() => setPhase("boot")}>
      <span>It&apos;s now safe to turn off</span>
      <span>your computer.</span>
      <small>(click anywhere to turn it back on)</small>
    </button>
  );
}

export default ShutdownScreen;
