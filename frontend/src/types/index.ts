export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  duration: number;
  startedAt?: string;
  endedAt?: string;
  isActive: boolean;
  questionNumber: number;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  isCorrect?: boolean; // Add correct answer flag
}

export interface Vote {
  _id: string;
  pollId: string;
  studentName: string;
  studentSessionId: string;
  optionId: string;
  votedAt: string;
}

export interface PollResult {
  optionId: string;
  optionText: string;
  count: number;
  percentage: number;
}

export interface Student {
  name: string;
  sessionId: string;
}

export interface ChatMessage {
  name: string;
  message: string;
  timestamp: Date;
  role: 'teacher' | 'student';
}