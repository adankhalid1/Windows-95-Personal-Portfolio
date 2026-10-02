import { useEffect, useRef, useState } from "react";

const THRESHOLD = 5;

export interface DragSource {
  pile: string;
  index: number;
}

interface Options {
  /** Can the card at this spot (and everything on top of it) be picked up? */
  canDrag: (source: DragSource) => boolean;
  /** Drop onto another pile; return true if the move was made. */
  onDrop: (source: DragSource, targetPile: string) => boolean;
  /** A press that didn't move: used for tap-to-select and the stock pile. */
  onTap: (source: DragSource) => void;
}

/**
 * Pointer-based drag and drop for card piles, so it works the same with a
 * mouse, a pen or a finger. Elements opt in with `data-pile="<id>"`; the
 * pile under the pointer when it's released is the drop target.
 */
export function useCardDrag({ canDrag, onDrop, onTap }: Options) {
  const [drag, setDrag] = useState<(DragSource & { dx: number; dy: number }) | null>(null);
  const start = useRef<{ source: DragSource; x: number; y: number; moved: boolean } | null>(null);
  const latest = useRef({ canDrag, onDrop, onTap });
  latest.current = { canDrag, onDrop, onTap };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const s = start.current;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (!s.moved && Math.hypot(dx, dy) < THRESHOLD) return;
      if (!s.moved && !latest.current.canDrag(s.source)) return;
      s.moved = true;
      setDrag({ ...s.source, dx, dy });
    };
    const up = (e: PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      setDrag(null);
      if (!s.moved) {
        latest.current.onTap(s.source);
        return;
      }
      // Dragged cards ignore the pointer, so this finds what's underneath.
      const target = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-pile]")?.dataset.pile;
      if (target && target !== s.source.pile) latest.current.onDrop(s.source, target);
    };
    const cancel = () => {
      start.current = null;
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, []);

  /** Spread onto a card: `{...press(pileId, index)}`. */
  const press = (pile: string, index: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      start.current = { source: { pile, index }, x: e.clientX, y: e.clientY, moved: false };
    },
  });

  /** Is this card part of the stack being dragged? Returns its offset if so. */
  const offsetOf = (pile: string, index: number) =>
    drag && drag.pile === pile && index >= drag.index ? { dx: drag.dx, dy: drag.dy } : null;

  return { press, offsetOf, dragging: drag !== null };
}
