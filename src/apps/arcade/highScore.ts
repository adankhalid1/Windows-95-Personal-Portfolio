import { useCallback, useRef, useState } from "react";

const read = (key: string) => {
  try {
    return Number(localStorage.getItem(`win95-best-${key}`)) || 0;
  } catch {
    return 0;
  }
};

/** A best score that survives reloads (in this browser only). */
export function useHighScore(key: string) {
  const [best, setBest] = useState(() => read(key));
  const bestRef = useRef(best);
  /** Records a finished game's score; returns true if it's a new best. */
  const submit = useCallback(
    (score: number) => {
      if (score <= bestRef.current) return false;
      bestRef.current = score;
      setBest(score);
      try {
        localStorage.setItem(`win95-best-${key}`, String(score));
      } catch {
        /* kept for this visit only */
      }
      return true;
    },
    [key],
  );
  /** Adds one to the stored number (used as a win counter). */
  const increment = useCallback(() => submit(bestRef.current + 1), [submit]);
  return { best, submit, increment };
}

export const isTouch = window.matchMedia("(pointer: coarse)").matches;
