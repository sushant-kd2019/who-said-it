import { v4 as uuidv4 } from 'uuid';
import { RoomModel, RoomDocument } from '../models/Room';
import { Player, Room } from '../types';
import { generateRoomCode } from '../utils/generateCode';

const MAX_CODE_ATTEMPTS = 10;

export async function createRoom(hostName: string): Promise<{ room: RoomDocument; oderId: string }> {
  const oderId = uuidv4();
  
  // Generate unique room code
  let roomCode: string = '';
  let attempts = 0;
  
  while (attempts < MAX_CODE_ATTEMPTS) {
    roomCode = generateRoomCode();
    const existing = await RoomModel.findOne({ roomCode });
    if (!existing) break;
    attempts++;
  }
  
  if (attempts >= MAX_CODE_ATTEMPTS) {
    throw new Error('Failed to generate unique room code');
  }
  
  const host: Player = {
    id: oderId,
    name: hostName,
    score: 0,
    socketId: null,
    isConnected: true,
    hasAnswered: false,
    hasVoted: false,
    isReady: false,
  };
  
  const room = new RoomModel({
    roomCode,
    hostId: oderId,
    players: [host],
    gameState: 'waiting',
    currentRound: 0,
    totalRounds: 0,
    rounds: [],
    usedQuestions: [],
  });
  
  await room.save();
  return { room, oderId };
}

export async function joinRoom(roomCode: string, playerName: string): Promise<{ room: RoomDocument; oderId: string }> {
  const room = await RoomModel.findOne({ roomCode: roomCode.toUpperCase() });
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  if (room.gameState !== 'waiting') {
    throw new Error('Game has already started');
  }
  
  // Check for duplicate names
  const existingName = room.players.find(
    p => p.name.toLowerCase() === playerName.toLowerCase() && p.isConnected
  );
  if (existingName) {
    throw new Error('A player with this name already exists in the room');
  }
  
  const oderId = uuidv4();
  const player: Player = {
    id: oderId,
    name: playerName,
    score: 0,
    socketId: null,
    isConnected: true,
    hasAnswered: false,
    hasVoted: false,
    isReady: false,
  };
  
  room.players.push(player);
  await room.save();
  
  return { room, oderId };
}

export async function rejoinRoom(roomCode: string, playerId: string): Promise<RoomDocument | null> {
  const room = await RoomModel.findOne({ roomCode: roomCode.toUpperCase() });
  
  if (!room) return null;
  
  const player = room.players.find(p => p.id === playerId);
  if (!player) return null;
  
  player.isConnected = true;
  await room.save();
  
  return room;
}

export async function getRoomByCode(roomCode: string): Promise<RoomDocument | null> {
  return RoomModel.findOne({ roomCode: roomCode.toUpperCase() });
}

export async function updatePlayerSocket(
  roomCode: string, 
  playerId: string, 
  socketId: string | null
): Promise<RoomDocument | null> {
  const room = await RoomModel.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) return null;
  
  const player = room.players.find(p => p.id === playerId);
  if (player) {
    player.socketId = socketId;
    player.isConnected = socketId !== null;
    await room.save();
  }
  
  return room;
}

export async function removePlayer(roomCode: string, playerId: string): Promise<RoomDocument | null> {
  const room = await RoomModel.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) return null;
  
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return room;
  
  // If game hasn't started, remove player completely
  if (room.gameState === 'waiting') {
    room.players.splice(playerIndex, 1);
    
    // If host left and there are other players, assign new host
    if (playerId === room.hostId && room.players.length > 0) {
      room.hostId = room.players[0].id;
    }
    
    // Delete room if empty
    if (room.players.length === 0) {
      await RoomModel.deleteOne({ roomCode: room.roomCode });
      return null;
    }
  } else {
    // Game in progress - just mark as disconnected
    room.players[playerIndex].isConnected = false;
    room.players[playerIndex].socketId = null;
  }
  
  await room.save();
  return room;
}

export async function deleteRoom(roomCode: string): Promise<void> {
  await RoomModel.deleteOne({ roomCode: roomCode.toUpperCase() });
}

export function toRoomResponse(room: RoomDocument): Room {
  return {
    roomCode: room.roomCode,
    hostId: room.hostId,
    players: room.players,
    gameState: room.gameState,
    currentRound: room.currentRound,
    totalRounds: room.totalRounds,
    rounds: room.rounds,
    usedQuestions: room.usedQuestions,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

