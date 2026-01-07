# 🎓 Live Polling System

A real-time polling application built with React, Node.js, Socket.io, and MongoDB. Designed for interactive classroom environments where teachers can create polls and students can vote in real-time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.x-blue)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## ✨ Features

- **Real-time Polling**: Instant vote updates using Socket.io
- **Timer Synchronization**: Late joiners see accurate remaining time
- **State Recovery**: Automatic reconnection and state restoration on page refresh
- **Duplicate Vote Prevention**: MongoDB unique indexes prevent multiple votes
- **Poll History**: View past polls with complete results
- **User Management**: Teachers can remove disruptive students
- **Real-time Chat**: Communication between teachers and students
- **Live Results**: Dynamic visualization of voting results
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **TypeScript** - Type safety

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Socket.io-client** - Real-time client
- **Vite** - Build tool and dev server

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **MongoDB** - [Local installation](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- **Git** - Version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/RupaliPriya0511/live-polling-system.git
cd live-polling-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
MONGODB_URI=mongodb://localhost:27017/polling-system
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/polling-system
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Note**: See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed database configuration.

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Update the `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## ⚙️ Configuration

### Environment Variables

#### Backend (`backend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/polling-system` |
| `PORT` | Backend server port | `3000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |

#### Frontend (`frontend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

## 📖 Usage

### As a Teacher

1. Select **Teacher** role on the home screen
2. Create a poll with:
   - Question text
   - Multiple options (2-6)
   - Duration (30-120 seconds)
   - Mark correct answers (optional)
3. Click **Ask Question** to start the poll
4. Monitor real-time results and student participation
5. Use the **Participants** tab to manage students
6. Use the **Chat** tab to communicate with students
7. View **Poll History** to see past results

### As a Student

1. Select **Student** role on the home screen
2. Enter your name
3. Wait for the teacher to start a poll
4. Select your answer and click **Submit**
5. View results after voting
6. Use the chat button to communicate with the teacher

## 📁 Project Structure

```
live-polling-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── handlers/        # Socket.io event handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── services/        # Business logic
│   │   └── server.ts        # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main component
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
├── MONGODB_SETUP.md
└── README.md
```

## 🔌 API Documentation

### Socket Events

#### Client → Server
- `user:register` - Register user session
- `teacher:create-poll` - Create new poll
- `student:vote` - Submit vote
- `teacher:kick-student` - Remove student
- `get:poll-history` - Request poll history
- `get:current-state` - Request current state
- `chat:send` - Send chat message

#### Server → Client
- `poll:created` - New poll started
- `poll:ended` - Poll ended
- `poll:state` - Current state (for recovery)
- `poll:results` - Real-time vote updates
- `students:list` - Connected students
- `user:kicked` - Student removed
- `chat:message` - New chat message
- `chat:history` - Chat history


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Contact

**Rupali Priya**

- GitHub: [@RupaliPriya0511](https://github.com/RupaliPriya0511)
- Project Link: [https://github.com/RupaliPriya0511/live-polling-system](https://github.com/RupaliPriya0511/live-polling-system)



⭐ If you find this project useful, please consider giving it a star on GitHub!
