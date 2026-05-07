import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GamePedia — Play Free Games Online",
    icons: {
    icon: "/icon.png",
  },
  description:
    "GamePedia is your ultimate destination for free browser games. Snake, Chess, Puzzle, Runner, Ludo, Memory, Breakout and more!",
  keywords: "free games, browser games, snake, chess, puzzle, ludo, memory game",
  openGraph: {
    title: "GamePedia",
    description: "Play free games online — no download, no login.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
