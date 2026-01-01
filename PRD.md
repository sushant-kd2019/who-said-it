# Product Requirements Document (PRD)
# Who Said It? - Multiplayer Party Game

**Version:** 1.0  
**Last Updated:** December 31, 2024  
**Domain:** whosaidit.lecorvus.com

---

## 1. Product Overview

### 1.1 Description
"Who Said It?" is a real-time multiplayer party game where players answer creative questions about each other and vote for the best (funniest/most accurate) answers. The game is designed for social gatherings, remote hangouts, and casual fun among friends.

### 1.2 Target Audience
- Friend groups looking for party games
- Remote teams for ice-breakers
- Family gatherings
- Anyone aged 13+ who enjoys social deduction/party games

### 1.3 Platform
- **Primary:** Mobile web (responsive, mobile-first design)
- **Secondary:** Desktop web browsers
- **Deployment:** whosaidit.lecorvus.com

---

## 2. Core Features

### 2.1 User Onboarding
| Feature | Description |
|---------|-------------|
| Name Entry | Single input field for player name (required, 2-20 characters) |
| Session Persistence | Name stored in localStorage for session recovery |
| No Account Required | Frictionless entry - just enter name and play |

### 2.2 Room Management

#### 2.2.1 Host a Room
- Generate unique 6-character alphanumeric room code
- Host becomes the room administrator
- Room persists until explicitly closed or 24h inactivity

#### 2.2.2 Join a Room
- Enter room code (case-insensitive)
- Validate room exists and game hasn't started
- Real-time player list updates

#### 2.2.3 Room Features
- No maximum player limit
- Minimum 3 players to start
- Display shareable room code prominently
- Show connected players with join animations

### 2.3 Game Flow

#### Phase 1: Waiting Room
- Display all connected players
- Host sees "Start Game" button (enabled when 3+ players)
- Players see "Waiting for host to start..."
- Real-time player join/leave updates

#### Phase 2: Question & Answer
- Display question with a player's name inserted
- Example: "What would **Alex** do if no one was looking?"
- All players (including the named player) submit answers
- Text input with 200 character limit
- Show checkmarks next to players who have answered
- Auto-advance when all players submit

#### Phase 3: Voting
- Display all answers anonymously (randomized order)
- Players vote for the best answer
- Cannot vote for own answer (own answer hidden or disabled)
- Show checkmarks next to players who have voted
- Auto-advance when all players vote

#### Phase 4: Results
- Reveal which player wrote each answer
- Highlight the winning answer(s)
- Display points earned this round
- Show updated scoreboard (sorted by score)
- Animation for score updates

#### Phase 5: Ready Check
- "Ready for Next Round" button
- Show which players are ready
- Auto-advance when all players ready
- 30-second auto-ready timer (optional future feature)

#### Phase 6: Game Over
- Final scoreboard with rankings
- Winner announcement with celebration animation
- "Play Again" option (same room, scores reset)
- "Leave Game" option

### 2.4 Scoring System
| Action | Points |
|--------|--------|
| Each vote received | +1 point |
| Most votes in round | No bonus (just vote points) |

### 2.5 Round System
- Total rounds = Number of players
- Each player is featured in at least one question
- Questions randomly selected from pool
- No repeat questions in same game

---

## 3. Question Pool

### 3.1 Question Templates
Questions use `{name}` placeholder replaced with player name:

```
1.  "What would {name} do if no one was looking?"
2.  "What is {name}'s secret talent that nobody knows about?"
3.  "What would {name} spend $1 million on first?"
4.  "What's the most embarrassing thing {name} has probably done?"
5.  "If {name} was a superhero, what would their power be?"
6.  "What would {name} do on their perfect day off?"
7.  "What's {name}'s guilty pleasure?"
8.  "What would {name} be famous for in 10 years?"
9.  "What's the weirdest thing in {name}'s search history?"
10. "If {name} had a catchphrase, what would it be?"
11. "What would {name} do if they won the lottery?"
12. "What's {name}'s most unpopular opinion?"
13. "If {name} could only eat one food forever, what would it be?"
14. "What would {name}'s autobiography be titled?"
15. "What's the first thing {name} would do during a zombie apocalypse?"
16. "If {name} was a villain, what would be their evil plan?"
17. "What would {name} never admit to liking?"
18. "If {name} had a theme song, what would it be?"
19. "What's {name} most likely to be late for?"
20. "What would {name} do with an extra hour every day?"
```

### 3.2 Question Selection Logic
- Shuffle players at game start
- Assign one question per player (round)
- Randomly select questions without repetition

---

## 4. Technical Specifications

### 4.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Real-time | Socket.IO |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Deployment | TBD (Vercel/Railway/DigitalOcean) |

### 4.2 Database Schema

#### Room Collection
```typescript
{
  _id: ObjectId,
  roomCode: string,          // Unique 6-char code
  hostId: string,            // Socket ID of host
  players: [{
    id: string,              // Unique player ID (UUID)
    name: string,
    score: number,
    socketId: string | null, // Current socket connection
    isConnected: boolean,
    hasAnswered: boolean,
    hasVoted: boolean,
    isReady: boolean
  }],
  gameState: enum [
    'waiting',    // In lobby
    'answering',  // Question phase
    'voting',     // Voting phase
    'results',    // Showing results
    'ready',      // Ready check
    'finished'    // Game over
  ],
  currentRound: number,
  totalRounds: number,
  rounds: [{
    questionTemplate: string,
    targetPlayerName: string,
    targetPlayerId: string,
    answers: [{
      oderId: string,
      text: string
    }],
    votes: [{
      oderId: string,
      votedForPlayerId: string
    }]
  }],
  usedQuestions: string[],   // Track used question templates
  createdAt: Date,
  updatedAt: Date
}
```

### 4.3 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rooms` | Create new room |
| GET | `/api/rooms/:code` | Get room state |
| POST | `/api/rooms/:code/join` | Join existing room |
| POST | `/api/rooms/:code/rejoin` | Rejoin after disconnect |

### 4.4 Socket Events

#### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomCode, playerId, playerName }` | Join/rejoin room |
| `start-game` | `{ roomCode }` | Host starts game |
| `submit-answer` | `{ roomCode, oderId, answer }` | Submit answer |
| `submit-vote` | `{ roomCode, oderId, votedForPlayerId }` | Submit vote |
| `mark-ready` | `{ roomCode, oderId }` | Ready for next round |
| `leave-room` | `{ roomCode, oderId }` | Leave room |

#### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `room-state` | `{ room }` | Full room state sync |
| `player-joined` | `{ player }` | New player joined |
| `player-left` | `{ playerId }` | Player disconnected |
| `player-reconnected` | `{ playerId }` | Player reconnected |
| `game-started` | `{ round }` | Game has started |
| `answer-submitted` | `{ playerId }` | Someone answered |
| `all-answered` | `{ answers }` | Voting phase begin |
| `vote-submitted` | `{ playerId }` | Someone voted |
| `round-results` | `{ results, scores }` | Round results |
| `player-ready` | `{ playerId }` | Someone is ready |
| `next-round` | `{ round }` | Next round starting |
| `game-over` | `{ finalScores, winner }` | Game finished |
| `error` | `{ message }` | Error occurred |

### 4.5 Session Recovery
- Player ID stored in localStorage
- On page refresh/reconnect:
  1. Check localStorage for playerId and roomCode
  2. Attempt rejoin via `/api/rooms/:code/rejoin`
  3. If valid, restore socket connection
  4. Receive `room-state` with current game state
- Disconnected players shown as "offline" for 60 seconds
- After 60 seconds, player removed from game

---

## 5. UI/UX Design

### 5.1 Design Principles
- **Mobile-First:** All designs optimized for 375px+ screens
- **Dark Mode:** Primary theme with playful accents
- **Accessibility:** Touch targets 44px+, readable fonts, good contrast
- **Feedback:** Every action has visual/haptic feedback
- **Delight:** Animations and micro-interactions throughout

### 5.2 Color Palette (Dark Playful Theme)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0f0f1a;      /* Deep dark blue-black */
  --bg-secondary: #1a1a2e;    /* Slightly lighter */
  --bg-card: #252540;         /* Card surfaces */
  
  /* Accent Colors */
  --accent-primary: #ff6b9d;   /* Playful pink */
  --accent-secondary: #c44dff; /* Vibrant purple */
  --accent-tertiary: #4dffdb;  /* Cyan/teal */
  --accent-warning: #ffd93d;   /* Yellow */
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #a0a0b0;
  --text-muted: #6b6b80;
  
  /* Status */
  --success: #4dff88;
  --error: #ff4d6a;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #ff6b9d, #c44dff);
  --gradient-glow: radial-gradient(circle, rgba(196,77,255,0.2), transparent);
}
```

### 5.3 Typography
- **Primary Font:** "Space Grotesk" (headings) - playful, modern
- **Secondary Font:** "Inter" (body) - clean, readable
- **Sizes:** Mobile-optimized scale (16px base)

### 5.4 Screen Layouts

#### Landing Screen
```
┌─────────────────────────┐
│                         │
│     🎭 WHO SAID IT?     │
│                         │
│   ┌─────────────────┐   │
│   │  Your Name      │   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │    CONTINUE     │   │
│   └─────────────────┘   │
│                         │
│                         │
└─────────────────────────┘
```

#### Lobby Screen
```
┌─────────────────────────┐
│  ← Back     WHO SAID IT │
│                         │
│   ┌─────────────────┐   │
│   │   HOST A ROOM   │   │
│   │   Create new    │   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │   JOIN A ROOM   │   │
│   │   Enter code    │   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │ Room Code: ___  │   │
│   │    [JOIN]       │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```

#### Waiting Room
```
┌─────────────────────────┐
│  Room: ABC123    [Copy] │
│─────────────────────────│
│                         │
│  Players (4)            │
│  ┌───────────────────┐  │
│  │ 👑 Alex (Host)    │  │
│  │ 🎮 Jordan         │  │
│  │ 🎮 Sam            │  │
│  │ 🎮 Riley          │  │
│  └───────────────────┘  │
│                         │
│  Share this code with   │
│  friends to join!       │
│                         │
│   ┌─────────────────┐   │
│   │   START GAME    │   │  (Host only)
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```

#### Answer Phase
```
┌─────────────────────────┐
│  Round 1/4              │
│─────────────────────────│
│                         │
│  "What would ALEX do    │
│   if no one was         │
│   looking?"             │
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │  Your answer...   │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│   ┌─────────────────┐   │
│   │     SUBMIT      │   │
│   └─────────────────┘   │
│                         │
│  Waiting for:           │
│  ✓ Alex  ✓ Jordan       │
│  ○ Sam   ○ Riley        │
│                         │
└─────────────────────────┘
```

#### Voting Phase
```
┌─────────────────────────┐
│  Vote for the best!     │
│─────────────────────────│
│                         │
│  "What would ALEX do    │
│   if no one was         │
│   looking?"             │
│                         │
│  ┌───────────────────┐  │
│  │ ○ "Eat an entire  │  │
│  │    cake"          │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ○ "Practice their │  │
│  │    dance moves"   │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ○ "Talk to their  │  │
│  │    plants"        │  │
│  └───────────────────┘  │
│                         │
│   ┌─────────────────┐   │
│   │   CAST VOTE     │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```

#### Results Phase
```
┌─────────────────────────┐
│  Round 1 Results! 🎉    │
│─────────────────────────│
│                         │
│  🏆 WINNING ANSWER      │
│  ┌───────────────────┐  │
│  │ "Eat an entire    │  │
│  │  cake"            │  │
│  │       - Jordan 🎯 │  │
│  │       3 votes     │  │
│  └───────────────────┘  │
│                         │
│  Other answers:         │
│  • "Dance moves" - Sam  │
│  • "Plants" - Riley     │
│                         │
│  ── SCOREBOARD ──       │
│  1. Jordan    3 pts     │
│  2. Alex      0 pts     │
│  3. Sam       0 pts     │
│  4. Riley     0 pts     │
│                         │
│   ┌─────────────────┐   │
│   │     READY ✓     │   │
│   └─────────────────┘   │
│   Waiting: Sam, Riley   │
│                         │
└─────────────────────────┘
```

#### Game Over
```
┌─────────────────────────┐
│                         │
│     🎊 GAME OVER! 🎊    │
│                         │
│     👑 WINNER 👑        │
│     ┌─────────────┐     │
│     │   JORDAN    │     │
│     │   12 pts    │     │
│     └─────────────┘     │
│                         │
│  ── FINAL SCORES ──     │
│  🥇 Jordan    12 pts    │
│  🥈 Alex       8 pts    │
│  🥉 Sam        5 pts    │
│  4. Riley      3 pts    │
│                         │
│   ┌─────────────────┐   │
│   │   PLAY AGAIN    │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │   LEAVE GAME    │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```

### 5.5 Animations & Micro-interactions
- Page transitions: Slide/fade (300ms)
- Button press: Scale down + haptic feedback
- Player join: Slide in from right + subtle bounce
- Answer submitted: Checkmark animation
- Vote cast: Ripple effect
- Score update: Number count-up animation
- Winner reveal: Confetti burst + scale animation

### 5.6 Mobile Optimizations
- Full viewport height (`100dvh`)
- Bottom-anchored primary actions
- Large touch targets (minimum 48px)
- Swipe gestures where appropriate
- Keyboard-aware input positioning
- Safe area insets for notched devices

---

## 6. Project Structure

```
who-said-that/
├── client/                      # Frontend (React)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── PlayerAvatar.tsx
│   │   │   ├── screens/         # Full page screens
│   │   │   │   ├── Landing.tsx
│   │   │   │   ├── Lobby.tsx
│   │   │   │   ├── WaitingRoom.tsx
│   │   │   │   ├── AnswerPhase.tsx
│   │   │   │   ├── VotingPhase.tsx
│   │   │   │   ├── ResultsPhase.tsx
│   │   │   │   └── GameOver.tsx
│   │   │   └── layout/
│   │   │       └── GameLayout.tsx
│   │   ├── context/
│   │   │   └── GameContext.tsx
│   │   ├── hooks/
│   │   │   ├── useSocket.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── game.ts
│   │   ├── utils/
│   │   │   └── helpers.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── server/                      # Backend (Node.js)
│   ├── src/
│   │   ├── models/
│   │   │   └── Room.ts
│   │   ├── services/
│   │   │   ├── roomService.ts
│   │   │   └── gameService.ts
│   │   ├── socket/
│   │   │   ├── index.ts
│   │   │   └── gameHandlers.ts
│   │   ├── routes/
│   │   │   └── roomRoutes.ts
│   │   ├── data/
│   │   │   └── questions.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── generateCode.ts
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json
│
├── .env.example
├── .gitignore
├── PRD.md
└── README.md
```

---

## 7. Environment Variables

### 7.1 Server (.env)
```env
PORT=3001
MONGODB_URI=mongodb+srv://...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 7.2 Client (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Initial load < 3 seconds on 3G
- Socket latency < 100ms
- Smooth 60fps animations

### 8.2 Reliability
- Graceful disconnect handling
- Automatic reconnection (3 attempts)
- Game state persistence in MongoDB

### 8.3 Scalability
- Stateless server (socket state in MongoDB)
- Horizontal scaling ready
- Room cleanup after 24h inactivity

### 8.4 Security
- Input sanitization (XSS prevention)
- Rate limiting on API endpoints
- Room codes are unguessable (6 chars = 2B combinations)

---

## 9. Future Enhancements (v2.0)

- [ ] Custom question packs
- [ ] Timer for answering/voting phases
- [ ] Spectator mode
- [ ] Voice chat integration
- [ ] Player avatars/customization
- [ ] Achievement system
- [ ] Game history/replay
- [ ] PWA support for mobile install
- [ ] Share results to social media

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Game completion rate | > 80% |
| Average session length | > 15 minutes |
| Return player rate | > 40% |
| Average players per room | 4-8 |
| Page load time | < 2 seconds |

---

## 11. Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Setup | 1 day | Project structure, DB connection |
| Phase 2: Core Backend | 2 days | Room management, Socket handlers |
| Phase 3: Core Frontend | 2 days | All screens, game flow |
| Phase 4: Integration | 1 day | Connect frontend ↔ backend |
| Phase 5: Polish | 1 day | Animations, error handling |
| Phase 6: Testing | 1 day | Bug fixes, edge cases |
| Phase 7: Deploy | 1 day | Production deployment |

**Total Estimated Time:** ~9 days

---

*Document maintained by: Development Team*  
*Next review: After v1.0 launch*

