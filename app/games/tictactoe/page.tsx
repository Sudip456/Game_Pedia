"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

type Cell = "X" | "O" | null;

const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkWinner(b: Cell[]): Cell | "draw" | null {
  for (const [a, c, d] of WINS) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  if (b.every(c => c)) return "draw";
  return null;
}

function aiMove(board: Cell[]): number {
  // Try to win
  for (const [a, b, c] of WINS) {
    const row = [board[a], board[b], board[c]];
    if (row.filter(x => x === "O").length === 2 && row.includes(null))
      return [a, b, c][row.indexOf(null)];
  }
  // Block player
  for (const [a, b, c] of WINS) {
    const row = [board[a], board[b], board[c]];
    if (row.filter(x => x === "X").length === 2 && row.includes(null))
      return [a, b, c][row.indexOf(null)];
  }
  // Center
  if (!board[4]) return 4;
  // Random empty
  const empty = board.map((c, i) => c ? -1 : i).filter(i => i >= 0);
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function TicTacToePage() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [mode, setMode] = useState<"ai" | "2p">("ai");
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const winner = checkWinner(board);

  const play = (i: number) => {
    if (board[i] || winner) return;
    const nb = [...board];
    nb[i] = turn;
    const w = checkWinner(nb);
    if (w) {
      setBoard(nb);
      setScores(s => ({ ...s, [w]: (s as any)[w] + 1 }));
      return;
    }
    if (mode === "ai" && turn === "X") {
      const ai = aiMove(nb);
      nb[ai] = "O";
      const w2 = checkWinner(nb);
      setBoard(nb);
      if (w2) setScores(s => ({ ...s, [w2]: (s as any)[w2] + 1 }));
    } else {
      setTurn(t => t === "X" ? "O" : "X");
      setBoard(nb);
    }
  };

  const reset = () => { setBoard(Array(9).fill(null)); setTurn("X"); };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="bg-grid">
      <Navbar />
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ color: "#475569", textDecoration: "none", fontSize: "0.85rem", fontFamily: "'Exo 2', sans-serif" }}>
            ← Back to Games
          </Link>
        </div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "2rem", fontWeight: 900, color: "#ec4899", marginBottom: 8 }}>
          ❌ Tic-Tac-Toe
        </h1>

        {/* Mode */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["ai", "2p"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); reset(); }}
              style={{
                background: mode === m ? "rgba(236,72,153,0.2)" : "#12121a",
                border: `1px solid ${mode === m ? "#ec4899" : "#1e1e2e"}`,
                borderRadius: 8,
                color: mode === m ? "#ec4899" : "#64748b",
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.85rem",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              {m === "ai" ? "vs AI" : "2 Players"}
            </button>
          ))}
        </div>

        {/* Scores */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[{ k: "X", c: "#6c63ff", l: "X" }, { k: "draw", c: "#64748b", l: "DRAW" }, { k: "O", c: "#ec4899", l: mode === "ai" ? "AI" : "O" }].map(s => (
            <div key={s.k} style={{ flex: 1, background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.3rem", color: s.c }}>{(scores as any)[s.k]}</div>
              <div style={{ color: "#475569", fontSize: "0.7rem", letterSpacing: "0.1em" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Status */}
        <div style={{ marginBottom: 20, fontFamily: "'Exo 2', sans-serif", color: "#94a3b8", fontSize: "0.95rem" }}>
          {winner
            ? winner === "draw" ? "It's a draw!" : `${winner === "O" && mode === "ai" ? "AI" : winner} wins! 🎉`
            : `${turn}'s turn ${mode === "ai" && turn === "O" ? "(AI)" : ""}`}
        </div>

        {/* Board */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
          {board.map((cell, i) => {
            const winLine = winner && winner !== "draw" ? WINS.find(([a, b, c]) => board[a] === winner && board[b] === winner && board[c] === winner) : null;
            const isWin = winLine?.includes(i);
            return (
              <div
                key={i}
                onClick={() => play(i)}
                style={{
                  height: 100,
                  background: isWin ? "rgba(16,185,129,0.1)" : "#12121a",
                  border: `1px solid ${isWin ? "#10b981" : "#1e1e2e"}`,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  cursor: cell || winner ? "default" : "pointer",
                  color: cell === "X" ? "#6c63ff" : "#ec4899",
                  fontFamily: "'Orbitron', monospace",
                  fontWeight: 900,
                  transition: "all 0.15s",
                }}
              >
                {cell}
              </div>
            );
          })}
        </div>

        <button className="btn-primary" onClick={reset}>New Game</button>
      </div>
    </div>
  );
}
