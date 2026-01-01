import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, AnonymousAnswer, RoundResult, FinalScore } from '../types/game';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export interface SocketEvents {
  onRoomState: (data: { room: Room; currentQuestion?: string }) => void;
  onPlayerJoined: (data: { player: Room['players'][0] }) => void;
  onPlayerLeft: (data: { playerId: string; room: Room }) => void;
  onPlayerDisconnected: (data: { playerId: string; room: Room }) => void;
  onPlayerReconnected: (data: { playerId: string }) => void;
  onGameStarted: (data: { room: Room; currentQuestion: string }) => void;
  onAnswerSubmitted: (data: { playerId: string; playerName: string }) => void;
  onVotingPhase: (data: { room: Room; answers: AnonymousAnswer[] }) => void;
  onVoteSubmitted: (data: { playerId: string; playerName: string }) => void;
  onRoundResults: (data: { room: Room; results: RoundResult[] }) => void;
  onPlayerReady: (data: { playerId: string; playerName: string }) => void;
  onNextRound: (data: { room: Room; currentQuestion: string }) => void;
  onGameOver: (data: { room: Room; finalScores: FinalScore[]; winner: FinalScore }) => void;
  onGameReset: (data: { room: Room }) => void;
  onError: (data: { message: string }) => void;
}

export function useSocket(events: Partial<SocketEvents>) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventsRef = useRef(events);
  
  // Keep events ref updated
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Set up all event listeners
    socket.on('room-state', (data) => eventsRef.current.onRoomState?.(data));
    socket.on('player-joined', (data) => eventsRef.current.onPlayerJoined?.(data));
    socket.on('player-left', (data) => eventsRef.current.onPlayerLeft?.(data));
    socket.on('player-disconnected', (data) => eventsRef.current.onPlayerDisconnected?.(data));
    socket.on('player-reconnected', (data) => eventsRef.current.onPlayerReconnected?.(data));
    socket.on('game-started', (data) => eventsRef.current.onGameStarted?.(data));
    socket.on('answer-submitted', (data) => eventsRef.current.onAnswerSubmitted?.(data));
    socket.on('voting-phase', (data) => eventsRef.current.onVotingPhase?.(data));
    socket.on('vote-submitted', (data) => eventsRef.current.onVoteSubmitted?.(data));
    socket.on('round-results', (data) => eventsRef.current.onRoundResults?.(data));
    socket.on('player-ready', (data) => eventsRef.current.onPlayerReady?.(data));
    socket.on('next-round', (data) => eventsRef.current.onNextRound?.(data));
    socket.on('game-over', (data) => eventsRef.current.onGameOver?.(data));
    socket.on('game-reset', (data) => eventsRef.current.onGameReset?.(data));
    socket.on('error', (data) => eventsRef.current.onError?.(data));

    return () => {
      socket.disconnect();
    };
  }, []);

  // Emit functions
  const joinRoom = useCallback((roomCode: string, playerId: string, playerName: string) => {
    socketRef.current?.emit('join-room', { roomCode, playerId, playerName });
  }, []);

  const startGame = useCallback((roomCode: string, playerId: string) => {
    socketRef.current?.emit('start-game', { roomCode, playerId });
  }, []);

  const submitAnswer = useCallback((roomCode: string, playerId: string, answer: string) => {
    socketRef.current?.emit('submit-answer', { roomCode, playerId, answer });
  }, []);

  const submitVote = useCallback((roomCode: string, playerId: string, votedForPlayerId: string) => {
    socketRef.current?.emit('submit-vote', { roomCode, playerId, votedForPlayerId });
  }, []);

  const markReady = useCallback((roomCode: string, playerId: string) => {
    socketRef.current?.emit('mark-ready', { roomCode, playerId });
  }, []);

  const leaveRoom = useCallback((roomCode: string, playerId: string) => {
    socketRef.current?.emit('leave-room', { roomCode, playerId });
  }, []);

  const playAgain = useCallback((roomCode: string) => {
    socketRef.current?.emit('play-again', { roomCode });
  }, []);

  return {
    isConnected,
    joinRoom,
    startGame,
    submitAnswer,
    submitVote,
    markReady,
    leaveRoom,
    playAgain,
  };
}

