import React from 'react';
import { Poll, PollResult } from '../types';

interface Props {
  poll: Poll;
  results: PollResult[];
}

const PollResults: React.FC<Props> = ({ poll, results }) => {
  // Create results array with all options, even if no votes yet
  const allResults = poll.options.map((option) => {
    const existingResult = results.find(r => r.optionId === option.id);
    return {
      optionId: option.id,
      optionText: option.text,
      count: existingResult ? existingResult.count : 0,
      percentage: existingResult ? existingResult.percentage : 0
    };
  });

  const totalVotes = allResults.reduce((sum, result) => sum + result.count, 0);

  return (
    <div className="question-display">
      <div className="question-header">
        {poll.question}
      </div>
      
      <div className="question-options">
        {allResults.map((result) => (
          <div 
            key={result.optionId} 
            className={`option-bar ${result.percentage > 0 ? 'has-votes' : ''}`}
            style={result.percentage > 0 ? {
              background: `linear-gradient(to right, #6366f1 ${result.percentage}%, #e5e7eb ${result.percentage}%)`
            } : {}}
          >
            <div className="option-icon">
              {String.fromCharCode(65 + poll.options.findIndex(opt => opt.id === result.optionId))}
            </div>
            <div className="option-text">{result.optionText}</div>
            <div className="option-percentage">{result.percentage}%</div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280' }}>
        Total votes: {totalVotes}
      </div>
    </div>
  );
};

export default PollResults;