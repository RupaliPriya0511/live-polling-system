import { Vote, IVote } from '../models/Vote';
import mongoose from 'mongoose';

export class VoteService {
  async submitVote(
    pollId: string, 
    studentSessionId: string, 
    studentName: string, 
    optionId: string
  ): Promise<IVote> {
    // Check for duplicate vote
    const existingVote = await Vote.findOne({
      pollId: new mongoose.Types.ObjectId(pollId),
      studentSessionId
    });

    if (existingVote) {
      throw new Error('You have already voted on this poll');
    }

    const vote = new Vote({
      pollId: new mongoose.Types.ObjectId(pollId),
      studentSessionId,
      studentName,
      optionId,
      votedAt: new Date()
    });

    await vote.save();
    return vote;
  }

  async hasVoted(pollId: string, studentSessionId: string): Promise<boolean> {
    const vote = await Vote.findOne({
      pollId: new mongoose.Types.ObjectId(pollId),
      studentSessionId
    });
    return !!vote;
  }

  async getVoteCount(pollId: string): Promise<number> {
    return Vote.countDocuments({ 
      pollId: new mongoose.Types.ObjectId(pollId) 
    });
  }
}