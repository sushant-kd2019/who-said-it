# Who Said It? 🎭

A real-time multiplayer party game where players answer creative questions about each other and vote for the best answers.

**Live at:** [whosaidit.lecorvus.com](https://whosaidit.lecorvus.com)

## 🎮 How to Play

1. Enter your name
2. Host a room or join with a code
3. Wait for friends to join (minimum 3 players)
4. Host starts the game
5. Answer questions about each other
6. Vote for the funniest/best answers
7. See who wrote what and earn points!

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Socket.IO
- **Database:** MongoDB
- **Deployment:** Cloudflare Pages (frontend) + Railway (backend)

## 📁 Project Structure

```
who-said-that/
├── client/          # React frontend
├── server/          # Node.js backend
├── PRD.md           # Product requirements
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd who-said-that

# Install all dependencies
npm run install:all

# Set up environment variables
cp .env.example server/.env
# Edit server/.env with your MongoDB URI
```

### Development

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:server  # Backend on http://localhost:3001
npm run dev:client  # Frontend on http://localhost:5173
```

### Build

```bash
# Build both
npm run build

# Or build separately:
npm run build:server
npm run build:client
```

## 🌐 Deployment

### Backend (Railway)

1. Connect your GitHub repo to Railway
2. Set root directory to `server`
3. Add environment variables:
   - `MONGODB_URI`
   - `CLIENT_URL=https://whosaidit.lecorvus.com`
   - `NODE_ENV=production`

### Frontend (Cloudflare Pages)

1. Connect your GitHub repo to Cloudflare Pages
2. Set root directory to `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_SOCKET_URL=https://your-railway-app.railway.app`

## 📝 License

MIT

