import { create } from 'zustand';

interface GameState {
  username: string;
  setUsername: (name: string) => void;
  roomId: string;
  setRoomId: (id: string) => void;
  gameState: any; // Generic game state that will be synced
  setGameState: (state: any) => void;
}

export const useGameStore = create<GameState>((set) => ({
  username: localStorage.getItem('username') || '',
  setUsername: (name: string) => {
    localStorage.setItem('username', name);
    set({ username: name });
  },
  roomId: '',
  setRoomId: (id: string) => set({ roomId: id }),
  gameState: null,
  setGameState: (state: any) => set({ gameState: state }),
}));
