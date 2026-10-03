import type { Card, Suit } from "./cards";

/**
 * The deal from the original Microsoft FreeCell, so "Game #1" here is the
 * same Game #1 people played in 1995: its random number generator and
 * shuffle, reproduced exactly.
 */
export function msDeal(gameNumber: number): Card[][] {
  let seed = gameNumber;
  const rand = () => {
    seed = (seed * 214013 + 2531011) & 0x7fffffff;
    return seed >> 16;
  };
  const suits: Suit[] = ["C", "D", "H", "S"];
  // Cards are numbered 0..51 as rank * 4 + suit, and start in reverse order.
  const deck = Array.from({ length: 52 }, (_, i) => 51 - i);
  for (let i = 0; i < 52; i++) {
    const j = 51 - (rand() % (52 - i));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const tableau: Card[][] = Array.from({ length: 8 }, () => []);
  deck.forEach((n, i) => tableau[i % 8].push({ suit: suits[n % 4], rank: Math.floor(n / 4) + 1 }));
  return tableau;
}

