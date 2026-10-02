"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const EMOJIS = ["🤖", "🧠", "💡", "🔥", "⚡", "🚀", "🎯", "💻", "🌐", "🔮", "✨", "🎲", "🏆", "💎", "🌟"];

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
    if (open) startGame();
  }, [open, startGame]);

  useEffect(() => {
    if (startTime !== null && !done) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, done]);

  function flip(id: number) {
    if (lockRef.current) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    if (startTime === null) setStartTime(Date.now());

    const next = cards.map((c, i) => i === id ? { ...c, flipped: true } : c);
    const newSel = [...selected, id];
    setCards(next);
    setSelected(newSel);

    if (newSel.length === 2) {
      lockRef.current = true;
      setMoves((m) => m + 1);
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
          setCards(next.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          lockRef.current = false;
        }, 900);
      }
    }
  }

  return (
    <>
      {/* Sticky tab */}
      <button className="mg-tab" onClick={() => setOpen(true)} aria-label="Abrir juego de memoria">
        <span className="mg-tab-icon">🎮</span>
        <span className="mg-tab-label">Te tengo un reto</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="mg-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="mg-modal">
            <div className="mg-header">
              <div>
                <h2 className="mg-title">Encuentra todos los pares</h2>
                <p className="mg-subtitle">15 emojis · 30 cartas · ¿cuánto tardas?</p>
              </div>
              <button className="mg-close" onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
            </div>

            {!done ? (
              <>
                <div className="mg-stats">
                  <span className="mg-stat"><span className="mg-stat-label">Tiempo</span><strong>{formatTime(elapsed)}</strong></span>
                  <span className="mg-stat"><span className="mg-stat-label">Movidas</span><strong>{moves}</strong></span>
                  <button className="mg-restart" onClick={startGame}>↺ Reiniciar</button>
                </div>
                <div className="mg-grid">
                  {cards.map((card, i) => (
                    <button
                      key={card.id}
                      className={`mg-card ${card.flipped || card.matched ? "mg-card--face" : ""} ${card.matched ? "mg-card--matched" : ""}`}
                      onClick={() => flip(i)}
                      aria-label={card.flipped || card.matched ? card.emoji : "carta oculta"}
                    >
                      <span className="mg-card-back">?</span>
                      <span className="mg-card-front">{card.emoji}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="mg-win">
                <div className="mg-win-icon">🏆</div>
                <h3 className="mg-win-title">¡Lo lograste!</h3>
                <p className="mg-win-time">Tiempo: <strong>{formatTime(finalTime)}</strong></p>
                <p className="mg-win-moves">Movidas: <strong>{moves}</strong></p>
                <p className="mg-win-msg">
                  {moves <= 20 ? "¡Memoria de elefante! 🧠" : moves <= 30 ? "¡Muy bien jugado! 🎯" : "¡Persistencia es clave! 🚀"}
                </p>
                <button className="btn btn-primary" onClick={startGame} style={{marginTop:"1.5rem"}}>
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
