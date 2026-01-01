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
- **Deployment:** Cloudflare Pages (frontend) + Render (backend)

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

### Backend (Render)

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New** → **Web Service** → Select this repo
3. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `CLIENT_URL` - `https://whosaidit.lecorvus.com` (or your frontend URL)
   - `NODE_ENV` - `production`
5. Deploy and copy your Render URL (e.g., `https://whosaidit-server.onrender.com`)

> **Note:** Free tier sleeps after 15 min of inactivity (~50s cold start on first request)

### Frontend (Cloudflare Pages)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables:
   - `VITE_API_URL` - Your Render backend URL
   - `VITE_SOCKET_URL` - Your Render backend URL (same as above)
5. Deploy!

## 📝 License

MIT

