import { RoomModel, RoomDocument } from '../models/Room';
import { Round, RoundResult } from '../types';
import { getRandomQuestion, formatQuestion } from '../data/questions';
import { shuffleArray } from '../utils/generateCode';

export async function startGame(roomCode: string, playerId: string): Promise<RoomDocument> {
  const upperRoomCode = roomCode.toUpperCase();
  
  // First, get room to validate and prepare data
  const room = await RoomModel.findOne({ roomCode: upperRoomCode });
  
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
  
  // Prepare game data
  const shuffledPlayers = shuffleArray(connectedPlayers);
  const questionTemplate = getRandomQuestion(room.usedQuestions);
  if (!questionTemplate) {
    throw new Error('No questions available');
  }
  
  const targetPlayer = shuffledPlayers[0];
  const firstRound: Round = {
    questionTemplate,
    targetPlayerName: targetPlayer.name,
    targetPlayerId: targetPlayer.id,
    answers: [],
    votes: [],
  };
  
  // Build player state resets
  const playerResets: Record<string, boolean> = {};
  room.players.forEach((_, idx) => {
    playerResets[`players.${idx}.hasAnswered`] = false;
    playerResets[`players.${idx}.hasVoted`] = false;
    playerResets[`players.${idx}.isReady`] = false;
  });
  
  // Atomically update only if game is still in 'waiting' state
  const updatedRoom = await RoomModel.findOneAndUpdate(
    {
      roomCode: upperRoomCode,
      hostId: playerId,
      gameState: 'waiting', // Only update if still waiting - prevents race condition
    },
    {
      $set: {
        totalRounds: connectedPlayers.length,
        currentRound: 1,
        gameState: 'answering',
        ...playerResets,
      },
      $push: {
        usedQuestions: questionTemplate,
        rounds: firstRound,
      }
    },
    { new: true }
  );
  
  if (!updatedRoom) {
    // Re-check to give appropriate error message
    const currentRoom = await RoomModel.findOne({ roomCode: upperRoomCode });
    if (!currentRoom) {
      throw new Error('Room not found');
    }
    if (currentRoom.gameState !== 'waiting') {
      throw new Error('Game has already started');
    }
    throw new Error('Failed to start game');
  }
  
  return updatedRoom;
}

export async function submitAnswer(
  roomCode: string, 
  playerId: string, 
  answerText: string
): Promise<{ room: RoomDocument; allAnswered: boolean }> {
  const upperRoomCode = roomCode.toUpperCase();
  
  // Find player index first
  const playerIndex = await findPlayerIndex(upperRoomCode, playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  // Get player name for the answer
  const roomCheck = await RoomModel.findOne({ roomCode: upperRoomCode });
  if (!roomCheck) {
    throw new Error('Room not found');
  }
  const player = roomCheck.players[playerIndex];
  
  // Perform atomic update: add answer and mark player as answered
  const updatedRoom = await RoomModel.findOneAndUpdate(
    {
      roomCode: upperRoomCode,
      gameState: 'answering',
      [`players.${playerIndex}.id`]: playerId,
      [`players.${playerIndex}.hasAnswered`]: false,
    },
    {
      $push: {
        [`rounds.$[round].answers`]: {
          playerId,
          playerName: player.name,
          text: answerText.trim(),
        }
      },
      $set: {
        [`players.${playerIndex}.hasAnswered`]: true,
      }
    },
    {
      new: true,
      arrayFilters: [{ 'round.answers': { $exists: true } }],
    }
  );
  
  if (!updatedRoom) {
    // Check why the update failed
    const room = await RoomModel.findOne({ roomCode: upperRoomCode });
    if (!room) {
      throw new Error('Room not found');
    }
    if (room.gameState !== 'answering') {
      throw new Error('Not in answering phase');
    }
    const p = room.players.find(pl => pl.id === playerId);
    if (!p) {
      throw new Error('Player not found');
    }
    if (p.hasAnswered) {
      throw new Error('Already answered');
    }
    throw new Error('Failed to submit answer');
  }
  
  // Check if all connected players have answered
  const connectedPlayers = updatedRoom.players.filter(p => p.isConnected);
  const allAnswered = connectedPlayers.every(p => p.hasAnswered);
  
  if (allAnswered) {
    // Build atomic update to reset hasVoted and change state
    const hasVotedResets: Record<string, boolean> = {};
    updatedRoom.players.forEach((_, idx) => {
      hasVotedResets[`players.${idx}.hasVoted`] = false;
    });
    
    const finalRoom = await RoomModel.findOneAndUpdate(
      { roomCode: upperRoomCode, gameState: 'answering' },
      {
        $set: {
          gameState: 'voting',
          ...hasVotedResets,
        }
      },
      { new: true }
    );
    
    return { room: finalRoom || updatedRoom, allAnswered: true };
  }
  
  return { room: updatedRoom, allAnswered };
}

export async function submitVote(
  roomCode: string, 
  playerId: string, 
  votedForPlayerId: string
): Promise<{ room: RoomDocument; allVoted: boolean }> {
  const upperRoomCode = roomCode.toUpperCase();
  
  // Validate: Can't vote for own answer
  if (playerId === votedForPlayerId) {
    throw new Error('Cannot vote for your own answer');
  }
  
  // Find player index
  const playerIndex = await findPlayerIndex(upperRoomCode, playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  // Perform atomic update: add vote and mark player as voted
  const updatedRoom = await RoomModel.findOneAndUpdate(
    {
      roomCode: upperRoomCode,
      gameState: 'voting',
      [`players.${playerIndex}.id`]: playerId,
      [`players.${playerIndex}.hasVoted`]: false,
    },
    {
      $push: {
        [`rounds.$[round].votes`]: {
          oderId: playerId,
          votedForPlayerId,
        }
      },
      $set: {
        [`players.${playerIndex}.hasVoted`]: true,
      }
    },
    {
      new: true,
      arrayFilters: [{ 'round.votes': { $exists: true } }],
    }
  );
  
  if (!updatedRoom) {
    // Could be: room not found, not voting phase, already voted, or player not found
    const room = await RoomModel.findOne({ roomCode: upperRoomCode });
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
    throw new Error('Failed to submit vote');
  }
  
  // Check if all connected players have voted
  const connectedPlayers = updatedRoom.players.filter(p => p.isConnected);
  const allVoted = connectedPlayers.every(p => p.hasVoted);
  
  if (allVoted) {
    // Calculate scores and transition to results - do this atomically too
    const currentRound = updatedRoom.rounds[updatedRoom.currentRound - 1];
    const voteCount: Record<string, number> = {};
    currentRound.votes.forEach(v => {
      voteCount[v.votedForPlayerId] = (voteCount[v.votedForPlayerId] || 0) + 1;
    });
    
    // Build atomic update for scores
    const scoreUpdates: Record<string, number> = {};
    updatedRoom.players.forEach((p, idx) => {
      if (voteCount[p.id]) {
        scoreUpdates[`players.${idx}.score`] = p.score + voteCount[p.id];
      }
    });
    
    const finalRoom = await RoomModel.findOneAndUpdate(
      { roomCode: upperRoomCode, gameState: 'voting' },
      {
        $set: {
          gameState: 'results',
          ...scoreUpdates,
        }
      },
      { new: true }
    );
    
    return { room: finalRoom || updatedRoom, allVoted: true };
  }
  
  return { room: updatedRoom, allVoted };
}

// Helper function to find player index
async function findPlayerIndex(roomCode: string, playerId: string): Promise<number> {
  const room = await RoomModel.findOne({ roomCode });
  if (!room) return -1;
  return room.players.findIndex(p => p.id === playerId);
}

export async function markReady(
  roomCode: string, 
  playerId: string
): Promise<{ room: RoomDocument; allReady: boolean; gameOver: boolean }> {
  const upperRoomCode = roomCode.toUpperCase();
  
  // Find player index
  const playerIndex = await findPlayerIndex(upperRoomCode, playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  // Atomically mark player as ready
  const updatedRoom = await RoomModel.findOneAndUpdate(
    {
      roomCode: upperRoomCode,
      gameState: 'results',
      [`players.${playerIndex}.id`]: playerId,
    },
    {
      $set: {
        [`players.${playerIndex}.isReady`]: true,
      }
    },
    { new: true }
  );
  
  if (!updatedRoom) {
    const room = await RoomModel.findOne({ roomCode: upperRoomCode });
    if (!room) {
      throw new Error('Room not found');
    }
    if (room.gameState !== 'results') {
      throw new Error('Not in results phase');
    }
    throw new Error('Failed to mark ready');
  }
  
  // Check if all connected players are ready
  const connectedPlayers = updatedRoom.players.filter(p => p.isConnected);
  const allReady = connectedPlayers.every(p => p.isReady);
  
  let gameOver = false;
  
  if (allReady) {
    // Check if game is over
    if (updatedRoom.currentRound >= updatedRoom.totalRounds) {
      const finalRoom = await RoomModel.findOneAndUpdate(
        { roomCode: upperRoomCode, gameState: 'results' },
        { $set: { gameState: 'finished' } },
        { new: true }
      );
      return { room: finalRoom || updatedRoom, allReady: true, gameOver: true };
    } else {
      // Start next round - prepare data
      const questionTemplate = getRandomQuestion(updatedRoom.usedQuestions);
      if (!questionTemplate) {
        throw new Error('No questions available');
      }
      
      const targetedIds = updatedRoom.rounds.map(r => r.targetPlayerId);
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
      
      // Build player state resets
      const playerResets: Record<string, boolean> = {};
      updatedRoom.players.forEach((_, idx) => {
        playerResets[`players.${idx}.hasAnswered`] = false;
        playerResets[`players.${idx}.hasVoted`] = false;
        playerResets[`players.${idx}.isReady`] = false;
      });
      
      const finalRoom = await RoomModel.findOneAndUpdate(
        { roomCode: upperRoomCode, gameState: 'results' },
        {
          $inc: { currentRound: 1 },
          $set: {
            gameState: 'answering',
            ...playerResets,
          },
          $push: {
            usedQuestions: questionTemplate,
            rounds: newRound,
          }
        },
        { new: true }
      );
      
      return { room: finalRoom || updatedRoom, allReady: true, gameOver: false };
    }
  }
  
  return { room: updatedRoom, allReady, gameOver };
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

