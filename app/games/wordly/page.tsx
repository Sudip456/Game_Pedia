'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// 120+ 5-Letter Words
const WORD_LIST = [
    "CRANE", "SLATE", "TRACE", "BRAIN", "HEART", "FLAME", "GHOST", "STONE", "RIVER", "LIGHT",
    "DREAM", "STORM", "PEACE", "MUSIC", "NIGHT", "OCEAN", "POWER", "QUEEN", "SHINE", "TOWER",
    "VOICE", "WORLD", "YOUTH", "BEACH", "CLOUD", "EAGLE", "FROST", "GIANT", "HOUSE", "IMAGE",
    "JELLY", "KNIFE", "LEMON", "MOUNT", "NOBLE", "ORBIT", "PIANO", "QUEST", "ROYAL", "SNAKE",
    "TIGER", "UNITY", "VIVID", "WHALE", "YACHT", "ZEBRA", "APPLE", "BREAD", "CANDY", "DANCE",
    "EARTH", "GRAPE", "HONEY", "IVORY", "JUICE", "KNOCK", "LUCID", "MAGIC", "NOVEL", "OLIVE",
    "PEARL", "QUIET", "RAPID", "SHARP", "TOAST", "ULTRA", "WHEAT", "ZESTY", "ALERT", "BRAVE",
    "CHARM", "DRIFT", "EAGER", "FANCY", "GLORY", "HAPPY", "INPUT", "JUMPY", "KNELT", "LATER",
    "MERRY", "PROUD", "QUICK", "ROAST", "SMART", "TRULY", "UPSET", "VITAL", "WIDOW", "YOUNG",
    "ABOVE", "BELOW", "CRAVE", "DRINK", "EVOKE", "FLAIR", "HUMOR", "IDEAL", "JOLLY", "KARMA",
    "LUNAR", "METAL", "NOBLE", "OCEAN", "PEACE", "RIVER", "STORM", "TIGER", "VOICE", "WHALE"
];

export default function WordFill() {
    const [targetWord, setTargetWord] = useState("");
    const [revealed, setRevealed] = useState<string[]>([]);
    const [userInput, setUserInput] = useState<string[]>([]);
    const [attempts, setAttempts] = useState(4);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const getRandomWord = () => {
        const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        setTargetWord(randomWord);

        const newRevealed = Array(5).fill("");
        const positions = new Set<number>();
        while (positions.size < 2) {
            positions.add(Math.floor(Math.random() * 5));
        }
        positions.forEach(pos => newRevealed[pos] = randomWord[pos]);

        setRevealed(newRevealed);
        setUserInput(Array(5).fill(""));
        setAttempts(4);
        setSelectedIndex(null);
    };

    useEffect(() => {
        getRandomWord();
    }, []);

    const handleBoxClick = (index: number) => {
        if (revealed[index]) return;
        setSelectedIndex(index);
    };

    // Keyboard Input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null || gameOver) return;

            if (e.key === "Backspace") {
                const newInput = [...userInput];
                newInput[selectedIndex] = "";
                setUserInput(newInput);
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                const newInput = [...userInput];
                newInput[selectedIndex] = e.key.toUpperCase();
                setUserInput(newInput);

                let next = selectedIndex + 1;
                while (next < 5 && (revealed[next] || newInput[next])) next++;
                setSelectedIndex(next < 5 ? next : null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndex, userInput, revealed, gameOver]);

    const getFullGuess = () => {
        return Array(5).fill("").map((_, i) => revealed[i] || userInput[i] || "").join("");
    };

    const checkAnswer = () => {
        const fullGuess = getFullGuess();

        if (fullGuess.length !== 5) {
            setMessage("Please fill all boxes!");
            setTimeout(() => setMessage(""), 1500);
            return;
        }

        if (fullGuess === targetWord) {
            setScore(prev => prev + 1);
            setMessage("✅ Correct!");
            setTimeout(() => {
                getRandomWord();
                setMessage("");
            }, 700);
        } else {
            const remaining = attempts - 1;
            setAttempts(remaining);
            setUserInput(Array(5).fill(""));

            if (remaining <= 0) {
                setGameOver(true);
            } else {
                setMessage(`Wrong! ${remaining} attempts left`);
                setTimeout(() => setMessage(""), 1600);
            }
        }
    };

    const restartGame = () => {
        setScore(0);
        setGameOver(false);
        getRandomWord();
    };

    return (
        <>
            <style jsx>{`
                * {
                    box-sizing: border-box;
                }

                .game-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0a0a0f 0%, #000000 100%);
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                }

                .main-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 2rem 1rem;
                }

                /* Header Styles */
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .back-link {
                    color: #9ca3af;
                    text-decoration: none;
                    transition: color 0.2s;
                    font-size: 0.9rem;
                }

                .back-link:hover {
                    color: white;
                }

                .title {
                    font-size: 2rem;
                    font-weight: 900;
                    letter-spacing: -0.025em;
                    background: linear-gradient(135deg, #10b981, #059669);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    margin: 0;
                }

                .score {
                    font-family: monospace;
                    color: #d1d5db;
                    font-size: 0.9rem;
                }

                .score-value {
                    color: #10b981;
                    font-weight: bold;
                    font-size: 1.2rem;
                }

                .game-card {
                    background: rgba(31, 41, 55, 0.5);
                    backdrop-filter: blur(10px);
                    border: 1px solid #374151;
                    border-radius: 1.5rem;
                    padding: 2rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }

                .game-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .game-subtitle {
                    color: #9ca3af;
                    font-size: 0.875rem;
                    margin-bottom: 0.25rem;
                }


                .boxes-container {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }

                .box {
                    width: 80px;
                    height: 90px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: bold;
                    border-radius: 0.75rem;
                    border: 2px solid #374151;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: rgba(31, 41, 55, 0.8);
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .box.revealed {
                    background: linear-gradient(135deg, #064e3b, #022c22);
                    border-color: #10b981;
                    color: #a7f3d0;
                    cursor: default;
                }

                .box.selected {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3));
                    border-color: #10b981;
                    transform: scale(1.05);
                    box-shadow: 0 0 0 2px #10b981, 0 10px 15px -3px rgba(16, 185, 129, 0.3);
                }

                .box:not(.revealed):hover {
                    border-color: #10b981;
                    background: rgba(55, 65, 81, 0.8);
                }

                .attempts-container {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .attempts-label {
                    color: #9ca3af;
                    font-size: 0.875rem;
                    margin-bottom: 0.25rem;
                }

                .attempts-value {
                    color: #f97316;
                    font-weight: bold;
                    font-size: 2.5rem;
                }

                .check-button {
                    width: 100%;
                    background: linear-gradient(135deg, #059669, #047857);
                    color: white;
                    padding: 1rem;
                    border: none;
                    border-radius: 1rem;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);
                }

                .check-button:hover {
                    background: linear-gradient(135deg, #10b981, #059669);
                    transform: scale(1.02);
                }

                .check-button:active {
                    transform: scale(0.98);
                }

                .helper-text {
                    text-align: center;
                    color: #6b7280;
                    margin-top: 1.5rem;
                    font-size: 0.875rem;
                }

                .toast {
                    position: fixed;
                    top: 6rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1f2937;
                    border: 1px solid #4b5563;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.75rem;
                    z-index: 50;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    animation: slideDown 0.3s ease-out;
                    white-space: nowrap;
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 50;
                    padding: 1rem;
                    animation: fadeIn 0.3s ease-out;
                }

                .modal-content {
                    background: linear-gradient(135deg, #1f2937, #111827);
                    border: 1px solid #374151;
                    border-radius: 1.5rem;
                    padding: 2rem;
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                    animation: zoomIn 0.3s ease-out;
                }

                .modal-emoji {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .modal-title {
                    font-size: 2.5rem;
                    font-weight: 900;
                    margin-bottom: 0.75rem;
                    background: linear-gradient(135deg, #f87171, #fb923c);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }

                .modal-score {
                    font-size: 1.5rem;
                    margin-bottom: 2rem;
                    color: #d1d5db;
                }

                .modal-score-value {
                    color: #10b981;
                    font-weight: bold;
                    font-size: 2rem;
                }

                .restart-button {
                    width: 100%;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 1rem;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .restart-button:hover {
                    background: linear-gradient(135deg, #34d399, #10b981);
                    transform: scale(1.02);
                }

                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes zoomIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @media (max-width: 640px) {
                    .main-wrapper {
                        padding: 1rem;
                    }

                    .game-card {
                        padding: 1.5rem;
                    }

                    .box {
                        width: 60px;
                        height: 70px;
                        font-size: 1.8rem;
                    }

                    .boxes-container {
                        gap: 0.75rem;
                    }

                    .title {
                        font-size: 1.5rem;
                    }

                    .header {
                        margin-bottom: 1.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .box {
                        width: 50px;
                        height: 60px;
                        font-size: 1.5rem;
                    }

                    .boxes-container {
                        gap: 0.5rem;
                    }

                    .game-card {
                        padding: 1rem;
                    }

                    .attempts-value {
                        font-size: 2rem;
                    }
                }

                @media (min-width: 1024px) {
                    .main-wrapper {
                        max-width: 700px;
                    }

                    .box {
                        width: 100px;
                        height: 110px;
                        font-size: 3rem;
                    }
                }
            `}</style>

            <div className="game-container">
                <div className="main-wrapper">
                    <div className="header">
                        <Link href="/" className="back-link">
                            ← Back to Home
                        </Link>
                        <h1 className="title">WORDFILL</h1>
                        <div className="score">
                            Score: <span className="score-value">{score}</span>
                        </div>
                    </div>

                    <div className="game-card">
                        <div className="game-header">
                            <p className="game-subtitle">Guess the 5-letter word</p>
                        </div>

                        <div className="boxes-container">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleBoxClick(i)}
                                    className={`box ${revealed[i] ? 'revealed' : ''} ${selectedIndex === i ? 'selected' : ''}`}
                                >
                                    {revealed[i] || userInput[i] || ""}
                                </div>
                            ))}
                        </div>

                        <div className="attempts-container">
                            <p className="attempts-label">Attempts Left</p>
                            <div className="attempts-value">{attempts}</div>
                        </div>

                        <button onClick={checkAnswer} className="check-button">
                            CHECK ANSWER
                        </button>
                    </div>

                    <p className="helper-text">
                         Tap an empty box → Type on keyboard 
                    </p>
                </div>

                {message && (
                    <div className="toast">
                        <span>{message}</span>
                    </div>
                )}

                {gameOver && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-emoji">🎮</div>
                            <h2 className="modal-title">GAME OVER</h2>
                            <p className="modal-score">
                                Final Score: <span className="modal-score-value">{score}</span>
                            </p>
                            <button onClick={restartGame} className="restart-button">
                                Play Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}