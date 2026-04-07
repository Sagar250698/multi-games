import { Server, Socket } from 'socket.io';
import Room from './models/Room.js';
import UserStat from './models/UserStat.js';
import Score from './models/Score.js';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- TIC TAC TOE EVENTS ---

    socket.on('joinRoom', async ({ roomId, username }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit('error', 'Room not found');
          return;
        }

        if (room.players.length >= 2) {
          socket.emit('error', 'Room is full');
          return;
        }

        const playerSymbol = room.players.length === 0 ? 'X' : 'O';
        room.players.push({ socketId: socket.id, username, symbol: playerSymbol });

        if (room.players.length === 2) {
          room.status = 'playing';
          room.currentTurn = room.players[0].socketId; // X starts
        }

        await room.save();
        socket.join(roomId);
        io.to(roomId).emit('roomUpdated', room);
      } catch (err: any) {
        socket.emit('error', err.message);
      }
    });

    socket.on('makeMove', async ({ roomId, index }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room || room.status !== 'playing') return;
        if (room.currentTurn !== socket.id) return;
        if (room.board[index] !== null) return;

        const player = room.players.find(p => p.socketId === socket.id);
        if (!player) return;

        room.board[index] = player.symbol;
        
        // Check winner
        const winnerSymbol = checkWinner(room.board);
        if (winnerSymbol) {
          room.status = 'finished';
          room.winner = winnerSymbol === 'draw' ? 'draw' : socket.id;
          await updateStats(room);
        } else {
          // Switch turn
          const nextPlayer = room.players.find(p => p.socketId !== socket.id);
          if (nextPlayer) {
            room.currentTurn = nextPlayer.socketId;
          }
        }

        await room.save();
        io.to(roomId).emit('roomUpdated', room);
      } catch (err: any) {
        socket.emit('error', err.message);
      }
    });

    socket.on('rematch', async ({ roomId }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) return;
        
        room.board = Array(9).fill(null);
        room.status = 'playing';
        room.winner = null;
        room.currentTurn = room.players[0].socketId; // X starts again
        
        await room.save();
        io.to(roomId).emit('roomUpdated', room);
      } catch (err: any) {
        socket.emit('error', err.message);
      }
    });

    // --- MATCH-3 EVENTS ---
    
    socket.on('newScore', async () => {
      // When a new score is submitted via API, we can trigger a leaderboard update
      const topScores = await Score.find().sort({ score: -1 }).limit(20);
      io.emit('leaderboardMatch3Update', topScores);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Handle player leaving room logic if needed
    });
  });
};

const checkWinner = (board: (string | null)[]) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every(cell => cell !== null)) {
    return 'draw';
  }

  return null;
};

const updateStats = async (room: any) => {
  for (const player of room.players) {
    let stat = await UserStat.findOne({ username: player.username });
    if (!stat) {
      stat = new UserStat({ username: player.username });
    }

    if (room.winner === 'draw') {
      stat.draws += 1;
    } else if (room.winner === player.socketId) {
      stat.wins += 1;
    } else {
      stat.losses += 1;
    }
    await stat.save();
  }
};
