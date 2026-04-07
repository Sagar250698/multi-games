import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGameStore } from '../store/useStore';
import { useSocket } from '../hooks/useSocket';
import { motion } from 'framer-motion';
import { Users, Plus, LogIn } from 'lucide-react';

const TicTacToeLobby: React.FC = () => {
  const [roomInput, setRoomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { username, setRoomId } = useGameStore();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/rooms`, { username });
      const { roomId } = response.data;
      setRoomId(roomId);
      navigate(`/ttt/game/${roomId}`);
    } catch (err) {
      alert('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!roomInput.trim()) return;
    setRoomId(roomInput.toUpperCase());
    navigate(`/ttt/game/${roomInput.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 rounded-3xl max-w-md w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-500/20 rounded-2xl text-blue-400 mb-2">
            <Users size={32} />
          </div>
          <h1 className="text-3xl font-bold">Game Lobby</h1>
          <p className="text-slate-400">Play Tic-Tac-Toe with friends</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <Plus size={20} />
            {loading ? 'Creating...' : 'Create New Room'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1e293b] px-4 text-slate-500 font-bold tracking-widest">or join existing</span>
            </div>
          </div>

          <div className="space-y-4">
            <input 
              type="text" 
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Enter Room Code (e.g. ABC123)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-xl font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              onClick={handleJoinRoom}
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-4 rounded-xl transition-all"
            >
              <LogIn size={20} />
              Join Room
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TicTacToeLobby;
