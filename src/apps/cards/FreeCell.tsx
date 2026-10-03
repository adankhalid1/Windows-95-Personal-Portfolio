import { useCallback, useMemo, useRef, useState } from "react";
import MenuBar from "../../components/MenuBar";
import BouncingCards from "./BouncingCards";
import { fitCardWidth, isRed, type Card, type Suit } from "./cards";
import { msDeal } from "./msDeal";
import PlayingCard from "./PlayingCard";
import { useCardDrag, type DragSource } from "./useCardDrag";

interface State {
  cells: (Card | null)[];
  foundations: Card[][];
  tableau: Card[][];
}

const fresh = (game: number): State => ({
  cells: [null, null, null, null],
  foundations: [[], [], [], []],
  tableau: msDeal(game),
});

const clone = (s: State): State => ({
  cells: [...s.cells],
  foundations: s.foundations.map((f) => [...f]),
  tableau: s.tableau.map((c) => [...c]),
});

const top = <T,>(a: T[]) => a[a.length - 1];
const randomGame = () => 1 + Math.floor(Math.random() * 32000);

const fitsOn = (card: Card, onto: Card) => onto.rank === card.rank + 1 && isRed(onto) !== isRed(card);
const fitsFoundation = (card: Card, f: Card[]) =>
  f.length === 0 ? card.rank === 1 : top(f).suit === card.suit && top(f).rank + 1 === card.rank;

/** A run you can lift: each card one lower and the opposite color of the one under it. */
function runFrom(col: Card[], index: number): Card[] | null {
  for (let i = index; i < col.length - 1; i++) if (!fitsOn(col[i + 1], col[i])) return null;
  return col.slice(index);
}

function pickUp(s: State, { pile, index }: DragSource): Card[] | null {
  if (pile[0] === "c") {
    const card = s.cells[+pile[1]];
    return card ? [card] : null;
  }
  if (pile[0] === "t") return index >= 0 && index < s.tableau[+pile[1]].length ? runFrom(s.tableau[+pile[1]], index) : null;
  return null; // Foundations are final, as in the original.
}

/** How many cards you can move at once, using free cells and empty columns as scratch space. */
function maxMovable(s: State, toEmptyColumn: boolean): number {
  const freeCells = s.cells.filter((c) => c === null).length;
  const emptyColumns = s.tableau.filter((c) => c.length === 0).length - (toEmptyColumn ? 1 : 0);
  return (freeCells + 1) * 2 ** Math.max(0, emptyColumns);
}

/** Makes a move without any follow-up; null if it isn't allowed. */
function rawMove(s: State, source: DragSource, target: string): State | null {
  const cards = pickUp(s, source);
  if (!cards || target === source.pile) return null;
  const next = clone(s);
  const n = +target[1];

  if (target[0] === "c") {
    if (cards.length !== 1 || next.cells[n]) return null;
    next.cells[n] = cards[0];
  } else if (target[0] === "f") {
    if (cards.length !== 1 || !fitsFoundation(cards[0], next.foundations[n])) return null;
    next.foundations[n].push(cards[0]);
  } else if (target[0] === "t") {
    const col = next.tableau[n];
    if (col.length > 0 && !fitsOn(cards[0], top(col))) return null;
    if (cards.length > maxMovable(s, col.length === 0)) return null;
    col.push(...cards);
  } else {
    return null;
  }

  if (source.pile[0] === "c") next.cells[+source.pile[1]] = null;
  else next.tableau[+source.pile[1]].splice(source.index);
  return next;
}

function move(s: State, source: DragSource, target: string): State | null {
  const next = rawMove(s, source, target);
  return next && autoPlay(next);
}

/**
 * Sends cards to the foundations when it can't hurt you: aces and twos
 * always, others once both opposite-color foundations are high enough
 * that nothing could still need them.
 */
function autoPlay(s: State): State {
  const next = clone(s);
  const height = (suit: Suit) => next.foundations.find((f) => f[0]?.suit === suit)?.length ?? 0;
  const safe = (card: Card) => {
    if (card.rank <= 2) return true;
    const opposite: Suit[] = isRed(card) ? ["C", "S"] : ["D", "H"];
    return opposite.every((suit) => height(suit) >= card.rank - 1);
  };
  const place = (card: Card) => {
    const f = next.foundations.find((f) => fitsFoundation(card, f));
    if (f && safe(card)) {
      f.push(card);
      return true;
    }
    return false;
  };
  let moved = true;
  while (moved) {
    moved = false;
    next.cells.forEach((card, i) => {
      if (card && place(card)) {
        next.cells[i] = null;
        moved = true;
      }
    });
    next.tableau.forEach((col) => {
      if (col.length && place(top(col))) {
        col.pop();
        moved = true;
      }
    });
  }
  return next;
}

const isWon = (s: State) => s.foundations.every((f) => f.length === 13);
const anyMove = (s: State) => {
  const sources: DragSource[] = [
    ...s.cells.map((_, i) => ({ pile: `c${i}`, index: 0 })),
    ...s.tableau.flatMap((col, i) => col.map((_, j) => ({ pile: `t${i}`, index: j }))),
  ];
  const targets = ["c0", "c1", "c2", "c3", "f0", "f1", "f2", "f3", ...s.tableau.map((_, i) => `t${i}`)];
  return sources.some((src) => targets.some((t) => rawMove(s, src, t)));
};

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="game-help">
      <h3>How to Play FreeCell</h3>
      <p>
        <b>Goal:</b> move every card to the four piles at the top right, one per suit, Ace up to
        King. All cards start face up, so it&apos;s all about planning; almost every game can be
        won.
      </p>
      <ul>
        <li>
          <b>Columns:</b> stack cards downward, alternating red and black (a black 8 on a red
          9). Any card can go in an empty column.
        </li>
        <li>
          <b>Free cells</b> (top left) each hold one card while you dig for the ones you need.
        </li>
        <li>
          <b>Moving runs:</b> you can move several cards at once if there are enough free cells
          and empty columns to shuffle them through. The game works out the limit for you.
        </li>
        <li>
          <b>Moving cards:</b> drag them, or click a card and then click where it should go.
          Double-click sends a card home, or to a free cell.
        </li>
        <li>
          Cards that are safe to put away go up to the top right piles on their own.
        </li>
        <li>
          <b>Game menu:</b> every deal has a number from 1 to 32000, the same deals as the
          original Windows FreeCell. Use Select Game to replay one.
        </li>
      </ul>
      <div className="button-row center">
        <button className="win-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

function FreeCell() {
  const [game, setGame] = useState(randomGame);
  const [state, setState] = useState(() => autoPlay(fresh(game)));
  const [selected, setSelected] = useState<DragSource | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickValue, setPickValue] = useState("");
  const [celebrating, setCelebrating] = useState(false);
  const history = useRef<State[]>([]);
  const cw = useMemo(() => fitCardWidth(8, 54, 34), []);

  const won = isWon(state);
  // Recomputed only when the cards change, not on every drag frame.
  const stuck = useMemo(() => !isWon(state) && !anyMove(state), [state]);

  const commit = (next: State) => {
    history.current.push(state);
    setState(next);
    setSelected(null);
    if (isWon(next) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCelebrating(true);
    }
  };

  const start = (n: number) => {
    history.current = [];
    setGame(n);
    setState(autoPlay(fresh(n)));
    setSelected(null);
    setCelebrating(false);
    setShowHelp(false);
    setPicking(false);
  };

  const undo = () => {
    const prev = history.current.pop();
    if (prev) setState(prev);
    setSelected(null);
  };

  const tryTargets = (source: DragSource, targets: string[]) => {
    for (const t of targets) {
      const next = move(state, source, t);
      if (next) {
        commit(next);
        return;
      }
    }
  };

  const { press, offsetOf } = useCardDrag({
    canDrag: (source) => pickUp(state, source) !== null,
    onDrop: (source, target) => {
      const next = move(state, source, target);
      if (next) commit(next);
      return next !== null;
    },
    onTap: (source) => {
      if (selected) {
        const next = move(state, selected, source.pile);
        if (next) return commit(next);
      }
      const same = selected?.pile === source.pile && selected.index === source.index;
      setSelected(!same && pickUp(state, source) ? source : null);
    },
  });

  const ch = Math.round(cw * 1.38);
  const gap = Math.round(cw * 0.12) + 2;
  const pad = 8;
  const x = (col: number) => pad + col * (cw + gap);
  const tableauY = pad + ch + gap * 2;
  const tallest = Math.max(...state.tableau.map((c) => c.length), 1);
  // Squeeze the overlap on long columns so the board doesn't grow forever.
  const step = Math.max(Math.round(ch * 0.16), Math.min(Math.round(ch * 0.26), Math.floor((ch * 4.2) / tallest)));
  const boardWidth = x(8) - gap + pad;
  const boardHeight = tableauY + (tallest - 1) * step + ch + pad;

  const launchPoints = useMemo(
    () => [4, 5, 6, 7].map((c) => ({ x: pad + c * (cw + gap), y: pad })),
    [cw, gap],
  );
  const stopCelebrating = useCallback(() => setCelebrating(false), []);

  const card = (c: Card, pile: string, index: number, left: number, topPx: number) => {
    const offset = offsetOf(pile, index);
    return (
      <PlayingCard
        key={`${c.suit}${c.rank}`}
        card={c}
        pile={pile}
        width={cw}
        selected={selected !== null && selected.pile === pile && index >= selected.index}
        dragging={offset !== null}
        style={{
          left,
          top: topPx,
          transform: offset ? `translate(${offset.dx}px, ${offset.dy}px)` : undefined,
          zIndex: offset ? 1000 + index : index,
        }}
        {...press(pile, index)}
        onDoubleClick={() => tryTargets({ pile, index }, ["f0", "f1", "f2", "f3", "c0", "c1", "c2", "c3"])}
      />
    );
  };

  const slot = (pile: string, left: number, topPx: number, label = "") => (
    <div
      key={`slot-${pile}`}
      className="card-slot"
      data-pile={pile}
      style={{ left, top: topPx, width: cw, height: ch }}
      {...press(pile, -1)}
    >
      {label}
    </div>
  );

  const menuBar = (
    <MenuBar
      menus={[
        {
          label: "Game",
          items: [
            { label: "New Game", onClick: () => start(randomGame()) },
            { label: "Select Game...", onClick: () => setPicking(true) },
            { label: "Restart Game", onClick: () => start(game) },
            { label: "Undo", onClick: undo, disabled: history.current.length === 0 },
          ],
        },
        { label: "Help", items: [{ label: "How to Play", onClick: () => setShowHelp(true) }] },
      ]}
    />
  );

  if (showHelp) {
    return (
      <div className="card-game" style={{ width: boardWidth }}>
        {menuBar}
        <HowToPlay onClose={() => setShowHelp(false)} />
      </div>
    );
  }

  const cardsLeft = 52 - state.foundations.reduce((n, f) => n + f.length, 0);

  return (
    <div className="card-game" style={{ width: boardWidth }}>
      {menuBar}
      <div className="card-board" style={{ width: boardWidth, height: boardHeight }}>
        {state.cells.map((c, i) => (
          <div key={`c${i}`}>
            {slot(`c${i}`, x(i), pad)}
            {c && card(c, `c${i}`, 0, x(i), pad)}
          </div>
        ))}
        {state.foundations.map((f, i) => (
          <div key={`f${i}`}>
            {slot(`f${i}`, x(4 + i), pad, "A")}
            {f.length > 0 && card(top(f), `f${i}`, f.length - 1, x(4 + i), pad)}
          </div>
        ))}
        {state.tableau.map((col, i) => (
          <div key={`t${i}`}>
            {slot(`t${i}`, x(i), tableauY)}
            {col.map((c, j) => card(c, `t${i}`, j, x(i), tableauY + j * step))}
          </div>
        ))}

        {picking && (
          <form
            className="card-dialog"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Math.round(Number(pickValue));
              if (n >= 1 && n <= 32000) start(n);
            }}
          >
            <label>
              Game number (1 to 32000):
              <input
                autoFocus
                inputMode="numeric"
                value={pickValue}
                onChange={(e) => setPickValue(e.currentTarget.value)}
              />
            </label>
            <div className="button-row center">
              <button className="win-btn" type="submit">
                OK
              </button>
              <button className="win-btn" type="button" onClick={() => setPicking(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {celebrating && (
          <BouncingCards
            launchPoints={launchPoints}
            foundations={state.foundations}
            cardWidth={cw}
            onDone={stopCelebrating}
          />
        )}
      </div>
      <div className="statusbar card-status">
        {won && !celebrating ? (
          <>
            <b>You win! 🎉</b>
            <button className="win-btn" onClick={() => start(randomGame())}>
              New game
            </button>
          </>
        ) : stuck ? (
          <>
            <b>No moves left.</b>
            <button className="win-btn" onClick={undo} disabled={history.current.length === 0}>
              Undo
            </button>
          </>
        ) : (
          <>
            <span>Game #{game}</span>
            <span>Cards left: {cardsLeft}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default FreeCell;
