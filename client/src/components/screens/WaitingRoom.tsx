import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { PlayerListItem } from '../ui/PlayerAvatar';
import { useGame } from '../../context/GameContext';

export function WaitingRoom() {
  const { room, playerId, isHost, startGame, leaveRoom, error } = useGame();
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const connectedPlayers = room.players.filter(p => p.isConnected);
  const canStart = connectedPlayers.length >= 3;

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = room.roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 bg-pattern">
      {/* Header with room code */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <p className="text-white/60 text-sm mb-2">Room Code</p>
        <button
          onClick={copyRoomCode}
          className="group flex items-center justify-center gap-3 mx-auto"
        >
          <span className="font-mono text-4xl font-bold tracking-[0.3em] bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent">
            {room.roomCode}
          </span>
          <motion.span
            animate={{ scale: copied ? [1, 1.2, 1] : 1 }}
            className="text-white/50 group-hover:text-white transition-colors"
          >
            {copied ? '✓' : '📋'}
          </motion.span>
        </button>
        <AnimatePresence>
          {copied && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-success text-sm mt-2"
            >
              Copied to clipboard!
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Share message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-4 mb-6 text-center"
      >
        <p className="text-white/70 text-sm">
          Share this code with friends to join! 📱
        </p>
      </motion.div>

      {/* Players list */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white/70">
            Players ({connectedPlayers.length})
          </h3>
          {!canStart && (
            <span className="text-xs text-accent-yellow">
              Need {3 - connectedPlayers.length} more
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <AnimatePresence>
            {room.players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <PlayerListItem
                  name={player.name}
                  isHost={player.id === room.hostId}
                  isConnected={player.isConnected}
                  isCurrentPlayer={player.id === playerId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-error/20 border border-error/30 rounded-xl text-center"
        >
          <p className="text-error text-sm">{error}</p>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 safe-bottom"
      >
        {isHost ? (
          <>
            <Button
              onClick={startGame}
              fullWidth
              size="lg"
              disabled={!canStart}
            >
              {canStart ? '🚀 Start Game' : `Waiting for players (${connectedPlayers.length}/3)`}
            </Button>
            <p className="text-center text-white/40 text-xs">
              You are the host. Start when everyone has joined.
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-dark-600 rounded-xl">
              <span className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
              <span className="text-white/70">Waiting for host to start...</span>
            </div>
          </div>
        )}
        
        <Button
          onClick={leaveRoom}
          variant="ghost"
          fullWidth
          className="text-white/50"
        >
          Leave Room
        </Button>
      </motion.div>
    </div>
  );
}

