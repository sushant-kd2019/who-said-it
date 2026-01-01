import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Input';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { useGame } from '../../context/GameContext';

export function AnswerPhase() {
  const { room, playerId, currentQuestion, submitAnswer, leaveRoom } = useGame();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showLeaveMenu, setShowLeaveMenu] = useState(false);

  if (!room || !currentQuestion) return null;

  const currentPlayer = room.players.find(p => p.id === playerId);
  const hasAnswered = currentPlayer?.hasAnswered || submitted;
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const answeredCount = connectedPlayers.filter(p => p.hasAnswered).length;

  const handleSubmit = () => {
    if (answer.trim().length < 1) return;
    submitAnswer(answer.trim());
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
        <span className="inline-block px-4 py-1 bg-accent-purple/20 text-accent-purple rounded-full text-sm font-medium">
          Round {room.currentRound} of {room.totalRounds}
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

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <p className="text-xl md:text-2xl font-semibold text-center leading-relaxed">
          {currentQuestion}
        </p>
      </motion.div>

      {/* Answer input or waiting state */}
      <div className="flex-1 flex flex-col">
        {!hasAnswered ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <TextArea
              placeholder="Type your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={200}
              showCount
              rows={4}
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              fullWidth
              size="lg"
              disabled={answer.trim().length < 1}
            >
              Submit Answer ✨
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Answer Submitted!</h3>
            <p className="text-white/60">Waiting for others...</p>
          </motion.div>
        )}
      </div>

      {/* Player status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 safe-bottom"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/60 text-sm">Answers</span>
          <span className="text-white/60 text-sm">
            {answeredCount}/{connectedPlayers.length}
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
                hasCompleted={player.hasAnswered}
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
            animate={{ width: `${(answeredCount / connectedPlayers.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-accent-pink to-accent-purple"
          />
        </div>
      </motion.div>
    </div>
  );
}

