// ============================================
// FILE: README.md
// ============================================
# Live Polling System

A resilient real-time polling system with Teacher and Student personas, built with React, Node.js, Socket.io, and MongoDB.

## Features

- ✅ Real-time polling with Socket.io
- ✅ Timer synchronization for late joiners
- ✅ State recovery on page refresh
- ✅ Duplicate vote prevention
- ✅ Poll history with database persistence
- ✅ Teacher can kick students
- ✅ Real-time chat between teacher and students
- ✅ Live results visualization

## Tech Stack

### Backend
- Node.js with Express
- Socket.io for real-time communication
- MongoDB with Mongoose
- TypeScript

### Frontend
- React 18 with Hooks
- Socket.io-client
- TypeScript
- Vite

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/polling-system
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/polling-system
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Important:** See `MONGODB_SETUP.md` for detailed MongoDB configuration instructions.

5. Start development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with backend URL:
```
VITE_API_URL=http://localhost:3000
```

5. Start development server:
```bash
npm run dev
```

6. Open browser at `http://localhost:5173`

## Architecture Highlights

### Backend Architecture
- **Controller-Service Pattern**: Business logic separated from socket handlers
- **Services**: PollService and VoteService handle all database operations
- **Socket Handler**: Manages real-time communication
- **Models**: Mongoose schemas for Poll, Vote, and User

### Frontend Architecture
- **Custom Hooks**: 
  - `useSocket`: Manages socket connection lifecycle
  - `usePollTimer`: Synchronizes timer with server time
  - `usePollState`: Manages poll state and recovery
- **Component Structure**: Separated by responsibility
- **State Management**: React Context/Hooks

## Key Implementation Details

### Timer Synchronization
When a student joins late, their timer calculates remaining time based on server's `startedAt` timestamp:

```typescript
const elapsed = (Date.now() - serverTime.getTime()) / 1000;
const remaining = Math.max(0, duration - elapsed);
```

### State Recovery
On page refresh, the application:
1. Reconnects to socket
2. Emits `get:current-state` event
3. Receives current poll state from server
4. Restores UI exactly as it was

### Race Condition Prevention
Duplicate votes prevented using:
1. MongoDB unique compound index on `(pollId, studentSessionId)`
2. Backend validation before inserting vote
3. Client-side UI state management

## Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL`

## Testing Scenarios

1. ✅ Basic flow: Teacher creates poll → Students vote → Results shown
2. ✅ Late join: Student joins mid-poll with synced timer
3. ✅ Page refresh: State recovers correctly
4. ✅ Duplicate vote: Second vote attempt rejected
5. ✅ Teacher kick: Student sees kicked screen
6. ✅ Poll history: Past polls with correct results
7. ✅ Real-time chat: Messages between teacher and students

## API Events

### Client → Server
- `user:register` - Register user session
- `teacher:create-poll` - Create new poll
- `student:vote` - Submit vote
- `teacher:kick-student` - Remove student
- `get:poll-history` - Request poll history
- `chat:send` - Send chat message

### Server → Client
- `poll:created` - New poll started
- `poll:ended` - Poll ended
- `poll:state` - Current state (for recovery)
- `poll:results` - Real-time vote updates
- `students:list` - Connected students
- `user:kicked` - Student removed
- `chat:message` - New chat message

## License

MIT