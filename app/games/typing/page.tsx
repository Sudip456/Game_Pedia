'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const TypingGame = () => {
  const router = useRouter();
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRandomText = async () => {
    setIsLoading(true);
    setApiError(false);
    
    try {
      const response = await fetch('https://api.quotable.io/random?minLength=100&maxLength=300');
      
      if (response.ok) {
        const data = await response.json();
        setText(data.content);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log("First API failed, trying second...");
    }
    
    try {
      const response2 = await fetch('https://baconipsum.com/api/?type=all-meat&sentences=5&format=json');
      
      if (response2.ok) {
        const data = await response2.json();
        setText(data.join(' '));
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log("Second API failed, trying third...");
    }
    
    try {
      const response3 = await fetch('https://dog.ceo/api/breeds/list/all');
      
      if (response3.ok) {
        const data = await response3.json();
        const breeds = Object.keys(data.message);
        const randomBreeds = breeds.slice(0, 20).join(', ');
        setText(`Here are some dog breeds: ${randomBreeds}. Practice typing these breed names to improve your speed and accuracy. Keep going and you'll get better every day!`);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log("All APIs failed, using fallback");
    }
    
    const fallbackSentences = [
      "The quick brown fox jumps over the lazy dog near the river bank on a beautiful sunny morning while birds are singing",
      "Technology has completely transformed the way we communicate and interact with each other in modern society",
      "Artificial intelligence and machine learning are revolutionizing industries across the entire world",
      "Practice makes perfect when learning to type quickly and accurately without making any mistakes",
      "The future of computing lies in quantum processors and neural networks working together seamlessly"
    ];
    const randomFallback = fallbackSentences[Math.floor(Math.random() * fallbackSentences.length)];
    setText(randomFallback);
    setApiError(true);
    setIsLoading(false);
  };

  const startNewGame = useCallback(async () => {
    setUserInput("");
    setElapsedTime(0);
    setWpm(0);
    setAccuracy(100);
    setIsStarted(false);
    setIsFinished(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    await fetchRandomText();

    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

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

    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) {
        correctChars++;
      }
    }
    const acc = userInput.length > 0 
      ? Math.round((correctChars / userInput.length) * 100) 
      : 100;
    setAccuracy(acc);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!isStarted && !isFinished && value.length > 0) {
      setIsStarted(true);
      startTimer();
    }

    setUserInput(value);

    if (value.length >= text.length && text.length > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsFinished(true);
      calculateResults();
    }
  };

  useEffect(() => {
    if (isStarted && !isFinished && elapsedTime > 0) {
      const minutes = elapsedTime / 60;
      const words = userInput.trim().split(/\s+/).filter(w => w.length > 0).length;
      const calculatedWpm = Math.round(words / minutes);
      setWpm(calculatedWpm || 0);
      
      let correctChars = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === text[i]) {
          correctChars++;
        }
      }
      const acc = userInput.length > 0 
        ? Math.round((correctChars / userInput.length) * 100) 
        : 100;
      setAccuracy(acc);
    }
  }, [userInput, elapsedTime, isStarted, isFinished, text]);

  useEffect(() => {
    fetchRandomText();
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, []);

  useEffect(() => {
    if (textContainerRef.current && userInput.length < text.length) {
      const currentCharElement = document.getElementById(`char-${userInput.length}`);
      if (currentCharElement) {
        currentCharElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center"
        });
      }
    }
  }, [userInput, text]);

  const renderText = () => {
    if (!text) return null;
    
    return text.split("").map((char, index) => {
      let color = "#6b7280"; 
      let bgColor = "transparent";
      let borderBottom = "none";
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          color = "#10b981"; 
          bgColor = "rgba(16, 185, 129, 0.1)";
        } else {
          color = "#ef4444"; 
          bgColor = "rgba(239, 68, 68, 0.15)";
        }
      } else if (index === userInput.length) {
        color = "#60a5fa";
        bgColor = "rgba(96, 165, 250, 0.2)";
        borderBottom = "2px solid #60a5fa";
      }
      
      return (
        <span
          key={index}
          id={`char-${index}`}
          style={{
            display: "inline-block",
            color: color,
            backgroundColor: bgColor,
            borderBottom: borderBottom,
            padding: "2px 0",
            margin: "0 1px",
            borderRadius: "4px",
            transition: "all 0.1s ease",
            fontSize: "inherit",
            fontFamily: "inherit"
          }}
        >
          {char === " " ? "\u00A0\u00A0" : char}
        </span>
      );
    });
  };

  return (
    <div className="typing-game">
      <div className="game-container">
        <div className="top-bar">
          <button onClick={() => router.back()} className="back-btn">
            ← Back
          </button>
          <button onClick={startNewGame} className="refresh-btn" disabled={isLoading}>
            {isLoading ? "Loading..." : " New Texts"}
          </button>
        </div>

        <div className="game-header">
          <h1 className="game-title">
             Typing Master
          </h1>
          <p className="game-subtitle">
            <span style={{ color: "#10b981" }}>Green</span> = Correct | 
            <span style={{ color: "#ef4444" }}> Red</span> = Wrong |
            <span style={{ color: "#60a5fa" }}> Blue</span> = Next to type
          </p>
          {apiError && (
            <p style={{ color: "#f59e0b", fontSize: "0.75rem", marginTop: "0.5rem" }}>
              ⚡ Using fast local mode (API issue)
            </p>
          )}
        </div>

        <div className="stats-panel">
          <div className="stat-card">
            <div className="stat-value">{elapsedTime}</div>
            <div className="stat-label">SECONDS</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{wpm}</div>
            <div className="stat-label">WPM</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">ACCURACY</div>
          </div>
        </div>

        <div className="text-display" ref={textContainerRef}>
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              Loading fresh text...
            </div>
          ) : (
            <div className="text-content">
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
          className="game-input"
          placeholder="Start typing here to see colors change..."
          autoComplete="off"
          spellCheck="false"
        />

        <div className="button-group">
          {isStarted && !isFinished && (
            <button onClick={stopTest} className="btn btn-danger">
              Stop Test
            </button>
          )}

          {isFinished && (
            <button onClick={startNewGame} className="btn btn-primary">
              Try Again
            </button>
          )}
        </div>

        {/* Results Card */}
        {isFinished && (
          <div className="results-card">
            <h2 className="results-title">🎉 Test Complete! 🎉</h2>
            <div className="results-grid">
              <div className="result-item">
                <div className="result-value">{wpm}</div>
                <div className="result-label">WPM</div>
              </div>
              <div className="result-item">
                <div className="result-value">{accuracy}%</div>
                <div className="result-label">Accuracy</div>
              </div>
              <div className="result-item">
                <div className="result-value">{elapsedTime}s</div>
                <div className="result-label">Time</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .typing-game {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 100%);
          padding: 1rem;
        }

        .game-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }

        /* Top Bar with Back Button */
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .back-btn {
          background: rgba(55, 65, 81, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(96, 165, 250, 0.3);
          padding: 0.6rem 1.2rem;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .back-btn:hover {
          background: rgba(96, 165, 250, 0.2);
          border-color: #60a5fa;
          transform: translateX(-3px);
        }

        .refresh-btn {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .refresh-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .game-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .game-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .game-subtitle {
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .stats-panel {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .stat-card {
          text-align: center;
          background: rgba(17, 24, 39, 0.6);
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(55, 65, 81, 0.5);
          min-width: 100px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #60a5fa;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #6b7280;
          letter-spacing: 0.05em;
        }

        .text-display {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(55, 65, 81, 0.5);
          height: 250px;
          overflow-y: auto;
          overflow-x: auto;
        }

        @media (min-width: 768px) {
          .text-display {
            height: 300px;
            padding: 2rem;
          }
        }

        .text-content {
          font-family: 'Courier New', 'Fira Code', monospace;
          font-size: 1.25rem;
          line-height: 1.8;
          letter-spacing: 0.02em;
          white-space: pre-wrap;
          word-break: break-all;
        }

        @media (min-width: 640px) {
          .text-content {
            font-size: 1.375rem;
          }
        }

        @media (min-width: 1024px) {
          .text-content {
            font-size: 1.5rem;
          }
        }

        .loading-state {
          text-align: center;
          color: #6b7280;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(96, 165, 250, 0.3);
          border-top-color: #60a5fa;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .game-input {
          width: 100%;
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(10px);
          border: 2px solid #374151;
          border-radius: 1rem;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          color: #f3f4f6;
          outline: none;
          transition: all 0.2s ease;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .game-input {
            font-size: 1.125rem;
            padding: 1.25rem 1.75rem;
          }
        }

        .game-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
        }

        .game-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-group {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          outline: none;
        }

        @media (min-width: 640px) {
          .btn {
            padding: 0.875rem 2rem;
            font-size: 1rem;
          }
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
        }

        .btn-danger {
          background: #dc2626;
          color: white;
        }

        .btn-danger:hover {
          background: #b91c1c;
          transform: translateY(-2px);
        }

        .results-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(96, 165, 250, 0.3);
          border-radius: 1.5rem;
          padding: 1.5rem;
          text-align: center;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .results-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          color: #f3f4f6;
        }

        @media (min-width: 768px) {
          .results-title {
            font-size: 2rem;
          }
        }

        .results-grid {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .result-item {
          text-align: center;
        }

        .result-value {
          font-size: 2rem;
          font-weight: bold;
          color: #60a5fa;
        }

        @media (min-width: 768px) {
          .result-value {
            font-size: 2.5rem;
          }
        }

        .result-label {
          font-size: 0.75rem;
          color: #9ca3af;
          letter-spacing: 0.05em;
        }

        .text-display::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .text-display::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 4px;
        }

        .text-display::-webkit-scrollbar-thumb {
          background: #60a5fa;
          border-radius: 4px;
        }

        @media (max-width: 640px) {
          .stats-panel {
            gap: 1rem;
          }
          
          .stat-card {
            padding: 0.75rem 1rem;
            min-width: 80px;
          }
          
          .stat-value {
            font-size: 1.5rem;
          }
          
          .top-bar {
            margin-bottom: 1rem;
          }
          
          .back-btn, .refresh-btn {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }
          
          .text-content {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TypingGame;