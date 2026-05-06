import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GameCard from "@/components/GameCard";

const games = [
  {
    title: "Snake",
    description: "Classic snake — eat, grow, survive. Don't bite yourself!",
    icon: "🐍",
    href: "/games/snake",
    color: "#10b981",
    tag: "Classic",
  },

  {
    title: "Puzzle",
    description: "Slide tiles into order. A satisfying number puzzle.",
    icon: "🖽",
    href: "/games/puzzle",
    color: "#6c63ff",
    tag: "Puzzle",
  },
  {
    title: "Floppy Bird",
    description: "Classic Flappy Bird. Tap / Space to flap!",
    icon: "🐦",
    href: "/games/flappy",
    color: "#eab308",
    tag: "Classic",
  },

  {
    title: "Tetris",
    description: "Classic block-stacking puzzle. Clear lines and set new high scores!",
    icon: "🧩",
    href: "/games/tetris",
    color: "#a855f7",
    tag: "Puzzle",
},
{
  title: "Typing Test",
  description: "Test and improve your typing speed",
  icon: "⌨️",
  href: "/games/typing",
  color: "#06b6d4",
  tag: "Practice",
},
  {
    title: "Tic-Tac-Toe",
    description: "Two-player or vs AI. The timeless X and O showdown.",
    icon: "❌",
    href: "/games/tictactoe",
    color: "#ec4899",
    tag: "2 Player",
  },
  {
    title: "Minesweeper",
    description: "Flag all mines and uncover the safe cells. A true test of logic!",
    icon: "💣",
    href: "/games/minesweeper",
    color: "#10b981",
    tag: "Solo",
},
 {
    title: "WordFill",
    description: "Fill the blanks! Guess the word with limited attempts.",
    icon: "📝",
    href: "/games/wordly",
    color: "#10b981",
    tag: "Fill Blanks",
},
  {
    title: "Memory Match",
    description: "Flip cards and find matching pairs. Train your memory!",
    icon: "🃏",
    href: "/games/memory",
    color: "#8b5cf6",
    tag: "Brain",
  },
  {
    title: "Breakout",
    description: "Smash all the bricks with a bouncing ball. Arcade classic!",
    icon: "🧱",
    href: "/games/breakout",
    color: "#f97316",
    tag: "Arcade",
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="bg-grid">
      <Navbar />

      {/* Hero */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 60px",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(108,99,255,0.1)",
            border: "1px solid rgba(108,99,255,0.3)",
            borderRadius: 20,
            padding: "6px 16px",
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: "0.7rem", color: "#6c63ff", fontFamily: "'Orbitron', monospace", letterSpacing: "0.15em" }}>
            🎮 10 FREE GAMES
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "clamp(2.2rem, 6vw, 4rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 20,
            letterSpacing: "-0.02em",
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Your Ultimate
          </span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #6c63ff, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Game Arcade
          </span>
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "1.1rem",
            maxWidth: 520,
            margin: "0 auto 40px",
            lineHeight: 1.7,
            fontFamily: "'Exo 2', sans-serif",
          }}
        >
          No login. No download. Just pick a game and play — instantly in your browser.
        </p>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            marginBottom: 60,
            flexWrap: "wrap",
          }}
        >
          {[
            { num: "8+", label: "Games" },
            { num: "100%", label: "Free" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #6c63ff, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.num}
              </div>
              <div style={{ color: "#475569", fontSize: "0.8rem", fontFamily: "'Exo 2', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Games Grid */}
      <section
        id="games"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}
      >
        <div style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 8,
            }}
          >
            All Games
          </h2>
          <p style={{ color: "#475569", fontFamily: "'Exo 2', sans-serif", fontSize: "0.9rem" }}>
            Click any game to start playing instantly
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {games.map(game => (
            <GameCard key={game.href} {...game} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
