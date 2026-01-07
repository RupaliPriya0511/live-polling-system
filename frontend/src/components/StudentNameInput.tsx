import React, { useState } from 'react';

interface Props {
  onSubmit: (name: string) => void;
}

const StudentNameInput: React.FC<Props> = ({ onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="student-name-container">
      <div className="intervue-badge">🎓 Intervue Poll</div>
      
      <div className="name-section">
        <h1>Let's Get Started</h1>
        <p>If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates</p>
        
        <div className="name-input-section">
          <label>Enter your Name</label>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Bajaj"
              className="name-input"
              required
            />
            <button type="submit" className="continue-btn" disabled={!name.trim()}>
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentNameInput;