export type GameState = 'waiting' | 'answering' | 'voting' | 'results' | 'ready' | 'finished';

export interface Player {
  id: string;
  name: string;
  score: number;
  socketId: string | null;
  isConnected: boolean;
  hasAnswered: boolean;
  hasVoted: boolean;
  isReady: boolean;
}

export interface Answer {
  playerId: string;
  playerName: string;
  text: string;
}

export interface AnonymousAnswer {
  playerId: string;
  text: string;
}

export interface Vote {
  oderId: string;
  votedForPlayerId: string;
}

export interface Round {
  questionTemplate: string;
  targetPlayerName: string;
  targetPlayerId: string;
  answers: Answer[];
  votes: Vote[];
}

export interface Room {
  roomCode: string;
  hostId: string;
  players: Player[];
  gameState: GameState;
  currentRound: number;
  totalRounds: number;
  rounds: Round[];
  usedQuestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoundResult {
  oderId: string;
  playerName: string;
  answerText: string;
  votes: number;
  voters: string[];
}

export interface FinalScore {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
}

// Screen states for the app
export type Screen = 
  | 'landing'
  | 'lobby'
  | 'waiting'
  | 'answering'
  | 'voting'
  | 'results'
  | 'gameOver';

