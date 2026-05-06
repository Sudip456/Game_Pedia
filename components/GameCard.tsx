import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  tag?: string;
}

export default function GameCard({ title, description, icon, href, color, tag }: GameCardProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className="game-card"
        style={{
          background: "#12121a",
          border: "1px solid #1e1e2e",
          borderRadius: 16,
          padding: 24,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: color,
            borderRadius: "16px 16px 0 0",
          }}
        />

        {/* Icon */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 14,
            background: `${color}22`,
            border: `1px solid ${color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            marginBottom: 16,
          }}
        >
          {icon}
        </div>

        {/* Tag */}
        {tag && (
          <span
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: `${color}22`,
              border: `1px solid ${color}55`,
              borderRadius: 20,
              color: color,
              fontSize: "0.65rem",
              fontFamily: "'Orbitron', monospace",
              padding: "3px 10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {tag}
          </span>
        )}

        <h3
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#e2e8f0",
            marginBottom: 8,
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: "#64748b",
            fontSize: "0.85rem",
            lineHeight: 1.5,
            fontFamily: "'Exo 2', sans-serif",
          }}
        >
          {description}
        </p>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: color,
            fontSize: "0.8rem",
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 600,
          }}
        >
          Play Now
          <span style={{ fontSize: "1rem" }}>→</span>
        </div>
      </div>
    </Link>
  );
}
