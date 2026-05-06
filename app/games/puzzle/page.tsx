"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

function createSolved() {
  return [...Array(16).keys()].map(i => (i === 15 ? 0 : i + 1));
}

function shuffle(tiles: number[]) {
  let t = [...tiles];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  // Ensure solvable
  const inv = t.filter(x => x !== 0).reduce((acc, val, i, arr) => {
    return acc + arr.slice(i + 1).filter(v => v < val).length;
  }, 0);
  const blankRow = Math.floor(t.indexOf(0) / 4);
  const solvable = (inv + blankRow) % 2 === 0;
  if (!solvable) { [t[0], t[1]] = [t[1], t[0]]; }
  return t;
}

function isSolved(tiles: number[]) {
  return tiles.every((v, i) => v === (i === 15 ? 0 : i + 1));
}

export default function PuzzlePage() {
  const [tiles, setTiles] = useState<number[]>(createSolved());
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);

  const start = () => {
    setTiles(shuffle(createSolved()));
    setMoves(0);
    setWon(false);
    setStarted(true);
  };

  const move = (i: number) => {
    if (won || !started) return;
    const blank = tiles.indexOf(0);
    const valid = [blank - 1, blank + 1, blank - 4, blank + 4];
    if (!valid.includes(i)) return;
    if ((i % 4 === 3 && blank % 4 === 0) || (i % 4 === 0 && blank % 4 === 3)) return;
    const nt = [...tiles];
    [nt[blank], nt[i]] = [nt[i], nt[blank]];
    setTiles(nt);
    setMoves(m => m + 1);
    if (isSolved(nt)) setWon(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="bg-grid">
      <Navbar />
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ color: "#475569", textDecoration: "none", fontSize: "0.85rem", fontFamily: "'Exo 2', sans-serif" }}>
            ← Back to Games
          </Link>
        </div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "2rem", fontWeight: 900, color: "#6c63ff", marginBottom: 8 }}>
          🧩 15 Puzzle
        </h1>
        <p style={{ color: "#64748b", fontFamily: "'Exo 2', sans-serif", marginBottom: 24 }}>
          Slide tiles to arrange numbers 1–15 in order.
        </p>

        <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center" }}>
          <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.4rem", color: "#6c63ff" }}>{moves}</div>
            <div style={{ color: "#475569", fontSize: "0.7rem", letterSpacing: "0.1em" }}>MOVES</div>
          </div>
          <button className="btn-primary" onClick={start} style={{ marginLeft: "auto" }}>
            {started ? "Shuffle" : "Start"}
          </button>
        </div>

        {won && (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "16px 24px", marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", color: "#10b981" }}>🎉 Solved in {moves} moves!</div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {tiles.map((val, i) => (
            <div
              key={i}
              onClick={() => move(i)}
              style={{
                height: 80,
                background: val === 0 ? "#0a0a0f" : val === i + 1 ? "rgba(16,185,129,0.15)" : "#12121a",
                border: `1px solid ${val === 0 ? "#0a0a0f" : val === i + 1 ? "rgba(16,185,129,0.4)" : "#1e1e2e"}`,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Orbitron', monospace",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: val === 0 ? "transparent" : val === i + 1 ? "#10b981" : "#e2e8f0",
                cursor: val === 0 ? "default" : "pointer",
                transition: "all 0.15s",
                userSelect: "none",
              }}
            >
              {val || ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
