import { useEffect, useMemo, useState } from "react";
import MenuBar from "../../components/MenuBar";
import { cardName, newDeck, sameCard, shuffle, type Card } from "./cards";
import {
  choosePass,
  choosePlay,
  isTwoOfClubs,
  legalPlays,
  points,
  scoreHand,
  sortHand,
  trickWinner,
  without,
  type Play,
} from "./heartsRules";
import PlayingCard from "./PlayingCard";

// Seats go clockwise: you (south), then west, north, east.
const NAMES = ["You", "Ben", "Michele", "Pauline"];
const PASS_LABEL = ["Pass Left", "Pass Right", "Pass Across", ""];
const PASS_OFFSET = [1, 3, 2, 0];
const GAME_OVER_AT = 100;
const pointsIn = (cards: Card[]) => cards.reduce((n, c) => n + points(c), 0);

type Phase = "pass" | "play" | "collect" | "handOver" | "gameOver";

interface Game {
  hands: Card[][];
  phase: Phase;
  handNo: number;
  trick: Play[];
  turn: number;
  firstTrick: boolean;
  heartsBroken: boolean;
  taken: Card[][];
  scores: number[];
  lastHand: number[] | null;
  moon: number | null;
  /** Cards you were passed, highlighted until you play. */
  received: Card[];
}

function dealHand(handNo: number, scores: number[]): Game {
  const deck = shuffle(newDeck());
  const hands = [0, 1, 2, 3].map((p) => sortHand(deck.slice(p * 13, p * 13 + 13)));
  const passing = PASS_OFFSET[handNo % 4] !== 0;
  const game: Game = {
    hands,
    phase: passing ? "pass" : "play",
    handNo,
    trick: [],
    turn: 0,
    firstTrick: true,
    heartsBroken: false,
    taken: [[], [], [], []],
    scores,
    lastHand: null,
    moon: null,
    received: [],
  };
  return passing ? game : startPlay(game);
}

function startPlay(g: Game): Game {
  return { ...g, phase: "play", turn: g.hands.findIndex((h) => h.some(isTwoOfClubs)) };
}

function playCard(g: Game, player: number, card: Card): Game {
  const trick = [...g.trick, { player, card }];
  return {
    ...g,
    hands: g.hands.map((h, i) => (i === player ? without(h, [card]) : h)),
    trick,
    turn: (player + 1) % 4,
    heartsBroken: g.heartsBroken || card.suit === "H",
    phase: trick.length === 4 ? "collect" : "play",
    received: player === 0 ? [] : g.received,
  };
}

function collect(g: Game): Game {
  const winner = trickWinner(g.trick);
  const taken = g.taken.map((t, i) => (i === winner ? [...t, ...g.trick.map((p) => p.card)] : t));
  const next = { ...g, trick: [], taken, turn: winner, firstTrick: false, phase: "play" as Phase };
  if (g.hands[0].length > 0) return next;
  const { scores: hand, moon } = scoreHand(taken);
  const scores = g.scores.map((s, i) => s + hand[i]);
  return {
    ...next,
    scores,
    lastHand: hand,
    moon,
    phase: Math.max(...scores) >= GAME_OVER_AT ? "gameOver" : "handOver",
  };
}

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="game-help">
      <h3>How to Play Hearts</h3>
      <p>
        <b>Goal:</b> end with the <i>lowest</i> score. Every heart you take is worth 1 point
        and the Queen of Spades is worth 13. The game ends when someone reaches 100.
      </p>
      <ul>
        <li>
          <b>Passing:</b> each hand starts by choosing 3 cards to give away: left, then right,
          then across, then no pass, and repeat. Get rid of high hearts and the Queen of Spades.
        </li>
        <li>
          <b>Tricks:</b> whoever has the 2 of clubs leads first. Everyone plays one card;
          you must follow the suit that was led if you can. The highest card of that suit
          takes all four cards. Aces are high.
        </li>
        <li>
          <b>Can&apos;t follow suit?</b> Play anything, which is the perfect time to dump a heart
          or the Queen of Spades on someone else.
        </li>
        <li>
          <b>Hearts</b> can&apos;t be led until one has been played. No points can be played on
          the first trick.
        </li>
        <li>
          <b>Shooting the moon:</b> take every heart <i>and</i> the Queen and you score 0 while
          everyone else gets 26.
        </li>
        <li>Cards you can&apos;t play right now are grayed out.</li>
      </ul>
      <div className="button-row center">
        <button className="win-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

function Hearts() {
  const [game, setGame] = useState(() => dealHand(0, [0, 0, 0, 0]));
  const [toPass, setToPass] = useState<Card[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  // Computer turns, and the pause to look at a finished trick.
  useEffect(() => {
    if (game.phase === "collect") {
      const t = setTimeout(() => setGame(collect), 1100);
      return () => clearTimeout(t);
    }
    if (game.phase === "play" && game.turn !== 0) {
      const t = setTimeout(() => {
        setGame((g) => {
          const card = choosePlay(g.hands[g.turn], g.trick, g.heartsBroken, g.firstTrick);
          return playCard(g, g.turn, card);
        });
      }, 550);
      return () => clearTimeout(t);
    }
  }, [game]);

  const legal = useMemo(
    () =>
      game.phase === "play" && game.turn === 0
        ? legalPlays(game.hands[0], game.trick, game.heartsBroken, game.firstTrick)
        : [],
    [game],
  );

  const passCards = () => {
    const offset = PASS_OFFSET[game.handNo % 4];
    const passes = game.hands.map((h, p) => (p === 0 ? toPass : choosePass(h)));
    const hands = game.hands.map((h, p) =>
      sortHand([...without(h, passes[p]), ...passes[(p - offset + 4) % 4]]),
    );
    setGame(startPlay({ ...game, hands, received: passes[(4 - offset) % 4] }));
    setToPass([]);
  };

  const onCard = (card: Card) => {
    if (game.phase === "pass") {
      const picked = toPass.some((c) => sameCard(c, card));
      if (picked) setToPass(toPass.filter((c) => !sameCard(c, card)));
      else if (toPass.length < 3) setToPass([...toPass, card]);
      return;
    }
    if (legal.some((c) => sameCard(c, card))) setGame(playCard(game, 0, card));
  };

  const newGame = () => {
    setGame(dealHand(0, [0, 0, 0, 0]));
    setToPass([]);
    setShowHelp(false);
  };

  const boardWidth = Math.min(460, window.innerWidth - 48);
  const cw = boardWidth < 420 ? 42 : 50;
  const ch = Math.round(cw * 1.38);
  const hand = game.hands[0];
  const step = Math.min(Math.round(cw * 0.55), Math.floor((boardWidth - cw - 16) / Math.max(1, hand.length - 1)));
  const handLeft = (boardWidth - (cw + step * (hand.length - 1))) / 2;
  const boardHeight = ch * 3 + 120;

  // Where each seat's played card lands in the middle.
  const cx = boardWidth / 2 - cw / 2;
  const cy = boardHeight / 2 - ch / 2 - 18;
  const trickSpot = [
    { left: cx, top: cy + ch * 0.45 },
    { left: cx - cw * 1.1, top: cy },
    { left: cx, top: cy - ch * 0.45 },
    { left: cx + cw * 1.1, top: cy },
  ];

  const menuBar = (
    <MenuBar
      menus={[
        { label: "Game", items: [{ label: "New Game", onClick: newGame }] },
        { label: "Help", items: [{ label: "How to Play", onClick: () => setShowHelp(true) }] },
      ]}
    />
  );

  if (showHelp) {
    return (
      <div className="card-game" style={{ width: boardWidth + 8 }}>
        {menuBar}
        <HowToPlay onClose={() => setShowHelp(false)} />
      </div>
    );
  }

  let status: string;
  if (game.phase === "pass") {
    const to = NAMES[PASS_OFFSET[game.handNo % 4]];
    status = `Choose 3 cards to pass to ${to} (${toPass.length}/3).`;
  } else if (game.phase === "collect") {
    status = `${NAMES[trickWinner(game.trick)]} ${trickWinner(game.trick) === 0 ? "take" : "takes"} the trick.`;
  } else if (game.phase === "play") {
    if (game.turn !== 0) status = `${NAMES[game.turn]} is playing...`;
    else if (game.firstTrick && game.trick.length === 0) status = "Your lead: start with the 2 of clubs.";
    else if (game.trick.length === 0 && !game.heartsBroken && legal.every((c) => c.suit !== "H"))
      status = "Your lead. (Hearts aren't broken yet.)";
    else status = "Your turn.";
  } else {
    status = "";
  }

  const seat = (player: number) => {
    const count = game.hands[player].length;
    const pts = pointsIn(game.taken[player]);
    return (
      <div className={`hearts-seat seat-${player}${game.turn === player && game.phase === "play" ? " active" : ""}`}>
        <div className="hearts-backs">
          {Array.from({ length: Math.min(count, 13) }, (_, i) => (
            <span key={i} className="hearts-back" />
          ))}
        </div>
        <span className="hearts-name">
          {NAMES[player]}: {game.scores[player]}
          {pts > 0 && <small> (+{pts})</small>}
        </span>
      </div>
    );
  };

  return (
    <div className="card-game" style={{ width: boardWidth + 8 }}>
      {menuBar}
      <div className="card-board hearts-board" style={{ width: boardWidth, height: boardHeight }}>
        {seat(1)}
        {seat(2)}
        {seat(3)}

        {game.trick.map(({ player, card }) => (
          <PlayingCard
            key={`${card.suit}${card.rank}`}
            card={card}
            width={cw}
            style={{ ...trickSpot[player], zIndex: 10 }}
          />
        ))}

        {hand.map((card, i) => {
          const picked = toPass.some((c) => sameCard(c, card));
          const isNew = game.received.some((c) => sameCard(c, card));
          const playable = game.phase === "pass" || legal.some((c) => sameCard(c, card));
          const myTurn = game.phase === "pass" || (game.phase === "play" && game.turn === 0);
          return (
            <PlayingCard
              key={`${card.suit}${card.rank}`}
              card={card}
              width={cw}
              className={`hearts-card${myTurn && !playable ? " unplayable" : ""}`}
              style={{
                left: handLeft + i * step,
                top: boardHeight - ch - 30 - (picked || isNew ? 14 : 0),
                zIndex: 20 + i,
              }}
              onClick={() => onCard(card)}
            />
          );
        })}
        <span className="hearts-name you">
          You: {game.scores[0]}
          {pointsIn(game.taken[0]) > 0 && <small> (+{pointsIn(game.taken[0])})</small>}
        </span>

        {game.phase === "pass" && (
          <button
            className="win-btn hearts-pass"
            disabled={toPass.length !== 3}
            onClick={passCards}
          >
            {PASS_LABEL[game.handNo % 4]}
          </button>
        )}

        {(game.phase === "handOver" || game.phase === "gameOver") && game.lastHand && (
          <div className="card-dialog hearts-scores" role="dialog" aria-label="Scores">
            <b>{game.phase === "gameOver" ? "Game over" : `End of hand ${game.handNo + 1}`}</b>
            {game.moon !== null && (
              <p>
                🌙 {game.moon === 0 ? "You shot the moon!" : `${NAMES[game.moon]} shot the moon!`}
              </p>
            )}
            <table>
              <thead>
                <tr>
                  <th />
                  <th>This hand</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {NAMES.map((name, i) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{game.lastHand![i]}</td>
                    <td>{game.scores[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {game.phase === "gameOver" ? (
              <>
                <p>
                  {(() => {
                    const best = Math.min(...game.scores);
                    const winners = NAMES.filter((_, i) => game.scores[i] === best);
                    return winners.includes("You") ? "You win! 🎉" : `${winners.join(" & ")} wins.`;
                  })()}
                </p>
                <button className="win-btn" onClick={newGame}>
                  New game
                </button>
              </>
            ) : (
              <button
                className="win-btn"
                onClick={() => setGame(dealHand(game.handNo + 1, game.scores))}
              >
                Next hand
              </button>
            )}
          </div>
        )}
      </div>
      <div className="statusbar card-status" role="status">
        <span>{status}</span>
        {game.phase === "play" && game.trick.length > 0 && game.turn === 0 && (
          <span className="muted">Led: {cardName(game.trick[0].card)}</span>
        )}
      </div>
    </div>
  );
}

export default Hearts;
