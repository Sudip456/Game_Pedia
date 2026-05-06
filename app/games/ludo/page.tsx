'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const TypingGame = () => {
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState<number[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  // Fetch random words
  const fetchRandomText = async () => {
    setIsLoading(true);
    try {
      const num = Math.floor(Math.random() * 30) + 70;
      const res = await fetch(`https://random-word-api.herokuapp.com/word?number=${num}`);
      const words: string[] = await res.json();
      setText(words.join(" "));
    } catch {
      const fallback = "practice makes perfect the quick brown fox jumps over the lazy dog keep typing to improve your speed and accuracy consistency matters more than anything";
      setText(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewGame = useCallback(async () => {
    setUserInput("");
    setCurrentIndex(0);
    setErrors([]);
    setElapsedTime(0);
    setWpm(0);
    setAccuracy(100);
    setTotalKeystrokes(0);
    setIsStarted(false);
    setIsFinished(false);

    await fetchRandomText();

    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Timer - counts UP
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFinished(true);
    calculateResults();
  };

  const calculateResults = () => {
    const minutes = elapsedTime / 60 || 1;
    const wordsTyped = userInput.trim().split(/\s+/).length;
    const calculatedWpm = Math.round(wordsTyped / minutes);
    setWpm(calculatedWpm);

    const acc = currentIndex > 0 
      ? Math.round(((currentIndex - errors.length) / currentIndex) * 100) 
      : 100;
    setAccuracy(acc);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted) {
      setIsStarted(true);
      startTimer();
    }

    const value = e.target.value;
    setUserInput(value);
    setTotalKeystrokes(prev => prev + 1);

    const newIndex = value.length;
    setCurrentIndex(newIndex);

    const newErrors: number[] = [];
    for (let i = 0; i < newIndex; i++) {
      if (value[i] !== text[i]) newErrors.push(i);
    }
    setErrors(newErrors);

    // Auto finish if completed
    if (newIndex >= text.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsFinished(true);
      calculateResults();
    }
  };

  // Auto scroll to current character
  useEffect(() => {
    if (currentCharRef.current && textContainerRef.current) {
      currentCharRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [currentIndex]);

  // Live WPM
  useEffect(() => {
    if (isStarted && !isFinished) {
      const minutes = elapsedTime / 60 || 1;
      const words = userInput.trim().split(/\s+/).length;
      setWpm(Math.round(words / minutes));
    }
  }, [userInput, elapsedTime, isStarted, isFinished]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "text-[19px] md:text-[21px] font-mono transition-all duration-75 ";

      if (index < currentIndex) {
        className += errors.includes(index) 
          ? "text-red-500 bg-red-900/40" 
          : "text-green-500";
      } else if (index === currentIndex) {
        className += "bg-blue-500/30 border-b-2 border-blue-400";
      } else {
        className += "text-gray-400";
      }

      return (
        <span 
          key={index} 
          ref={index === currentIndex ? currentCharRef : null}
          className={className}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Typing Master
          </h1>
          <p className="text-gray-400">Random words • Unlimited time</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-400">{elapsedTime}</div>
            <div className="text-xs text-gray-500">SECONDS</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">{wpm}</div>
            <div className="text-xs text-gray-500">WPM</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400">{accuracy}%</div>
            <div className="text-xs text-gray-500">ACCURACY</div>
          </div>
        </div>

        {/* Text Display Box - Fixed Height + Scroll */}
        <div 
          ref={textContainerRef}
          className="bg-gray-900 rounded-2xl p-8 md:p-10 mb-8 border border-gray-800 h-[260px] overflow-auto leading-relaxed tracking-wide"
        >
          {isLoading ? (
            <div className="text-gray-400 text-center py-20">Loading fresh words...</div>
          ) : (
            <div className="min-h-full">
              {renderText()}
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInput}
          disabled={isFinished || isLoading}
          className="w-full bg-transparent border-2 border-gray-700 focus:border-blue-500 rounded-xl px-6 py-5 text-lg md:text-xl outline-none"
          placeholder="Start typing here..."
          autoComplete="off"
          spellCheck="false"
        />

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={startNewGame}
            disabled={isLoading}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "New Random Text"}
          </button>

          {isStarted && !isFinished && (
            <button
              onClick={stopTest}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
            >
              Stop Test
            </button>
          )}

          {isFinished && (
            <button
              onClick={startNewGame}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium"
            >
              Try Again
            </button>
          )}
        </div>

        {/* Results */}
        {isFinished && (
          <div className="mt-10 bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Test Complete!</h2>
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              <div>
                <div className="text-4xl font-bold text-green-400">{wpm}</div>
                <div className="text-gray-400">WPM</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400">{accuracy}%</div>
                <div className="text-gray-400">Accuracy</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">{elapsedTime}s</div>
                <div className="text-gray-400">Time</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingGame;