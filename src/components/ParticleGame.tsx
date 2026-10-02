"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const COUNT = 15;
const REPEL = 120;
const CONNECT_DIST = 140;

type Bot = {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  alive: boolean;
  exploding: number; // 0 = no, 1..0 = fading out
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

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export function ParticleGame() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(COUNT);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finalTime, setFinalTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const botsRef = useRef<Bot[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    botsRef.current = make(canvas.offsetWidth, canvas.offsetHeight);
    setRemaining(COUNT);
    setDone(false);
    setStartTime(null);
    setFinalTime(0);
    setElapsed(0);
    startTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    startGame();
  }, [open, startGame]);

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
      let aliveCount = 0;

      // draw connection lines between alive bots
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
          aliveCount++;
          // repel from mouse
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

          // draw bot body
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = "#c0392b";
          ctx.fill();
          ctx.strokeStyle = "#ff6b6b";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // eye
          ctx.beginPath();
          ctx.arc(b.x, b.y - 1, b.r * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = "#ff0044";
          ctx.shadowColor = "#ff0044";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (b.exploding > 0) {
          // explosion ring fading out
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

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [open]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleMouseLeave() {
    mouseRef.current = { x: -999, y: -999 };
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    let hit = false;
    for (const b of botsRef.current) {
      if (!b.alive) continue;
      const dx = b.x - cx;
      const dy = b.y - cy;
      if (Math.sqrt(dx * dx + dy * dy) < b.r + 6) {
        b.alive = false;
        b.exploding = 1;
        hit = true;

        if (startTimeRef.current === null) {
          startTimeRef.current = Date.now();
          setStartTime(Date.now());
          timerRef.current = setInterval(() => {
            if (startTimeRef.current) setElapsed(Date.now() - startTimeRef.current);
          }, 200);
        }

        const alive = botsRef.current.filter(x => x.alive).length;
        setRemaining(alive);
        if (alive === 0) {
          const t = Date.now() - (startTimeRef.current ?? Date.now());
          setFinalTime(t);
          setDone(true);
          if (timerRef.current) clearInterval(timerRef.current);
        }
        break;
      }
    }
    return hit;
  }

  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const cx = (e.touches[0].clientX - rect.left) * scaleX;
    const cy = (e.touches[0].clientY - rect.top) * scaleY;
    const synth = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as React.MouseEvent<HTMLCanvasElement>;
    // reuse same logic inline
    for (const b of botsRef.current) {
      if (!b.alive) continue;
      const dx = b.x - cx;
      const dy = b.y - cy;
      if (Math.sqrt(dx * dx + dy * dy) < b.r + 10) {
        b.alive = false;
        b.exploding = 1;
        if (startTimeRef.current === null) {
          startTimeRef.current = Date.now();
          setStartTime(Date.now());
          timerRef.current = setInterval(() => {
            if (startTimeRef.current) setElapsed(Date.now() - startTimeRef.current);
          }, 200);
        }
        const alive = botsRef.current.filter(x => x.alive).length;
        setRemaining(alive);
        if (alive === 0) {
          const t = Date.now() - (startTimeRef.current ?? Date.now());
          setFinalTime(t);
          setDone(true);
          if (timerRef.current) clearInterval(timerRef.current);
        }
        break;
      }
    }
    void synth;
  }

  return (
    <>
      <button
        className="mg-tab pg-tab"
        onClick={() => setOpen(true)}
        aria-label="Destruye a Ultrón"
      >
        <span>💪😈</span>
        <span className="mg-tab-label">Destruye a Ultrón</span>
      </button>

      {open && (
        <div className="mg-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="mg-modal pg-modal">
            <div className="mg-header">
              <div>
                <h2 className="mg-title">Destruye a Ultrón</h2>
                <p className="mg-subtitle">
                  Haz click en cada bot para eliminarlo ·{" "}
                  <strong>{remaining}</strong> restantes ·{" "}
                  {startTime ? formatTime(elapsed) : "0s"}
                </p>
              </div>
              <button className="mg-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div style={{ position: "relative" }}>
              <canvas
                ref={canvasRef}
                className="pg-canvas ultron-canvas"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
              />
              {done && (
                <div className="ng-overlay-msg">
                  <p style={{ fontSize: "2.5rem" }}>⚡</p>
                  <p className="ng-msg-title">¡Ultrón derrotado!</p>
                  <p className="ng-msg-sub">Tiempo: <strong style={{ color: "#00c5de" }}>{formatTime(finalTime)}</strong></p>
                  <p className="ng-msg-sub" style={{ marginTop: 4 }}>
                    {finalTime < 15000 ? "¡Vengador nivel Dios! 🦾" : finalTime < 30000 ? "¡Iron Man aprobaría esto! 🦾" : "Ultrón se resistió un poco... 😅"}
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => { startGame(); }}>
                    Reiniciar ataque →
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
