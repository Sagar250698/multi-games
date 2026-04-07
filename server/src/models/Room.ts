import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer {
  socketId: string;
  username: string;
  symbol: 'X' | 'O';
}

export interface IRoom extends Document {
  roomId: string;
  players: IPlayer[];
  board: (string | null)[];
  currentTurn: string; // socketId of the player whose turn it is
  status: 'waiting' | 'playing' | 'finished';
  winner: string | null; // socketId or 'draw'
}

const RoomSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  players: [
    {
      socketId: { type: String, required: true },
      username: { type: String, required: true },
      symbol: { type: String, enum: ['X', 'O'], required: true },
    },
  ],
  board: { type: [Schema.Types.Mixed], default: Array(9).fill(null) },
  currentTurn: { type: String, default: null },
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  winner: { type: String, default: null },
});

export default mongoose.model<IRoom>('Room', RoomSchema);
