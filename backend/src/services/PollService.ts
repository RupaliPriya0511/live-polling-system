import { Poll, IPoll } from '../models/Poll';
import { Vote } from '../models/Vote';
import mongoose from 'mongoose';

export class PollService {
  async createPoll(question: string, options: { id: string; text: string }[], duration: number = 60): Promise<IPoll> {
    const lastPoll = await Poll.findOne().sort({ questionNumber: -1 });
    const questionNumber = lastPoll ? lastPoll.questionNumber + 1 : 1;

    const poll = new Poll({
      question,
      options,
      duration,
      questionNumber,
      isActive: false
    });

    await poll.save();
    return poll;
  }

  async startPoll(pollId: string): Promise<IPoll | null> {
    const poll = await Poll.findByIdAndUpdate(
      pollId,
      { 
        isActive: true,
        startedAt: new Date()
      },
      { new: true }
    );
    
    return poll;
  }

  async endPoll(pollId: string): Promise<IPoll | null> {
    const poll = await Poll.findByIdAndUpdate(
      pollId,
      { 
        isActive: false,
        endedAt: new Date()
      },
      { new: true }
    );
    
    return poll;
  }

  async getActivePoll(): Promise<IPoll | null> {
    return Poll.findOne({ isActive: true });
  }

  async getPollResults(pollId: string) {
    const votes = await Vote.find({ pollId: new mongoose.Types.ObjectId(pollId) });
    const poll = await Poll.findById(pollId);

    if (!poll) return null;

    const results = poll.options.map(option => ({
      optionId: option.id,
      optionText: option.text,
      count: votes.filter(v => v.optionId === option.id).length,
      percentage: votes.length > 0 
        ? Math.round((votes.filter(v => v.optionId === option.id).length / votes.length) * 100)
        : 0
    }));

    return {
      poll,
      results,
      totalVotes: votes.length,
      voters: votes.map(v => ({ name: v.studentName, votedAt: v.votedAt }))
    };
  }

  async getPollHistory() {
    const polls = await Poll.find({ isActive: false, endedAt: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(50);

    const history = await Promise.all(
      polls.map(async (poll) => {
        const results = await this.getPollResults(poll._id.toString());
        return results;
      })
    );

    return history.filter(item => item !== null);
  }

  async canCreateNewPoll(connectedStudents: number): Promise<{ canCreate: boolean; reason?: string }> {
    const activePoll = await this.getActivePoll();
    
    if (!activePoll) {
      return { canCreate: true };
    }

    const votes = await Vote.countDocuments({ 
      pollId: activePoll._id 
    });

    if (votes >= connectedStudents) {
      return { canCreate: true };
    }

    return { 
      canCreate: false, 
      reason: 'Not all students have answered the current question' 
    };
  }
}
