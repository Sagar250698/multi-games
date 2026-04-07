import express, { Request, Response } from 'express';
import Room from '../models/Room.js';
import Score from '../models/Score.js';
import UserStat from '../models/UserStat.js';

const router = express.Router();

// Tic Tac Toe - Create Room
router.post('/rooms', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Create an empty room. The creator will join via socket and be added to players then.
    const newRoom = new Room({
      roomId,
      players: [],
      status: 'waiting',
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Tic Tac Toe - Get Room
router.get('/rooms/:id', async (req: Request, res: Response) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Match-3 - Submit Score
router.post('/scores', async (req: Request, res: Response) => {
  try {
    const { username, score } = req.body;
    const newScore = new Score({ username, score });
    await newScore.save();
    
    // Broadcast of leaderboard is handled by Socket.io separately or via this API if needed,
    // but typically Socket.io will broadcast after this.
    
    res.status(201).json(newScore);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboards
router.get('/leaderboard/match3', async (req: Request, res: Response) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(20);
    res.json(scores);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leaderboard/stats', async (req: Request, res: Response) => {
  try {
    const stats = await UserStat.find().sort({ wins: -1 }).limit(20);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
