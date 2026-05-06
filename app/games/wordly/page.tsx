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
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-12">
            <div className="max-w-md mx-auto pt-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="text-[#475569] hover:text-white">← Back</Link>
                    <h1 className="text-4xl font-black tracking-tighter text-emerald-400">WORDFILL</h1>
                    <div className="font-mono">Score: <span className="text-emerald-400">{score}</span></div>
                </div>

                <div className="bg-[#12121a] border border-[#1e1e2e] rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <p className="text-[#64748b] text-sm mb-1">Guess the 5-letter word</p>
                        <p className="text-3xl font-mono tracking-[6px] text-transparent">-----</p>
                    </div>

                    {/* Word Boxes */}
                    <div className="flex gap-4 justify-center mb-10">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                onClick={() => handleBoxClick(i)}
                                className={`w-16 h-20 flex items-center justify-center text-5xl font-bold rounded-2xl border-2 cursor-pointer transition-all active:scale-95
                                    ${revealed[i] 
                                        ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300' 
                                        : selectedIndex === i 
                                            ? 'bg-[#1e3a2f] border-emerald-400 scale-110 ring-2 ring-emerald-400' 
                                        : 'bg-[#1a1a1f] border-[#334155] hover:border-[#64748b]'
                                    }`}
                            >
                                {revealed[i] || userInput[i] || ""}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mb-8">
                        Attempts Left: <span className="text-orange-400 font-bold text-3xl">{attempts}</span>
                    </div>

                    <button
                        onClick={checkAnswer}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl text-lg font-bold transition active:scale-95"
                    >
                        CHECK ANSWER
                    </button>
                </div>

                <p className="text-center text-[#475569] mt-6 text-sm">
                    Tap empty box → Type on keyboard
                </p>
            </div>

            {/* Toast */}
            {message && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#1f1f2b] border border-[#334155] px-8 py-4 rounded-2xl z-50 shadow-2xl">
                    {message}
                </div>
            )}

            {/* Game Over */}
            {gameOver && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-3xl p-10 w-full max-w-sm text-center">
                        <div className="text-6xl mb-4">😔</div>
                        <h2 className="text-4xl font-black mb-3">GAME OVER</h2>
                        <p className="text-2xl mb-8">Final Score: <span className="text-emerald-400">{score}</span></p>
                        <button
                            onClick={restartGame}
                            className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-gray-100"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}