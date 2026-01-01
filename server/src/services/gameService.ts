import { RoomModel, RoomDocument } from '../models/Room';
import { Round, RoundResult } from '../types';
import { getRandomQuestion, formatQuestion } from '../data/questions';
import { shuffleArray } from '../utils/generateCode';

export async function startGame(roomCode: string, playerId: string): Promise<RoomDocument> {
  const room = await RoomModel.findOne({ roomCode: roomCode.toUpperCase() });
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  if (room.hostId !== playerId) {
    throw new Error('Only the host can start the game');
  }
  
  const connectedPlayers = room.players.filter(p => p.isConnected);
  if (connectedPlayers.length < 3) {
    throw new Error('Need at least 3 players to start');
  }
  
  if (room.gameState !== 'waiting') {
    throw new Error('Game has already started');
  }
  
  // Set up the game
  room.totalRounds = connectedPlayers.length;
  room.currentRound = 1;
  room.gameState = 'answering';
  
  // Shuffle players to randomize who gets questions
  const shuffledPlayers = shuffleArray(connectedPlayers);
  
  // Create first round
  const questionTemplate = getRandomQuestion(room.usedQuestions);
  if (!questionTemplate) {
    throw new Error('No questions available');
  }
  
  room.usedQuestions.push(questionTemplate);
  
  const targetPlayer = shuffledPlayers[0];
  const firstRound: Round = {
    questionTemplate,
    targetPlayerName: targetPlayer.name,
    targetPlayerId: targetPlayer.id,
    answers: [],
    votes: [],
  };
  
  room.rounds.push(firstRound);
  
  // Reset player states
  room.players.forEach(p => {
    p.hasAnswered = false;
    p.hasVoted = false;
    p.isReady = false;
  });
  
  await room.save();
  return room;
}

export async function submitAnswer(
  roomCode: string, 
  playerId: string, 
  answerText: string
): Promise<{ room: RoomDocument; allAnswered: boolean }> {
  const room = await RoomModel.findOne({ roomCode: roomCode.toUpperCase() });
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  if (room.gameState !== 'answering') {
    throw new Error('Not in answering phase');
  }
  
  const player = room.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }
  
  if (player.hasAnswered) {
    throw new Error('Already answered');
  }
  
  const currentRound = room.rounds[room.currentRound - 1];
  if (!currentRound) {
    throw new Error('Round not found');
  }
  
  // Add the answer
  currentRound.answers.push({
    playerId,
    playerName: player.name,
    text: answerText.trim(),
  });
  
  player.hasAnswered = true;
  
  // Check if all connected players have answered
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const allAnswered = connectedPlayers.every(p => p.hasAnswered);
  
  if (allAnswered) {
    room.gameState = 'voting';
    // Reset hasVoted for all players
    room.players.forEach(p => {
      p.hasVoted = false;
    });
  }
  
  await room.save();
  return { room, allAnswered };
}

export async function submitVote(
  roomCode: string, 
  playerId: string, 
  votedForPlayerId: string
): Promise<{ room: RoomDocument; allVoted: boolean }> {
  const room = await RoomModel.findOne({ roomCode: roomCode.toUpperCase() });
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  if (room.gameState !== 'voting') {
    throw new Error('Not in voting phase');
  }
  
  const player = room.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }
  
  if (player.hasVoted) {
    throw new Error('Already voted');
  }
  
  // Can't vote for own answer
  if (playerId === votedForPlayerId) {
    throw new Error('Cannot vote for your own answer');
  }
  
  const currentRound = room.rounds[room.currentRound - 1];
  if (!currentRound) {
    throw new Error('Round not found');
  }
  
  // Verify the voted answer exists
  const votedAnswer = currentRound.answers.find(a => a.playerId === votedForPlayerId);
  if (!votedAnswer) {
    throw new Error('Invalid vote target');
  }
  
  // Add the vote
  currentRound.votes.push({
    oderId: playerId,
    votedForPlayerId,
  });
  
  player.hasVoted = true;
  
  // Check if all connected players have voted
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const allVoted = connectedPlayers.every(p => p.hasVoted);
  
  if (allVoted) {
    // Calculate scores
    const voteCount: Record<string, number> = {};
    currentRound.votes.forEach(v => {
      voteCount[v.votedForPlayerId] = (voteCount[v.votedForPlayerId] || 0) + 1;
    });
    
    // Update scores
    Object.entries(voteCount).forEach(([oderId, votes]) => {
      const p = room.players.find(pl => pl.id === oderId);
      if (p) {
        p.score += votes;
      }
    });
    
    room.gameState = 'results';
  }
  
  await room.save();
  return { room, allVoted };
}

export async function markReady(
  roomCode: string, 
  playerId: string
): Promise<{ room: RoomDocument; allReady: boolean; gameOver: boolean }> {
  const room = await RoomModel.findOne({ roomCode: roomCode.toUpperCase() });
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  if (room.gameState !== 'results') {
    throw new Error('Not in results phase');
  }
  
  const player = room.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }
  
  player.isReady = true;
  
  // Check if all connected players are ready
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const allReady = connectedPlayers.every(p => p.isReady);
  
  let gameOver = false;
  
  if (allReady) {
    // Check if game is over
    if (room.currentRound >= room.totalRounds) {
      room.gameState = 'finished';
      gameOver = true;
    } else {
      // Start next round
      room.currentRound += 1;
      room.gameState = 'answering';
      
      // Get next question and target player
      const questionTemplate = getRandomQuestion(room.usedQuestions);
      if (!questionTemplate) {
        throw new Error('No questions available');
      }
      
      room.usedQuestions.push(questionTemplate);
      
      // Get player who hasn't been target yet
      const targetedIds = room.rounds.map(r => r.targetPlayerId);
      const availablePlayers = connectedPlayers.filter(p => !targetedIds.includes(p.id));
      const targetPlayer = availablePlayers.length > 0 
        ? availablePlayers[Math.floor(Math.random() * availablePlayers.length)]
        : connectedPlayers[Math.floor(Math.random() * connectedPlayers.length)];
      
      const newRound: Round = {
        questionTemplate,
        targetPlayerName: targetPlayer.name,
        targetPlayerId: targetPlayer.id,
        answers: [],
        votes: [],
      };
      
      room.rounds.push(newRound);
      
      // Reset player states
      room.players.forEach(p => {
        p.hasAnswered = false;
        p.hasVoted = false;
        p.isReady = false;
      });
    }
  }
  
  await room.save();
  return { room, allReady, gameOver };
}

export function getRoundResults(room: RoomDocument): RoundResult[] {
  const currentRound = room.rounds[room.currentRound - 1];
  if (!currentRound) return [];
  
  const results: RoundResult[] = currentRound.answers.map(answer => {
    const votes = currentRound.votes.filter(v => v.votedForPlayerId === answer.playerId);
    const voterNames = votes.map(v => {
      const voter = room.players.find(p => p.id === v.oderId);
      return voter?.name || 'Unknown';
    });
    
    return {
      oderId: answer.playerId,
      playerName: answer.playerName,
      answerText: answer.text,
      votes: votes.length,
      voters: voterNames,
    };
  });
  
  // Sort by votes descending
  return results.sort((a, b) => b.votes - a.votes);
}

export function getCurrentQuestion(room: RoomDocument): string | null {
  const currentRound = room.rounds[room.currentRound - 1];
  if (!currentRound) return null;
  
  return formatQuestion(currentRound.questionTemplate, currentRound.targetPlayerName);
}

export function getShuffledAnswers(room: RoomDocument, excludePlayerId?: string) {
  const currentRound = room.rounds[room.currentRound - 1];
  if (!currentRound) return [];
  
  let answers = currentRound.answers;
  if (excludePlayerId) {
    answers = answers.filter(a => a.playerId !== excludePlayerId);
  }
  
  return shuffleArray(answers.map(a => ({
    playerId: a.playerId,
    text: a.text,
  })));
}

export async function resetGame(roomCode: string): Promise<RoomDocument | null> {
  const room = await RoomModel.findOne({ roomCode: roomCode.toUpperCase() });
  
  if (!room) return null;
  
  room.gameState = 'waiting';
  room.currentRound = 0;
  room.totalRounds = 0;
  room.rounds = [];
  room.usedQuestions = [];
  
  room.players.forEach(p => {
    p.score = 0;
    p.hasAnswered = false;
    p.hasVoted = false;
    p.isReady = false;
  });
  
  await room.save();
  return room;
}

