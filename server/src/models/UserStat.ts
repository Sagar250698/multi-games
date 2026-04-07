import mongoose, { Schema, Document } from 'mongoose';

export interface IUserStat extends Document {
  username: string;
  wins: number;
  losses: number;
  draws: number;
}

const UserStatSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
});

export default mongoose.model<IUserStat>('UserStat', UserStatSchema);
