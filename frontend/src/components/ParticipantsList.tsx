import React from 'react';
import { Student } from '../types';

interface Props {
  students: Student[];
  onKick: (sessionId: string) => void;
}

const ParticipantsList: React.FC<Props> = ({ students, onKick }) => {
  return (
    <div className="participants-content">
      <div className="participants-header">
        <h4>Name</h4>
        <h4>Action</h4>
      </div>
      
      <div className="participants-list">
        {students.map((student) => (
          <div key={student.sessionId} className="participant-row">
            <span className="participant-name">{student.name}</span>
            <button 
              className="kick-btn"
              onClick={() => onKick(student.sessionId)}
            >
              Kick out
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;