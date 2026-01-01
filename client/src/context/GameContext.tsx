import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Room, Screen, AnonymousAnswer, RoundResult, FinalScore } from '../types/game';
import { useSocket } from '../hooks/useSocket';
import { useLocalStorage, SessionData, STORAGE_KEYS } from '../hooks/useLocalStorage';
import { api } from '../services/api';

interface GameContextType {
  // Player state
  playerName: string | null;
  playerId: string | null;
  setPlayerName: (name: string) => void;
  
  // Room state
  room: Room | null;
  roomCode: string | null;
  isHost: boolean;
  currentQuestion: string | null;
  anonymousAnswers: AnonymousAnswer[];
  roundResults: RoundResult[];
  finalScores: FinalScore[];
  winner: FinalScore | null;
  
  // Screen navigation
  screen: Screen;
  setScreen: (screen: Screen) => void;
  
  // Connection
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  
  // Actions
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  startGame: () => void;
  submitAnswer: (answer: string) => void;
  submitVote: (votedForPlayerId: string) => void;
  markReady: () => void;
  leaveRoom: () => void;
  playAgain: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Persistent session
  const [session, setSession] = useLocalStorage<SessionData>(STORAGE_KEYS.SESSION, {
    playerName: null,
    playerId: null,
    roomCode: null,
  });
  
  // Local state
  const [room, setRoom] = useState<Room | null>(null);
  const [screen, setScreen] = useState<Screen>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [anonymousAnswers, setAnonymousAnswers] = useState<AnonymousAnswer[]>([]);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [finalScores, setFinalScores] = useState<FinalScore[]>([]);
  const [winner, setWinner] = useState<FinalScore | null>(null);

  // Socket event handlers
  const socketEvents = useMemo(() => ({
    onRoomState: (data: { room: Room; currentQuestion?: string }) => {
      setRoom(data.room);
      if (data.currentQuestion) {
        setCurrentQuestion(data.currentQuestion);
      }
      // Navigate to appropriate screen based on game state
      switch (data.room.gameState) {
        case 'waiting':
          setScreen('waiting');
          break;
        case 'answering':
          setScreen('answering');
          break;
        case 'voting':
          setScreen('voting');
          break;
        case 'results':
          setScreen('results');
          break;
        case 'finished':
          setScreen('gameOver');
          break;
      }
    },
    onPlayerJoined: (data: { player: Room['players'][0] }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        // Check if player already exists
        const exists = prev.players.some(p => p.id === data.player.id);
        if (exists) {
          return {
            ...prev,
            players: prev.players.map(p => 
              p.id === data.player.id ? data.player : p
            ),
          };
        }
        return {
          ...prev,
          players: [...prev.players, data.player],
        };
      });
    },
    onPlayerLeft: (data: { playerId: string; room: Room }) => {
      setRoom(data.room);
    },
    onPlayerDisconnected: (data: { playerId: string; room: Room }) => {
      setRoom(data.room);
    },
    onGameStarted: (data: { room: Room; currentQuestion: string }) => {
      setRoom(data.room);
      setCurrentQuestion(data.currentQuestion);
      setScreen('answering');
    },
    onAnswerSubmitted: (data: { playerId: string }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => 
            p.id === data.playerId ? { ...p, hasAnswered: true } : p
          ),
        };
      });
    },
    onVotingPhase: (data: { room: Room; answers: AnonymousAnswer[] }) => {
      setRoom(data.room);
      setAnonymousAnswers(data.answers);
      setScreen('voting');
    },
    onVoteSubmitted: (data: { playerId: string }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => 
            p.id === data.playerId ? { ...p, hasVoted: true } : p
          ),
        };
      });
    },
    onRoundResults: (data: { room: Room; results: RoundResult[] }) => {
      setRoom(data.room);
      setRoundResults(data.results);
      setScreen('results');
    },
    onPlayerReady: (data: { playerId: string }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => 
            p.id === data.playerId ? { ...p, isReady: true } : p
          ),
        };
      });
    },
    onNextRound: (data: { room: Room; currentQuestion: string }) => {
      setRoom(data.room);
      setCurrentQuestion(data.currentQuestion);
      setAnonymousAnswers([]);
      setRoundResults([]);
      setScreen('answering');
    },
    onGameOver: (data: { room: Room; finalScores: FinalScore[]; winner: FinalScore }) => {
      setRoom(data.room);
      setFinalScores(data.finalScores);
      setWinner(data.winner);
      setScreen('gameOver');
    },
    onGameReset: (data: { room: Room }) => {
      setRoom(data.room);
      setCurrentQuestion(null);
      setAnonymousAnswers([]);
      setRoundResults([]);
      setFinalScores([]);
      setWinner(null);
      setScreen('waiting');
    },
    onError: (data: { message: string }) => {
      setError(data.message);
      setIsLoading(false);
    },
  }), []);

  const { 
    isConnected, 
    joinRoom: socketJoinRoom, 
    startGame: socketStartGame,
    submitAnswer: socketSubmitAnswer,
    submitVote: socketSubmitVote,
    markReady: socketMarkReady,
    leaveRoom: socketLeaveRoom,
    playAgain: socketPlayAgain,
  } = useSocket(socketEvents);

  // Try to rejoin on mount
  useEffect(() => {
    const tryRejoin = async () => {
      if (session.playerId && session.roomCode && session.playerName && isConnected) {
        try {
          setIsLoading(true);
          const response = await api.rejoinRoom(session.roomCode, session.playerId);
          setRoom(response.room);
          if (response.currentQuestion) {
            setCurrentQuestion(response.currentQuestion);
          }
          socketJoinRoom(session.roomCode, session.playerId, session.playerName);
        } catch {
          // Clear session if rejoin fails
          setSession({
            playerName: session.playerName,
            playerId: null,
            roomCode: null,
          });
          setScreen('lobby');
        } finally {
          setIsLoading(false);
        }
      } else if (session.playerName) {
        setScreen('lobby');
      }
    };

    if (isConnected) {
      tryRejoin();
    }
  }, [isConnected, session.playerId, session.roomCode, session.playerName, socketJoinRoom, setSession]);

  // Actions
  const setPlayerName = useCallback((name: string) => {
    setSession((prev) => ({ ...prev, playerName: name }));
    setScreen('lobby');
  }, [setSession]);

  const createRoom = useCallback(async () => {
    if (!session.playerName) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.createRoom(session.playerName);
      setSession((prev) => ({
        ...prev,
        playerId: response.oderId,
        roomCode: response.roomCode,
      }));
      socketJoinRoom(response.roomCode, response.oderId, session.playerName);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [session.playerName, setSession, socketJoinRoom]);

  const joinRoom = useCallback(async (code: string) => {
    if (!session.playerName) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.joinRoom(code, session.playerName);
      setRoom(response.room);
      setSession((prev) => ({
        ...prev,
        playerId: response.oderId,
        roomCode: response.room.roomCode,
      }));
      socketJoinRoom(response.room.roomCode, response.oderId, session.playerName);
      setScreen('waiting');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [session.playerName, setSession, socketJoinRoom]);

  const startGame = useCallback(() => {
    if (!session.playerId || !session.roomCode) return;
    socketStartGame(session.roomCode, session.playerId);
  }, [session.playerId, session.roomCode, socketStartGame]);

  const submitAnswer = useCallback((answer: string) => {
    if (!session.playerId || !session.roomCode) return;
    socketSubmitAnswer(session.roomCode, session.playerId, answer);
  }, [session.playerId, session.roomCode, socketSubmitAnswer]);

  const submitVote = useCallback((votedForPlayerId: string) => {
    if (!session.playerId || !session.roomCode) return;
    socketSubmitVote(session.roomCode, session.playerId, votedForPlayerId);
  }, [session.playerId, session.roomCode, socketSubmitVote]);

  const markReady = useCallback(() => {
    if (!session.playerId || !session.roomCode) return;
    socketMarkReady(session.roomCode, session.playerId);
  }, [session.playerId, session.roomCode, socketMarkReady]);

  const leaveRoom = useCallback(() => {
    if (session.playerId && session.roomCode) {
      socketLeaveRoom(session.roomCode, session.playerId);
    }
    setRoom(null);
    setSession((prev) => ({
      ...prev,
      playerId: null,
      roomCode: null,
    }));
    setCurrentQuestion(null);
    setAnonymousAnswers([]);
    setRoundResults([]);
    setFinalScores([]);
    setWinner(null);
    setScreen('lobby');
  }, [session.playerId, session.roomCode, socketLeaveRoom, setSession]);

  const playAgain = useCallback(() => {
    if (!session.roomCode) return;
    socketPlayAgain(session.roomCode);
  }, [session.roomCode, socketPlayAgain]);

  const clearError = useCallback(() => setError(null), []);

  const isHost = room?.hostId === session.playerId;

  const value = useMemo(() => ({
    playerName: session.playerName,
    playerId: session.playerId,
    setPlayerName,
    room,
    roomCode: session.roomCode,
    isHost,
    currentQuestion,
    anonymousAnswers,
    roundResults,
    finalScores,
    winner,
    screen,
    setScreen,
    isConnected,
    isLoading,
    error,
    clearError,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    submitVote,
    markReady,
    leaveRoom,
    playAgain,
  }), [
    session.playerName,
    session.playerId,
    session.roomCode,
    setPlayerName,
    room,
    isHost,
    currentQuestion,
    anonymousAnswers,
    roundResults,
    finalScores,
    winner,
    screen,
    isConnected,
    isLoading,
    error,
    clearError,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    submitVote,
    markReady,
    leaveRoom,
    playAgain,
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

