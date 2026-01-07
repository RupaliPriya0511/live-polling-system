import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Poll } from '../types';

interface Props {
  socket: Socket;
  studentName: string;
  sessionId: string;
}

const StudentView: React.FC<Props> = ({ socket, studentName, sessionId }) => {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Timer logic
  useEffect(() => {
    if (!currentPoll || !currentPoll.startedAt) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const startTime = new Date(currentPoll.startedAt!).getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, currentPoll.duration - elapsed);
      setTimeRemaining(remaining);
      
      if (remaining <= 0 && !hasVoted) {
        setHasVoted(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentPoll, hasVoted]);

  useEffect(() => {
    console.log('[STUDENT] Component mounted, requesting current state');
    socket.emit('get:current-state');
    
    socket.on('poll:created', (data) => {
      console.log('[STUDENT] New poll:', data);
      setCurrentPoll(data.poll);
      setHasVoted(false);
      setSelectedOption(null);
    });

    socket.on('vote:submitted', () => {
      console.log('[STUDENT] Vote submitted');
      setHasVoted(true);
    });

    socket.on('poll:ended', () => {
      console.log('[STUDENT] Poll ended');
      setHasVoted(true);
    });

    socket.on('chat:message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    socket.on('chat:history', (messages) => {
      console.log('[STUDENT] Received chat history:', messages.length, 'messages');
      setChatMessages(messages);
    });

    socket.on('poll:state', (data) => {
      console.log('[STUDENT] State recovery received:', data);
      
      if (data.poll && data.poll.isActive) {
        console.log('[STUDENT] Setting active poll:', data.poll);
        setCurrentPoll(data.poll);
        setHasVoted(data.hasVoted || false);
        
        if (data.timeRemaining !== undefined) {
          console.log('[STUDENT] Using server time remaining:', data.timeRemaining);
          setTimeRemaining(data.timeRemaining);
        }
      } else {
        console.log('[STUDENT] No active poll or poll inactive');
        setCurrentPoll(null);
        setHasVoted(false);
      }
    });

    return () => {
      socket.off('poll:created');
      socket.off('vote:submitted');
      socket.off('poll:ended');
      socket.off('chat:message');
      socket.off('chat:history');
      socket.off('poll:state');
    };
  }, [socket]);

  const handleVote = () => {
    if (!selectedOption || !currentPoll) {
      alert('Please select an option');
      return;
    }
    
    console.log('[STUDENT] Voting:', { pollId: currentPoll._id, optionId: selectedOption });
    socket.emit('student:vote', {
      pollId: currentPoll._id,
      optionId: selectedOption
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit('chat:send', { message: newMessage.trim() });
      setNewMessage('');
    }
  };

  const renderChatMessages = () => {
    return chatMessages.map((msg, index) => {
      const isCurrentUser = msg.name === studentName;
      const isTeacher = msg.role === 'teacher';
      
      return (
        <div key={index} style={{ 
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
        }}>
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#666', 
            marginBottom: '0.25rem'
          }}>
            {msg.name}
          </div>
          <div style={{
            background: isTeacher ? '#6366f1' : '#374151',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            maxWidth: '80%',
            wordWrap: 'break-word'
          }}>
            {msg.message}
          </div>
        </div>
      );
    });
  };

  const renderChatPopup = () => (
    <div style={{
      position: 'fixed',
      bottom: '6rem',
      right: '2rem',
      width: '300px',
      height: '400px',
      background: 'white',
      border: '1px solid #ccc',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Chat</h3>
        <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {renderChatMessages()}
      </div>
      <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );

  // No poll - waiting
  if (!currentPoll) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh' }}>
        <div style={{ background: '#6366f1', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'inline-block', marginBottom: '2rem' }}>
          🎓 Intervue Poll
        </div>
        
        <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
          <strong>Debug Info:</strong><br/>
          Current Poll: {currentPoll ? 'EXISTS' : 'NULL'}<br/>
          Has Voted: {hasVoted ? 'YES' : 'NO'}<br/>
          Time Remaining: {timeRemaining}s<br/>
          Socket Connected: {socket.connected ? 'YES' : 'NO'}<br/>
          Session ID: {sessionId}<br/>
        </div>
        
        <div style={{ fontSize: '3rem', margin: '2rem 0' }}>⏳</div>
        <h2>Wait for the teacher to ask questions..</h2>
        
        <button 
          onClick={() => setShowChat(!showChat)}
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
            cursor: 'pointer'
          }}
        >
          💬
        </button>

        {showChat && renderChatPopup()}
      </div>
    );
  }

  // Has voted or time expired
  if (hasVoted || timeRemaining === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh' }}>
        <div style={{ background: '#6366f1', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'inline-block', marginBottom: '1rem' }}>
          🎓 Intervue Poll
        </div>
        <div style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'inline-block', marginBottom: '2rem', marginLeft: '1rem' }}>
          🚩 {studentName}
        </div>
        
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h2>Thank you for voting!</h2>
          <p>Wait for the teacher to ask a new question..</p>
        </div>

        <button 
          onClick={() => setShowChat(!showChat)}
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
            cursor: 'pointer'
          }}
        >
          💬
        </button>

        {showChat && renderChatPopup()}
      </div>
    );
  }

  // Active voting interface
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ background: '#6366f1', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'inline-block', marginBottom: '1rem' }}>
        🎓 Intervue Poll
      </div>
      <div style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'inline-block', marginBottom: '2rem', marginLeft: '1rem' }}>
        🚩 {studentName}
      </div>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Question {currentPoll.questionNumber}</h2>
          <div style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '15px' }}>
            ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div style={{ background: '#374151', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          {currentPoll.question}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          {currentPoll.options.map((option) => (
            <div
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: selectedOption === option.id ? '2px solid #6366f1' : '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '1rem',
                background: selectedOption === option.id ? '#f0f9ff' : 'white',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #d1d5db',
                borderRadius: '50%',
                marginRight: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: selectedOption === option.id ? '#6366f1' : '#d1d5db'
              }}>
                {selectedOption === option.id && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    background: '#6366f1',
                    borderRadius: '50%'
                  }} />
                )}
              </div>
              <span>{option.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleVote}
          disabled={!selectedOption}
          style={{
            background: selectedOption ? '#6366f1' : '#d1d5db',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: selectedOption ? 'pointer' : 'not-allowed',
            width: '100%'
          }}
        >
          Submit
        </button>
      </div>
      
      <button 
        onClick={() => setShowChat(!showChat)}
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
          cursor: 'pointer'
        }}
      >
        💬
      </button>

      {showChat && renderChatPopup()}
    </div>
  );
};

export default StudentView;