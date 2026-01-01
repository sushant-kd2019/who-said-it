import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { useGame } from '../../context/GameContext';

export function VotingPhase() {
  const { room, playerId, currentQuestion, anonymousAnswers, submitVote, leaveRoom } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showLeaveMenu, setShowLeaveMenu] = useState(false);

  if (!room || !currentQuestion) return null;

  const currentPlayer = room.players.find(p => p.id === playerId);
  const hasVoted = currentPlayer?.hasVoted || submitted;
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const votedCount = connectedPlayers.filter(p => p.hasVoted).length;

  const handleVote = () => {
    if (!selectedId) return;
    submitVote(selectedId);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 bg-pattern">
      {/* Header with menu */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="w-10" />
        <span className="inline-block px-4 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm font-medium">
          Vote for the Best! 🗳️
        </span>
        <div className="relative">
          <button
            onClick={() => setShowLeaveMenu(!showLeaveMenu)}
            className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            ⋮
          </button>
          <AnimatePresence>
            {showLeaveMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLeaveMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 z-50 bg-dark-700 border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[160px]"
                >
                  <button
                    onClick={() => {
                      setShowLeaveMenu(false);
                      leaveRoom();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <span>🚪</span>
                    Leave Game
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Question reminder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-4 mb-6"
      >
        <p className="text-center text-white/80">
          {currentQuestion}
        </p>
      </motion.div>

      {/* Answers to vote on */}
      <div className="flex-1 overflow-y-auto">
        {!hasVoted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {anonymousAnswers.map((answer, index) => (
              <motion.div
                key={answer.playerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  onClick={() => setSelectedId(answer.playerId)}
                  selected={selectedId === answer.playerId}
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-dark-500 flex items-center justify-center text-white/50 text-sm font-bold">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-white/90 leading-relaxed">
                      "{answer.text}"
                    </p>
                    {selectedId === answer.playerId && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-accent-purple text-xl"
                      >
                        ✓
                      </motion.span>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-accent-cyan/20 flex items-center justify-center mb-4">
              <span className="text-4xl">🗳️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Vote Cast!</h3>
            <p className="text-white/60">Waiting for others to vote...</p>
          </motion.div>
        )}
      </div>

      {/* Vote button */}
      {!hasVoted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <Button
            onClick={handleVote}
            fullWidth
            size="lg"
            disabled={!selectedId}
          >
            Cast Vote 🎯
          </Button>
        </motion.div>
      )}

      {/* Player status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 safe-bottom"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/60 text-sm">Votes</span>
          <span className="text-white/60 text-sm">
            {votedCount}/{connectedPlayers.length}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {connectedPlayers.map((player) => (
            <motion.div
              key={player.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-1"
            >
              <PlayerAvatar
                name={player.name}
                hasCompleted={player.hasVoted}
                showStatus
                size="sm"
              />
              <span className="text-xs text-white/50 max-w-[60px] truncate">
                {player.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-dark-600 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(votedCount / connectedPlayers.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple"
          />
        </div>
      </motion.div>
    </div>
  );
}

