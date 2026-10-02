import { useCallback, useEffect, useRef, useState } from "react";
import MenuBar from "../../components/MenuBar";
import { isTouch, useHighScore } from "./highScore";

const COLS = 20;
const ROWS = 20;
const CELL = 14;
const START_MS = 140;
const FASTEST_MS = 60;

type Dir = { x: number; y: number };
type Status = "ready" | "playing" | "paused" | "over";

const DIRS: Record<string, Dir> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

interface World {
  snake: { x: number; y: number }[];
  dir: Dir;
  /** Turns queued up between ticks, so quick double-taps aren't lost. */
  queue: Dir[];
  food: { x: number; y: number };
  delay: number;
}

function placeFood(snake: { x: number; y: number }[]) {
  for (;;) {
    const food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!snake.some((s) => s.x === food.x && s.y === food.y)) return food;
  }
}

function freshWorld(): World {
  const snake = [
    { x: 6, y: 10 },
    { x: 5, y: 10 },
    { x: 4, y: 10 },
  ];
  return { snake, dir: { x: 1, y: 0 }, queue: [], food: placeFood(snake), delay: START_MS };
}

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="game-help">
      <h3>How to Play Snake</h3>
      <ul>
        <li>
          <b>Steer</b> with the arrow keys or W A S D
          {isTouch ? ", swipe on the board, or use the buttons below it" : ""}.
        </li>
        <li>
          <b>Eat the red apples</b> to grow and score 10 points each. You speed up as you go.
        </li>
        <li>
          <b>Don&apos;t crash</b> into the walls or your own tail.
        </li>
        <li>
          <b>Pause</b> with P or the space bar. Your best score is saved in this browser.
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

function Snake() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<World>(freshWorld());
  const [status, setStatus] = useState<Status>("ready");
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [showHelp, setShowHelp] = useState(false);
  const { best, submit } = useHighScore("snake");
  const [newBest, setNewBest] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const { snake, food } = world.current;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    ctx.fillStyle = "#ff2020";
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 1, 0, Math.PI * 2);
    ctx.fill();
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#80ff80" : "#00c000";
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const steer = (d: Dir) => {
    const w = world.current;
    const last = w.queue[w.queue.length - 1] ?? w.dir;
    // No reversing straight into yourself, and no repeats.
    if ((d.x === -last.x && d.y === -last.y) || (d.x === last.x && d.y === last.y)) return;
    if (w.queue.length < 3) w.queue.push(d);
    if (status === "ready") setStatus("playing");
  };

  const restart = () => {
    world.current = freshWorld();
    scoreRef.current = 0;
    setScore(0);
    setNewBest(false);
    setStatus("ready");
    draw();
    canvas.current?.focus();
  };

  // The game clock. Each tick moves the snake one cell.
  useEffect(() => {
    draw();
    if (status !== "playing") return;
    let timer: number;
    const tick = () => {
      const w = world.current;
      if (w.queue.length) w.dir = w.queue.shift()!;
      const head = { x: w.snake[0].x + w.dir.x, y: w.snake[0].y + w.dir.y };
      const eating = head.x === w.food.x && head.y === w.food.y;
      const body = eating ? w.snake : w.snake.slice(0, -1);
      const crashed =
        head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
        body.some((s) => s.x === head.x && s.y === head.y);
      if (crashed) {
        setStatus("over");
        setNewBest(submit(scoreRef.current));
        return;
      }
      w.snake = [head, ...body];
      if (eating) {
        w.food = placeFood(w.snake);
        w.delay = Math.max(FASTEST_MS, w.delay - 3);
        scoreRef.current += 10;
        setScore(scoreRef.current);
      }
      draw();
      timer = window.setTimeout(tick, w.delay);
    };
    timer = window.setTimeout(tick, world.current.delay);
    return () => clearTimeout(timer);
  }, [status, draw, submit]);

  const onKey = (e: React.KeyboardEvent) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (DIRS[key]) {
      e.preventDefault();
      if (status === "over") return;
      if (status === "paused") setStatus("playing");
      steer(DIRS[key]);
    } else if (key === "p" || key === " ") {
      e.preventDefault();
      if (status === "playing") setStatus("paused");
      else if (status === "paused") setStatus("playing");
      else if (status === "over") restart();
    }
  };

  const message =
    status === "ready"
      ? isTouch
        ? "Swipe or tap an arrow to start"
        : "Press an arrow key to start"
      : status === "paused"
        ? "Paused"
        : status === "over"
          ? newBest
            ? "New high score! 🎉"
            : "Game over"
          : null;

  return (
    <div className="arcade">
      <MenuBar
        menus={[
          {
            label: "Game",
            items: [
              { label: "New Game", onClick: restart },
              {
                label: status === "paused" ? "Resume" : "Pause",
                onClick: () => setStatus(status === "paused" ? "playing" : "paused"),
                disabled: status !== "playing" && status !== "paused",
              },
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
              width={COLS * CELL}
              height={ROWS * CELL}
              tabIndex={0}
              autoFocus
              className="arcade-canvas"
              aria-label="Snake board"
              onKeyDown={onKey}
              onPointerDown={(e) => {
                e.currentTarget.focus();
                swipe.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerUp={(e) => {
                const s = swipe.current;
                swipe.current = null;
                if (!s) return;
                const dx = e.clientX - s.x;
                const dy = e.clientY - s.y;
                if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
                  if (status === "over") restart();
                  return;
                }
                if (status === "paused") setStatus("playing");
                steer(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
              }}
            />
            {message && (
              <div className="arcade-message">
                <b>{message}</b>
                {status === "over" && (
                  <button className="win-btn" onClick={restart}>
                    Play again
                  </button>
                )}
              </div>
            )}
          </div>
          {isTouch && (
            <div className="dpad">
              <button className="win-btn up" onClick={() => steer(DIRS.ArrowUp)} aria-label="Up">▲</button>
              <button className="win-btn left" onClick={() => steer(DIRS.ArrowLeft)} aria-label="Left">◀</button>
              <button className="win-btn right" onClick={() => steer(DIRS.ArrowRight)} aria-label="Right">▶</button>
              <button className="win-btn down" onClick={() => steer(DIRS.ArrowDown)} aria-label="Down">▼</button>
            </div>
          )}
          <div className="statusbar card-status">
            <span>Score: {score}</span>
            <span>Best: {Math.max(best, score)}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default Snake;
