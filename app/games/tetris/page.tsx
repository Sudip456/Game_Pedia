'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';

// Tetris shapes
const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#06b6d4'
  },
  O: {
    shape: [[1, 1], [1, 1]],
    color: '#fbbf24'
  },
  T: {
    shape: [[0, 1, 0], [1, 1, 1]],
    color: '#a855f7'
  },
  S: {
    shape: [[0, 1, 1], [1, 1, 0]],
    color: '#10b981'
  },
  Z: {
    shape: [[1, 1, 0], [0, 1, 1]],
    color: '#ef4444'
  },
  L: {
    shape: [[1, 0, 0], [1, 1, 1]],
    color: '#f97316'
  },
  J: {
    shape: [[0, 0, 1], [1, 1, 1]],
    color: '#3b82f6'
  }
};

const SHAPES = Object.values(TETROMINOS);
const COLORS = Object.values(TETROMINOS).map(t => t.color);

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;
const TICK_SPEED = 500;

type Position = {
  x: number;
  y: number;
};

type Piece = {
  shape: number[][];
  color: string;
};

const Tetris: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<number[][]>([]);
  const [currentColor, setCurrentColor] = useState<string>('');
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [nextPiece, setNextPiece] = useState<number[][]>([]);
  const [nextColor, setNextColor] = useState<string>('');
  const [highScore, setHighScore] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isGameActive = useRef(false);
  const touchStartTime = useRef<number>(0);

  // Check if device is mobile
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

  // Initialize board
  const initBoard = useCallback((): number[][] => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  }, []);

  // Get random piece
  const getRandomPiece = useCallback((): Piece => {
    const idx = Math.floor(Math.random() * SHAPES.length);
    const tetromino = SHAPES[idx];
    return {
      shape: tetromino.shape.map(row => [...row]),
      color: COLORS[idx]
    };
  }, []);

  // Spawn new piece
  const spawnNewPiece = useCallback(() => {
    if (!nextPiece.length) {
      const { shape, color } = getRandomPiece();
      setCurrentPiece(shape);
      setCurrentColor(color);
      setCurrentPosition({ x: Math.floor((BOARD_WIDTH - shape[0].length) / 2), y: 0 });
      
      const next = getRandomPiece();
      setNextPiece(next.shape);
      setNextColor(next.color);
    } else {
      setCurrentPiece(nextPiece);
      setCurrentColor(nextColor);
      setCurrentPosition({ x: Math.floor((BOARD_WIDTH - nextPiece[0].length) / 2), y: 0 });
      
      const next = getRandomPiece();
      setNextPiece(next.shape);
      setNextColor(next.color);
    }
  }, [nextPiece, nextColor, getRandomPiece]);

  // Check collision
  const checkCollision = useCallback((piece: number[][], pos: Position): boolean => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[0].length; x++) {
        if (piece[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || newY < 0) {
            return true;
          }
          if (newY >= 0 && board[newY]?.[newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, [board]);

  // Merge piece to board
  const mergePiece = useCallback((): number[][] => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[0].length; x++) {
        if (currentPiece[y][x]) {
          const boardY = currentPosition.y + y;
          const boardX = currentPosition.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = COLORS.indexOf(currentColor) + 1;
          }
        }
      }
    }
    
    return newBoard;
  }, [board, currentPiece, currentPosition, currentColor]);

  // Clear lines and calculate score
  const clearLines = useCallback((newBoard: number[][]): { board: number[][]; linesCleared: number } => {
    let linesCleared = 0;
    const clearedBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    
    for (let i = 0; i < linesCleared; i++) {
      clearedBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    if (linesCleared > 0) {
      const points = [0, 40, 100, 300, 1200];
      const newScore = score + points[linesCleared] * (level + 1);
      setScore(newScore);
      setLines(prev => prev + linesCleared);
      
      const newLines = lines + linesCleared;
      const newLevel = Math.floor(newLines / 10);
      if (newLevel > level) {
        setLevel(newLevel);
      }
      
      if (newScore > highScore) {
        setHighScore(newScore);
        if (typeof window !== 'undefined') {
          localStorage.setItem('tetrisHighScore', newScore.toString());
        }
      }
    }
    
    return { board: clearedBoard, linesCleared };
  }, [score, level, lines, highScore]);

  // Move piece
  const movePiece = useCallback((dx: number, dy: number): boolean => {
    if (gameOver || isPaused) return false;
    
    const newPos = { x: currentPosition.x + dx, y: currentPosition.y + dy };
    if (!checkCollision(currentPiece, newPos)) {
      setCurrentPosition(newPos);
      return true;
    }
    
    if (dy === 1) {
      const newBoard = mergePiece();
      const { board: clearedBoard } = clearLines(newBoard);
      setBoard(clearedBoard);
      spawnNewPiece();
      
      if (checkCollision(currentPiece, currentPosition)) {
        setGameOver(true);
        isGameActive.current = false;
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      }
    }
    return false;
  }, [currentPiece, currentPosition, gameOver, isPaused, checkCollision, mergePiece, clearLines, spawnNewPiece]);

  // Rotate piece
  const rotatePiece = useCallback((): void => {
    if (gameOver || isPaused) return;
    
    const rotated = currentPiece[0].map((_, idx) => 
      currentPiece.map(row => row[idx]).reverse()
    );
    
    if (!checkCollision(rotated, currentPosition)) {
      setCurrentPiece(rotated);
    } else {
      for (const dx of [-1, 1, -2, 2]) {
        const newPos = { x: currentPosition.x + dx, y: currentPosition.y };
        if (!checkCollision(rotated, newPos)) {
          setCurrentPiece(rotated);
          setCurrentPosition(newPos);
          break;
        }
      }
    }
  }, [currentPiece, currentPosition, gameOver, isPaused, checkCollision]);

  // Hard drop
  const hardDrop = useCallback((): void => {
    if (gameOver || isPaused) return;
    
    while (movePiece(0, 1)) {
      // Keep moving down until collision
    }
  }, [movePiece, gameOver, isPaused]);

  // Game tick
  const gameTick = useCallback((): void => {
    if (!gameOver && !isPaused) {
      movePiece(0, 1);
    }
  }, [movePiece, gameOver, isPaused]);

  // Keyboard controls (for desktop)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (gameOver) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotatePiece();
          break;
        case ' ':
        case 'Space':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePiece, hardDrop, gameOver]);

  // Game loop
  useEffect(() => {
    if (gameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }
    
    if (!isPaused) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      const speed = Math.max(100, TICK_SPEED - (level * 30));
      gameLoopRef.current = setInterval(gameTick, speed);
    }
    
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameTick, level, isPaused, gameOver]);

  // Start new game
  const startNewGame = useCallback((): void => {
    setBoard(initBoard());
    setScore(0);
    setLines(0);
    setLevel(0);
    setGameOver(false);
    setIsPaused(false);
    setCurrentPosition({ x: 3, y: 0 });
    
    const firstPiece = getRandomPiece();
    setCurrentPiece(firstPiece.shape);
    setCurrentColor(firstPiece.color);
    
    const next = getRandomPiece();
    setNextPiece(next.shape);
    setNextColor(next.color);
    
    if (typeof window !== 'undefined') {
      const savedHighScore = localStorage.getItem('tetrisHighScore');
      if (savedHighScore) setHighScore(parseInt(savedHighScore));
    }
  }, [initBoard, getRandomPiece]);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Render board with current piece
  const renderBoard = (): number[][] => {
    const displayBoard = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[0].length; x++) {
        if (currentPiece[y][x]) {
          const boardY = currentPosition.y + y;
          const boardX = currentPosition.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = COLORS.indexOf(currentColor) + 1;
          }
        }
      }
    }
    
    return displayBoard;
  };

  const displayBoard = renderBoard();

  // Handle touch for hard drop (long press)
  const handleTouchStart = (e: React.TouchEvent, action: () => void, isLongPress?: boolean) => {
    if (isLongPress) {
      touchStartTime.current = Date.now();
    } else {
      e.preventDefault();
      action();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, action: () => void) => {
    const duration = Date.now() - touchStartTime.current;
    if (duration > 300) {
      action(); // Hard drop on long press
    }
    touchStartTime.current = 0;
  };

  return (
    <>
      <style jsx>{`
        .tetris-page {
          min-height: 100vh;
          background: #0a0a0f;
          color: white;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }

        .tetris-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1rem 2rem;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .back-link {
          color: #475569;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
          font-size: 0.9rem;
        }

        .back-link:hover {
          color: white;
        }

        .game-title {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, #a855f7, #d946ef);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        @media (min-width: 768px) {
          .game-title {
            font-size: 2.5rem;
          }
        }

        .stats-group {
          display: flex;
          gap: 0.75rem;
        }

        .stat-card {
          background: #12121a;
          border: 1px solid #1e1e2e;
          border-radius: 0.75rem;
          padding: 0.5rem 1rem;
        }

        .stat-label {
          color: #64748b;
          font-size: 0.75rem;
        }

        .stat-value {
          font-family: monospace;
          font-size: 1.25rem;
          font-weight: bold;
          margin-left: 0.5rem;
        }

        .score-value {
          color: #a855f7;
        }

        .high-value {
          color: #fbbf24;
        }

        .game-area {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .board-container {
          background: #12121a;
          border: 1px solid #1e1e2e;
          border-radius: 1.5rem;
          padding: 1.25rem;
        }

        .board-grid {
          display: grid;
          gap: 1px;
          background: #1e1e2e;
          padding: 1px;
          margin: 0 auto;
        }

        .cell {
          width: 30px;
          height: 30px;
          transition: all 0.075s ease;
        }

        @media (max-width: 640px) {
          .cell {
            width: 25px;
            height: 25px;
          }
        }

        @media (max-width: 480px) {
          .cell {
            width: 22px;
            height: 22px;
          }
        }

        /* Mobile Arrow Controls - Just 4 buttons */
        .mobile-controls {
          margin-top: 1rem;
          display: ${isMobile ? 'flex' : 'none'};
          justify-content: center;
          gap: 1rem;
        }

        .arrow-btn {
          background: linear-gradient(135deg, #1e1e2e, #12121a);
          border: 2px solid #2a2a35;
          border-radius: 1rem;
          padding: 1rem 1.5rem;
          font-size: 2rem;
          font-weight: bold;
          color: white;
          cursor: pointer;
          transition: all 0.05s linear;
          user-select: none;
          touch-action: manipulation;
          min-width: 80px;
        }

        .arrow-btn:active {
          transform: scale(0.92);
          background: linear-gradient(135deg, #2a2a35, #1e1e2e);
        }

        .up-btn {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border-color: #8b5cf6;
        }

        @media (max-width: 480px) {
          .arrow-btn {
            padding: 0.75rem 1rem;
            font-size: 1.5rem;
            min-width: 65px;
          }
        }

        .info-panel {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .next-piece-card {
          background: #12121a;
          border: 1px solid #1e1e2e;
          border-radius: 1rem;
          padding: 1.25rem;
          min-width: 160px;
        }

        .next-piece-title {
          color: #64748b;
          font-size: 0.75rem;
          text-align: center;
          margin-bottom: 1rem;
          letter-spacing: 0.5px;
        }

        .next-piece-preview {
          display: flex;
          justify-content: center;
        }

        .next-grid {
          display: grid;
          gap: 1px;
          background: #1e1e2e;
          padding: 1px;
        }

        .next-cell {
          width: 30px;
          height: 30px;
        }

        @media (max-width: 640px) {
          .next-cell {
            width: 25px;
            height: 25px;
          }
        }

        @media (max-width: 480px) {
          .next-cell {
            width: 22px;
            height: 22px;
          }
        }

        .stats-card {
          background: #12121a;
          border: 1px solid #1e1e2e;
          border-radius: 1rem;
          padding: 1.25rem;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .stat-row:last-child {
          margin-bottom: 0;
        }

        .stat-name {
          color: #64748b;
        }

        .stat-number {
          font-family: monospace;
          color: #a855f7;
          font-size: 1.25rem;
          font-weight: bold;
        }

        .controls-card {
          background: #12121a;
          border: 1px solid #1e1e2e;
          border-radius: 1rem;
          padding: 1.25rem;
        }

        .controls-title {
          color: #64748b;
          font-size: 0.75rem;
          margin-bottom: 0.75rem;
          letter-spacing: 0.5px;
        }

        .control-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .control-key {
          font-family: monospace;
          font-weight: 600;
        }

        .control-desc {
          color: #475569;
        }

        .buttons-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .pause-badge {
          background: rgba(234, 179, 8, 0.1);
          color: #fbbf24;
          text-align: center;
          padding: 0.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .btn-pause {
          background: #1e1e2e;
          color: white;
        }

        .btn-pause:hover {
          background: #2a2a35;
          transform: scale(1.02);
        }

        .btn-new {
          background: #7c3aed;
          color: white;
        }

        .btn-new:hover {
          background: #8b5cf6;
          transform: scale(1.02);
        }

        .btn:active {
          transform: scale(0.98);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: #12121a;
          border: 1px solid #1e1e2e;
          border-radius: 1.5rem;
          padding: 2rem;
          width: 90%;
          max-width: 400px;
          text-align: center;
          animation: zoomIn 0.3s ease;
        }

        .modal-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .modal-title {
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 0.75rem;
        }

        .modal-score {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .modal-score span {
          color: #a855f7;
        }

        .modal-lines {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 2rem;
        }

        .modal-btn {
          background: #7c3aed;
          color: white;
          padding: 1rem;
          border-radius: 1rem;
          font-weight: bold;
          font-size: 1rem;
          width: 100%;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-btn:hover {
          background: #8b5cf6;
          transform: scale(1.02);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
      `}</style>

      <div className="tetris-page">
        <div className="tetris-wrapper">
          <div className="game-header">
            <Link href="/" className="back-link">
              ← Back
            </Link>
            <h1 className="game-title">TETRIS</h1>
            <div className="stats-group">
              <div className="stat-card">
                <span className="stat-label">🎯 SCORE</span>
                <span className="stat-value score-value">{score}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">🏆 HIGH</span>
                <span className="stat-value high-value">{highScore}</span>
              </div>
            </div>
          </div>

          <div className="game-area">
            <div className="board-container">
              <div 
                className="board-grid"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
                  width: 'fit-content'
                }}
              >
                {displayBoard.map((row, i) => (
                  row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="cell"
                      style={{
                        backgroundColor: cell ? COLORS[cell - 1] : '#1a1a1f',
                        boxShadow: cell ? 'inset 0 0 8px rgba(255,255,255,0.15)' : 'none'
                      }}
                    />
                  ))
                ))}
              </div>

              {/* Mobile Controls - Just 4 Arrow Buttons */}
              <div className="mobile-controls">
                <button 
                  className="arrow-btn"
                  onClick={() => movePiece(-1, 0)}
                  onTouchStart={(e) => { e.preventDefault(); movePiece(-1, 0); }}
                >
                  ←
                </button>
                <button 
                  className="arrow-btn"
                  onClick={() => movePiece(0, 1)}
                  onTouchStart={(e) => { e.preventDefault(); movePiece(0, 1); }}
                >
                  ↓
                </button>
                <button 
                  className="arrow-btn"
                  onClick={() => movePiece(1, 0)}
                  onTouchStart={(e) => { e.preventDefault(); movePiece(1, 0); }}
                >
                  →
                </button>
                <button 
                  className="arrow-btn up-btn"
                  onClick={() => rotatePiece()}
                  onTouchStart={(e) => { e.preventDefault(); rotatePiece(); }}
                >
                  ↑
                </button>
              </div>
            </div>

            <div className="info-panel">
              <div className="next-piece-card">
                <div className="next-piece-title">NEXT PIECE</div>
                <div className="next-piece-preview">
                  <div 
                    className="next-grid"
                    style={{
                      gridTemplateColumns: `repeat(${nextPiece[0]?.length || 2}, minmax(0, 1fr))`,
                      width: 'fit-content'
                    }}
                  >
                    {nextPiece.map((row, i) => (
                      row.map((cell, j) => (
                        <div
                          key={`next-${i}-${j}`}
                          className="next-cell"
                          style={{
                            backgroundColor: cell ? nextColor : 'transparent',
                            boxShadow: cell ? 'inset 0 0 8px rgba(255,255,255,0.15)' : 'none'
                          }}
                        />
                      ))
                    ))}
                  </div>
                </div>
              </div>

              <div className="stats-card">
                <div className="stat-row">
                  <span className="stat-name">Lines</span>
                  <span className="stat-number">{lines}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Level</span>
                  <span className="stat-number">{level}</span>
                </div>
              </div>

              <div className="controls-card">
                <div className="controls-title">CONTROLS</div>
                <div className="control-row">
                  <span className="control-key">← →</span>
                  <span className="control-desc">Move</span>
                </div>
                <div className="control-row">
                  <span className="control-key">↓</span>
                  <span className="control-desc">Soft Drop</span>
                </div>
                <div className="control-row">
                  <span className="control-key">↑</span>
                  <span className="control-desc">Rotate</span>
                </div>
                <div className="control-row">
                  <span className="control-key">Space</span>
                  <span className="control-desc">Hard Drop</span>
                </div>
                <div className="control-row">
                  <span className="control-key">P</span>
                  <span className="control-desc">Pause</span>
                </div>
              </div>

              <div className="buttons-group">
                {isPaused && !gameOver && (
                  <div className="pause-badge"> PAUSED</div>
                )}
                <button
                  onClick={() => setIsPaused(prev => !prev)}
                  className="btn btn-pause"
                >
                  {isPaused ? ' RESUME' : ' PAUSE'}
                </button>
                <button
                  onClick={startNewGame}
                  className="btn btn-new"
                >
                   NEW GAME
                </button>
              </div>
            </div>
          </div>
        </div>

        {gameOver && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-icon">💀</div>
              <h2 className="modal-title">GAME OVER</h2>
              <p className="modal-score">
                Final Score: <span>{score}</span>
              </p>
              <p className="modal-lines">Lines cleared: {lines}</p>
              <button onClick={startNewGame} className="modal-btn">
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Tetris;