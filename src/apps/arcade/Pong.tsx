import { useCallback, useEffect, useRef, useState } from "react";
import MenuBar from "../../components/MenuBar";
import { useWindowKeys } from "../../hooks/useWindowKeys";
import { isTouch, useHighScore } from "./highScore";

const W = 360;
const H = 240;
const PADDLE_W = 6;
const PADDLE_H = 40;
const BALL = 6;
const WIN_AT = 7;
const PLAYER_SPEED = 300; // px per second with the keyboard

type Difficulty = "easy" | "normal" | "hard";
/** How fast the computer's paddle can move (px/s), and how sloppy it is. */
const CPU: Record<Difficulty, { speed: number; error: number }> = {
  easy: { speed: 150, error: 26 },
  normal: { speed: 225, error: 14 },
  hard: { speed: 320, error: 4 },
};

type Status = "ready" | "playing" | "paused" | "over";

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="game-help">
      <h3>How to Play Pong</h3>
      <ul>
        <li>
          You&apos;re the <b>left paddle</b>. Move it with the mouse
          {isTouch ? " or your finger" : ""} over the court, or with <b>↑ ↓</b> / <b>W S</b>.
        </li>
        <li>Bounce the ball past the computer to score. First to {WIN_AT} wins.</li>
        <li>
          Where the ball hits your paddle sets its angle: the edges send it flying steeply.
          It speeds up with every hit.
        </li>
        <li>
          <b>P</b> pauses. Change the difficulty in the Game menu.
        </li>
      </ul>
      <div className="button-row center">
        <button className="win-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

function Pong() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const { best: wins, increment: addWin } = useHighScore(`pong-wins-${difficulty}`);
  const [result, setResult] = useState<string | null>(null);

  const g = useRef({
    you: H / 2 - PADDLE_H / 2,
    cpu: H / 2 - PADDLE_H / 2,
    ball: { x: W / 2, y: H / 2, vx: 0, vy: 0 },
    keys: { up: false, down: false },
    serveAt: 0,
    aimError: 0,
    score: { you: 0, cpu: 0 },
  });

  const serve = useCallback(
    (towardYou: boolean) => {
      const s = g.current;
      const angle = (Math.random() - 0.5) * (Math.PI / 3);
      const speed = 230;
      s.ball = {
        x: W / 2,
        y: H / 2,
        vx: Math.cos(angle) * speed * (towardYou ? -1 : 1),
        vy: Math.sin(angle) * speed,
      };
      s.serveAt = performance.now() + 700;
      s.aimError = (Math.random() - 0.5) * 2 * CPU[difficulty].error;
    },
    [difficulty],
  );

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const s = g.current;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#555";
    for (let y = 4; y < H; y += 16) ctx.fillRect(W / 2 - 1, y, 2, 8);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(s.score.you), W / 2 - 40, 34);
    ctx.fillText(String(s.score.cpu), W / 2 + 40, 34);
    ctx.fillRect(8, s.you, PADDLE_W, PADDLE_H);
    ctx.fillRect(W - 8 - PADDLE_W, s.cpu, PADDLE_W, PADDLE_H);
    ctx.fillRect(s.ball.x - BALL / 2, s.ball.y - BALL / 2, BALL, BALL);
  }, []);

  useEffect(() => {
    draw();
    if (status !== "playing") return;
    let frame = 0;
    let last = performance.now();
    const clamp = (y: number) => Math.max(0, Math.min(H - PADDLE_H, y));

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = g.current;
      const b = s.ball;

      if (s.keys.up) s.you = clamp(s.you - PLAYER_SPEED * dt);
      if (s.keys.down) s.you = clamp(s.you + PLAYER_SPEED * dt);

      // The computer tracks the ball when it's coming, otherwise drifts to the middle.
      const target = (b.vx > 0 ? b.y + s.aimError : H / 2) - PADDLE_H / 2;
      const step = CPU[difficulty].speed * dt;
      s.cpu = clamp(s.cpu + Math.max(-step, Math.min(step, target - s.cpu)));

      if (now >= s.serveAt) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y < BALL / 2 || b.y > H - BALL / 2) {
          b.y = Math.max(BALL / 2, Math.min(H - BALL / 2, b.y));
          b.vy = -b.vy;
        }
        const hit = (paddleY: number, dir: 1 | -1) => {
          const offset = (b.y - (paddleY + PADDLE_H / 2)) / (PADDLE_H / 2); // -1 .. 1
          const speed = Math.min(600, Math.hypot(b.vx, b.vy) * 1.06);
          const angle = offset * (Math.PI / 3);
          b.vx = Math.cos(angle) * speed * dir;
          b.vy = Math.sin(angle) * speed;
          s.aimError = (Math.random() - 0.5) * 2 * CPU[difficulty].error;
        };
        const youX = 8 + PADDLE_W;
        const cpuX = W - 8 - PADDLE_W;
        if (b.vx < 0 && b.x - BALL / 2 <= youX && b.x > 8 && b.y >= s.you - BALL && b.y <= s.you + PADDLE_H + BALL) {
          b.x = youX + BALL / 2;
          hit(s.you, 1);
        }
        if (b.vx > 0 && b.x + BALL / 2 >= cpuX && b.x < W - 8 && b.y >= s.cpu - BALL && b.y <= s.cpu + PADDLE_H + BALL) {
          b.x = cpuX - BALL / 2;
          hit(s.cpu, -1);
        }
        if (b.x < -BALL || b.x > W + BALL) {
          const youScored = b.x > W;
          if (youScored) s.score.you++;
          else s.score.cpu++;
          setScore({ ...s.score });
          if (s.score.you >= WIN_AT || s.score.cpu >= WIN_AT) {
            const won = s.score.you >= WIN_AT;
            if (won) addWin();
            setResult(won ? "You win! 🎉" : "The computer wins.");
            setStatus("over");
            draw();
            return;
          }
          serve(!youScored);
        }
      }
      draw();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [status, difficulty, draw, serve, addWin]);

  const start = () => {
    const s = g.current;
    s.score = { you: 0, cpu: 0 };
    s.you = s.cpu = H / 2 - PADDLE_H / 2;
    setScore(s.score);
    setResult(null);
    serve(Math.random() < 0.5);
    setStatus("playing");
    canvas.current?.focus();
  };

  useWindowKeys(
    (e) => setKey(e, true),
    (e) => setKey(e, false),
  );

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * H;
    g.current.you = Math.max(0, Math.min(H - PADDLE_H, y - PADDLE_H / 2));
    if (status !== "playing") draw();
  };

  const setKey = (e: KeyboardEvent, down: boolean) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === "ArrowUp" || k === "w") g.current.keys.up = down;
    else if (k === "ArrowDown" || k === "s") g.current.keys.down = down;
    else if (down && k === "p") {
      if (status === "playing") setStatus("paused");
      else if (status === "paused") setStatus("playing");
      return;
    } else if (down && (k === " " || k === "Enter") && (status === "ready" || status === "over")) {
      e.preventDefault();
      start();
      return;
    } else return;
    e.preventDefault();
    if (down && status === "ready") start();
  };

  return (
    <div className="arcade">
      <MenuBar
        menus={[
          {
            label: "Game",
            items: [
              { label: "New Game", onClick: start },
              {
                label: status === "paused" ? "Resume" : "Pause",
                onClick: () => setStatus(status === "paused" ? "playing" : "paused"),
                disabled: status !== "playing" && status !== "paused",
              },
              "divider",
              ...(["easy", "normal", "hard"] as Difficulty[]).map((d) => ({
                label: d[0].toUpperCase() + d.slice(1),
                checked: difficulty === d,
                onClick: () => setDifficulty(d),
              })),
            ],
          },
          { label: "Help", items: [{ label: "How to Play", onClick: () => setShowHelp(true) }] },
        ]}
      />
      {showHelp ? (
        <HowToPlay onClose={() => setShowHelp(false)} />
      ) : (
        <>
          <div className="arcade-stage">
            <canvas
              ref={canvas}
              width={W}
              height={H}
              tabIndex={0}
              autoFocus
              className="arcade-canvas pong-canvas"
              aria-label="Pong court"
              onPointerMove={onPointer}
              onPointerDown={(e) => {
                e.currentTarget.focus();
                onPointer(e);
              }}
            />
            {status !== "playing" && (
              <div className="arcade-message">
                <b>{status === "paused" ? "Paused" : status === "over" ? result : "Pong"}</b>
                {status !== "paused" && (
                  <button className="win-btn" onClick={start}>
                    {status === "over" ? "Play again" : "Start"}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="statusbar card-status">
            <span>
              You {score.you} : {score.cpu} Computer
            </span>
            <span>
              Wins on {difficulty}: {wins}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default Pong;
