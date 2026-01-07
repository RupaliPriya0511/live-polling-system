import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Poll, PollResult, Student } from '../types';
import PollResults from './PollResults';
import PollHistory from './PollHistory';
import Chat from './Chat';
import ParticipantsList from './ParticipantsList';

interface Props {
  socket: Socket;
}

const TeacherDashboard: React.FC<Props> = ({ socket }) => {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [duration, setDuration] = useState(60);
  const [results, setResults] = useState<PollResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('participants');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showChatPopup, setShowChatPopup] = useState(false);

  useEffect(() => {
    // Request current state on mount
    socket.emit('get:current-state');
    
    socket.on('poll:created', (data) => {
      console.log('[TEACHER] Poll created:', data);
      setCurrentPoll(data.poll);
      const initialResults = data.poll.options.map((option: any) => ({
        optionId: option.id,
        optionText: option.text,
        count: 0,
        percentage: 0
      }));
      setResults(initialResults);
      setQuestion('');
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]);
    });

    socket.on('poll:ended', (data) => {
      console.log('[TEACHER] Poll ended:', data);
      if (data.results && data.results.results) {
        setResults(data.results.results);
      }
    });

    socket.on('poll:results', (data) => {
      console.log('[TEACHER] Results update:', data);
      if (data.results) {
        setResults(data.results);
      }
    });

    socket.on('poll:state', (data) => {
      console.log('[TEACHER] Poll state:', data);
      if (data.poll && data.poll.isActive) {
        setCurrentPoll(data.poll);
        if (data.results && data.results.results) {
          setResults(data.results.results);
        } else {
          const initialResults = data.poll.options.map((option: any) => ({
            optionId: option.id,
            optionText: option.text,
            count: 0,
            percentage: 0
          }));
          setResults(initialResults);
        }
      } else {
        setCurrentPoll(null);
        setResults([]);
      }
    });

    socket.on('students:list', (list: Student[]) => {
      console.log('[TEACHER] Students list:', list);
      setStudents(list);
    });

    socket.on('chat:message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    socket.on('chat:history', (messages) => {
      setChatMessages(messages);
    });

    socket.on('error', (error) => {
      console.error('[TEACHER] Socket error:', error);
      alert(error.message);
    });

    return () => {
      socket.off('poll:created');
      socket.off('poll:ended');
      socket.off('poll:results');
      socket.off('poll:state');
      socket.off('students:list');
      socket.off('chat:message');
      socket.off('chat:history');
      socket.off('error');
    };
  }, [socket]);

  const handleCreatePoll = () => {
    const validOptions = options.filter(opt => opt.text.trim());
    
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    const pollOptions = validOptions.map((opt, idx) => ({
      id: `option_${idx}`,
      text: opt.text.trim(),
      isCorrect: opt.isCorrect
    }));

    console.log('[TEACHER] Creating poll:', { question: question.trim(), options: pollOptions, duration });
    
    socket.emit('teacher:create-poll', {
      question: question.trim(),
      options: pollOptions,
      duration
    });
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const handleKickStudent = (sessionId: string) => {
    socket.emit('teacher:kick-student', { sessionId });
  };

  const handleNewQuestion = () => {
    setCurrentPoll(null);
    setResults([]);
    setQuestion('');
    setOptions([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]);
  };

  const handleCorrectAnswerChange = (index: number, isCorrect: boolean) => {
    const newOptions = [...options];
    newOptions[index].isCorrect = isCorrect;
    setOptions(newOptions);
  };

  // Render chat popup modal
  const renderChatPopup = () => (
    <div style={{
      position: 'fixed',
      bottom: '6rem',
      right: '2rem',
      width: '350px',
      height: '450px',
      background: 'white',
      border: '1px solid #ccc',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    }}>
      <div style={{ 
        padding: '1rem', 
        borderBottom: '1px solid #eee', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8f9fa',
        borderRadius: '12px 12px 0 0'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setActiveTab('chat')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.9rem',
              cursor: 'pointer',
              color: activeTab === 'chat' ? '#6366f1' : '#6b7280',
              padding: '0.5rem 0',
              borderBottom: activeTab === 'chat' ? '2px solid #6366f1' : 'none'
            }}
          >
            Chat
          </button>
          <button 
            onClick={() => setActiveTab('participants')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.9rem',
              cursor: 'pointer',
              color: activeTab === 'participants' ? '#6366f1' : '#6b7280',
              padding: '0.5rem 0',
              borderBottom: activeTab === 'participants' ? '2px solid #6366f1' : 'none'
            }}
          >
            Participants
          </button>
        </div>
        <button 
          onClick={() => setShowChatPopup(false)} 
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.2rem', 
            cursor: 'pointer',
            color: '#6b7280',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', padding: '1rem' }}>
        {activeTab === 'participants' && (
          <ParticipantsList students={students} onKick={handleKickStudent} />
        )}
        {activeTab === 'chat' && (
          <Chat 
            socket={socket} 
            currentUserName="Teacher" 
            messages={chatMessages}
            onMessagesChange={setChatMessages}
          />
        )}
      </div>
    </div>
  );

  // Poll creation form
  if (!currentPoll || !currentPoll.isActive) {
    return (
      <div className="teacher-dashboard-container">
        <div className="teacher-header">
          <div className="intervue-badge">🎓 Intervue Poll</div>
          <button className="view-history-btn" onClick={() => setShowHistory(true)}>
            👁️ View Poll history
          </button>
        </div>
        
        <div className="create-poll-section">
          <h1>Let's Get Started</h1>
          <p>you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
          
          <div className="poll-form">
            <div className="form-group">
              <label>Enter your question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is your favorite programming language?"
                className="question-input"
              />
              <div className="duration-selector">
                <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                  <option value={120}>120 seconds</option>
                </select>
                <span className="timer-display">
                  ⏱️ {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="options-section">
              <div className="options-header">
                <h3>Edit Options</h3>
                <h3>Is it Correct?</h3>
              </div>
              
              {options.map((option, idx) => (
                <div key={idx} className="option-row">
                  <div className="option-input-group">
                    <div className="option-number">{idx + 1}</div>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[idx].text = e.target.value;
                        setOptions(newOptions);
                      }}
                      placeholder={`Option ${idx + 1}`}
                    />
                  </div>
                  
                  <div className="correct-answer-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name={`correct-${idx}`}
                        checked={option.isCorrect === true}
                        onChange={() => handleCorrectAnswerChange(idx, true)}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name={`correct-${idx}`}
                        checked={option.isCorrect === false}
                        onChange={() => handleCorrectAnswerChange(idx, false)}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              ))}
              
              {options.length < 6 && (
                <button className="add-option-btn" onClick={handleAddOption}>
                  + Add More option
                </button>
              )}
            </div>

            <button className="ask-question-btn" onClick={handleCreatePoll}>
              Ask Question
            </button>
          </div>
        </div>

        <button 
          onClick={() => setShowChatPopup(!showChatPopup)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100
          }}
        >
          💬
        </button>

        {showChatPopup && renderChatPopup()}
        {showHistory && <PollHistory socket={socket} onClose={() => setShowHistory(false)} />}
      </div>
    );
  }

  // Active poll view
  return (
    <div className="teacher-dashboard-container">
      <div className="teacher-header">
        <div className="intervue-badge">🎓 Intervue Poll</div>
        <button className="view-history-btn" onClick={() => setShowHistory(true)}>
          👁️ View Poll history
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <PollResults poll={currentPoll} results={results} />
        <button className="ask-new-question-btn" onClick={handleNewQuestion}>
          + Ask a new question
        </button>
      </div>

      <button 
        onClick={() => setShowChatPopup(!showChatPopup)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100
        }}
      >
        💬
      </button>

      {showChatPopup && renderChatPopup()}
      {showHistory && <PollHistory socket={socket} onClose={() => setShowHistory(false)} />}
    </div>
  );
};

export default TeacherDashboard;