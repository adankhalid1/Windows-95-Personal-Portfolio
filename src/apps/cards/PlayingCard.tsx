import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { cardName, isRed, rankLabel, SUIT_SYMBOL, type Card } from "./cards";

interface PlayingCardProps {
  card: Card | null;
  /** Which pile this card is in, so drops onto it land on that pile. */
  pile?: string;
  faceUp?: boolean;
  width: number;
  selected?: boolean;
  dragging?: boolean;
  className?: string;
  style?: CSSProperties;
  onPointerDown?: (e: ReactPointerEvent) => void;
  onDoubleClick?: () => void;
  onClick?: () => void;
}

/** One playing card, drawn with plain HTML/CSS (no images). */
function PlayingCard({
  card,
  pile,
  faceUp = true,
  width,
  selected,
  dragging,
  className = "",
  style,
  ...handlers
}: PlayingCardProps) {
  const size = { width, height: Math.round(width * 1.38), fontSize: Math.round(width * 0.24) };
  const classes = [
    "card",
    faceUp && card ? (isRed(card) ? "red" : "black") : "back",
    selected && "selected",
    dragging && "dragging",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!card || !faceUp) {
    return (
      <div
        className={classes}
        style={{ ...size, ...style }}
        data-pile={pile}
        aria-label="face-down card"
        {...handlers}
      />
    );
  }

  const label = rankLabel(card.rank);
  const symbol = SUIT_SYMBOL[card.suit];
  return (
    <div
      className={classes}
      style={{ ...size, ...style }}
      data-pile={pile}
      aria-label={cardName(card)}
      {...handlers}
    >
      <span className="card-corner">
        {label}
        <br />
        {symbol}
      </span>
      <span className={`card-center${card.rank > 10 ? " face" : ""}`}>
        {card.rank > 10 ? label : symbol}
      </span>
      <span className="card-corner bottom">
        {label}
        <br />
        {symbol}
      </span>
    </div>
  );
}

export default PlayingCard;
