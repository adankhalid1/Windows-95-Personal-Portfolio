import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MenuBar from "../../components/MenuBar";
import BouncingCards from "./BouncingCards";
import { fitCardWidth, isRed, newDeck, shuffle, type Card } from "./cards";
import PlayingCard from "./PlayingCard";
import { useCardDrag, type DragSource } from "./useCardDrag";

interface Column {
  cards: Card[];
  /** The first `faceDown` cards are face down. */
  faceDown: number;
}

interface State {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Column[];
  score: number;
}

function deal(): State {
  const deck = shuffle(newDeck());
  const tableau: Column[] = [];
  for (let i = 0; i < 7; i++) tableau.push({ cards: deck.splice(0, i + 1), faceDown: i });
  return { stock: deck, waste: [], foundations: [[], [], [], []], tableau, score: 0 };
}

const clone = (s: State): State => ({
  stock: [...s.stock],
  waste: [...s.waste],
  foundations: s.foundations.map((f) => [...f]),
  tableau: s.tableau.map((c) => ({ cards: [...c.cards], faceDown: c.faceDown })),
  score: s.score,
});

const top = <T,>(a: T[]) => a[a.length - 1];

/** The cards that would move if you picked up `source` (or null if you can't). */
function pickUp(s: State, { pile, index }: DragSource): Card[] | null {
  if (pile === "waste") return index === s.waste.length - 1 && s.waste.length ? [top(s.waste)] : null;
  if (pile[0] === "f") {
    const f = s.foundations[+pile[1]];
    return index === f.length - 1 && f.length ? [top(f)] : null;
  }
  if (pile[0] === "t") {
    const col = s.tableau[+pile[1]];
    return index >= col.faceDown && index < col.cards.length ? col.cards.slice(index) : null;
  }
  return null;
}

const fitsTableau = (card: Card, col: Column) => {
  if (col.cards.length === 0) return card.rank === 13;
  const t = top(col.cards);
  return t.rank === card.rank + 1 && isRed(t) !== isRed(card);
};

const fitsFoundation = (card: Card, f: Card[]) =>
  f.length === 0 ? card.rank === 1 : top(f).suit === card.suit && top(f).rank + 1 === card.rank;

/** Tries a move; returns the new state, or null if it isn't allowed. */
function move(s: State, source: DragSource, target: string): State | null {
  const cards = pickUp(s, source);
  if (!cards || target === source.pile) return null;
  const next = clone(s);

  if (target[0] === "f") {
    if (cards.length !== 1 || !fitsFoundation(cards[0], next.foundations[+target[1]])) return null;
    next.foundations[+target[1]].push(cards[0]);
    if (source.pile[0] !== "f") next.score += 10;
  } else if (target[0] === "t") {
    if (!fitsTableau(cards[0], next.tableau[+target[1]])) return null;
    next.tableau[+target[1]].cards.push(...cards);
    if (source.pile === "waste") next.score += 5;
    if (source.pile[0] === "f") next.score = Math.max(0, next.score - 15);
  } else {
    return null;
  }

  // Take the cards off where they came from.
  if (source.pile === "waste") next.waste.pop();
  else if (source.pile[0] === "f") next.foundations[+source.pile[1]].pop();
  else {
    const col = next.tableau[+source.pile[1]];
    col.cards.splice(source.index);
    // Turn up the card underneath.
    if (col.cards.length > 0 && col.faceDown >= col.cards.length) {
      col.faceDown = col.cards.length - 1;
      next.score += 5;
    }
  }
  return next;
}

const isWon = (s: State) => s.foundations.every((f) => f.length === 13);

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="game-help">
      <h3>How to Play Solitaire</h3>
      <p>
        <b>Goal:</b> move all 52 cards onto the four piles at the top right, one pile per
        suit, from Ace up to King.
      </p>
      <ul>
        <li>
          <b>The seven columns:</b> stack cards in descending order, alternating red and black
          (a red 6 on a black 7). You can move a whole run of face-up cards at once.
        </li>
        <li>
          <b>Empty columns</b> only accept a King (or a run starting with a King).
        </li>
        <li>
          <b>Stuck?</b> Click the deck at top left to turn over cards. When it runs out, click
          the empty spot to flip the pile back over.
        </li>
        <li>
          <b>Moving cards:</b> drag them, or click a card and then click where it should go.
          Double-click a card to send it straight to the top-right piles.
        </li>
        <li>
          <b>Game menu:</b> deal a new game, undo, or switch between turning over one card or
          three at a time (three is harder).
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

function Solitaire() {
  const [state, setState] = useState(deal);
  const [drawThree, setDrawThree] = useState(false);
  const [selected, setSelected] = useState<DragSource | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const history = useRef<State[]>([]);
  const cw = useMemo(() => fitCardWidth(7, 56, 38), []);

  const won = isWon(state);

  useEffect(() => {
    if (!started || won) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, won]);

  const commit = (next: State) => {
    history.current.push(state);
    setState(next);
    setSelected(null);
    setStarted(true);
    if (isWon(next) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCelebrating(true);
    }
  };

  const newGame = (three = drawThree) => {
    history.current = [];
    setDrawThree(three);
    setState(deal());
    setSelected(null);
    setSeconds(0);
    setStarted(false);
    setCelebrating(false);
    setShowHelp(false);
  };

  const undo = () => {
    const prev = history.current.pop();
    if (prev) setState(prev);
    setSelected(null);
  };

  const drawFromStock = () => {
    const next = clone(state);
    if (next.stock.length === 0) {
      if (next.waste.length === 0) return;
      next.stock = next.waste.reverse();
      next.waste = [];
      if (!drawThree) next.score = Math.max(0, next.score - 100);
    } else {
      for (let i = 0; i < (drawThree ? 3 : 1) && next.stock.length; i++) {
        next.waste.push(next.stock.pop()!);
      }
    }
    commit(next);
  };

  const toFoundation = (source: DragSource) => {
    for (let i = 0; i < 4; i++) {
      const next = move(state, source, `f${i}`);
      if (next) {
        commit(next);
        return true;
      }
    }
    return false;
  };

  const { press, offsetOf } = useCardDrag({
    canDrag: (source) => pickUp(state, source) !== null,
    onDrop: (source, target) => {
      const next = move(state, source, target);
      if (next) commit(next);
      return next !== null;
    },
    onTap: (source) => {
      if (source.pile === "stock") return drawFromStock();
      if (selected) {
        const next = move(state, selected, source.pile);
        if (next) return commit(next);
      }
      // Select a card you could pick up; tapping it again deselects.
      const same = selected?.pile === source.pile && selected.index === source.index;
      setSelected(!same && pickUp(state, source) ? source : null);
    },
  });

  // Layout, all derived from the card width so it scales on phones.
  const ch = Math.round(cw * 1.38);
  const gap = Math.round(cw * 0.14) + 2;
  const pad = 8;
  const x = (col: number) => pad + col * (cw + gap);
  const tableauY = pad + ch + gap * 2;
  const downStep = Math.round(ch * 0.1);
  const upStep = Math.round(ch * 0.25);
  const boardWidth = x(7) - gap + pad;
  const columnHeight = (c: Column) =>
    c.faceDown * downStep + Math.max(0, c.cards.length - c.faceDown - 1) * upStep + ch;
  const boardHeight = tableauY + Math.max(ch, ...state.tableau.map(columnHeight)) + pad;

  const launchPoints = useMemo(
    () => [3, 4, 5, 6].map((c) => ({ x: pad + c * (cw + gap), y: pad })),
    [cw, gap],
  );
  const stopCelebrating = useCallback(() => setCelebrating(false), []);

  const isSelected = (pile: string, index: number) =>
    selected !== null && selected.pile === pile && index >= selected.index;

  const card = (c: Card, pile: string, index: number, left: number, topPx: number, faceUp = true) => {
    const offset = offsetOf(pile, index);
    return (
      <PlayingCard
        key={`${c.suit}${c.rank}`}
        card={c}
        pile={pile}
        faceUp={faceUp}
        width={cw}
        selected={isSelected(pile, index)}
        dragging={offset !== null}
        style={{
          left,
          top: topPx,
          transform: offset ? `translate(${offset.dx}px, ${offset.dy}px)` : undefined,
          zIndex: offset ? 1000 + index : index,
        }}
        {...(faceUp || pile === "stock" ? press(pile, index) : {})}
        onDoubleClick={faceUp ? () => toFoundation({ pile, index }) : undefined}
      />
    );
  };

  const slot = (pile: string, left: number, topPx: number, label = "") => (
    <div
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
            { label: "Deal", onClick: () => newGame() },
            { label: "Undo", onClick: undo, disabled: history.current.length === 0 },
            "divider",
            { label: "Draw One", checked: !drawThree, onClick: () => newGame(false) },
            { label: "Draw Three", checked: drawThree, onClick: () => newGame(true) },
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

  // Draw Three fans out the top three waste cards.
  const wasteShown = drawThree ? state.waste.slice(-3) : state.waste.slice(-1);
  const wasteStart = state.waste.length - wasteShown.length;

  return (
    <div className="card-game" style={{ width: boardWidth }}>
      {menuBar}
      <div className="card-board" style={{ width: boardWidth, height: boardHeight }}>
        {/* Stock: click to deal; when empty, click the outline to recycle. */}
        {slot("stock", x(0), pad, state.waste.length ? "↻" : "")}
        {state.stock.length > 0 &&
          card(top(state.stock), "stock", state.stock.length - 1, x(0), pad, false)}

        {slot("waste", x(1), pad)}
        {wasteShown.map((c, i) =>
          card(c, "waste", wasteStart + i, x(1) + i * Math.round(cw * 0.22), pad),
        )}

        {state.foundations.map((f, i) => (
          <div key={`f${i}`}>
            {slot(`f${i}`, x(3 + i), pad, "A")}
            {f.map((c, j) => card(c, `f${i}`, j, x(3 + i), pad))}
          </div>
        ))}

        {state.tableau.map((col, i) => {
          let y = tableauY;
          return (
            <div key={`t${i}`}>
              {slot(`t${i}`, x(i), tableauY)}
              {col.cards.map((c, j) => {
                const el = card(c, `t${i}`, j, x(i), y, j >= col.faceDown);
                y += j < col.faceDown ? downStep : upStep;
                return el;
              })}
            </div>
          );
        })}

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
            <button className="win-btn" onClick={() => newGame()}>
              Deal again
            </button>
          </>
        ) : (
          <>
            <span>Score: {state.score}</span>
            <span>Time: {seconds}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default Solitaire;
