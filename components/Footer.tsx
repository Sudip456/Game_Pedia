export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #1e1e2e",
        padding: "40px 24px",
        marginTop: 80,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: "1.1rem",
          fontWeight: 700,
          background: "linear-gradient(135deg, #6c63ff, #06b6d4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}
      >
        GAMEPEDIA
      </p>
      <p style={{ color: "#475569", fontSize: "0.8rem", fontFamily: "'Exo 2', sans-serif" }}>
        Free browser games — no login, no download. Just play.
      </p>
      <p style={{ color: "#334155", fontSize: "0.75rem", marginTop: 16, fontFamily: "'Exo 2', sans-serif" }}>
        © {new Date().getFullYear()} GamePedia. All games free to play.
      </p>
    </footer>
  );
}
