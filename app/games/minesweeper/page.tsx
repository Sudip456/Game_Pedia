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

    if (!isGameStarted) {
      setIsGameStarted(true);
    }

    const newGrid = JSON.parse(JSON.stringify(grid));
    
    if (newGrid[row][col].isMine) {
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameStarted && gameStatus === 'playing') {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameStarted, gameStatus]);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const { rows, cols } = difficulties[difficulty];

  const getNumberColor = (num: number): string => {
    const colors: Record<number, string> = {
      1: 'number-blue',
      2: 'number-green',
      3: 'number-red',
      4: 'number-purple',
      5: 'number-orange',
      6: 'number-cyan',
      7: 'number-pink',
      8: 'number-yellow'
    };
    return colors[num] || 'number-white';
  };

  return (
    <>
      <style jsx>{`
        /* Reset and base styles */
        .minesweeper-page {
          min-height: 100vh;
          background: #0a0a0f;
          color: white;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }

        .minesweeper-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1rem 2rem;
        }

        /* Header styles */
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
          background: linear-gradient(135deg, #10b981, #34d399);
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
          font-size: 0.875rem;
        }

        .stat-value {
          font-family: monospace;
          font-size: 1.25rem;
          font-weight: bold;
          margin-left: 0.5rem;
          color: #10b981;
        }

        /* Difficulty selector */
        .difficulty-selector {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .difficulty-btn {
          padding: 0.5rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: bold;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          font-size: 0.875rem;
          text-transform: capitalize;
        }

        @media (min-width: 640px) {
          .difficulty-btn {
            padding: 0.5rem 2rem;
            font-size: 1rem;
          }
        }

        .difficulty-active {
          background: #10b981;
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .difficulty-inactive {
          background: #12121a;
          border: 1px solid #1e1e2e;
          color: #64748b;
        }

        .difficulty-inactive:hover {
          border-color: rgba(16, 185, 129, 0.5);
        }

        /* Board container */
        .board-container {
          display: flex;
          justify-content: center;
        }

        .board-wrapper {
          background: #12121a;
          border: 1px solid #1e1e2e;
          border-radius: 1.5rem;
          padding: 1rem;
          overflow-x: auto;
          max-width: 100%;
        }

        @media (min-width: 768px) {
          .board-wrapper {
            padding: 1.5rem;
          }
        }

        .board-grid {
          display: grid;
          gap: 2px;
          margin: 0 auto;
          min-width: min-content;
        }

        /* Cell styles */
        .cell-btn {
          aspect-ratio: 1 / 1;
          border-radius: 0.5rem;
          font-weight: bold;
          transition: all 0.15s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          border: none;
          width: 100%;
          min-width: 28px;
        }

        @media (min-width: 640px) {
          .cell-btn {
            font-size: 1rem;
            min-width: 35px;
          }
        }

        @media (min-width: 768px) {
          .cell-btn {
            min-width: 40px;
          }
        }

        .cell-revealed {
          background: #1a1a1f;
          border: 1px solid #2a2a35;
        }

        .cell-hidden {
          background: #1e1e2e;
          border: 2px solid #2a2a35;
        }

        .cell-hidden:hover {
          border-color: rgba(16, 185, 129, 0.5);
          transform: scale(0.95);
        }

        .cell-hidden:active {
          transform: scale(0.9);
        }

        .cell-mine-lost {
          background: rgba(127, 29, 29, 0.5);
          border-color: #ef4444;
        }

        .cell-flagged {
          background: #1e3a2f;
          border-color: rgba(16, 185, 129, 0.5);
        }

        /* Number colors */
        .number-blue { color: #60a5fa; }
        .number-green { color: #4ade80; }
        .number-red { color: #f87171; }
        .number-purple { color: #c084fc; }
        .number-orange { color: #fb923c; }
        .number-cyan { color: #22d3ee; }
        .number-pink { color: #f472b6; }
        .number-yellow { color: #facc15; }
        .number-white { color: white; }

        /* Game status */
        .game-status {
          text-align: center;
          margin-top: 2rem;
        }

        .status-card {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          animation: fadeInZoom 0.3s ease;
        }

        .status-win {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
        }

        .status-lose {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
        }

        .status-icon {
          font-size: 1.5rem;
        }

        .status-text-win {
          color: #10b981;
          font-weight: bold;
        }

        .status-text-lose {
          color: #ef4444;
          font-weight: bold;
        }

        .play-again-btn {
          margin-left: 1rem;
          padding: 0.25rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .play-again-win {
          background: #10b981;
          color: white;
        }

        .play-again-win:hover {
          background: #059669;
          transform: scale(1.05);
        }

        .play-again-lose {
          background: #ef4444;
          color: white;
        }

        .play-again-lose:hover {
          background: #dc2626;
          transform: scale(1.05);
        }

        .play-again-btn:active {
          transform: scale(0.95);
        }

        /* Instructions */
        .instructions {
          text-align: center;
          color: #475569;
          font-size: 0.75rem;
          margin-top: 2rem;
          line-height: 1.5;
        }

        @media (min-width: 640px) {
          .instructions {
            font-size: 0.875rem;
          }
        }

        .instructions-highlight {
          color: #10b981;
        }

        .instructions-space {
          margin-top: 0.25rem;
          font-size: 0.7rem;
        }

        @media (min-width: 640px) {
          .instructions-space {
            font-size: 0.75rem;
          }
        }

        /* Animations */
        @keyframes fadeInZoom {
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

      <div className="minesweeper-page">
        <div className="minesweeper-wrapper">
          {/* Header */}
          <div className="game-header">
            <Link href="/" className="back-link">
              ← Back
            </Link>
            <h1 className="game-title">MINESWEEPER</h1>
            <div className="stats-group">
              <div className="stat-card">
                <span className="stat-label">💣</span>
                <span className="stat-value">{minesCount - flagsPlaced}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">⏱️</span>
                <span className="stat-value">{time}</span>
              </div>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="difficulty-selector">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => changeDifficulty(diff)}
                className={`difficulty-btn ${
                  difficulty === diff
                    ? 'difficulty-active'
                    : 'difficulty-inactive'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Game Board */}
          <div className="board-container">
            <div className="board-wrapper">
              <div 
                className="board-grid"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(28px, 45px))`,
                }}
              >
                {grid.map((row, i) => (
                  row.map((cell, j) => {
                    let cellClass = 'cell-btn ';
                    if (cell.isRevealed) {
                      cellClass += 'cell-revealed ';
                    } else {
                      cellClass += 'cell-hidden ';
                    }
                    if (gameStatus === 'lost' && cell.isMine && cell.isRevealed) {
                      cellClass += 'cell-mine-lost ';
                    }
                    if (cell.isFlagged && !cell.isRevealed) {
                      cellClass += 'cell-flagged ';
                    }

                    return (
                      <button
                        key={`${i}-${j}`}
                        onClick={() => handleCellClick(i, j)}
                        onContextMenu={(e) => toggleFlag(e, i, j)}
                        className={cellClass}
                      >
                        <span>
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
                    );
                  })
                ))}
              </div>
            </div>
          </div>

          {/* Game Status */}
          <div className="game-status">
            {gameStatus === 'won' && (
              <div className="status-card status-win">
                <span className="status-icon">🎉</span>
                <span className="status-text-win">YOU WIN!</span>
                <button
                  onClick={resetGame}
                  className="play-again-btn play-again-win"
                >
                  Play Again
                </button>
              </div>
            )}
            {gameStatus === 'lost' && (
              <div className="status-card status-lose">
                <span className="status-icon">💀</span>
                <span className="status-text-lose">GAME OVER</span>
                <button
                  onClick={resetGame}
                  className="play-again-btn play-again-lose"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="instructions">
            <p>🖱️ <span className="instructions-highlight">Left Click</span>: Reveal cell &nbsp;&nbsp;|&nbsp;&nbsp; 🚩 <span className="instructions-highlight">Right Click</span>: Place/Remove flag</p>
            <p className="instructions-space"> First click is always safe! </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Minesweeper;