import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useStore';
import Leaderboard from '../components/Leaderboard';
import { Gamepad2, Grid3X3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const { username, setUsername } = useGameStore();
  const [nameInput, setNameInput] = useState(username);
  const navigate = useNavigate();

  const handleStart = (path: string) => {
    if (!nameInput.trim()) {
      alert('Please enter a username');
      return;
    }
    setUsername(nameInput);
    navigate(path);
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-12 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-6xl font-black bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Multi-Game Arena
        </h1>
        <p className="text-slate-400 text-lg font-medium">Experience the thrill of real-time multiplayer</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12 items-start w-full justify-center">
        {/* Main Content */}
        <div className="flex-1 space-y-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-3xl space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Your Username</label>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter username..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <button 
                onClick={() => handleStart('/ttt/lobby')}
                className="group relative flex flex-col items-start p-6 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 rounded-2xl hover:border-blue-500/50 transition-all text-left"
              >
                <div className="p-3 bg-blue-500/20 rounded-lg mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                  <Grid3X3 size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">Tic-Tac-Toe</h3>
                <p className="text-slate-400 text-sm mb-4">Multiplayer turn-based strategy. Battle players in real-time.</p>
                <div className="mt-auto flex items-center text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                  Play Now <ArrowRight size={18} className="ml-2" />
                </div>
              </button>

              <button 
                onClick={() => handleStart('/match3')}
                className="group relative flex flex-col items-start p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/10 border border-purple-500/20 rounded-2xl hover:border-purple-500/50 transition-all text-left"
              >
                <div className="p-3 bg-purple-500/20 rounded-lg mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                  <Gamepad2 size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">Match-3 Puzzle</h3>
                <p className="text-slate-400 text-sm mb-4">Fast-paced candy matching action. Climb the leaderboards.</p>
                <div className="mt-auto flex items-center text-purple-400 font-bold group-hover:translate-x-2 transition-transform">
                  Play Now <ArrowRight size={18} className="ml-2" />
                </div>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebars */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-auto space-y-6"
        >
          <Leaderboard type="stats" />
          <Leaderboard type="match3" />
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
