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
              marginRight:"1rem",
              background: "linear-gradient(135deg, #6c63ff, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.05em",
            }}
          >
            GAME<span style={{ color: "#f59e0b", WebkitTextFillColor: "#f59e0b" }}>PEDIA</span>
          </span>
        </Link>

        
      </div>
    </nav>
  );
}
