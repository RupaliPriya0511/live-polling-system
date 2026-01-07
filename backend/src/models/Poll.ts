
// ============================================
// FILE: backend/src/models/Poll.ts
// ============================================
import mongoose, { Schema, Document } from 'mongoose';

export interface IPollOption {
  id: string;
  text: string;
  isCorrect?: boolean; // Add correct answer flag
}

export interface IPoll extends Document {
  question: string;
  options: IPollOption[];
  duration: number;
  startedAt?: Date;
  endedAt?: Date;
  isActive: boolean;
  questionNumber: number;
  createdAt: Date;
}

const PollSchema = new Schema<IPoll>({
  question: { type: String, required: true },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  duration: { type: Number, required: true, default: 60 },
  startedAt: { type: Date },
  endedAt: { type: Date },
  isActive: { type: Boolean, default: false },
  questionNumber: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

PollSchema.index({ isActive: 1 });
PollSchema.index({ createdAt: -1 });

export const Poll = mongoose.model<IPoll>('Poll', PollSchema)