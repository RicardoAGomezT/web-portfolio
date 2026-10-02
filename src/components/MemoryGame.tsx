"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const EMOJIS = ["🤖", "🧠", "💡", "🔥", "⚡", "🚀", "🎯", "💻", "🔮", "✨"];

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildDeck(): Card[] {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export function MemoryGame() {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const lockRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCards(buildDeck());
    setSelected([]);
    setMoves(0);
    setStartTime(null);
    setElapsed(0);
    setDone(false);
    setFinalTime(0);
    lockRef.current = false;
  }, []);

  useEffect(() => {
    if (open && cards.length === 0) startGame();
  }, [open, cards.length, startGame]);

  useEffect(() => {
    if (startTime !== null && !done) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 200);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, done]);

  function flip(idx: number) {
    if (lockRef.current) return;
    const card = cards[idx];
    if (!card || card.flipped || card.matched) return;
    if (selected.length === 1 && selected[0] === idx) return;

    if (startTime === null) setStartTime(Date.now());

    const next = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    const newSel = [...selected, idx];
    setCards(next);
    setSelected(newSel);

    if (newSel.length === 2) {
      lockRef.current = true;
      const newMoves = moves + 1;
      setMoves(newMoves);
      const [a, b] = newSel;

      if (next[a].emoji === next[b].emoji) {
        const matched = next.map((c, i) =>
          i === a || i === b ? { ...c, matched: true } : c
        );
        setCards(matched);
        setSelected([]);
        lockRef.current = false;
        if (matched.every((c) => c.matched)) {
          const t = Date.now() - (startTime ?? Date.now());
          setFinalTime(t);
          setDone(true);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c)
          );
          setSelected([]);
          lockRef.current = false;
        }, 900);
      }
    }
  }

  const msg =
    moves <= 12 ? "¡Memoria de elefante! 🧠"
    : moves <= 20 ? "¡Muy bien jugado! 🎯"
    : "¡Persistencia es clave! 🚀";

  return (
    <>
      <button className="mg-tab" onClick={() => setOpen(true)} aria-label="Juego de memoria">
        <span>🎮</span>
        <span className="mg-tab-label">¿Cómo estamos de memoria?</span>
      </button>

      {open && (
        <div
          className="mg-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="mg-modal">
            <div className="mg-header">
              <div>
                <h2 className="mg-title">Encuentra todos los pares</h2>
                <p className="mg-subtitle">10 pares · 20 cartas · ¿cuánto tardas?</p>
              </div>
              <button className="mg-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            {!done ? (
              <>
                <div className="mg-stats">
                  <div className="mg-stat">
                    <span className="mg-stat-label">Tiempo</span>
                    <strong>{formatTime(elapsed)}</strong>
                  </div>
                  <div className="mg-stat">
                    <span className="mg-stat-label">Movidas</span>
                    <strong>{moves}</strong>
                  </div>
                  <button className="mg-restart" onClick={startGame}>↺ Reiniciar</button>
                </div>

                <div className="mg-grid">
                  {cards.map((card, i) => (
                    <div key={card.id} className="mg-grid-cell">
                      <button
                        className={`mg-card${card.matched ? " mg-matched" : ""}${card.flipped ? " mg-flipped" : ""}`}
                        onClick={() => flip(i)}
                        disabled={card.matched}
                      >
                        {card.flipped || card.matched ? card.emoji : "?"}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mg-win">
                <div className="mg-win-icon">🏆</div>
                <h3 className="mg-win-title">¡Lo lograste!</h3>
                <p className="mg-win-time">Tiempo: <strong>{formatTime(finalTime)}</strong></p>
                <p className="mg-win-moves">Movidas: <strong>{moves}</strong></p>
                <p className="mg-win-msg">{msg}</p>
                <button className="btn btn-primary" onClick={startGame} style={{ marginTop: "1.5rem" }}>
                  Jugar de nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
