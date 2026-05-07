"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const W = 480, H = 400;
const PAD_H = 10;
const BALL_R = 8;
const BRICK_ROWS = 5, BRICK_COLS = 8;
const BRICK_W = 52, BRICK_H = 20, BRICK_GAP = 4;
const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#6c63ff"];

// Level configurations with different brick patterns
const LEVELS = [
  { // Level 1 - Easy
    ballSpeed: 3,
    paddleWidth: 80,
    scoreMultiplier: 1,
    pattern: "full",
  },
  { // Level 2
    ballSpeed: 4,
    paddleWidth: 75,
    scoreMultiplier: 1.5,
    pattern: "holes",
  },
  { // Level 3
    ballSpeed: 5,
    paddleWidth: 70,
    scoreMultiplier: 2,
    pattern: "checkerboard",
  },
  { // Level 4
    ballSpeed: 6,
    paddleWidth: 65,
    scoreMultiplier: 2.5,
    pattern: "zigzag",
  },
  { // Level 5
    ballSpeed: 7,
    paddleWidth: 60,
    scoreMultiplier: 3,
    pattern: "sparse",
  },
  { // Level 6 - Very Hard
    ballSpeed: 8,
    paddleWidth: 55,
    scoreMultiplier: 3.5,
    pattern: "diamond",
  },
  { // Level 7 - Extreme
    ballSpeed: 9,
    paddleWidth: 50,
    scoreMultiplier: 4,
    pattern: "alternating",
  },
];

export default function BreakoutPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "dead">("idle");
  const [isMobile, setIsMobile] = useState(false);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const isTransitioningRef = useRef(false);

  const state = useRef({
    px: W / 2 - LEVELS[0].paddleWidth / 2,
    py: H - 30,
    bx: W / 2,
    by: H - 50,
    vx: LEVELS[0].ballSpeed,
    vy: -LEVELS[0].ballSpeed,
    bricks: [] as { x: number; y: number; alive: boolean; row: number; health: number }[],
    score: 0,
    lives: 3,
    running: false,
    currentLevel: 0,
    paddleWidth: LEVELS[0].paddleWidth,
  });

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create bricks with different patterns
  const makeBricks = (levelIdx: number) => {
    const bricks = [];
    const levelConfig = LEVELS[levelIdx];
    const pattern = levelConfig.pattern;
    
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        let shouldExist = true;
        let health = 1;
        
        // Different patterns for each level
        switch(pattern) {
          case "full":
            shouldExist = true;
            break;
          case "holes":
            shouldExist = !((c === 2 || c === 5) && (r === 1 || r === 3));
            break;
          case "checkerboard":
            shouldExist = (r + c) % 2 === 0;
            break;
          case "zigzag":
            shouldExist = (r % 2 === 0 && c % 2 === 0) || (r % 2 === 1 && c % 2 === 1);
            break;
          case "sparse":
            shouldExist = (c === 1 || c === 3 || c === 5 || c === 7) && (r === 1 || r === 3);
            break;
          case "diamond":
            const center = 3.5;
            const dist = Math.abs(c - center);
            shouldExist = dist <= r && r <= 3;
            break;
          case "alternating":
            shouldExist = r === 0 || r === 2 || r === 4;
            break;
          default:
            shouldExist = true;
        }
        
        // Add health for higher levels
        if (shouldExist && levelIdx >= 3) {
          if (r === 0 || r === 1) health = 2;
          if (levelIdx >= 5 && r === 0) health = 3;
        }
        
        if (shouldExist) {
          bricks.push({
            x: 20 + c * (BRICK_W + BRICK_GAP),
            y: 40 + r * (BRICK_H + BRICK_GAP),
            alive: true,
            row: r,
            health: health,
          });
        }
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

    // Bricks with health indicator
    s.bricks.forEach(b => {
      if (!b.alive) return;
      ctx.save();
      ctx.shadowColor = COLORS[b.row % COLORS.length];
      ctx.shadowBlur = 6;
      
      // Different colors based on health
      if (b.health === 3) {
        ctx.fillStyle = "#ff00ff";
      } else if (b.health === 2) {
        ctx.fillStyle = "#8b5cf6";
      } else {
        ctx.fillStyle = COLORS[b.row % COLORS.length];
      }
      
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 4);
      ctx.fill();
      
      // Draw health number
      if (b.health > 1) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px monospace";
        ctx.shadowBlur = 0;
        ctx.fillText(b.health.toString(), b.x + BRICK_W / 2 - 3, b.y + BRICK_H / 2 + 4);
      }
      ctx.restore();
    });

    // Paddle
    ctx.save();
    ctx.shadowColor = "#6c63ff";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#6c63ff";
    ctx.beginPath();
    ctx.roundRect(s.px, s.py, s.paddleWidth, PAD_H, 5);
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

  const nextLevel = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    
    const nextLevelIdx = state.current.currentLevel + 1;
    if (nextLevelIdx >= LEVELS.length) {
      state.current.running = false;
      setStatus("won");
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      isTransitioningRef.current = false;
      return;
    }
    
    // Update level configuration
    const levelConfig = LEVELS[nextLevelIdx];
    state.current.currentLevel = nextLevelIdx;
    state.current.paddleWidth = levelConfig.paddleWidth;
    state.current.vx = levelConfig.ballSpeed;
    state.current.vy = -levelConfig.ballSpeed;
    state.current.bricks = makeBricks(nextLevelIdx);
    state.current.bx = W / 2;
    state.current.by = H - 80;
    state.current.px = W / 2 - state.current.paddleWidth / 2;
    
    setLevel(nextLevelIdx + 1);
    
    // Reset transition flag after a short delay
    setTimeout(() => {
      isTransitioningRef.current = false;
      draw();
    }, 100);
  }, [draw]);

  const gameLoop = useCallback(() => {
    const s = state.current;
    if (!s.running) return;

    // Skip physics update if transitioning
    if (isTransitioningRef.current) {
      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    s.bx += s.vx;
    s.by += s.vy;

    // Wall bounce
    if (s.bx <= BALL_R) {
      s.bx = BALL_R;
      s.vx = Math.abs(s.vx);
    }
    if (s.bx >= W - BALL_R) {
      s.bx = W - BALL_R;
      s.vx = -Math.abs(s.vx);
    }
    if (s.by <= BALL_R) {
      s.by = BALL_R;
      s.vy = Math.abs(s.vy);
    }

    // Paddle bounce
    if (s.by + BALL_R >= s.py && s.by - BALL_R <= s.py + PAD_H && 
        s.bx + BALL_R >= s.px && s.bx - BALL_R <= s.px + s.paddleWidth) {
      s.vy = -Math.abs(s.vy);
      const hitPos = (s.bx - (s.px + s.paddleWidth / 2)) / (s.paddleWidth / 2);
      const currentSpeed = LEVELS[s.currentLevel]?.ballSpeed || 5;
      s.vx = hitPos * currentSpeed;
      // Ensure minimum speed
      if (Math.abs(s.vx) < 2) s.vx = s.vx > 0 ? 2 : -2;
      // Cap maximum speed
      if (Math.abs(s.vx) > currentSpeed + 2) s.vx = s.vx > 0 ? currentSpeed + 2 : -(currentSpeed + 2);
      s.by = s.py - BALL_R;
    }

    // Fall
    if (s.by > H + 20) {
      s.lives--;
      setLives(s.lives);
      if (s.lives <= 0) { 
        s.running = false; 
        setStatus("dead"); 
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        return; 
      }
      s.bx = W / 2; 
      s.by = H - 80; 
      s.vx = LEVELS[s.currentLevel].ballSpeed;
      s.vy = -LEVELS[s.currentLevel].ballSpeed;
      s.px = W / 2 - s.paddleWidth / 2;
      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Brick collision
    let hitBrick = false;
    
    for (let i = 0; i < s.bricks.length; i++) {
      const b = s.bricks[i];
      if (!b.alive) continue;
      
      if (s.bx + BALL_R > b.x && s.bx - BALL_R < b.x + BRICK_W && 
          s.by + BALL_R > b.y && s.by - BALL_R < b.y + BRICK_H) {
        hitBrick = true;
        
        // Decrease health or destroy brick
        if (b.health > 1) {
          b.health--;
        } else {
          b.alive = false;
        }
        
        // Change direction based on collision side
        const overlapLeft = (s.bx + BALL_R) - b.x;
        const overlapRight = (b.x + BRICK_W) - (s.bx - BALL_R);
        const overlapTop = (s.by + BALL_R) - b.y;
        const overlapBottom = (b.y + BRICK_H) - (s.by - BALL_R);
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          s.vx *= -1;
        } else {
          s.vy *= -1;
        }
        
        const points = (5 - b.row) * 10 * LEVELS[s.currentLevel].scoreMultiplier;
        s.score += points;
        setScore(s.score);
        break;
      }
    }
    
    // Check if level completed
    const allBricksDead = s.bricks.length > 0 && s.bricks.every(b => !b.alive);
    if (allBricksDead && !isTransitioningRef.current) {
      nextLevel();
      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, nextLevel]);

  const start = useCallback(() => {
    // Cancel any existing game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
    
    isTransitioningRef.current = false;
    
    const levelConfig = LEVELS[0];
    state.current.paddleWidth = levelConfig.paddleWidth;
    state.current.px = W / 2 - levelConfig.paddleWidth / 2;
    state.current.py = H - 30;
    state.current.bx = W / 2;
    state.current.by = H - 80;
    state.current.vx = levelConfig.ballSpeed;
    state.current.vy = -levelConfig.ballSpeed;
    state.current.bricks = makeBricks(0);
    state.current.score = 0;
    state.current.lives = 3;
    state.current.running = true;
    state.current.currentLevel = 0;
    
    setScore(0);
    setLives(3);
    setLevel(1);
    setStatus("playing");
    
    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, gameLoop]);

  // Mouse/Touch move handler
  const handleMove = useCallback((clientX: number) => {
    if (status !== "playing" || isTransitioningRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;
    const newPx = Math.max(0, Math.min(W - state.current.paddleWidth, canvasX - state.current.paddleWidth / 2));
    state.current.px = newPx;
  }, [status]);

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchstart", onTouchStart);
    };
  }, [handleMove]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status !== "playing" || isTransitioningRef.current) return;
      const step = 25;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        state.current.px = Math.max(0, state.current.px - step);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        state.current.px = Math.min(W - state.current.paddleWidth, state.current.px + step);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  useEffect(() => {
    draw();
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
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
          {isMobile ? " Drag finger on canvas to move paddle" : "Move mouse or use ← → arrows"}
        </p>

        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.4rem", color: "#f97316" }}>{score}</div>
            <div style={{ color: "#475569", fontSize: "0.7rem", letterSpacing: "0.1em" }}>SCORE</div>
          </div>
          <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.4rem", color: "#ef4444" }}>{"❤️".repeat(lives)}</div>
            <div style={{ color: "#475569", fontSize: "0.7rem", letterSpacing: "0.1em" }}>LIVES</div>
          </div>
          <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.4rem", color: "#10b981" }}>{level}/{LEVELS.length}</div>
            <div style={{ color: "#475569", fontSize: "0.7rem", letterSpacing: "0.1em" }}>LEVEL</div>
          </div>
        </div>

        <div style={{ 
          position: "relative", 
          display: "flex", 
          justifyContent: "center",
          borderRadius: 12, 
          overflow: "hidden", 
          border: "1px solid #1e1e2e",
          width: "100%",
        }}>
          <canvas 
            ref={canvasRef} 
            width={W} 
            height={H} 
            style={{ 
              display: "block", 
              width: "100%", 
              height: "auto",
              maxWidth: W,
              margin: "0 auto",
              cursor: "pointer",
              touchAction: "none"
            }} 
          />
          {status !== "playing" && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(10,10,15,0.92)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)"
            }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.8rem", fontWeight: 900, color: status === "won" ? "#10b981" : "#e2e8f0", marginBottom: 8, textAlign: "center", padding: "0 20px" }}>
                {status === "won" ? "YOU WIN! 🎉" : status === "dead" ? "GAME OVER" : "BREAKOUT"}
              </div>
              {(status === "dead" || status === "won") && (
                <div style={{ color: "#64748b", fontFamily: "'Exo 2', sans-serif", marginBottom: 20 }}>Score: {score}</div>
              )}
              <button onClick={start} style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                border: "none",
                padding: "12px 32px",
                borderRadius: 40,
                color: "white",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer"
              }}>
                {status === "idle" ? "Start Game" : "Play Again"}
              </button>
            </div>
          )}
        </div>
        
        
      </div>
    </div>
  );
}