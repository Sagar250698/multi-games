import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, Star } from 'lucide-react';

interface LeaderboardProps {
  type: 'match3' | 'stats';
}

const Leaderboard: React.FC<LeaderboardProps> = ({ type }) => {
  const [data, setData] = useState<any[]>([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchData = async () => {
    try {
      const endpoint = type === 'match3' ? 'leaderboard/match3' : 'leaderboard/stats';
      const response = await axios.get(`${API_URL}/${endpoint}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // In a real app, you could listen for socket updates here
  }, [type]);

  return (
    <div className="glass rounded-2xl p-6 w-full max-w-sm">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-yellow-400 w-6 h-6" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          {type === 'match3' ? 'Match-3 Legends' : 'Tic-Tac-Toe Kings'}
        </h2>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div 
            key={item._id} 
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                index === 0 ? 'bg-yellow-500 text-black' : 
                index === 1 ? 'bg-slate-300 text-black' : 
                index === 2 ? 'bg-amber-600 text-white' : 'bg-white/10 text-slate-400'
              }`}>
                {index + 1}
              </span>
              <span className="font-medium text-slate-200">{item.username}</span>
            </div>
            <div className="text-right">
              <span className="text-blue-400 font-bold">
                {type === 'match3' ? `${item.score} pts` : `${item.wins}W`}
              </span>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-slate-500 text-center py-4 text-sm italic">No entries yet. Be the first!</p>}
      </div>
    </div>
  );
};

export default Leaderboard;
