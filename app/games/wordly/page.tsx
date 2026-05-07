'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// 300+ 5-Letter Words
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
    "LUNAR", "METAL", "TRUTH", "BRIGHT", "CLEAR", "FIELD", "GRASS", "ANGEL", "ARROW", "BERRY",
    "BLAST", "BLESS", "BLOOM", "BLUSH", "BOOST", "BRING", "BROWN", "BURST", "CARRY", "CHASE",
    "CHEST", "CHILL", "CLEAN", "CLIMB", "CLOSE", "COAST", "COULD", "COUNT", "COVER", "CRAFT",
    "CRASH", "CRAZY", "CROSS", "CROWD", "CROWN", "CRUSH", "CURVE", "CYCLE", "DAILY", "DROVE",
    "EARLY", "EIGHT", "EMPTY", "ENTER", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT", "EXIST",
    "EXTRA", "FAITH", "FALSE", "FAULT", "FIGHT", "FINAL", "FIRST", "FLOAT", "FLOOD", "FLOOR",
    "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH",
    "FRONT", "FRUIT", "FULLY", "FUNNY", "GIVEN", "GLASS", "GLOBE", "GOING", "GRACE", "GRADE",
    "GRAND", "GRANT", "GRAVE", "GREAT", "GREEN", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS",
    "GUEST", "GUIDE", "HEAVY", "HENCE", "HORSE", "HOTEL", "HUMAN", "IMPLY", "INDEX", "INNER",
    "ISSUE", "JOINT", "JUDGE", "KNOWN", "LABEL", "LARGE", "LASER", "LAUGH", "LAYER", "LEARN",
    "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LEWIS", "LIMIT", "LINKS", "LIVES", "LOCAL",
    "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYING", "MAJOR", "MANGO", "MATCH", "MAYBE",
    "MINOR", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUSE", "MOUTH", "MOVED", "MOVIE", "NEEDS",
    "NEVER", "NEWLY", "NOISE", "NORTH", "NOTED", "NUMBER", "OCCUR", "OFFER", "OFTEN", "ORDER",
    "OTHER", "OUGHT", "OUTER", "OWNED", "OWNER", "PAINT", "PANEL", "PAPER", "PARIS", "PARTY",
    "PHASE", "PHONE", "PHOTO", "PIECE", "PILOT", "PITCH", "PLACE", "PLAIN", "PLANE", "PLANT",
    "PLATE", "PLAZA", "POINT", "POUND", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR",
    "PRIZE", "PROOF", "PROVE", "RADIO", "RAISE", "RANGE", "RATIO", "REACH", "READY", "REALM"
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
    const [isMobile, setIsMobile] = useState(false);

    const hiddenInputRef = useRef<HTMLInputElement>(null);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(
                /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                window.innerWidth <= 768
            );
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
        
        // Focus hidden input on new game for mobile
        setTimeout(() => {
            if (hiddenInputRef.current && isMobile) {
                hiddenInputRef.current.focus();
            }
        }, 100);
    };

    useEffect(() => {
        getRandomWord();
    }, []);

    const handleBoxClick = (index: number) => {
        if (revealed[index] || gameOver) return;
        setSelectedIndex(index);
        // Focus the hidden input to keep keyboard open
        if (hiddenInputRef.current) {
            hiddenInputRef.current.focus();
        }
    };

    // Handle input from hidden input field (works for both mobile and desktop)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (selectedIndex === null || gameOver) {
            if (hiddenInputRef.current) hiddenInputRef.current.value = "";
            return;
        }
        if (revealed[selectedIndex]) return;

        if (value.length > 0) {
            const lastChar = value.slice(-1).toUpperCase();
            if (/^[A-Z]$/.test(lastChar)) {
                const newInput = [...userInput];
                newInput[selectedIndex] = lastChar;
                setUserInput(newInput);
                
                // Auto move to next empty box
                let next = selectedIndex + 1;
                while (next < 5 && (revealed[next] || newInput[next])) next++;
                if (next < 5) {
                    setSelectedIndex(next);
                } else {
                    setSelectedIndex(null);
                }
            }
            // Clear the input field after processing
            if (hiddenInputRef.current) hiddenInputRef.current.value = "";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (selectedIndex === null || gameOver) return;
        if (revealed[selectedIndex]) return;

        if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            const newInput = [...userInput];
            newInput[selectedIndex] = "";
            setUserInput(newInput);
            
            // Move to previous box
            let prev = selectedIndex - 1;
            while (prev >= 0 && (revealed[prev] || userInput[prev])) prev--;
            if (prev >= 0) {
                setSelectedIndex(prev);
            }
        }
    };

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
            setSelectedIndex(null);

            if (remaining <= 0) {
                setGameOver(true);
            } else {
                setMessage(`Wrong! ${remaining} attempts left`);
                setTimeout(() => setMessage(""), 1600);
            }
        }
        
        // Keep focus on hidden input
        setTimeout(() => {
            if (hiddenInputRef.current && !gameOver) {
                hiddenInputRef.current.focus();
            }
        }, 50);
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
                    position: relative;
                }

                .main-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 2rem 1rem;
                }

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
                    user-select: none;
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

                .box:not(.revealed):active {
                    transform: scale(0.96);
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

                .check-button:active {
                    transform: scale(0.98);
                }

                .helper-text {
                    text-align: center;
                    color: #6b7280;
                    margin-top: 1.5rem;
                    font-size: 0.875rem;
                }

                /* Hidden input - always present, never moves */
                .hidden-input {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 1px;
                    height: 1px;
                    opacity: 0;
                    pointer-events: none;
                    z-index: -1;
                }

                /* Make hidden input focusable but invisible for mobile */
                .hidden-input:focus {
                    outline: none;
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

                .restart-button:active {
                    transform: scale(0.98);
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
            `}</style>

            <div className="game-container">
                {/* Permanent hidden input - never removed, always ready */}
                <input
                    ref={hiddenInputRef}
                    type="text"
                    className="hidden-input"
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    spellCheck="false"
                    inputMode="text"
                />

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
                        {isMobile 
                            ? "📱 Tap any empty box → Type on keyboard" 
                            : "💻 Click an empty box → Type on keyboard"}
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