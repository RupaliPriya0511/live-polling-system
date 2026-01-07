import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  senderName: string;
  senderRole: 'teacher' | 'student';
  message: string;
  timestamp: Date;
  sessionId?: string; // Optional: to track which session the message belongs to
}

const ChatMessageSchema = new Schema<IChatMessage>({
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['teacher', 'student'], required: true },
  message: { type: String, required: true, maxlength: 500 },
  timestamp: { type: Date, default: Date.now },
  sessionId: { type: String } // For future session-based chat rooms
});

// Index for efficient querying of recent messages
ChatMessageSchema.index({ timestamp: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);