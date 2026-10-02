"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const LAYERS = [4, 6, 7, 6, 4, 1];
const TOTAL_NODES = LAYERS.reduce((a, b) => a + b, 0);

type NodeState = "active" | "dead" | "firing";
type Pulse = { from: number; to: number; progress: number; id: number };

function buildNodes() {
  const nodes: { layer: number; index: number; state: NodeState }[] = [];
  for (let l = 0; l < LAYERS.length; l++) {
    for (let i = 0; i < LAYERS[l]; i++) {
      nodes.push({ layer: l, index: i, state: "active" });
    }
  }
  return nodes;
}

function nodeId(layer: number, index: number) {
  let id = 0;
  for (let l = 0; l < layer; l++) id += LAYERS[l];
  return id + index;
}

function getPos(layer: number, index: number, W: number, H: number) {
  const y = (layer / (LAYERS.length - 1)) * (H - 80) + 40;
  const count = LAYERS[layer];
  const x = ((index + 1) / (count + 1)) * W;
  return { x, y };
}

let pulseCounter = 0;

export function NeuralGame() {
  const [open, setOpen] = useState(false);
  const [nodes, setNodes] = useState(buildNodes);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [lives, setLives] = useState(5);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [noLives, setNoLives] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const deadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameStartRef = useRef<number | null>(null);
  const speedRef = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef(nodes);
  const pulsesRef = useRef(pulses);

  nodesRef.current = nodes;
  pulsesRef.current = pulses;

  const W = 400;
  const H = 520;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    const ns = nodesRef.current;
    const ps = pulsesRef.current;

    // draw connections
    for (let l = 0; l < LAYERS.length - 1; l++) {
      for (let i = 0; i < LAYERS[l]; i++) {
        for (let j = 0; j < LAYERS[l + 1]; j++) {
          const from = ns[nodeId(l, i)];
          const to = ns[nodeId(l + 1, j)];
          const { x: x1, y: y1 } = getPos(l, i, W, H);
          const { x: x2, y: y2 } = getPos(l + 1, j, W, H);
          const alive = from.state !== "dead" && to.state !== "dead";
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = alive ? "rgba(255,255,255,0.22)" : "rgba(180,30,30,0.2)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // draw pulses
    for (const pulse of ps) {
      const fromNode = ns[pulse.from];
      const toNode = ns[pulse.to];
      const fl = fromNode.layer, fi = fromNode.index;
      const tl = toNode.layer, ti = toNode.index;
      const { x: x1, y: y1 } = getPos(fl, fi, W, H);
      const { x: x2, y: y2 } = getPos(tl, ti, W, H);
      const px = x1 + (x2 - x1) * pulse.progress;
      const py = y1 + (y2 - y1) * pulse.progress;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#00c5de";
      ctx.shadowColor = "#00c5de";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // draw nodes
    for (const n of ns) {
      const { x, y } = getPos(n.layer, n.index, W, H);
      const r = n.layer === LAYERS.length - 1 ? 16 : 12;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (n.state === "dead") {
        // Ultrón corruption — dark metal + red glow
        ctx.fillStyle = "#1c1010";
        ctx.strokeStyle = "#c0392b";
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();
        ctx.shadowColor = "#e74c3c";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#e74c3c";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✕", x, y);
        ctx.shadowBlur = 0;
      } else if (n.state === "firing") {
        ctx.fillStyle = "#00c5de";
        ctx.shadowColor = "#00c5de";
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = n.layer === LAYERS.length - 1 ? "rgba(0,197,222,0.45)" : "rgba(0,197,222,0.25)";
        ctx.strokeStyle = "#00c5de";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#00c5de";
        ctx.shadowBlur = n.layer === LAYERS.length - 1 ? 12 : 6;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }, [W, H]);

  // animation loop
  useEffect(() => {
    if (!open || !started || gameOver) return;

    function loop(ts: number) {
      const dt = ts - lastRef.current;
      lastRef.current = ts;

      // increase speed over time
      if (gameStartRef.current) {
        const elapsed = (Date.now() - gameStartRef.current) / 1000;
        speedRef.current = 1 + elapsed * 0.025;
      }

      setPulses(prev => {
        const next: Pulse[] = [];
        for (const p of prev) {
          const newP = p.progress + dt * 0.0018 * speedRef.current;
          if (newP >= 1) {
            const toNode = nodesRef.current[p.to];
            if (toNode.layer === LAYERS.length - 1) {
              // pulse reached output — no action needed
            } else if (toNode.state !== "dead") {
              // spawn pulses to next layer
              const nextL = toNode.layer + 1;
              for (let j = 0; j < LAYERS[nextL]; j++) {
                const nextId = nodeId(nextL, j);
                if (nodesRef.current[nextId].state !== "dead") {
                  next.push({ from: p.to, to: nextId, progress: 0, id: pulseCounter++ });
                }
              }
            }
          } else {
            next.push({ ...p, progress: newP });
          }
        }
        return next;
      });

      drawCanvas();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, started, gameOver, drawCanvas]);

  // spawn pulses from input layer
  useEffect(() => {
    if (!started || gameOver) return;
    pulseTimerRef.current = setInterval(() => {
      const inputL = 0;
      const activeInputs = nodesRef.current.filter(n => n.layer === inputL && n.state !== "dead");
      if (activeInputs.length === 0) return;
      const src = activeInputs[Math.floor(Math.random() * activeInputs.length)];
      const nextL = 1;
      for (let j = 0; j < LAYERS[nextL]; j++) {
        const nextId = nodeId(nextL, j);
        if (nodesRef.current[nextId].state !== "dead") {
          setPulses(prev => [...prev, { from: nodeId(src.layer, src.index), to: nextId, progress: 0, id: pulseCounter++ }]);
        }
      }
    }, 600);
    return () => { if (pulseTimerRef.current) clearInterval(pulseTimerRef.current); };
  }, [started, gameOver]);

  // display timer
  useEffect(() => {
    if (!started || gameOver) return;
    displayTimerRef.current = setInterval(() => {
      if (gameStartRef.current) setGameTime(Math.floor((Date.now() - gameStartRef.current) / 1000));
    }, 500);
    return () => { if (displayTimerRef.current) clearInterval(displayTimerRef.current); };
  }, [started, gameOver]);

  // kill nodes with increasing frequency
  useEffect(() => {
    if (!started || gameOver) return;
    gameStartRef.current = Date.now();

    function scheduleKill() {
      const elapsed = gameStartRef.current ? (Date.now() - gameStartRef.current) / 1000 : 0;
      const interval = Math.max(400, 3000 - Math.floor(elapsed) * 100);
      deadTimerRef.current = setTimeout(() => {
        setNodes(prev => {
          const candidates = prev.filter(n => n.state === "active" && n.layer !== LAYERS.length - 1);
          if (candidates.length === 0) return prev;
          const shuffled = [...candidates].sort(() => Math.random() - 0.5);
          const targets = shuffled.slice(0, Math.min(2, shuffled.length));
          const targetIds = new Set(targets.map(t => nodeId(t.layer, t.index)));
          const next = prev.map(n =>
            targetIds.has(nodeId(n.layer, n.index)) ? { ...n, state: "dead" as NodeState } : n
          );
          const allDead = next.filter(n => n.layer !== LAYERS.length - 1).every(n => n.state === "dead");
          if (allDead) {
            if (gameStartRef.current) setFinalTime(Math.floor((Date.now() - gameStartRef.current) / 1000));
            setGameOver(true);
          }
          return next;
        });
        scheduleKill();
      }, interval);
    }

    scheduleKill();
    return () => { if (deadTimerRef.current) clearTimeout(deadTimerRef.current); };
  }, [started, gameOver]);

  function clickNode(layer: number, index: number) {
    if (!started || gameOver) return;
    setNodes(prev => prev.map(n =>
      n.layer === layer && n.index === index && n.state === "dead"
        ? { ...n, state: "firing" }
        : n
    ));
    setTimeout(() => {
      setNodes(prev => prev.map(n =>
        n.layer === layer && n.index === index && n.state === "firing"
          ? { ...n, state: "active" }
          : n
      ));
    }, 300);
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    for (let l = 0; l < LAYERS.length - 1; l++) {
      for (let i = 0; i < LAYERS[l]; i++) {
        const { x, y } = getPos(l, i, W, H);
        if (Math.sqrt((cx - x) ** 2 + (cy - y) ** 2) < 20) {
          clickNode(l, i);
          return;
        }
      }
    }
  }

  function revive() {
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      setNoLives(true);
      return;
    }
    if (deadTimerRef.current) clearTimeout(deadTimerRef.current);
    if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
    if (displayTimerRef.current) clearInterval(displayTimerRef.current);
    setNodes(buildNodes());
    setPulses([]);
    setStarted(false);
    setGameOver(false);
    setGameTime(0);
    setFinalTime(0);
    speedRef.current = 1;
    gameStartRef.current = null;
  }

  function restart() {
    if (deadTimerRef.current) clearTimeout(deadTimerRef.current);
    if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
    if (displayTimerRef.current) clearInterval(displayTimerRef.current);
    setNodes(buildNodes());
    setPulses([]);
    setStarted(false);
    setGameOver(false);
    setNoLives(false);
    setGameTime(0);
    setFinalTime(0);
    setLives(5);
    speedRef.current = 1;
    gameStartRef.current = null;
  }

  return (
    <>
      <button
        className="mg-tab ng-tab"
        onClick={() => { setOpen(true); restart(); }}
        aria-label="No dejes morir a Jarvis"
      >
        <span>🤖</span>
        <span className="mg-tab-label">Salva a Jarvis</span>
      </button>

      {open && (
        <div className="mg-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="mg-modal">
            <div className="mg-header">
              <div>
                <h2 className="mg-title">No dejes morir a Jarvis</h2>
                <p className="mg-subtitle">Los nodos se apagan — haz click para reactivarlos</p>
              </div>
              <button className="mg-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="mg-stats">
              <div className="mg-stat">
                <span className="mg-stat-label">Tiempo vivo</span>
                <strong>{gameTime}s</strong>
              </div>
              <div className="mg-stat">
                <span className="mg-stat-label">Vidas</span>
                <strong style={{ letterSpacing: "2px", color: lives <= 1 ? "#ff4d6d" : "inherit" }}>
                  {Array.from({ length: 5 }, (_, i) => i < lives ? "♥" : "♡").join("")}
                </strong>
              </div>
              <button className="mg-restart" onClick={restart}>↺ Reset</button>
            </div>

            <div style={{ position: "relative" }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={520}
                className="ng-canvas"
                onClick={handleCanvasClick}
                style={{ cursor: started && !gameOver ? "pointer" : "default" }}
              />

              {!started && !gameOver && (
                <div className="ng-overlay-msg">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <img src="/jarvis.webp" alt="J.A.R.V.I.S." style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid #00c5de", objectFit: "cover", flexShrink: 0, boxShadow: "0 0 12px rgba(0,197,222,0.5)" }} />
                    <div style={{ textAlign: "left" }}>
                      <p className="ng-msg-title" style={{ fontSize: "1.2rem" }}>¿Listo?</p>
                      <p className="ng-msg-sub" style={{ color: "#e74c3c", fontStyle: "italic", fontSize: "0.78rem" }}>
                        Ultrón ha infiltrado la red neuronal de Jarvis y está apagando sus nodos uno a uno.
                      </p>
                    </div>
                  </div>
                  <p className="ng-msg-sub">Haz click en los nodos rojos para reactivarlos.<br />Si todos caen, Jarvis muere para siempre.</p>
                  <button className="btn btn-primary" style={{ marginTop: 8, padding: "10px 22px" }} onClick={() => setStarted(true)}>
                    Proteger a Jarvis →
                  </button>
                </div>
              )}

              {gameOver && !noLives && (
                <div className="ng-overlay-msg">
                  <img src="/jarvis.webp" alt="J.A.R.V.I.S." style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #444", marginBottom: 4, objectFit: "cover", filter: "grayscale(80%)" }} />
                  <p className="ng-msg-title" style={{ color: "#aaa" }}>Un minuto de silencio...</p>
                  <p className="ng-msg-sub" style={{ color: "#888", fontSize: "0.95rem", marginTop: 4 }}>
                    Sin Jarvis, Tony solo es un hombre en una lata de metal.
                  </p>
                  <p className="ng-msg-sub" style={{ marginTop: 8 }}>
                    Lo mantuviste vivo <strong style={{ color: "#00c5de" }}>{finalTime}s</strong>
                  </p>
                  <p className="ng-msg-sub" style={{ marginTop: 4, fontSize: "0.8rem", color: "#666" }}>
                    {Array.from({ length: 5 }, (_, i) => i < lives ? "♥" : "♡").join("")} &nbsp;{lives} {lives === 1 ? "vida restante" : "vidas restantes"}
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={revive}>
                    Revivir a Jarvis →
                  </button>
                </div>
              )}

              {noLives && (
                <div className="ng-overlay-msg">
                  <p style={{ fontSize: "2.5rem" }}>💀</p>
                  <p className="ng-msg-title" style={{ color: "#ff4d6d" }}>Sin más vidas</p>
                  <p className="ng-msg-sub" style={{ color: "#888", fontSize: "0.95rem", marginTop: 4 }}>
                    Jarvis ya no tiene a quién llamar. Game over definitivo.
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: "1rem", opacity: 0.6 }} onClick={restart}>
                    ↺ Empezar de cero (5 vidas)
                  </button>
                </div>
              )}
            </div>

            <p className="ng-hint">
              Los pulsos viajan de izquierda a derecha. Haz click en los nodos rojos para reactivarlos. Si todos mueren, Jarvis cae.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
