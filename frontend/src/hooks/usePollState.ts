import { useState, useCallback } from 'react';
import { Poll } from '../types';

export const usePollState = () => {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  const addPoll = useCallback((poll: Poll) => {
    setPolls(prev => [poll, ...prev]);
    setCurrentPoll(poll);
    setHasVoted(false);
  }, []);

  const updatePoll = useCallback((pollId: string, updates: Partial<Poll>) => {
    setPolls(prev => prev.map(poll => 
      poll._id === pollId ? { ...poll, ...updates } : poll
    ));
    
    if (currentPoll?._id === pollId) {
      setCurrentPoll(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentPoll]);

  const setUserVoted = useCallback(() => {
    setHasVoted(true);
  }, []);

  const resetVoteStatus = useCallback(() => {
    setHasVoted(false);
  }, []);

  return {
    currentPoll,
    setCurrentPoll,
    polls,
    addPoll,
    updatePoll,
    hasVoted,
    setUserVoted,
    resetVoteStatus
  };
};