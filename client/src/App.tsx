import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import TicTacToeLobby from './pages/TicTacToeLobby';
import TicTacToeGame from './pages/TicTacToeGame';
import Match3Game from './pages/Match3Game';
import { useGameStore } from './store/useStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { username } = useGameStore();
  if (!username) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="bg-[#0f172a] min-h-screen text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/ttt/lobby" 
            element={
              <ProtectedRoute>
                <TicTacToeLobby />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ttt/game/:id" 
            element={
              <ProtectedRoute>
                <TicTacToeGame />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/match3" 
            element={
              <ProtectedRoute>
                <Match3Game />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
