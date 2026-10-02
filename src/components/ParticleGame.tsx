"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const COUNT = 15;
const REPEL = 120;
const CONNECT_DIST = 140;
const TIME_LIMIT = 60;

type Bot = {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  alive: boolean;
  exploding: number;
};

function make(w: number, h: number): Bot[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * (w - 80) + 40,
    y: Math.random() * (h - 60) + 30,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    r: Math.random() * 6 + 18,
    alive: true,
    exploding: 0,
  }));
}

export function ParticleGame() {
  const [open, setOpen] = useState(false);
  const [lives, setLives] = useState(5);
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(COUNT);
  const [done, setDone] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [noLives, setNoLives] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [finalTime, setFinalTime] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const botsRef = useRef<Bot[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  const timeLeftRef = useRef(TIME_LIMIT);

  startedRef.current = started;
  timeLeftRef.current = timeLeft;

  const initBots = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    botsRef.current = make(canvas.offsetWidth, canvas.offsetHeight);
  }, []);

  // draw loop — always runs while open
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      if (!ctx || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const { x: mx, y: my } = mouseRef.current;

      const alive = botsRef.current.filter(b => b.alive);
      for (let i = 0; i < alive.length; i++) {
        for (let j = i + 1; j < alive.length; j++) {
          const dx = alive[i].x - alive[j].x;
          const dy = alive[i].y - alive[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.5;
            ctx.beginPath();
            ctx.moveTo(alive[i].x, alive[i].y);
            ctx.lineTo(alive[j].x, alive[j].y);
            ctx.strokeStyle = `rgba(90,90,100,${alpha * 2})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }

      for (const b of botsRef.current) {
        if (!b.alive && b.exploding <= 0) continue;

        if (b.alive) {
          if (startedRef.current) {
            const dx = b.x - mx;
            const dy = b.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < REPEL && dist > 0) {
              const f = (REPEL - dist) / REPEL;
              b.vx += (dx / dist) * f * 0.5;
              b.vy += (dy / dist) * f * 0.5;
            }
            const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (spd > 2.5) { b.vx *= 0.92; b.vy *= 0.92; }
            b.vx *= 0.997; b.vy *= 0.997;
            b.x += b.vx; b.y += b.vy;
            if (b.x - b.r < 0) { b.x = b.r; b.vx *= -1; }
            if (b.x + b.r > W) { b.x = W - b.r; b.vx *= -1; }
            if (b.y - b.r < 0) { b.y = b.r; b.vy *= -1; }
            if (b.y + b.r > H) { b.y = H - b.r; b.vy *= -1; }
          }

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = "#c0392b";
          ctx.fill();
          ctx.strokeStyle = "#ff6b6b";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(b.x, b.y - 1, b.r * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = "#ff0044";
          ctx.shadowColor = "#ff0044";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (b.exploding > 0) {
          const alpha = b.exploding;
          const ringR = b.r * (1 + (1 - b.exploding) * 4);
          ctx.beginPath();
          ctx.arc(b.x, b.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,100,0,${alpha})`;
          ctx.lineWidth = 3;
          ctx.stroke();
          for (let k = 0; k < 6; k++) {
            const angle = (k / 6) * Math.PI * 2 + (1 - b.exploding) * 3;
            const len = b.r * (1 - b.exploding) * 3;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(b.x + Math.cos(angle) * len, b.y + Math.sin(angle) * len);
            ctx.strokeStyle = `rgba(255,200,0,${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          b.exploding -= 0.06;
          if (b.exploding < 0) b.exploding = 0;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    initBots();
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, initBots]);

  // countdown timer
  useEffect(() => {
    if (!started || done || timeUp) return;
    setTimeLeft(TIME_LIMIT);
    timeLeftRef.current = TIME_LIMIT;
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setTimeUp(true);
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [started, done, timeUp]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleMouseLeave() {
    mouseRef.current = { x: -999, y: -999 };
  }

  function killBot(cx: number, cy: number) {
    if (!started || done || timeUp) return;
    for (const b of botsRef.current) {
      if (!b.alive) continue;
      const dx = b.x - cx;
      const dy = b.y - cy;
      if (Math.sqrt(dx * dx + dy * dy) < b.r + 6) {
        b.alive = false;
        b.exploding = 1;
        const aliveCount = botsRef.current.filter(x => x.alive).length;
        setRemaining(aliveCount);
        if (aliveCount === 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setFinalTime(TIME_LIMIT - timeLeftRef.current);
          setDone(true);
        }
        break;
      }
    }
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    killBot((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    killBot((e.touches[0].clientX - rect.left) * scaleX, (e.touches[0].clientY - rect.top) * scaleY);
  }

  function startRound() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    initBots();
    setRemaining(COUNT);
    setDone(false);
    setTimeUp(false);
    setTimeLeft(TIME_LIMIT);
    setFinalTime(0);
    setStarted(true);
  }

  function revive() {
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) { setNoLives(true); return; }
    startRound();
  }

  function fullReset() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setLives(5);
    setStarted(false);
    setDone(false);
    setTimeUp(false);
    setNoLives(false);
    setTimeLeft(TIME_LIMIT);
    setRemaining(COUNT);
    setFinalTime(0);
    initBots();
  }

  const hearts = Array.from({ length: 5 }, (_, i) => i < lives ? "♥" : "♡").join("");

  return (
    <>
      <button
        className="mg-tab pg-tab"
        onClick={() => setOpen(true)}
        aria-label="Destruye a Ultrón"
      >
        <span>🦾</span>
        <span className="mg-tab-label">Destruye a Ultrón</span>
      </button>

      {open && (
        <div className="mg-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="mg-modal pg-modal">
            <div className="mg-header">
              <div>
                <h2 className="mg-title">Destruye a Ultrón</h2>
                <p className="mg-subtitle">
                  <strong>{remaining}</strong> nodos activos ·{" "}
                  {started ? (
                    <strong style={{ color: timeLeft <= 10 ? "#ff4d6d" : "inherit" }}>
                      ⏱ {timeLeft}s
                    </strong>
                  ) : "60s para acabar con todos"}
                </p>
              </div>
              <button className="mg-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="mg-stats">
              <div className="mg-stat">
                <span className="mg-stat-label">Tiempo</span>
                <strong style={{ color: timeLeft <= 10 && started ? "#ff4d6d" : "inherit" }}>
                  {started ? `${timeLeft}s` : `${TIME_LIMIT}s`}
                </strong>
              </div>
              <div className="mg-stat">
                <span className="mg-stat-label">Vidas</span>
                <strong style={{ letterSpacing: "2px", color: lives <= 1 ? "#ff4d6d" : "inherit" }}>
                  {hearts}
                </strong>
              </div>
              <button className="mg-restart" onClick={fullReset}>↺ Reset</button>
            </div>

            <div style={{ position: "relative" }}>
              <canvas
                ref={canvasRef}
                className="pg-canvas ultron-canvas"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                style={{ cursor: started && !done && !timeUp ? "crosshair" : "default" }}
              />

              {!started && !noLives && (
                <div className="ng-overlay-msg">
                  <img src="/ultron.webp" alt="Ultrón" style={{ width: 90, height: 135, objectFit: "cover", objectPosition: "top", borderRadius: 10, border: "2px solid #c0392b", marginBottom: 8, boxShadow: "0 0 18px rgba(220,50,50,0.5)" }} />
                  <p className="ng-msg-title">¿Listo para atacar?</p>
                  <p className="ng-msg-sub" style={{ color: "#e74c3c", fontStyle: "italic", marginBottom: 4 }}>
                    Ultrón se liberó del control de Iron Man y su mente artificial amenaza con dominar el mundo.
                  </p>
                  <p className="ng-msg-sub">
                    15 nodos del núcleo cognitivo siguen activos — aniquílalos<br />
                    antes de que la red se regenere.<br />
                    <strong style={{ color: "#00c5de" }}>Tienes 60 segundos.</strong>
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={startRound}>
                    Atacar →
                  </button>
                </div>
              )}

              {done && (
                <div className="ng-overlay-msg">
                  <img src="/ultron.webp" alt="Ultrón derrotado" style={{ width: 70, height: 105, objectFit: "cover", objectPosition: "top", borderRadius: 10, border: "2px solid #444", marginBottom: 8, filter: "grayscale(70%) brightness(0.6)" }} />
                  <p className="ng-msg-title">¡Ultrón derrotado!</p>
                  <p className="ng-msg-sub">
                    Tiempo: <strong style={{ color: "#00c5de" }}>{finalTime}s</strong>
                  </p>
                  <p className="ng-msg-sub" style={{ marginTop: 4 }}>
                    {finalTime < 15 ? "¡Vengador nivel Dios! 🦾" : finalTime < 30 ? "¡Iron Man aprobaría esto! 🦾" : "Ultrón se resistió un poco... 😅"}
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={startRound}>
                    Reiniciar ataque →
                  </button>
                </div>
              )}

              {timeUp && !done && !noLives && (
                <div className="ng-overlay-msg">
                  <p style={{ fontSize: "2.5rem" }}>💥</p>
                  <p className="ng-msg-title" style={{ color: "#ff4d6d" }}>¡Se acabó el tiempo!</p>
                  <p className="ng-msg-sub" style={{ color: "#888", fontSize: "0.95rem", marginTop: 4 }}>
                    La matriz de Ultrón se regeneró. Quedan {remaining} nodos activos.
                  </p>
                  <p className="ng-msg-sub" style={{ marginTop: 4, fontSize: "0.8rem", color: "#666" }}>
                    {hearts} &nbsp;{lives} {lives === 1 ? "vida restante" : "vidas restantes"}
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={revive}>
                    Intentar de nuevo →
                  </button>
                </div>
              )}

              {noLives && (
                <div className="ng-overlay-msg">
                  <p style={{ fontSize: "2.5rem" }}>💀</p>
                  <p className="ng-msg-title" style={{ color: "#ff4d6d" }}>Sin más vidas</p>
                  <p className="ng-msg-sub" style={{ color: "#888", fontSize: "0.95rem", marginTop: 4 }}>
                    Ultrón ganó esta vez. Game over definitivo.
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: "1rem", opacity: 0.6 }} onClick={fullReset}>
                    ↺ Empezar de cero (5 vidas)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
