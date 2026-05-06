"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const EMOJIS = ["🎮", "🚀", "⭐", "🎯", "💎", "🔥", "🌙", "🎪"];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Card { id: number; emoji: string; matched: boolean; }

export default function MemoryPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [locked, setLocked] = useState(false);

  const init = () => {
    const deck = shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({ id: i, emoji, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setWon(false);
    setLocked(false);
  };

  useEffect(() => { init(); }, []);

  const flip = (id: number) => {
    if (locked || flipped.includes(id) || cards.find(c => c.id === id)?.matched) return;
    const nf = [...flipped, id];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = nf.map(i => cards.find(c => c.id === i)!);
      if (a.emoji === b.emoji) {
        const nc = cards.map(c => nf.includes(c.id) ? { ...c, matched: true } : c);
        setCards(nc);
        setFlipped([]);
        setLocked(false);
        if (nc.every(c => c.matched)) setWon(true);
      } else {
        setTimeout(() => { setFlipped([]); setLocked(false); }, 800);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="bg-grid">
      <Navbar />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ color: "#475569", textDecoration: "none", fontSize: "0.85rem", fontFamily: "'Exo 2', sans-serif" }}>
            ← Back to Games
          </Link>
        </div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "2rem", fontWeight: 900, color: "#8b5cf6", marginBottom: 8 }}>
          🃏 Memory Match
        </h1>
        <p style={{ color: "#64748b", fontFamily: "'Exo 2', sans-serif", marginBottom: 24 }}>
          Flip cards to find matching pairs. Fewest moves wins!
        </p>

        <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center" }}>
          <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.4rem", color: "#8b5cf6" }}>{moves}</div>
            <div style={{ color: "#475569", fontSize: "0.7rem", letterSpacing: "0.1em" }}>MOVES</div>
          </div>
          <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.4rem", color: "#10b981" }}>{cards.filter(c => c.matched).length / 2}</div>
            <div style={{ color: "#475569", fontSize: "0.7rem", letterSpacing: "0.1em" }}>PAIRS</div>
          </div>
          <button className="btn-secondary" onClick={init} style={{ marginLeft: "auto" }}>New Game</button>
        </div>

        {won && (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "20px 24px", marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.2rem", color: "#10b981", marginBottom: 8 }}>🎉 YOU WIN!</div>
            <div style={{ color: "#64748b", fontFamily: "'Exo 2', sans-serif", marginBottom: 12 }}>Completed in {moves} moves</div>
            <button className="btn-primary" onClick={init}>Play Again</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {cards.map(card => {
            const visible = flipped.includes(card.id) || card.matched;
            return (
              <div
                key={card.id}
                onClick={() => flip(card.id)}
                style={{
                  height: 90,
                  background: card.matched ? "rgba(16,185,129,0.1)" : visible ? "#1e1e2e" : "#12121a",
                  border: `1px solid ${card.matched ? "rgba(16,185,129,0.4)" : visible ? "#6c63ff44" : "#1e1e2e"}`,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  cursor: card.matched ? "default" : "pointer",
                  transition: "all 0.2s",
                  userSelect: "none",
                  transform: visible ? "scale(1)" : "scale(0.97)",
                }}
              >
                {visible ? card.emoji : (
                  <span style={{ color: "#1e1e2e", fontSize: "1.5rem" }}>?</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
