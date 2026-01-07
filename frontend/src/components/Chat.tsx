import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface Props {
  socket: Socket;
  currentUserName?: string;
  messages?: any[];
  onMessagesChange?: (messages: any[]) => void;
}

const Chat: React.FC<Props> = ({ socket, currentUserName = 'Unknown', messages: externalMessages }) => {
  const [messages, setMessages] = useState<any[]>(externalMessages || []);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalMessages) {
      setMessages(externalMessages);
    }
  }, [externalMessages]);

  useEffect(() => {
    if (!externalMessages) {
      socket.on('chat:message', (message) => {
        console.log('Chat message received:', message);
        setMessages(prev => [...prev, message]);
      });

      socket.on('chat:history', (messages) => {
        console.log('Chat history received:', messages);
        setMessages(messages);
      });

      return () => {
        socket.off('chat:message');
        socket.off('chat:history');
      };
    }
  }, [socket, externalMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      socket.emit('chat:send', { message: newMessage.trim() });
      setNewMessage('');
    }
  };

  return (
    <div className="chat-section">
      <div className="chat-messages" style={{ 
        height: '300px', 
        overflowY: 'auto', 
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        {messages.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
            No messages yet...
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.name === currentUserName;
            const isTeacher = msg.role === 'teacher';
            
            return (
              <div key={index} style={{ 
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
              }}>
                {/* User name label */}
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#666', 
                  marginBottom: '0.25rem',
                  fontWeight: '500'
                }}>
                  {msg.name}
                </div>
                
                {/* Message bubble */}
                <div style={{
                  background: isTeacher ? '#6366f1' : '#374151',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  wordWrap: 'break-word',
                  alignSelf: isCurrentUser ? 'flex-end' : 'flex-start'
                }}>
                  {msg.message}
                </div>
                
                {/* Timestamp */}
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: '#999', 
                  marginTop: '0.25rem'
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ 
            flex: 1, 
            padding: '0.75rem', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          style={{ 
            background: newMessage.trim() ? '#6366f1' : '#d1d5db', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '8px', 
            cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;