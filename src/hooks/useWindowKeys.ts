import { createContext, useContext, useEffect, useRef } from "react";
import { useWindowsStore } from "../store/windows";

/** The id of the app window a component is rendered in. */
export const WindowIdContext = createContext<string | null>(null);

type Handler = (e: KeyboardEvent) => void;

const typingInField = (e: KeyboardEvent) => {
  const el = e.target as HTMLElement | null;
  return Boolean(el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)));
};

/**
 * Keyboard input for games: handlers run only while this window is the
 * front-most one (like real Windows), whether or not anything inside it
 * has focus. Typing into text fields is left alone.
 */
export function useWindowKeys(onKeyDown: Handler, onKeyUp?: Handler) {
  const id = useContext(WindowIdContext);
  const handlers = useRef({ onKeyDown, onKeyUp });
  handlers.current = { onKeyDown, onKeyUp };

  useEffect(() => {
    const isFront = () => useWindowsStore.getState().openWindows.at(-1) === id;
    const down = (e: KeyboardEvent) => {
      if (isFront() && !typingInField(e)) handlers.current.onKeyDown(e);
    };
    const up = (e: KeyboardEvent) => {
      if (isFront() && !typingInField(e)) handlers.current.onKeyUp?.(e);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [id]);
}
