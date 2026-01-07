import { Request, Response } from 'express';
import { PollService } from '../services/PollService';
import { VoteService } from '../services/VoteService';

export class PollController {
  static async createPoll(req: Request, res: Response) {
    try {
      const { question, options, duration } = req.body;
      const poll = await PollService.createPoll(question, options, duration);
      res.status(201).json(poll);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create poll' });
    }
  }

  static async getActivePoll(req: Request, res: Response) {
    try {
      const poll = await PollService.getActivePoll();
      res.json(poll);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get active poll' });
    }
  }

  static async submitVote(req: Request, res: Response) {
    try {
      const { pollId, userId, selectedOption } = req.body;
      
      const hasVoted = await VoteService.hasUserVoted(pollId, userId);
      if (hasVoted) {
        return res.status(400).json({ error: 'User has already voted' });
      }
      
      const vote = await VoteService.submitVote(pollId, userId, selectedOption);
      res.status(201).json(vote);
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit vote' });
    }
  }

  static async getPollResults(req: Request, res: Response) {
    try {
      const { pollId } = req.params;
      const results = await PollService.getPollResults(pollId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get poll results' });
    }
  }
}