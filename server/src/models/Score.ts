import mongoose, { Schema, Document } from 'mongoose';

export interface IScore extends Document {
  username: string;
  score: number;
}

const ScoreSchema: Schema = new Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IScore>('Score', ScoreSchema);
