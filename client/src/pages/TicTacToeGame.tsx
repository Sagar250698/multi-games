import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useStore';
import { useSocket } from '../hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, X, Circle, Trophy } from 'lucide-react';

const TicTacToeGame: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { username } = useGameStore();
  const { socket, on, emit, off } = useSocket();
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    if (!socket) return;

    emit('joinRoom', { roomId: id, username });

    on('roomUpdated', (updatedRoom: any) => {
      setRoom(updatedRoom);
    });

    on('error', (msg: string) => {
      alert(msg);
      navigate('/ttt/lobby');
    });

    return () => {
      off('roomUpdated');
      off('error');
    };
  }, [socket, id]);

  const handleMove = (index: number) => {
    if (!room || room.status !== 'playing' || room.currentTurn !== socket?.id) return;
    emit('makeMove', { roomId: id, index });
  };

  const handleRematch = () => {
    emit('rematch', { roomId: id });
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-400 font-medium">Connecting to room...</p>
        </div>
      </div>
    );
  }

  const myPlayer = room.players.find((p: any) => p.socketId === socket?.id);
  const isMyTurn = room.currentTurn === socket?.id;
  const opponent = room.players.find((p: any) => p.socketId !== socket?.id);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center max-w-4xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate('/ttt/lobby')}
          className="p-3 glass rounded-xl hover:bg-white/10 transition-all text-slate-400"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Room Code</h2>
          <p className="text-2xl font-black text-white tracking-widest">{id}</p>
        </div>
        <div className="w-12"></div>
      </div>

      {/* Players Info */}
      <div className="grid grid-cols-2 gap-8 w-full mb-12">
        <div className={`p-6 glass rounded-2xl border-2 transition-all ${isMyTurn ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105' : 'border-transparent'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase text-blue-400">Player 1 (You)</span>
            <X size={20} className="text-blue-500" />
          </div>
          <p className="text-xl font-bold">{myPlayer?.username}</p>
          {isMyTurn && <p className="text-xs mt-2 text-blue-400 animate-pulse font-bold">YOUR TURN</p>}
        </div>

        <div className={`p-6 glass rounded-2xl border-2 transition-all ${!isMyTurn && room.status === 'playing' ? 'border-red-500 shadow-lg shadow-red-500/20 scale-105' : 'border-transparent'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase text-red-400">Player 2</span>
            <Circle size={20} className="text-red-500" />
          </div>
          <p className="text-xl font-bold">{opponent ? opponent.username : 'Waiting...'}</p>
          {!isMyTurn && room.status === 'playing' && <p className="text-xs mt-2 text-red-400 animate-pulse font-bold">OPPONENT'S TURN</p>}
        </div>
      </div>

      {/* Board */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 shadow-2xl">
          {room.board.map((cell: any, i: number) => (
            <motion.button
              key={i}
              whileHover={cell === null && isMyTurn ? { scale: 1.05 } : {}}
              whileTap={cell === null && isMyTurn ? { scale: 0.95 } : {}}
              onClick={() => handleMove(i)}
              className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl font-black transition-all ${
                cell === null && isMyTurn ? 'bg-white/10 hover:bg-white/20 cursor-pointer' : 'bg-white/5 cursor-default'
              }`}
            >
              {cell === 'X' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><X size={48} className="text-blue-500" /></motion.div>}
              {cell === 'O' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Circle size={44} className="text-red-500" /></motion.div>}
            </motion.button>
          ))}
        </div>

        {/* Status Overlays */}
        {room.status === 'waiting' && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <Users className="w-16 h-16 text-blue-400 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold mb-2">Waiting for opponent</h3>
            <p className="text-slate-400">Share the room code with a friend to start playing!</p>
          </div>
        )}
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {room.status === 'finished' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass p-12 rounded-[3rem] max-w-md w-full text-center space-y-8 border-2 border-white/10"
            >
              <div className="flex justify-center">
                <div className="p-6 bg-yellow-500/20 rounded-full">
                  <Trophy size={64} className="text-yellow-500" />
                </div>
              </div>

              <div>
                <h3 className="text-4xl font-black mb-2">
                  {room.winner === 'draw' ? "It's a Draw!" : room.winner === socket?.id ? "Victory!" : "Defeat!"}
                </h3>
                <p className="text-slate-400 font-medium">
                  {room.winner === 'draw' ? "Good game! Both played well." : room.winner === socket?.id ? "You dominated the board!" : "Better luck next time!"}
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleRematch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw size={20} /> Play Again
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-white/10 transition-all"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicTacToeGame;

// Helper to avoid duplicate icons in the board
const Users = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
