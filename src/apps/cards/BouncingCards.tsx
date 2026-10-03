import { useEffect, useRef } from "react";
import { isRed, rankLabel, SUIT_SYMBOL, type Card } from "./cards";

interface Props {
  /** Where each foundation pile sits, relative to the board. */
  launchPoints: { x: number; y: number }[];
  /** The four finished foundations (Ace..King), used as ammunition. */
  foundations: Card[][];
  cardWidth: number;
  onDone: () => void;
}

/**
 * The famous Windows Solitaire win: cards leap off the foundations one by
 * one and bounce across the screen, leaving a trail because the canvas is
 * never cleared. Click (or tap) to stop.
 */
function BouncingCards({ launchPoints, foundations, cardWidth, onDone }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const w = cardWidth;
    const h = Math.round(cardWidth * 1.38);

    // Kings first, round-robin across the four foundations, like the original.
    const queue: { card: Card; from: { x: number; y: number } }[] = [];
    for (let rank = 13; rank >= 1; rank--) {
      foundations.forEach((pile, i) => {
        const card = pile[rank - 1];
        if (card) queue.push({ card, from: launchPoints[i] });
      });
    }

    const drawCard = (card: Card, x: number, y: number) => {
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isRed(card) ? "#d00000" : "#000";
      ctx.font = `bold ${Math.round(w * 0.24)}px Arial, sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText(rankLabel(card.rank), x + 3, y + 2);
      ctx.fillText(SUIT_SYMBOL[card.suit], x + 3, y + 2 + w * 0.24);
      ctx.font = `${Math.round(w * 0.5)}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(SUIT_SYMBOL[card.suit], x + w / 2, y + h / 2 + 2);
      ctx.textAlign = "start";
    };

    let current: { card: Card; x: number; y: number; vx: number; vy: number } | null = null;
    let frame = 0;
    const tick = () => {
      if (!current) {
        const next = queue.shift();
        if (!next) {
          onDone();
          return;
        }
        const dir = Math.random() < 0.5 ? -1 : 1;
        current = {
          card: next.card,
          x: next.from.x,
          y: next.from.y,
          vx: dir * (2 + Math.random() * 4),
          vy: -(Math.random() * 6),
        };
      }
      const c = current;
      c.vy += 0.5; // gravity
      c.x += c.vx;
      c.y += c.vy;
      if (c.y + h > canvas.height) {
        c.y = canvas.height - h;
        c.vy = -c.vy * 0.78; // lose some energy each bounce
      }
      drawCard(c.card, c.x, c.y);
      if (c.x + w < 0 || c.x > canvas.width) current = null;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [launchPoints, foundations, cardWidth, onDone]);

  return (
    <canvas
      ref={ref}
      className="bouncing-cards"
      onPointerDown={onDone}
      aria-label="You win! Click to stop the animation."
    />
  );
}

export default BouncingCards;
