import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useGame } from '../../context/GameContext';

export function Landing() {
  const { setPlayerName, isConnected } = useGame();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (trimmedName.length > 20) {
      setError('Name must be less than 20 characters');
      return;
    }
    
    setPlayerName(trimmedName);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-pattern">
      {/* Logo and title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl mb-4"
        >
          🎭
        </motion.div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
          <span className="bg-gradient-to-r from-accent-pink via-accent-purple to-accent-cyan bg-clip-text text-transparent">
            Who Said It?
          </span>
        </h1>
        <p className="text-white/60 text-lg">
          The hilarious party game
        </p>
      </motion.div>

      {/* Name input form */}
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6"
      >
        <Input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          maxLength={20}
          autoComplete="off"
          autoFocus
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!isConnected || name.trim().length < 2}
        >
          {isConnected ? "Let's Play!" : 'Connecting...'}
        </Button>
      </motion.form>

      {/* Connection status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex items-center gap-2"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-success' : 'bg-error animate-pulse'
          }`}
        />
        <span className="text-sm text-white/50">
          {isConnected ? 'Connected' : 'Connecting to server...'}
        </span>
      </motion.div>
    </div>
  );
}

