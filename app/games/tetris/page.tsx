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
const TICK_SPEED = 500; // milliseconds

type Position = {
  x: number;
  y: number;
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
  
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const isGameActive = useRef(false);

  // Initialize board
  const initBoard = useCallback(() => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  }, []);

  // Get random piece
  const getRandomPiece = useCallback(() => {
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
  const checkCollision = useCallback((piece: number[][], pos: Position) => {
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
  const mergePiece = useCallback(() => {
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
  const clearLines = useCallback((newBoard: number[][]) => {
    let linesCleared = 0;
    const clearedBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    
    // Add empty rows at the top
    for (let i = 0; i < linesCleared; i++) {
      clearedBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    // Update score based on lines cleared
    if (linesCleared > 0) {
      const points = [0, 40, 100, 300, 1200];
      const newScore = score + points[linesCleared] * (level + 1);
      setScore(newScore);
      setLines(prev => prev + linesCleared);
      
      // Update level (every 10 lines)
      const newLines = lines + linesCleared;
      const newLevel = Math.floor(newLines / 10);
      if (newLevel > level) {
        setLevel(newLevel);
      }
      
      // Update high score
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('tetrisHighScore', newScore.toString());
      }
    }
    
    return { board: clearedBoard, linesCleared };
  }, [score, level, lines, highScore]);

  // Move piece
  const movePiece = useCallback((dx: number, dy: number) => {
    if (gameOver || isPaused) return false;
    
    const newPos = { x: currentPosition.x + dx, y: currentPosition.y + dy };
    if (!checkCollision(currentPiece, newPos)) {
      setCurrentPosition(newPos);
      return true;
    }
    
    // If moving down and collision, lock the piece
    if (dy === 1) {
      const newBoard = mergePiece();
      const { board: clearedBoard, linesCleared } = clearLines(newBoard);
      setBoard(clearedBoard);
      
      // Spawn next piece
      spawnNewPiece();
      
      // Check game over
      if (checkCollision(currentPiece, currentPosition)) {
        setGameOver(true);
        isGameActive.current = false;
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      }
    }
    return false;
  }, [currentPiece, currentPosition, gameOver, isPaused, checkCollision, mergePiece, clearLines, spawnNewPiece]);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (gameOver || isPaused) return;
    
    // Rotate matrix
    const rotated = currentPiece[0].map((_, idx) => 
      currentPiece.map(row => row[idx]).reverse()
    );
    
    // Kick handling (simple wall kick)
    if (!checkCollision(rotated, currentPosition)) {
      setCurrentPiece(rotated);
    } else {
      // Try shifting left or right
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
  const hardDrop = useCallback(() => {
    if (gameOver || isPaused) return;
    
    while (movePiece(0, 1)) {
      // Keep moving down until collision
    }
  }, [movePiece, gameOver, isPaused]);

  // Game tick (move piece down)
  const gameTick = useCallback(() => {
    if (!gameOver && !isPaused) {
      movePiece(0, 1);
    }
  }, [movePiece, gameOver, isPaused]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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
  const startNewGame = useCallback(() => {
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
    
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('tetrisHighScore');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
  }, [initBoard, getRandomPiece]);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Render board with current piece
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display board
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-12">
      <div className="max-w-6xl mx-auto pt-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <Link href="/" className="text-[#475569] hover:text-white transition-colors">
            ← Back
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-purple-400">
            TETRIS
          </h1>
          <div className="flex gap-4">
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl px-4 py-2">
              <span className="text-[#64748b] text-sm">🎯 SCORE</span>
              <span className="ml-2 font-mono text-purple-400 text-xl">{score}</span>
            </div>
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl px-4 py-2">
              <span className="text-[#64748b] text-sm">🏆 HIGH</span>
              <span className="ml-2 font-mono text-yellow-400 text-xl">{highScore}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-start gap-8 flex-wrap">
          {/* Main Game Board */}
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-3xl p-6">
            <div 
              className="grid gap-[1px] bg-[#1e1e2e] p-[1px]"
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
              }}
            >
              {displayBoard.map((row, i) => (
                row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="transition-all duration-75"
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: cell ? COLORS[cell - 1] : '#1a1a1f',
                      boxShadow: cell ? 'inset 0 0 10px rgba(255,255,255,0.2)' : 'none'
                    }}
                  />
                ))
              ))}
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Next Piece */}
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
              <h3 className="text-[#64748b] text-sm mb-4 text-center">NEXT PIECE</h3>
              <div className="flex justify-center">
                <div 
                  className="grid gap-[1px] bg-[#1e1e2e] p-[1px]"
                  style={{
                    gridTemplateColumns: `repeat(${nextPiece[0]?.length || 2}, 30px)`,
                  }}
                >
                  {nextPiece.map((row, i) => (
                    row.map((cell, j) => (
                      <div
                        key={`next-${i}-${j}`}
                        style={{
                          width: 30,
                          height: 30,
                          backgroundColor: cell ? nextColor : 'transparent',
                          boxShadow: cell ? 'inset 0 0 10px rgba(255,255,255,0.2)' : 'none'
                        }}
                      />
                    ))
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Lines</span>
                <span className="font-mono text-purple-400 text-xl">{lines}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Level</span>
                <span className="font-mono text-purple-400 text-xl">{level}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
              <h3 className="text-[#64748b] text-sm mb-3">CONTROLS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>← →</span>
                  <span className="text-[#475569]">Move</span>
                </div>
                <div className="flex justify-between">
                  <span>↓</span>
                  <span className="text-[#475569]">Soft Drop</span>
                </div>
                <div className="flex justify-between">
                  <span>↑</span>
                  <span className="text-[#475569]">Rotate</span>
                </div>
                <div className="flex justify-between">
                  <span>Space</span>
                  <span className="text-[#475569]">Hard Drop</span>
                </div>
                <div className="flex justify-between">
                  <span>P</span>
                  <span className="text-[#475569]">Pause</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isPaused && !gameOver && (
                <div className="text-center text-yellow-400 bg-yellow-400/10 rounded-xl py-2">
                  ⏸️ PAUSED
                </div>
              )}
              <button
                onClick={() => setIsPaused(prev => !prev)}
                className="w-full bg-[#1e1e2e] hover:bg-[#2a2a35] py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
              >
                {isPaused ? '▶️ RESUME' : '⏸️ PAUSE'}
              </button>
              <button
                onClick={startNewGame}
                className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
              >
                🔄 NEW GAME
              </button>
            </div>
          </div>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-3xl p-10 w-full max-w-sm text-center animate-in fade-in zoom-in duration-300">
              <div className="text-6xl mb-4">💀</div>
              <h2 className="text-4xl font-black mb-3">GAME OVER</h2>
              <p className="text-2xl mb-2">Final Score: <span className="text-purple-400">{score}</span></p>
              <p className="text-sm text-[#64748b] mb-8">Lines cleared: {lines}</p>
              <button
                onClick={startNewGame}
                className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tetris;