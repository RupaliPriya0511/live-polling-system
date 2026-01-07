import React, { useState } from 'react';

interface Props {
  onSelectRole: (role: 'teacher' | 'student') => void;
}

const RoleSelection: React.FC<Props> = ({ onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="role-selection-container">
      <div className="intervue-badge">🎓 Intervue Poll</div>
      
      <div className="welcome-section">
        <h1>Welcome to the Live Polling System</h1>
        <p>Please select the role that best describes you to begin using the live polling system</p>
      </div>
      
      <div className="role-cards">
        <div 
          className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
          onClick={() => handleRoleSelect('student')}
        >
          <h3>I'm a Student</h3>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
        </div>
        
        <div 
          className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
          onClick={() => handleRoleSelect('teacher')}
        >
          <h3>I'm a Teacher</h3>
          <p>Submit answers and view live poll results in real-time</p>
        </div>
      </div>
      
      <button 
        className="continue-btn" 
        onClick={handleContinue}
        disabled={!selectedRole}
      >
        Continue
      </button>
    </div>
  );
};

export default RoleSelection;