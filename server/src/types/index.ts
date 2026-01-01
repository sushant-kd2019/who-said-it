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
  createdAt: Date;
  updatedAt: Date;
}

// Socket event payloads
export interface JoinRoomPayload {
  roomCode: string;
  playerId: string;
  playerName: string;
}

export interface StartGamePayload {
  roomCode: string;
  playerId: string;
}

export interface SubmitAnswerPayload {
  roomCode: string;
  playerId: string;
  answer: string;
}

export interface SubmitVotePayload {
  roomCode: string;
  playerId: string;
  votedForPlayerId: string;
}

export interface MarkReadyPayload {
  roomCode: string;
  playerId: string;
}

export interface LeaveRoomPayload {
  roomCode: string;
  playerId: string;
}

// API response types
export interface CreateRoomResponse {
  roomCode: string;
  oderId: string;
}

export interface JoinRoomResponse {
  room: Room;
  playerId: string;
}

export interface RoomStateResponse {
  room: Room;
}

// Results for display
export interface RoundResult {
  oderId: string;
  playerName: string;
  answerText: string;
  votes: number;
  voters: string[];
}

