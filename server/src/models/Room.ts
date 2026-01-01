import mongoose, { Schema, Document } from 'mongoose';
import { GameState, Player, Round } from '../types';

export interface RoomDocument extends Document {
  roomCode: string;
  hostId: string;
  players: Player[];
  gameState: GameState;
  currentRound: number;
  totalRounds: number;
  rounds: Round[];
  usedQuestions: string[];
  questionPool: string[]; // Pre-fetched questions for the game
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<Player>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  score: { type: Number, default: 0 },
  socketId: { type: String, default: null },
  isConnected: { type: Boolean, default: true },
  hasAnswered: { type: Boolean, default: false },
  hasVoted: { type: Boolean, default: false },
  isReady: { type: Boolean, default: false },
}, { _id: false });

const AnswerSchema = new Schema({
  playerId: { type: String, required: true },
  playerName: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const VoteSchema = new Schema({
  oderId: { type: String, required: true },
  votedForPlayerId: { type: String, required: true },
}, { _id: false });

const RoundSchema = new Schema<Round>({
  questionTemplate: { type: String, required: true },
  targetPlayerName: { type: String, required: true },
  targetPlayerId: { type: String, required: true },
  answers: [AnswerSchema],
  votes: [VoteSchema],
}, { _id: false });

const RoomSchema = new Schema<RoomDocument>({
  roomCode: { type: String, required: true, unique: true, uppercase: true },
  hostId: { type: String, required: true },
  players: [PlayerSchema],
  gameState: { 
    type: String, 
    enum: ['waiting', 'answering', 'voting', 'results', 'ready', 'finished'],
    default: 'waiting' 
  },
  currentRound: { type: Number, default: 0 },
  totalRounds: { type: Number, default: 0 },
  rounds: [RoundSchema],
  usedQuestions: [{ type: String }],
  questionPool: [{ type: String }],
}, { 
  timestamps: true,
  toJSON: {
    transform: (_, ret: Record<string, unknown>) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for faster lookups
RoomSchema.index({ roomCode: 1 });
RoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // Auto-delete after 24h

export const RoomModel = mongoose.model<RoomDocument>('Room', RoomSchema);

