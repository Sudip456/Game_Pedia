"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const W = 600;
const H = 400;
const GROUND_Y = H - 60;

export default function FlappyBirdPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<"idle" | "playing" | "dead">("idle");

  const gameRef = useRef({
    birdY: H / 2 - 30,
    birdVY: 0,
    gravity: 0.38,        
    flapStrength: -6,   
    rotation: 0,
    pipes: [] as { x: number; top: number; passed: boolean }[],
    clouds: [] as { x: number; y: number; size: number }[],
    frame: 0,
    speed: 2.4,
    running: false,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const g = gameRef.current;

    ctx.fillStyle = "#0a1428";
    ctx.fillRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    grad.addColorStop(0, "#1e3a8a");
    grad.addColorStop(1, "#3b82f6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, GROUND_Y);

    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    g.clouds.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.arc(c.x + c.size*0.7, c.y-6, c.size*0.85, 0, Math.PI * 2);
      ctx.arc(c.x + c.size*1.4, c.y, c.size*0.7, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pipes
    ctx.fillStyle = "#10b981";
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 4;
    g.pipes.forEach((pipe) => {
      const gap = 140;
      const top = pipe.top;

      ctx.fillRect(pipe.x, 0, 60, top);
      ctx.strokeRect(pipe.x, 0, 60, top);
      ctx.fillRect(pipe.x - 4, top - 32, 68, 32);

      ctx.fillRect(pipe.x, top + gap, 60, H);
      ctx.strokeRect(pipe.x, top + gap, 60, H);
      ctx.fillRect(pipe.x - 4, top + gap, 68, 32);
    });

    // Ground
    ctx.fillStyle = "#166534";
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(0, GROUND_Y + 8, W, 22);

    // Bird
    ctx.save();
    ctx.translate(120, g.birdY);
    ctx.rotate((g.rotation * Math.PI) / 180);

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.ellipse(-5, 2, 12, 9, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(11, -5, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(16, -7, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e2937";
    ctx.beginPath();
    ctx.arc(17.5, -7, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(21, -5);
    ctx.lineTo(29, -3);
    ctx.lineTo(21, 1);
    ctx.fill();

    ctx.restore();

 
  }, []);

  const gameLoop = useCallback(() => {
    const g = gameRef.current;
    if (!g.running) return;

    g.frame++;

    g.birdVY += g.gravity;
    g.birdY += g.birdVY;
    g.rotation = Math.max(-30, Math.min(80, g.birdVY * 4));

    // Spawn
    if (g.frame % 80 === 0) {
      const top = 65 + Math.random() * (GROUND_Y - 260);
      g.pipes.push({ x: W + 30, top, passed: false });
    }
    if (g.frame % 55 === 0) {
      g.clouds.push({ x: W + 50, y: 45 + Math.random() * 110, size: 15 + Math.random() * 13 });
    }

    // Move
    g.pipes.forEach(p => p.x -= g.speed);
    g.clouds.forEach(c => c.x -= 0.75);

    g.pipes = g.pipes.filter(p => p.x > -80);
    g.clouds = g.clouds.filter(c => c.x > -100);

    // Score
    g.pipes.forEach(pipe => {
      if (!pipe.passed && pipe.x + 60 < 120) {
        pipe.passed = true;
        setScore(s => s + 1);
      }
    });

    // Collision
    if (g.birdY > GROUND_Y - 22 || g.birdY < 25) {
      endGame();
      return;
    }

    for (const pipe of g.pipes) {
      const gap = 140;
      if (
        138 > pipe.x && 102 < pipe.x + 60 &&
        (g.birdY - 17 < pipe.top || g.birdY + 17 > pipe.top + gap)
      ) {
        endGame();
        return;
      }
    }

    draw();
    requestAnimationFrame(gameLoop);
  }, [draw]);

  const flap = useCallback(() => {
    const g = gameRef.current;
    if (g.running) g.birdVY = g.flapStrength;
  }, []);

  const start = useCallback(() => {
    const g = gameRef.current;
    g.birdY = H / 2 - 30;
    g.birdVY = -4;           // Gentle start lift
    g.rotation = 0;
    g.pipes = [];
    g.clouds = [];
    g.frame = 0;
    g.running = true;

    setScore(0);
    setStatus("playing");
    requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const endGame = useCallback(() => {
    gameRef.current.running = false;
    setStatus("dead");
    setBest(b => Math.max(b, score));
  }, [score]);

  useEffect(() => {
    draw();

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (status === "playing") {
          flap();
        } else {
          start();
        }
      }
    };

    const handleTap = () => {
      if (status === "playing") {
        flap();
      } else {
        start();
      }
    };

    window.addEventListener("keydown", handleKey);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("click", handleTap);
      canvas.addEventListener("touchstart", handleTap);
    }

    return () => {
      window.removeEventListener("keydown", handleKey);
      if (canvas) {
        canvas.removeEventListener("click", handleTap);
        canvas.removeEventListener("touchstart", handleTap);
      }
    };
  }, [status, flap, start, draw]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="bg-grid">
      <Navbar />
      <div style={{ maxWidth: 750, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ color: "#475569", textDecoration: "none", fontSize: "0.85rem", fontFamily: "'Exo 2', sans-serif" }}>
            ← Back to Games
          </Link>
        </div>

        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "2.2rem", fontWeight: 900, color: "#eab308", marginBottom: 8 }}>
          🐦 Floppy Bird
        </h1>
        <p style={{ color: "#64748b", marginBottom: 24 }}>Click Spacebar to Flap</p>

        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          {[{ label: "Score", val: score, color: "#eab308" }, { label: "Best", val: best, color: "#22d3ee" }].map((st) => (
            <div key={st.label} style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 20px", textAlign: "center", flex: 1 }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.6rem", color: st.color }}>{st.val}</div>
              <div style={{ color: "#475569", fontSize: "0.75rem" }}>{st.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "2px solid #1e1e2e" }}>
          <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", width: "100%" }} />

          {status !== "playing" && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(10,10,15,0.92)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
            }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "2.8rem", fontWeight: 900, color: "#eab308", marginBottom: 16 }}>
                {status === "dead" ? "GAME OVER" : "FLOPPY BIRD"}
              </div>
              {status === "dead" && <div style={{ fontSize: "1.5rem", color: "#eab308", marginBottom: 20 }}>Score: {score}</div>}
              <button onClick={start} className="btn-primary">
                {status === "dead" ? "Play Again" : "Start Game"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}