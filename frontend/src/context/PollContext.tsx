import React, { createContext, useContext, ReactNode } from 'react';
import { usePollState } from '../hooks/usePollState';
import { Poll, User } from '../types';

interface PollContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  polls: Poll[];
  addPoll: (poll: Poll) => void;
  updatePoll: (pollId: string, updates: Partial<Poll>) => void;
  hasVoted: boolean;
  setUserVoted: () => void;
  resetVoteStatus: () => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pollState = usePollState();

  return (
    <PollContext.Provider value={pollState}>
      {children}
    </PollContext.Provider>
  );
};

export const usePollContext = () => {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error('usePollContext must be used within a PollProvider');
  }
  return context;
};