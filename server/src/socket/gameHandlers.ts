import { Server, Socket } from 'socket.io';
import * as roomService from '../services/roomService';
import * as gameService from '../services/gameService';
import {
  JoinRoomPayload,
  StartGamePayload,
  SubmitAnswerPayload,
  SubmitVotePayload,
  MarkReadyPayload,
} from '../types';

// Track socket to room mapping for disconnect handling
const socketRoomMap = new Map<string, { roomCode: string; playerId: string }>();

export function setupGameHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room handler
    socket.on('join-room', async (payload: JoinRoomPayload) => {
      try {
        const { roomCode, playerId, playerName } = payload;
        
        // Update player's socket ID
        const room = await roomService.updatePlayerSocket(roomCode, playerId, socket.id);
        
        if (!room) {
          socket.emit('error', { message: 'Room not found or player not in room' });
          return;
        }
        
        // Track for disconnect
        socketRoomMap.set(socket.id, { roomCode, playerId });
        
        // Join socket room
        socket.join(roomCode.toUpperCase());
        
        // Send full room state to the joining player
        const roomResponse = roomService.toRoomResponse(room);
        socket.emit('room-state', { 
          room: roomResponse,
          currentQuestion: gameService.getCurrentQuestion(room),
        });
        
        // Notify others
        socket.to(roomCode.toUpperCase()).emit('player-joined', {
          player: room.players.find(p => p.id === playerId),
        });
        
        console.log(`Player ${playerName} joined room ${roomCode}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Start game handler
    socket.on('start-game', async (payload: StartGamePayload) => {
      try {
        const { roomCode, playerId } = payload;
        
        const room = await gameService.startGame(roomCode, playerId);
        const roomResponse = roomService.toRoomResponse(room);
        const currentQuestion = gameService.getCurrentQuestion(room);
        
        io.to(roomCode.toUpperCase()).emit('game-started', {
          room: roomResponse,
          currentQuestion,
        });
        
        console.log(`Game started in room ${roomCode}`);
      } catch (error) {
        console.error('Start game error:', error);
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Submit answer handler
    socket.on('submit-answer', async (payload: SubmitAnswerPayload) => {
      try {
        const { roomCode, playerId, answer } = payload;
        
        const { room, allAnswered } = await gameService.submitAnswer(roomCode, playerId, answer);
        const roomResponse = roomService.toRoomResponse(room);
        
        // Notify everyone that someone answered
        io.to(roomCode.toUpperCase()).emit('answer-submitted', {
          playerId,
          playerName: room.players.find(p => p.id === playerId)?.name,
        });
        
        if (allAnswered) {
          // Send voting phase with shuffled anonymous answers
          room.players.forEach(p => {
            if (p.socketId) {
              const answers = gameService.getShuffledAnswers(room, p.id);
              io.to(p.socketId).emit('voting-phase', {
                room: roomResponse,
                answers,
              });
            }
          });
        }
        
        console.log(`Player ${playerId} submitted answer in room ${roomCode}`);
      } catch (error) {
        console.error('Submit answer error:', error);
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Submit vote handler
    socket.on('submit-vote', async (payload: SubmitVotePayload) => {
      try {
        const { roomCode, playerId, votedForPlayerId } = payload;
        
        const { room, allVoted } = await gameService.submitVote(roomCode, playerId, votedForPlayerId);
        const roomResponse = roomService.toRoomResponse(room);
        
        // Notify everyone that someone voted
        io.to(roomCode.toUpperCase()).emit('vote-submitted', {
          playerId,
          playerName: room.players.find(p => p.id === playerId)?.name,
        });
        
        if (allVoted) {
          const results = gameService.getRoundResults(room);
          io.to(roomCode.toUpperCase()).emit('round-results', {
            room: roomResponse,
            results,
          });
        }
        
        console.log(`Player ${playerId} voted in room ${roomCode}`);
      } catch (error) {
        console.error('Submit vote error:', error);
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Mark ready handler
    socket.on('mark-ready', async (payload: MarkReadyPayload) => {
      try {
        const { roomCode, playerId } = payload;
        
        const { room, allReady, gameOver } = await gameService.markReady(roomCode, playerId);
        const roomResponse = roomService.toRoomResponse(room);
        
        // Notify everyone that someone is ready
        io.to(roomCode.toUpperCase()).emit('player-ready', {
          playerId,
          playerName: room.players.find(p => p.id === playerId)?.name,
        });
        
        if (allReady) {
          if (gameOver) {
            // Sort players by score for final results
            const finalScores = [...room.players]
              .sort((a, b) => b.score - a.score)
              .map((p, index) => ({
                rank: index + 1,
                playerId: p.id,
                playerName: p.name,
                score: p.score,
              }));
            
            io.to(roomCode.toUpperCase()).emit('game-over', {
              room: roomResponse,
              finalScores,
              winner: finalScores[0],
            });
          } else {
            const currentQuestion = gameService.getCurrentQuestion(room);
            io.to(roomCode.toUpperCase()).emit('next-round', {
              room: roomResponse,
              currentQuestion,
            });
          }
        }
        
        console.log(`Player ${playerId} ready in room ${roomCode}`);
      } catch (error) {
        console.error('Mark ready error:', error);
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Play again handler
    socket.on('play-again', async (payload: { roomCode: string }) => {
      try {
        const { roomCode } = payload;
        
        const room = await gameService.resetGame(roomCode);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        const roomResponse = roomService.toRoomResponse(room);
        io.to(roomCode.toUpperCase()).emit('game-reset', { room: roomResponse });
        
        console.log(`Game reset in room ${roomCode}`);
      } catch (error) {
        console.error('Play again error:', error);
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Leave room handler
    socket.on('leave-room', async (payload: { roomCode: string; playerId: string }) => {
      try {
        const { roomCode, playerId } = payload;
        
        const room = await roomService.removePlayer(roomCode, playerId);
        socketRoomMap.delete(socket.id);
        socket.leave(roomCode.toUpperCase());
        
        if (room) {
          const roomResponse = roomService.toRoomResponse(room);
          io.to(roomCode.toUpperCase()).emit('player-left', {
            playerId,
            room: roomResponse,
          });
        }
        
        console.log(`Player ${playerId} left room ${roomCode}`);
      } catch (error) {
        console.error('Leave room error:', error);
      }
    });

    // Disconnect handler
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      const mapping = socketRoomMap.get(socket.id);
      if (mapping) {
        const { roomCode, playerId } = mapping;
        
        try {
          // Mark player as disconnected
          const room = await roomService.updatePlayerSocket(roomCode, playerId, null);
          
          if (room) {
            const roomResponse = roomService.toRoomResponse(room);
            io.to(roomCode.toUpperCase()).emit('player-disconnected', {
              playerId,
              room: roomResponse,
            });
          }
        } catch (error) {
          console.error('Disconnect handler error:', error);
        }
        
        socketRoomMap.delete(socket.id);
      }
    });
  });
}

