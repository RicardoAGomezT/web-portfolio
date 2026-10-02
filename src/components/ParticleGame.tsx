"use client";

import { useState, useEffect, useRef } from "react";

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
};

const COUNT = 80;
const MAX_DIST = 130;
const REPEL = 100;

function make(w: number, h: number): Particle[] {
  return Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    r: Math.random() * 2 + 1.5,
  }));
}

export function ParticleGame() {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -999, y: -999, clicking: false });
  const rafRef = useRef<number>(0);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particlesRef.current = make(canvas.width, canvas.height);
    };
    resize();

    const accent = "#00c5de";
    const accentRgb = "0,197,222";

    function draw() {
      if (!ctx || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const ps = particlesRef.current;
      const { x: mx, y: my } = mouseRef.current;

      for (const p of ps) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL && dist > 0) {
          const force = (REPEL - dist) / REPEL;
          p.vx += (dx / dist) * force * 0.6;
          p.vy += (dy / dist) * force * 0.6;
        }
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 3) { p.vx *= 0.95; p.vy *= 0.95; }
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > W) { p.x = W; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > H) { p.y = H; p.vy *= -1; }
      }

      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.5;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(${accentRgb},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      for (const p of ps) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const glow = dist < REPEL ? 1 : 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dist < REPEL
          ? `rgba(${accentRgb},${glow})`
          : accent;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [open]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
  }

  function handleMouseLeave() {
    mouseRef.current.x = -999;
    mouseRef.current.y = -999;
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const BLAST = 160;
    for (const p of particlesRef.current) {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < BLAST && dist > 0) {
        const force = (BLAST - dist) / BLAST;
        p.vx += (dx / dist) * force * 6;
        p.vy += (dy / dist) * force * 6;
      }
    }
    setClicks(c => c + 1);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    mouseRef.current.x = e.touches[0].clientX - rect.left;
    mouseRef.current.y = e.touches[0].clientY - rect.top;
  }

  return (
    <>
      <button
        className="mg-tab pg-tab"
        onClick={() => { setOpen(true); setClicks(0); }}
        aria-label="Abrir partículas interactivas"
      >
        <span>✦</span>
        <span className="mg-tab-label">Partículas</span>
      </button>

      {open && (
        <div
          className="mg-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="mg-modal pg-modal">
            <div className="mg-header">
              <div>
                <h2 className="mg-title">Campo de partículas</h2>
                <p className="mg-subtitle">
                  mueve el cursor para repeler · click para explotar · explosiones: <strong>{clicks}</strong>
                </p>
              </div>
              <button className="mg-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <canvas
              ref={canvasRef}
              className="pg-canvas"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              onTouchMove={handleTouchMove}
            />
          </div>
        </div>
      )}
    </>
  );
}
