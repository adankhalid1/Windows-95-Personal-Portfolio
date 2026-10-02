import { sameCard, type Card, type Suit } from "./cards";

export interface Play {
  player: number;
  card: Card;
}

/** Aces are high in Hearts. */
export const value = (c: Card) => (c.rank === 1 ? 14 : c.rank);
export const isQueenOfSpades = (c: Card) => c.suit === "S" && c.rank === 12;
export const points = (c: Card) => (c.suit === "H" ? 1 : isQueenOfSpades(c) ? 13 : 0);
export const isTwoOfClubs = (c: Card) => c.suit === "C" && c.rank === 2;

const SUIT_ORDER: Suit[] = ["C", "D", "S", "H"];
export const sortHand = (hand: Card[]) =>
  [...hand].sort(
    (a, b) => SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit) || value(a) - value(b),
  );

export const without = (hand: Card[], cards: Card[]) =>
  hand.filter((h) => !cards.some((c) => sameCard(c, h)));

/** Which cards in `hand` may be played right now. */
export function legalPlays(
  hand: Card[],
  trick: Play[],
  heartsBroken: boolean,
  firstTrick: boolean,
): Card[] {
  if (trick.length === 0) {
    if (firstTrick) return hand.filter(isTwoOfClubs);
    if (!heartsBroken) {
      const safe = hand.filter((c) => c.suit !== "H");
      if (safe.length) return safe;
    }
    return hand;
  }
  const lead = trick[0].card.suit;
  const follow = hand.filter((c) => c.suit === lead);
  if (follow.length) return follow;
  // Void in the suit: anything goes, except no points on the very first trick.
  if (firstTrick) {
    const clean = hand.filter((c) => points(c) === 0);
    if (clean.length) return clean;
  }
  return hand;
}

/** The player who takes the trick: highest card of the suit that was led. */
export function trickWinner(trick: Play[]): number {
  const lead = trick[0].card.suit;
  return trick
    .filter((p) => p.card.suit === lead)
    .reduce((best, p) => (value(p.card) > value(best.card) ? p : best)).player;
}

/** Cards a computer player chooses to pass: the most dangerous ones. */
export function choosePass(hand: Card[]): Card[] {
  const danger = (c: Card) => {
    if (isQueenOfSpades(c)) return 100;
    if (c.suit === "S" && value(c) > 12) return 90; // A and K of spades attract the queen
    if (c.suit === "H") return 20 + value(c);
    return value(c);
  };
  return [...hand].sort((a, b) => danger(b) - danger(a)).slice(0, 3);
}

/** A simple but sensible computer strategy: dodge points, dump danger. */
export function choosePlay(
  hand: Card[],
  trick: Play[],
  heartsBroken: boolean,
  firstTrick: boolean,
): Card {
  const legal = legalPlays(hand, trick, heartsBroken, firstTrick);
  const byValue = [...legal].sort((a, b) => value(a) - value(b));
  const lowest = byValue[0];
  const highest = byValue[byValue.length - 1];

  if (trick.length === 0) {
    // Lead low, preferring not to lead spades while holding the queen.
    const holdsQueen = hand.some(isQueenOfSpades);
    return byValue.find((c) => !(holdsQueen && c.suit === "S")) ?? lowest;
  }

  const lead = trick[0].card.suit;
  if (legal[0].suit === lead) {
    const winning = Math.max(...trick.filter((p) => p.card.suit === lead).map((p) => value(p.card)));
    const under = byValue.filter((c) => value(c) < winning);
    // Duck under the winning card with the highest card that still loses.
    if (under.length) return under[under.length - 1];
    // Can't duck. Last to play on a pointless trick? Win it with the biggest card.
    const trickPoints = trick.reduce((n, p) => n + points(p.card), 0);
    if (trick.length === 3 && trickPoints === 0) {
      return byValue.filter((c) => !isQueenOfSpades(c)).pop() ?? highest;
    }
    return byValue.find((c) => !isQueenOfSpades(c)) ?? lowest;
  }

  // Can't follow suit: get rid of the most dangerous card.
  const queen = legal.find(isQueenOfSpades);
  if (queen) return queen;
  const bigSpade = legal.filter((c) => c.suit === "S" && value(c) > 12).pop();
  if (bigSpade) return bigSpade;
  const hearts = legal.filter((c) => c.suit === "H").sort((a, b) => value(a) - value(b));
  if (hearts.length) return hearts[hearts.length - 1];
  return highest;
}

/**
 * Points for a finished hand. Taking all 26 points ("shooting the moon")
 * gives everyone else 26 instead.
 */
export function scoreHand(taken: Card[][]): { scores: number[]; moon: number | null } {
  const raw = taken.map((cards) => cards.reduce((n, c) => n + points(c), 0));
  const moon = raw.indexOf(26);
  if (moon >= 0) return { scores: raw.map((_, i) => (i === moon ? 0 : 26)), moon };
  return { scores: raw, moon: null };
}
