import { Chess } from "chess.js";
import { chooseMove, type Difficulty } from "./ai";
import type { ThinkRequest, ThinkResult } from "./ai.worker";

type Answer = Omit<ThinkResult, "id">;

const pending = new Map<number, { request: ThinkRequest; resolve: (a: Answer) => void }>();
let worker: Worker | null | undefined;
let nextId = 0;

function thinkHere({ fen, difficulty }: ThinkRequest): Answer {
  const move = chooseMove(new Chess(fen), difficulty);
  return { from: move.from, to: move.to, promotion: move.promotion };
}

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    worker = new Worker(new URL("./ai.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<ThinkResult>) => {
      pending.get(e.data.id)?.resolve(e.data);
      pending.delete(e.data.id);
    };
    worker.onerror = () => {
      // Workers blocked (some sandboxes do this): think on the main thread.
      worker?.terminate();
      worker = null;
      for (const { request, resolve } of pending.values()) resolve(thinkHere(request));
      pending.clear();
    };
  } catch {
    worker = null;
  }
  return worker;
}

/** Asks the computer for its move in the position `fen`. */
export function think(fen: string, difficulty: Difficulty): Promise<Answer> {
  const request: ThinkRequest = { id: nextId++, fen, difficulty };
  const w = getWorker();
  return new Promise((resolve) => {
    if (!w) {
      // Let the "thinking..." status paint before the search blocks.
      setTimeout(() => resolve(thinkHere(request)), 30);
      return;
    }
    pending.set(request.id, { request, resolve });
    w.postMessage(request);
  });
}
