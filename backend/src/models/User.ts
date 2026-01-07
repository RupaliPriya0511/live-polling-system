import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  sessionId: string;
  socketId?: string;
  name: string;
  role: 'teacher' | 'student';
  connectedAt: Date;
  isKicked: boolean;
}

const UserSchema = new Schema<IUser>({
  sessionId: { type: String, required: true, unique: true },
  socketId: { type: String },
  name: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  connectedAt: { type: Date, default: Date.now },
  isKicked: { type: Boolean, default: false }
});

UserSchema.index({ sessionId: 1 });
UserSchema.index({ socketId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);