// ============================================
// FILE: backend/src/models/Vote.ts
// ============================================
import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  pollId: mongoose.Types.ObjectId;
  studentName: string;
  studentSessionId: string;
  optionId: string;
  votedAt: Date;
}

const VoteSchema = new Schema<IVote>({
  pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
  studentName: { type: String, required: true },
  studentSessionId: { type: String, required: true },
  optionId: { type: String, required: true },
  votedAt: { type: Date, default: Date.now }
});

VoteSchema.index({ pollId: 1, studentSessionId: 1 }, { unique: true });
VoteSchema.index({ pollId: 1 });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);