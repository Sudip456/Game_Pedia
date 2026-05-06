"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const CELL = 20;
const COLS = 20;
const ROWS = 20;
const W = CELL * COLS;
const H = CELL * ROWS;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pt = { x: number; y: number };

function rand() {
  return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
}

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<"idle" | "playing" | "dead">("idle");
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: "RIGHT" as Dir,
    next: "RIGHT" as Dir,
    food: { x: 15, y: 10 } as Pt,
    score: 0,
    running: false,
  });
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s = stateRef.current;

    ctx.fillStyle = "#0d0d14";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(108,99,255,0.05)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
      ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(W, j * CELL); ctx.stroke();
    }

    // Food
    const fx = s.food.x * CELL + CELL / 2;
    const fy = s.food.y * CELL + CELL / 2;
    ctx.save();
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(fx, fy, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Snake
    s.snake.forEach((seg, i) => {
      const alpha = 0.4 + 0.6 * (i === 0 ? 1 : (s.snake.length - i) / s.snake.length);
      ctx.save();
      if (i === 0) {
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 12;
      }
      ctx.fillStyle = i === 0 ? "#10b981" : `rgba(16,185,129,${alpha})`;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  const gameLoop = useCallback((ts: number) => {
    const s = stateRef.current;
    if (!s.running) return;
    const dt = ts - lastRef.current;
    if (dt >= 120) {
      lastRef.current = ts;
      s.dir = s.next;
      const head = { x: s.snake[0].x, y: s.snake[0].y };
      if (s.dir === "UP") head.y--;
      if (s.dir === "DOWN") head.y++;
      if (s.dir === "LEFT") head.x--;
      if (s.dir === "RIGHT") head.x++;

      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || s.snake.some(p => p.x === head.x && p.y === head.y)) {
        s.running = false;
        setStatus("dead");
        setBest(b => Math.max(b, s.score));
        return;
      }

      s.snake.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        s.score++;
        setScore(s.score);
        let nf: Pt;
        do { nf = rand(); } while (s.snake.some(p => p.x === nf.x && p.y === nf.y));
        s.food = nf;
      } else {
        s.snake.pop();
      }
    }
    draw();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  const start = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const s = stateRef.current;
    s.snake = [{ x: 10, y: 10 }];
    s.dir = "RIGHT"; s.next = "RIGHT";
    s.food = { x: 15, y: 10 };
    s.score = 0; s.running = true;
    setScore(0); setStatus("playing");
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => {
    draw();
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const map: Record<string, Dir> = {
        ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
        w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
      };
      const d = map[e.key];
      if (!d) return;
      e.preventDefault();
      const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
      if (d !== opp[s.dir]) s.next = d;
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); cancelAnimationFrame(rafRef.current); };
  }, [draw]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="bg-grid">
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ color: "#475569", textDecoration: "none", fontSize: "0.85rem", fontFamily: "'Exo 2', sans-serif" }}>
            ← Back to Games
          </Link>
        </div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "2rem", fontWeight: 900, color: "#10b981", marginBottom: 8 }}>
          🐍 Snake
        </h1>
        <p style={{ color: "#64748b", fontFamily: "'Exo 2', sans-serif", marginBottom: 24 }}>
          Use arrow keys or WASD to control. Eat the red dots, don't hit the walls!
        </p>

        {/* Score */}
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          {[{ label: "Score", val: score, color: "#10b981" }, { label: "Best", val: best, color: "#f59e0b" }].map(s => (
            <div key={s.label} style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 24px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ color: "#475569", fontSize: "0.75rem", fontFamily: "'Exo 2', sans-serif", letterSpacing: "0.1em" }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ position: "relative", display: "inline-block", borderRadius: 12, overflow: "hidden", border: "1px solid #1e1e2e" }}>
          <canvas ref={canvasRef} width={W} height={H} />
          {status !== "playing" && (
            <div className="game-overlay">
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "2rem", fontWeight: 900, color: "#e2e8f0", marginBottom: 8 }}>
                {status === "dead" ? "GAME OVER" : "SNAKE"}
              </div>
              {status === "dead" && (
                <div style={{ color: "#64748b", fontFamily: "'Exo 2', sans-serif", marginBottom: 24 }}>Score: {score}</div>
              )}
              <button className="btn-primary" onClick={start}>
                {status === "dead" ? "Play Again" : "Start Game"}
              </button>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 48px)", gridTemplateRows: "repeat(2, 48px)", gap: 6, justifyContent: "center" }}>
          {[
            { label: "↑", dir: "UP" as Dir, col: 2, row: 1 },
            { label: "←", dir: "LEFT" as Dir, col: 1, row: 2 },
            { label: "↓", dir: "DOWN" as Dir, col: 2, row: 2 },
            { label: "→", dir: "RIGHT" as Dir, col: 3, row: 2 },
          ].map(btn => (
            <button
              key={btn.dir}
              onClick={() => {
                const s = stateRef.current;
                const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
                if (btn.dir !== opp[s.dir]) s.next = btn.dir;
              }}
              style={{
                gridColumn: btn.col,
                gridRow: btn.row,
                background: "#12121a",
                border: "1px solid #1e1e2e",
                borderRadius: 8,
                color: "#94a3b8",
                fontSize: "1.2rem",
                cursor: "pointer",
                width: 48,
                height: 48,
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
