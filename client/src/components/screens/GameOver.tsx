import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { Confetti } from '../ui/Confetti';
import { useGame } from '../../context/GameContext';

export function GameOver() {
  const { room, playerId, finalScores, winner, isHost, playAgain, leaveRoom } = useGame();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti after a short delay
    const timer = setTimeout(() => setShowConfetti(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!room || !winner) return null;

  const isWinner = winner.playerId === playerId;

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 bg-pattern overflow-hidden">
      <Confetti trigger={showConfetti} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 0.5,
            repeat: 3,
            repeatDelay: 1
          }}
          className="text-6xl mb-4"
        >
          🎊
        </motion.div>
        <h1 className="font-display text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-accent-yellow via-accent-pink to-accent-purple bg-clip-text text-transparent">
            Game Over!
          </span>
        </h1>
      </motion.div>

      {/* Winner showcase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="mb-6"
      >
        <Card className="p-6 gradient-border text-center" glow>
          <div className="text-4xl mb-2">👑</div>
          <p className="text-accent-yellow font-bold text-sm mb-3">WINNER</p>
          
          <div className="flex justify-center mb-3">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <PlayerAvatar name={winner.playerName} size="lg" />
            </motion.div>
          </div>
          
          <h2 className="text-2xl font-bold mb-1">{winner.playerName}</h2>
          <p className="text-3xl font-bold text-accent-yellow">{winner.score} pts</p>
          
          {isWinner && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 text-accent-cyan"
            >
              🎉 That's you! Congratulations!
            </motion.p>
          )}
        </Card>
      </motion.div>

      {/* Final Scoreboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex-1"
      >
        <p className="text-white/50 text-sm mb-3">Final Standings</p>
        <Card className="p-4">
          <div className="space-y-2">
            {finalScores.map((score, index) => (
              <motion.div
                key={score.playerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  score.playerId === playerId 
                    ? 'bg-accent-purple/20 border border-accent-purple/30' 
                    : 'bg-dark-600'
                }`}
              >
                <span className="w-8 text-center text-xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                </span>
                <PlayerAvatar name={score.playerName} size="md" />
                <span className="flex-1 font-medium truncate">
                  {score.playerName}
                  {score.playerId === playerId && (
                    <span className="text-accent-purple ml-2">(You)</span>
                  )}
                </span>
                <div className="text-right">
                  <span className="font-bold text-xl text-accent-yellow">{score.score}</span>
                  <span className="text-white/50 text-sm ml-1">pts</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 space-y-3 safe-bottom"
      >
        {isHost && (
          <Button onClick={playAgain} fullWidth size="lg">
            🔄 Play Again
          </Button>
        )}
        
        {!isHost && (
          <div className="text-center py-3">
            <span className="text-white/60">Waiting for host to start new game...</span>
          </div>
        )}
        
        <Button onClick={leaveRoom} variant="ghost" fullWidth>
          Leave Game
        </Button>
      </motion.div>
    </div>
  );
}

