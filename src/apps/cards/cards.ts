export type Suit = "C" | "D" | "H" | "S";

export interface Card {
  suit: Suit;
  /** 1 = Ace ... 11 = Jack, 12 = Queen, 13 = King. */
  rank: number;
}

export const SUITS: Suit[] = ["C", "D", "H", "S"];
export const SUIT_SYMBOL: Record<Suit, string> = { C: "♣", D: "♦", H: "♥", S: "♠" };
export const SUIT_NAME: Record<Suit, string> = {
  C: "clubs",
  D: "diamonds",
  H: "hearts",
  S: "spades",
};
const RANK_LABEL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RANK_NAME = ["", "ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];

export const rankLabel = (rank: number) => RANK_LABEL[rank];
export const isRed = (card: Card) => card.suit === "D" || card.suit === "H";
export const cardName = (card: Card) => `${RANK_NAME[card.rank]} of ${SUIT_NAME[card.suit]}`;
export const sameCard = (a: Card, b: Card) => a.suit === b.suit && a.rank === b.rank;

export function newDeck(): Card[] {
  return SUITS.flatMap((suit) =>
    Array.from({ length: 13 }, (_, i) => ({ suit, rank: i + 1 })),
  );
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Picks a card width that fits `columns` cards (plus gaps) across the
 * screen, between `min` and `max` pixels.
 */
export function fitCardWidth(columns: number, max = 56, min = 34): number {
  const available = Math.min(window.innerWidth - 56, columns * (max + 8));
  return Math.max(min, Math.min(max, Math.floor(available / columns) - 6));
}
