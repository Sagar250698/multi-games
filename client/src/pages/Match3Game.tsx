import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, ArrowLeft, Timer, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGameStore } from '../store/useStore';
import { useSocket } from '../hooks/useSocket';

const GRID_SIZE = 8;
const TILE_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#a855f7', // Purple
  '#ec4899', // Pink
];

interface Tile {
  id: string;
  color: string;
  x: number;
  y: number;
}

const Match3Game: React.FC = () => {
  const [board, setBoard] = useState<Tile[][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedTile, setSelectedTile] = useState<{ x: number, y: number } | null>(null);
  const { username } = useGameStore();
  const { emit } = useSocket();
  const navigate = useNavigate();
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Initialize Board
  const createBoard = useCallback(() => {
    const newBoard: Tile[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        row.push({
          id: `${x}-${y}-${Math.random()}`,
          color: TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)],
          x,
          y
        });
      }
      newBoard.push(row);
    }
    // Check and fix initial matches (recursive until clean)
    return fixInitialMatches(newBoard);
  }, []);

  const fixInitialMatches = (currentBoard: Tile[][]): Tile[][] => {
    let hasMatch = false;
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const color = currentBoard[y][x].color;
        // Horizontal
        if (x < GRID_SIZE - 2 && color === currentBoard[y][x+1].color && color === currentBoard[y][x+2].color) {
          currentBoard[y][x].color = TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
          hasMatch = true;
        }
        // Vertical
        if (y < GRID_SIZE - 2 && color === currentBoard[y+1][x].color && color === currentBoard[y+2][x].color) {
          currentBoard[y][x].color = TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
          hasMatch = true;
        }
      }
    }
    if (hasMatch) return fixInitialMatches(currentBoard);
    return currentBoard;
  };

  useEffect(() => {
    setBoard(createBoard());
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [createBoard]);

  const handleGameOver = useCallback(async () => {
    try {
      if (score > 0) {
        await axios.post(`${API_URL}/scores`, { username, score });
        emit('newScore', {});
      }
    } catch (err) {
      console.error('Failed to submit score:', err);
    }
  }, [score, username, emit]);

  useEffect(() => {
    if (isGameOver) {
      handleGameOver();
    }
  }, [isGameOver, handleGameOver]);

  const checkMatches = (currentBoard: Tile[][]) => {
    const matchedTiles = new Set<string>();
    
    // Horizontal check
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE - 2; x++) {
        const color = currentBoard[y][x].color;
        if (color && color === currentBoard[y][x+1].color && color === currentBoard[y][x+2].color) {
          matchedTiles.add(`${x},${y}`);
          matchedTiles.add(`${x+1},${y}`);
          matchedTiles.add(`${x+2},${y}`);
        }
      }
    }
    
    // Vertical check
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE - 2; y++) {
        const color = currentBoard[y][x].color;
        if (color && color === currentBoard[y+1][x].color && color === currentBoard[y+2][x].color) {
          matchedTiles.add(`${x},${y}`);
          matchedTiles.add(`${x},${y+1}`);
          matchedTiles.add(`${x},${y+2}`);
        }
      }
    }

    return matchedTiles;
  };

  const processBoard = async (currentBoard: Tile[][]) => {
    const matches = checkMatches(currentBoard);
    if (matches.size === 0) return currentBoard;

    // Calculate score
    const newPoints = matches.size === 3 ? 30 : matches.size === 4 ? 100 : 300;
    setScore(s => s + newPoints);

    // Remove matches
    const boardWithGaps = currentBoard.map((row, y) => 
      row.map((tile, x) => matches.has(`${x},${y}`) ? { ...tile, color: '' } : tile)
    );

    setBoard([...boardWithGaps]);
    await new Promise(r => setTimeout(r, 300));

    // Fall down
    const nextBoard = [...boardWithGaps];
    for (let x = 0; x < GRID_SIZE; x++) {
      let emptySpace = GRID_SIZE - 1;
      for (let y = GRID_SIZE - 1; y >= 0; y--) {
        if (nextBoard[y][x].color !== '') {
          const temp = nextBoard[y][x].color;
          nextBoard[y][x].color = '';
          nextBoard[emptySpace][x].color = temp;
          emptySpace--;
        }
      }
      // Refill
      for (let y = emptySpace; y >= 0; y--) {
        nextBoard[y][x].color = TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
      }
    }

    setBoard([...nextBoard]);
    await new Promise(r => setTimeout(r, 300));
    return processBoard(nextBoard);
  };

  const handleTileClick = async (x: number, y: number) => {
    if (isGameOver) return;

    if (!selectedTile) {
      setSelectedTile({ x, y });
    } else {
      const dx = Math.abs(x - selectedTile.x);
      const dy = Math.abs(y - selectedTile.y);

      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        // Swap colors
        const newBoard = [...board.map(row => [...row])];
        const temp = newBoard[y][x].color;
        newBoard[y][x].color = newBoard[selectedTile.y][selectedTile.x].color;
        newBoard[selectedTile.y][selectedTile.x].color = temp;

        const matches = checkMatches(newBoard);
        if (matches.size > 0) {
          setSelectedTile(null);
          await processBoard(newBoard);
        } else {
          // Internal reset if no match (animation could be added here)
          setBoard([...board]);
          setSelectedTile(null);
        }
      } else {
        setSelectedTile({ x, y });
      }
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-[#0f172a]">
      {/* HUD */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-3 glass rounded-xl hover:bg-white/10 transition-all text-slate-400"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-b-4 border-blue-500/50">
            <Timer className="text-blue-400" size={20} />
            <span className="text-2xl font-black text-white w-12 text-center">{timeLeft}s</span>
          </div>
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-b-4 border-purple-500/50">
            <Star className="text-purple-400" size={20} />
            <span className="text-2xl font-black text-white min-w-[60px] text-center">{score}</span>
          </div>
        </div>

        <div className="w-12"></div>
      </div>

      {/* Board */}
      <div className="glass p-3 rounded-[2rem] shadow-2xl relative">
        <div 
          className="grid gap-2" 
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {board.map((row, y) => 
            row.map((tile, x) => (
              <motion.div
                key={tile.id}
                onClick={() => handleTileClick(x, y)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  backgroundColor: tile.color || 'transparent',
                  scale: tile.color === '' ? 0 : 1,
                  opacity: tile.color === '' ? 0 : 1
                }}
                className={`w-10 h-10 md:w-14 md:h-14 rounded-xl cursor-pointer shadow-inner relative transition-colors duration-300 ${
                  selectedTile?.x === x && selectedTile?.y === y ? 'ring-4 ring-white ring-inset scale-110 z-10' : ''
                }`}
              >
                {tile.color && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-[1px] opacity-30" />
                )}
              </motion.div>
            ))
          )}
        </div>

        <AnimatePresence>
          {isGameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md rounded-[1.8rem] z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="p-6 bg-purple-500/20 rounded-full mb-6">
                <Trophy size={64} className="text-purple-500" />
              </div>
              <h2 className="text-4xl font-black mb-2">Game Over!</h2>
              <p className="text-slate-400 mb-8 text-lg">Final Score: <span className="text-white font-black text-2xl">{score}</span></p>
              
              <div className="w-full space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw size={20} /> Try Again
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-white/10 transition-all"
                >
                  Leaderboards
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-slate-500 text-sm font-medium">
        Click two adjacent tiles to swap them and make matches of 3 or more!
      </div>
    </div>
  );
};

export default Match3Game;
