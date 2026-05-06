'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// Types
type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

type GameStatus = 'playing' | 'won' | 'lost';

const Minesweeper: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [minesCount, setMinesCount] = useState(40);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Difficulty configurations
  const difficulties = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
  };

  const initializeGrid = useCallback((firstClickRow?: number, firstClickCol?: number) => {
    const { rows, cols, mines } = difficulties[difficulty];
    
    // Create empty grid
    let newGrid: Cell[][] = Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Place mines avoiding first click position
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      
      // Only check first click position if coordinates are provided
      const isFirstClickCell = firstClickRow !== undefined && firstClickCol !== undefined;
      const isNearFirstClick = isFirstClickCell && 
        Math.abs(row - firstClickRow) <= 1 && 
        Math.abs(col - firstClickCol) <= 1;
      
      if (!newGrid[row][col].isMine && !isNearFirstClick) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newGrid[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && newGrid[ni][nj].isMine) {
                count++;
              }
            }
          }
          newGrid[i][j].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameStatus('playing');
    setFlagsPlaced(0);
    setMinesCount(mines);
    if (firstClickRow === undefined) {
      setTime(0);
      setIsGameStarted(false);
    }
  }, [difficulty]);

  const revealCell = useCallback((row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    if (grid[row][col].isRevealed || grid[row][col].isFlagged) return;

    // Start timer on first reveal
    if (!isGameStarted) {
      setIsGameStarted(true);
    }

    const newGrid = JSON.parse(JSON.stringify(grid));
    
    // Hit a mine - game over
    if (newGrid[row][col].isMine) {
      // Reveal all mines
      for (let i = 0; i < newGrid.length; i++) {
        for (let j = 0; j < newGrid[0].length; j++) {
          if (newGrid[i][j].isMine) {
            newGrid[i][j].isRevealed = true;
          }
        }
      }
      setGrid(newGrid);
      setGameStatus('lost');
      return;
    }

    // Reveal cell using BFS for empty cells
    const revealQueue = [[row, col]];
    const visited = new Set<string>();
    
    while (revealQueue.length > 0) {
      const [r, c] = revealQueue.pop()!;
      const key = `${r},${c}`;
      
      if (visited.has(key)) continue;
      if (r < 0 || r >= newGrid.length || c < 0 || c >= newGrid[0].length) continue;
      if (newGrid[r][c].isRevealed || newGrid[r][c].isFlagged) continue;
      
      visited.add(key);
      newGrid[r][c].isRevealed = true;
      
      // If cell has 0 neighbors, add adjacent cells to queue
      if (newGrid[r][c].neighborMines === 0 && !newGrid[r][c].isMine) {
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            if (di === 0 && dj === 0) continue;
            const ni = r + di;
            const nj = c + dj;
            if (ni >= 0 && ni < newGrid.length && 
                nj >= 0 && nj < newGrid[0].length &&
                !newGrid[ni][nj].isRevealed &&
                !newGrid[ni][nj].isFlagged) {
              revealQueue.push([ni, nj]);
            }
          }
        }
      }
    }

    setGrid(newGrid);

    // Check win condition
    let unrevealedCount = 0;
    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[0].length; j++) {
        if (!newGrid[i][j].isRevealed && !newGrid[i][j].isMine) {
          unrevealedCount++;
        }
      }
    }
    
    if (unrevealedCount === 0) {
      setGameStatus('won');
      setIsGameStarted(false);
    }
  }, [grid, gameStatus, isGameStarted]);

  const toggleFlag = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;
    if (grid[row][col].isRevealed) return;

    const newGrid = JSON.parse(JSON.stringify(grid));
    const cell = newGrid[row][col];
    
    if (!cell.isFlagged && flagsPlaced >= minesCount) return;
    
    cell.isFlagged = !cell.isFlagged;
    setGrid(newGrid);
    setFlagsPlaced(prev => prev + (cell.isFlagged ? 1 : -1));
  }, [grid, gameStatus, flagsPlaced, minesCount]);

  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    
    // Initialize game on first click with safe cell
    if (!isGameStarted && !grid[row]?.[col]?.isRevealed) {
      initializeGrid(row, col);
      setTimeout(() => {
        revealCell(row, col);
      }, 10);
      return;
    }
    
    revealCell(row, col);
  };

  const resetGame = () => {
    initializeGrid();
    setIsGameStarted(false);
    setTime(0);
  };

  const changeDifficulty = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    setTimeout(() => {
      initializeGrid();
      setIsGameStarted(false);
      setTime(0);
    }, 0);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameStarted && gameStatus === 'playing') {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameStarted, gameStatus]);

  // Initialize game
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const { rows, cols } = difficulties[difficulty];

  // Get color for number
  const getNumberColor = (num: number) => {
    const colors: Record<number, string> = {
      1: 'text-blue-400',
      2: 'text-green-400',
      3: 'text-red-400',
      4: 'text-purple-400',
      5: 'text-orange-400',
      6: 'text-cyan-400',
      7: 'text-pink-400',
      8: 'text-yellow-400'
    };
    return colors[num] || 'text-white';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-12">
      <div className="max-w-7xl mx-auto pt-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <Link href="/" className="text-[#475569] hover:text-white transition-colors">
            ← Back
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-emerald-400">
            MINESWEEPER
          </h1>
          <div className="flex gap-4">
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl px-4 py-2">
              <span className="text-[#64748b] text-sm">💣</span>
              <span className="ml-2 font-mono text-emerald-400">{minesCount - flagsPlaced}</span>
            </div>
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl px-4 py-2">
              <span className="text-[#64748b] text-sm">⏱️</span>
              <span className="ml-2 font-mono text-emerald-400">{time}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-3 mb-8">
          {(['easy', 'medium', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => changeDifficulty(diff)}
              className={`px-6 py-2 rounded-xl font-bold transition-all capitalize ${
                difficulty === diff
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-[#12121a] border border-[#1e1e2e] text-[#64748b] hover:border-emerald-500/50'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Game Board */}
        <div className="flex justify-center">
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-3xl p-6 overflow-auto">
            <div 
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(35px, 45px))`,
              }}
            >
              {grid.map((row, i) => (
                row.map((cell, j) => (
                  <button
                    key={`${i}-${j}`}
                    onClick={() => handleCellClick(i, j)}
                    onContextMenu={(e) => toggleFlag(e, i, j)}
                    className={`
                      aspect-square rounded-lg font-bold transition-all duration-150
                      ${cell.isRevealed 
                        ? 'bg-[#1a1a1f] border border-[#2a2a35]' 
                        : 'bg-[#1e1e2e] border-2 border-[#2a2a35] hover:border-emerald-500/50 hover:scale-95 active:scale-90 cursor-pointer'
                      }
                      ${gameStatus === 'lost' && cell.isMine && cell.isRevealed ? 'bg-red-900/50 border-red-500' : ''}
                      ${cell.isFlagged && !cell.isRevealed ? 'bg-[#1e3a2f] border-emerald-500/50' : ''}
                    `}
                  >
                    <span className="text-lg">
                      {cell.isRevealed ? (
                        cell.isMine ? (
                          '💣'
                        ) : cell.neighborMines > 0 ? (
                          <span className={getNumberColor(cell.neighborMines)}>
                            {cell.neighborMines}
                          </span>
                        ) : (
                          ''
                        )
                      ) : cell.isFlagged ? (
                        '🚩'
                      ) : (
                        ''
                      )}
                    </span>
                  </button>
                ))
              ))}
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="text-center mt-8">
          {gameStatus === 'won' && (
            <div className="inline-flex items-center gap-3 bg-emerald-900/20 border border-emerald-500 rounded-2xl px-6 py-3 animate-in fade-in zoom-in duration-300">
              <span className="text-2xl">🎉</span>
              <span className="text-emerald-400 font-bold">YOU WIN!</span>
              <button
                onClick={resetGame}
                className="ml-4 px-4 py-1 bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          )}
          {gameStatus === 'lost' && (
            <div className="inline-flex items-center gap-3 bg-red-900/20 border border-red-500 rounded-2xl px-6 py-3 animate-in fade-in zoom-in duration-300">
              <span className="text-2xl">💀</span>
              <span className="text-red-400 font-bold">GAME OVER</span>
              <button
                onClick={resetGame}
                className="ml-4 px-4 py-1 bg-red-600 rounded-lg hover:bg-red-500 transition-all hover:scale-105 active:scale-95"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-[#475569] text-sm mt-8 space-y-1">
          <p>🖱️ <span className="text-emerald-400">Left Click</span>: Reveal cell &nbsp;&nbsp;|&nbsp;&nbsp; 🚩 <span className="text-emerald-400">Right Click</span>: Place/Remove flag</p>
          <p className="text-xs">✨ First click is always safe! ✨</p>
        </div>
      </div>
    </div>
  );
};

export default Minesweeper;