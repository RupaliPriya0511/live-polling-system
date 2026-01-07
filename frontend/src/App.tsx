import { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import RoleSelection from './components/RoleSelection';
import StudentNameInput from './components/StudentNameInput';
import TeacherDashboard from './components/TeacherDashboard';
import StudentView from './components/StudentView';
import './app.css';

function App() {
  const { socket } = useSocket();
  const [role, setRole] = useState<'teacher' | 'student' | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isKicked, setIsKicked] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('user:kicked', () => {
      setIsKicked(true);
    });

    socket.on('user:registered', () => {
      setIsRegistered(true);
    });

    return () => {
      socket.off('user:kicked');
      socket.off('user:registered');
    };
  }, [socket]);

  const handleRoleSelect = (selectedRole: 'teacher' | 'student') => {
    setRole(selectedRole);
    
    if (selectedRole === 'teacher') {
      socket?.emit('user:register', {
        sessionId,
        name: 'Teacher',
        role: 'teacher'
      });
    }
  };

  const handleNameSubmit = (name: string) => {
    setStudentName(name);
    socket?.emit('user:register', {
      sessionId,
      name,
      role: 'student'
    });
  };

  if (isKicked) {
    return (
      <div className="kicked-screen">
        <div className="intervue-badge">🎓 Intervue Poll</div>
        <h1>You've been Kicked out !</h1>
        <p>Looks like the teacher had removed you from the poll system. Please Try again sometime.</p>
      </div>
    );
  }

  if (!role) {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  if (role === 'student' && !studentName) {
    return <StudentNameInput onSubmit={handleNameSubmit} />;
  }

  if (!isRegistered || !socket) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Connecting...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {role === 'teacher' ? (
        <TeacherDashboard socket={socket} />
      ) : (
        <StudentView socket={socket} studentName={studentName} sessionId={sessionId} />
      )}
    </div>
  );
}

export default App;
