// Runs the computer's search off the main thread so the desktop never freezes.
import { Chess } from "chess.js";
import { chooseMove, type Difficulty } from "./ai";

export interface ThinkRequest {
  id: number;
  fen: string;
  difficulty: Difficulty;
}

export interface ThinkResult {
  id: number;
  from: string;
  to: string;
  promotion?: string;
}

self.onmessage = (e: MessageEvent<ThinkRequest>) => {
  const { id, fen, difficulty } = e.data;
  const move = chooseMove(new Chess(fen), difficulty);
  const result: ThinkResult = { id, from: move.from, to: move.to, promotion: move.promotion };
  self.postMessage(result);
};
