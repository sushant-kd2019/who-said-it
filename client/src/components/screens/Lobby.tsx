import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useGame } from '../../context/GameContext';

export function Lobby() {
  const { playerName, createRoom, joinRoom, isLoading, error, clearError, setScreen } = useGame();
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleCreateRoom = async () => {
    clearError();
    await createRoom();
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setLocalError('Room code must be 6 characters');
      return;
    }
    
    await joinRoom(code);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 bg-pattern">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <button
          onClick={() => setScreen('landing')}
          className="text-white/60 hover:text-white p-2 -ml-2"
        >
          ← Back
        </button>
        <div className="flex-1 text-center">
          <h2 className="font-display text-xl font-semibold">
            <span className="text-accent-pink">Who Said It?</span>
          </h2>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </motion.div>

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <p className="text-white/60">Welcome,</p>
        <p className="text-2xl font-bold bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent">
          {playerName}
        </p>
      </motion.div>

      {/* Options */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-4">
        {/* Create Room */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            onClick={handleCreateRoom}
            className="p-6 cursor-pointer hover:border-accent-pink/50 transition-colors"
            disabled={isLoading}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-pink to-accent-purple flex items-center justify-center text-2xl">
                🎮
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Host a Room</h3>
                <p className="text-white/50 text-sm">Create a new game room</p>
              </div>
              {isLoading && !showJoinInput && (
                <div className="w-5 h-5 border-2 border-accent-pink/30 border-t-accent-pink rounded-full animate-spin" />
              )}
            </div>
          </Card>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-sm">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Join Room */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {!showJoinInput ? (
            <Card
              onClick={() => setShowJoinInput(true)}
              className="p-6 cursor-pointer hover:border-accent-cyan/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-2xl">
                  🔗
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Join a Room</h3>
                  <p className="text-white/50 text-sm">Enter a room code</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setLocalError('');
                    clearError();
                  }}
                  maxLength={6}
                  autoFocus
                  className="text-center text-2xl tracking-widest font-mono uppercase"
                  error={localError || error || undefined}
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowJoinInput(false);
                      setJoinCode('');
                      setLocalError('');
                      clearError();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={joinCode.length !== 6}
                    className="flex-1"
                  >
                    Join
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Error display */}
      {error && !showJoinInput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-error/20 border border-error/30 rounded-xl text-center"
        >
          <p className="text-error text-sm">{error}</p>
        </motion.div>
      )}
    </div>
  );
}

