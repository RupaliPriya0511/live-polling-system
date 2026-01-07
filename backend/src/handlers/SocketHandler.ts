
// ============================================
// FILE: backend/src/handlers/SocketHandler.ts
// ============================================
import { Server, Socket } from 'socket.io';
import { PollService } from '../services/PollService';
import { VoteService } from '../services/VoteService';
import { ChatService } from '../services/ChatService';
import { User } from '../models/User';

const pollService = new PollService();
const voteService = new VoteService();

const connectedUsers = new Map<string, { sessionId: string; name: string; role: string; socketId: string }>();

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', async (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Handle user registration
    socket.on('user:register', async (data: { sessionId: string; name: string; role: 'teacher' | 'student' }) => {
      try {
        const { sessionId, name, role } = data;
        console.log(`[USER] Registering user: ${name} (${role}) with session: ${sessionId}`);
        
        // Store user info
        connectedUsers.set(socket.id, { sessionId, name, role, socketId: socket.id });

        // Check if kicked
        const user = await User.findOne({ sessionId });
        if (user?.isKicked) {
          socket.emit('user:kicked');
          return;
        }

        // Update or create user record
        const savedUser = await User.findOneAndUpdate(
          { sessionId },
          { socketId: socket.id, name, role, connectedAt: new Date() },
          { upsert: true, new: true }
        );
        console.log(`[USER] User saved to database:`, savedUser);

        // Send current state
        await sendCurrentState(socket, sessionId);

        // Send recent chat messages to new user
        try {
          const recentMessages = await ChatService.getRecentMessages(20);
          socket.emit('chat:history', recentMessages.map(msg => ({
            name: msg.senderName,
            message: msg.message,
            timestamp: msg.timestamp,
            role: msg.senderRole
          })));
        } catch (error) {
          console.error('[SOCKET] Error sending chat history:', error);
        }

        // Broadcast student list to teachers
        if (role === 'student') {
          broadcastStudentList(io);
        }

        socket.emit('user:registered', { success: true });
      } catch (error) {
        console.error('[USER] Registration failed:', error);
        socket.emit('error', { message: 'Registration failed' });
      }
    });

    // Teacher creates poll
    socket.on('teacher:create-poll', async (data: { 
      question: string; 
      options: { id: string; text: string }[]; 
      duration: number 
    }) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (user?.role !== 'teacher') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const students = Array.from(connectedUsers.values()).filter(u => u.role === 'student');
        const canCreate = await pollService.canCreateNewPoll(students.length);

        if (!canCreate.canCreate) {
          socket.emit('error', { message: canCreate.reason });
          return;
        }

        const poll = await pollService.createPoll(data.question, data.options, data.duration);
        const startedPoll = await pollService.startPoll(poll._id.toString());

        // Broadcast to all clients
        console.log('Broadcasting poll to all clients:', startedPoll);
        io.emit('poll:created', {
          poll: startedPoll,
          startedAt: startedPoll?.startedAt
        });

        // Broadcast student list immediately
        broadcastStudentList(io);

        // Auto-end poll after duration
        setTimeout(async () => {
          const endedPoll = await pollService.endPoll(poll._id.toString());
          const results = await pollService.getPollResults(poll._id.toString());
          io.emit('poll:ended', { poll: endedPoll, results });
        }, data.duration * 1000);

      } catch (error) {
        socket.emit('error', { message: 'Failed to create poll' });
      }
    });

    // Student submits vote
    socket.on('student:vote', async (data: { pollId: string; optionId: string }) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user || user.role !== 'student') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const vote = await voteService.submitVote(
          data.pollId,
          user.sessionId,
          user.name,
          data.optionId
        );

        socket.emit('vote:submitted', { success: true });

        // Broadcast updated results
        const results = await pollService.getPollResults(data.pollId);
        io.emit('poll:results', results);

      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to submit vote' });
      }
    });

    // Teacher kicks student
    socket.on('teacher:kick-student', async (data: { sessionId: string }) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (user?.role !== 'teacher') return;

        await User.findOneAndUpdate(
          { sessionId: data.sessionId },
          { isKicked: true }
        );

        const studentSocket = Array.from(connectedUsers.entries())
          .find(([_, u]) => u.sessionId === data.sessionId);

        if (studentSocket) {
          io.to(studentSocket[0]).emit('user:kicked');
          connectedUsers.delete(studentSocket[0]);
        }

        broadcastStudentList(io);
      } catch (error) {
        socket.emit('error', { message: 'Failed to kick student' });
      }
    });

    // Get current state request
    socket.on('get:current-state', async () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`[SOCKET] Manual current state request from ${user.name}`);
        await sendCurrentState(socket, user.sessionId);
      }
    });

    // Get poll history
    socket.on('get:poll-history', async () => {
      try {
        const history = await pollService.getPollHistory();
        socket.emit('poll:history', history);
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch history' });
      }
    });

    // Chat message
    socket.on('chat:send', async (data: { message: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      try {
        // Save message to database
        const savedMessage = await ChatService.saveMessage(
          user.name,
          user.role as 'teacher' | 'student',
          data.message
        );

        // Broadcast to all users
        const messageData = {
          name: savedMessage.senderName,
          message: savedMessage.message,
          timestamp: savedMessage.timestamp,
          role: savedMessage.senderRole
        };

        io.emit('chat:message', messageData);
        console.log(`[CHAT] Message from ${user.name}: ${data.message}`);
      } catch (error) {
        console.error('[CHAT] Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      broadcastStudentList(io);
      console.log('Client disconnected:', socket.id);
    });
  });
};

async function sendCurrentState(socket: Socket, sessionId: string) {
  console.log(`[SOCKET] Sending current state to ${sessionId}`);
  
  const activePoll = await pollService.getActivePoll();
  
  if (!activePoll) {
    console.log(`[SOCKET] No active poll found`);
    socket.emit('poll:state', { poll: null });
    return;
  }

  console.log(`[SOCKET] Active poll found:`, {
    id: activePoll._id,
    question: activePoll.question,
    startedAt: activePoll.startedAt,
    duration: activePoll.duration,
    isActive: activePoll.isActive
  });

  // Only send poll state if poll is actually active
  if (!activePoll.isActive) {
    console.log(`[SOCKET] Poll exists but is not active`);
    socket.emit('poll:state', { poll: null });
    return;
  }

  const hasVoted = await voteService.hasVoted(activePoll._id.toString(), sessionId);
  const results = await pollService.getPollResults(activePoll._id.toString());

  // Calculate remaining time for late joiners
  let timeRemaining = 0;
  if (activePoll.startedAt && activePoll.isActive) {
    const now = Date.now();
    const startTime = new Date(activePoll.startedAt).getTime();
    const elapsed = Math.floor((now - startTime) / 1000);
    timeRemaining = Math.max(0, activePoll.duration - elapsed);
    console.log(`[SOCKET] Time calculation - elapsed: ${elapsed}s, remaining: ${timeRemaining}s`);
    
    // If time has expired, don't send the poll
    if (timeRemaining <= 0) {
      console.log(`[SOCKET] Poll time expired, not sending to late joiner`);
      socket.emit('poll:state', { poll: null });
      return;
    }
  }

  const stateData = {
    poll: activePoll,
    startedAt: activePoll.startedAt,
    hasVoted,
    results,
    timeRemaining
  };
  
  console.log(`[SOCKET] Sending poll state:`, stateData);
  socket.emit('poll:state', stateData);
}

function broadcastStudentList(io: Server) {
  const students = Array.from(connectedUsers.values())
    .filter(u => u.role === 'student')
    .map(u => ({ name: u.name, sessionId: u.sessionId }));

  console.log('Broadcasting student list:', students);
  io.emit('students:list', students);
}
