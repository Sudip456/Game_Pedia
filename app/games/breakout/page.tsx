"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const W = 480, H = 400;
const PAD_W = 80, PAD_H = 10;
const BALL_R = 8;
const BRICK_ROWS = 5, BRICK_COLS = 8;
const BRICK_W = 52, BRICK_H = 20, BRICK_GAP = 4;
const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#6c63ff"];

export default function BreakoutPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "dead">("idle");
  const state = useRef({
    px: W / 2 - PAD_W / 2, py: H - 30,
    bx: W / 2, by: H - 50, vx: 3, vy: -3,
    bricks: [] as { x: number; y: number; alive: boolean; row: number }[],
    score: 0, lives: 3, running: false,
  });

  const makeBricks = () => {
    const bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: 20 + c * (BRICK_W + BRICK_GAP),
          y: 40 + r * (BRICK_H + BRICK_GAP),
          alive: true,
          row: r,
        });
      }
    }
    return bricks;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s = state.current;

    ctx.fillStyle = "#0d0d14";
    ctx.fillRect(0, 0, W, H);

    // Bricks
    s.bricks.forEach(b => {
      if (!b.alive) return;
      ctx.save();
      ctx.shadowColor = COLORS[b.row];
      ctx.shadowBlur = 8;
      ctx.fillStyle = COLORS[b.row];
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 4);
      ctx.fill();
      ctx.restore();
    });

    // Paddle
    ctx.save();
    ctx.shadowColor = "#6c63ff";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#6c63ff";
    ctx.beginPath();
    ctx.roundRect(s.px, s.py, PAD_W, PAD_H, 5);
    ctx.fill();
    ctx.restore();

    // Ball
    ctx.save();
    ctx.shadowColor = "#f59e0b";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const gameLoop = useCallback(() => {
    const s = state.current;
    if (!s.running) return;

    s.bx += s.vx;
    s.by += s.vy;

    // Wall bounce
    if (s.bx <= BALL_R || s.bx >= W - BALL_R) s.vx *= -1;
    if (s.by <= BALL_R) s.vy *= -1;

    // Paddle bounce
    if (s.by + BALL_R >= s.py && s.by - BALL_R <= s.py + PAD_H && s.bx >= s.px && s.bx <= s.px + PAD_W) {
      s.vy = -Math.abs(s.vy);
      const hit = (s.bx - (s.px + PAD_W / 2)) / (PAD_W / 2);
      s.vx = hit * 5;
    }

    // Fall
    if (s.by > H + 20) {
      s.lives--;
      setLives(s.lives);
      if (s.lives <= 0) { s.running = false; setStatus("dead"); return; }
      s.bx = W / 2; s.by = H - 80; s.vx = 3; s.vy = -3;
    }

    // Brick collision
    for (const b of s.bricks) {
      if (!b.alive) continue;
      if (s.bx + BALL_R > b.x && s.bx - BALL_R < b.x + BRICK_W && s.by + BALL_R > b.y && s.by - BALL_R < b.y + BRICK_H) {
        b.alive = false;
        s.vy *= -1;
        s.score += (5 - b.row) * 10;
        setScore(s.score);
        break;
      }
    }

    if (s.bricks.every(b => !b.alive)) { s.running = false; setStatus("won"); return; }

    draw();
    requestAnimationFrame(gameLoop);
  }, [draw]);

  const start = () => {
    const s = state.current;
    s.px = W / 2 - PAD_W / 2; s.py = H - 30;
    s.bx = W / 2; s.by = H - 80; s.vx = 3; s.vy = -3;
    s.bricks = makeBricks();
    s.score = 0; s.lives = 3; s.running = true;
    setScore(0); setLives(3); setStatus("playing");
    requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    draw();
    const onKey = (e: KeyboardEvent) => {
      const s = state.current;
      if (e.key === "ArrowLeft") s.px = Math.max(0, s.px - 20);
      if (e.key === "ArrowRight") s.px = Math.min(W - PAD_W, s.px + 20);
    };
    const onMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      state.current.px = Math.max(0, Math.min(W - PAD_W, e.clientX - rect.left - PAD_W / 2));
    };
    window.addEventListener("keydown", onKey);
    canvasRef.current?.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [draw]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="bg-grid">
      <Navbar />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ color: "#475569", textDecoration: "none", fontSize: "0.85rem", fontFamily: "'Exo 2', sans-serif" }}>
            ← Back to Games
          </Link>
        </div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "2rem", fontWeight: 900, color: "#f97316", marginBottom: 8 }}>
          🧱 Breakout
        </h1>
        <p style={{ color: "#64748b", fontFamily: "'Exo 2', sans-serif", marginBottom: 24 }}>
          Move mouse or use arrow keys to control the paddle.
        </p>

        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.4rem", color: "#f97316" }}>{score}</div>
            <div style={{ color: "#475569", fontSize: "0.7rem", letterSpacing: "0.1em" }}>SCORE</div>
          </div>
          <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.4rem", color: "#ef4444" }}>{"❤️".repeat(lives)}</div>
            <div style={{ color: "#475569", fontSize: "0.7rem", letterSpacing: "0.1em" }}>LIVES</div>
          </div>
        </div>

        <div style={{ position: "relative", display: "inline-block", borderRadius: 12, overflow: "hidden", border: "1px solid #1e1e2e" }}>
          <canvas ref={canvasRef} width={W} height={H} />
          {status !== "playing" && (
            <div className="game-overlay">
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "2rem", fontWeight: 900, color: status === "won" ? "#10b981" : "#e2e8f0", marginBottom: 8 }}>
                {status === "won" ? "YOU WIN! 🎉" : status === "dead" ? "GAME OVER" : "BREAKOUT"}
              </div>
              {(status === "dead" || status === "won") && (
                <div style={{ color: "#64748b", fontFamily: "'Exo 2', sans-serif", marginBottom: 20 }}>Score: {score}</div>
              )}
              <button className="btn-primary" onClick={start}>
                {status === "idle" ? "Start Game" : "Play Again"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
