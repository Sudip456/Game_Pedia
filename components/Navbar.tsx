"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        background: "rgba(10,10,15,0.9)",
        borderBottom: "1px solid #1e1e2e",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "1.4rem",
              fontWeight: 900,
              background: "linear-gradient(135deg, #6c63ff, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.05em",
            }}
          >
            GAME<span style={{ color: "#f59e0b", WebkitTextFillColor: "#f59e0b" }}>PEDIA</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", fontFamily: "'Exo 2', sans-serif", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e2e8f0")}
            onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
          >
            Home
          </Link>
          <Link href="/#games" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", fontFamily: "'Exo 2', sans-serif", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e2e8f0")}
            onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
          >
            All Games
          </Link>
          <span
            style={{
              background: "linear-gradient(135deg, #6c63ff22, #8b5cf622)",
              border: "1px solid #6c63ff44",
              borderRadius: 20,
              color: "#a78bfa",
              fontSize: "0.75rem",
              fontFamily: "'Orbitron', monospace",
              padding: "4px 12px",
              letterSpacing: "0.08em",
            }}
          >
            FREE
          </span>
        </div>
      </div>
    </nav>
  );
}
