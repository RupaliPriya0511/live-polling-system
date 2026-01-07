import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Poll, PollResult } from '../types';

interface Props {
  socket: Socket;
  onClose: () => void;
}

interface HistoryItem {
  poll: Poll;
  results: PollResult[];
  totalVotes: number;
}

const PollHistory: React.FC<Props> = ({ socket, onClose }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.emit('get:poll-history');

    socket.on('poll:history', (data: HistoryItem[]) => {
      setHistory(data);
      setLoading(false);
    });

    return () => {
      socket.off('poll:history');
    };
  }, [socket]);

  return (
    <div className="poll-history-modal">
      <div className="history-content">
        <div className="history-header">
          <h2>View Poll History</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="history-body">
          {loading ? (
            <div className="loading">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="no-history">No polls conducted yet</div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.poll._id} className="history-question">
                  <h3>Question {item.poll.questionNumber}</h3>
                  <div className="history-question-text">{item.poll.question}</div>
                  
                  <div className="history-results">
                    {item.results.map((result, idx) => (
                      <div key={result.optionId} className="history-option">
                        <div className="history-option-bar">
                          <div className="option-icon">
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <div className="option-text">{result.optionText}</div>
                          <div className="option-percentage">{result.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollHistory;