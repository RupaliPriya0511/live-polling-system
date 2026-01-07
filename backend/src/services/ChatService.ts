import { ChatMessage, IChatMessage } from '../models/ChatMessage';

export class ChatService {
  // Save message to database
  static async saveMessage(senderName: string, senderRole: 'teacher' | 'student', message: string): Promise<IChatMessage> {
    const chatMessage = new ChatMessage({
      senderName,
      senderRole,
      message: message.trim(),
      timestamp: new Date()
    });
    
    await chatMessage.save();
    return chatMessage;
  }

  // Get recent chat messages (last 50 messages)
  static async getRecentMessages(limit: number = 50): Promise<IChatMessage[]> {
    return ChatMessage.find()
      .sort({ timestamp: -1 }) // Most recent first
      .limit(limit)
      .exec()
      .then(messages => messages.reverse()); // Reverse to show oldest first in UI
  }

  // Clear old messages (optional - for cleanup)
  static async clearOldMessages(daysOld: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    await ChatMessage.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
  }
}