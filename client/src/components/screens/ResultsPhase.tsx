import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { useGame } from '../../context/GameContext';

export function ResultsPhase() {
  const { room, playerId, currentQuestion, roundResults, markReady } = useGame();
  const [ready, setReady] = useState(false);

  if (!room || !currentQuestion) return null;

  const currentPlayer = room.players.find(p => p.id === playerId);
  const isReady = currentPlayer?.isReady || ready;
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const readyCount = connectedPlayers.filter(p => p.isReady).length;
  
  // Sort players by score for leaderboard
  const sortedPlayers = [...room.players]
    .filter(p => p.isConnected)
    .sort((a, b) => b.score - a.score);

  const handleReady = () => {
    markReady();
    setReady(true);
  };

  // Find the winner(s) of this round
  const maxVotes = Math.max(...roundResults.map(r => r.votes), 0);
  const winners = roundResults.filter(r => r.votes === maxVotes && r.votes > 0);

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 bg-pattern">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <span className="inline-block px-4 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-sm font-medium">
          Round {room.currentRound} Results 🎉
        </span>
      </motion.div>

      {/* Question reminder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-4 mb-4"
      >
        <p className="text-center text-white/80 text-sm">
          {currentQuestion}
        </p>
      </motion.div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Winner showcase */}
        {winners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-5 gradient-border" glow>
              <div className="text-center mb-3">
                <span className="text-2xl">🏆</span>
                <p className="text-accent-yellow font-bold text-sm">
                  {winners.length > 1 ? 'WINNERS' : 'WINNER'}
                </p>
              </div>
              {winners.map((winner, i) => (
                <div key={winner.oderId} className={i > 0 ? 'mt-4 pt-4 border-t border-white/10' : ''}>
                  <p className="text-lg text-center mb-2">"{winner.answerText}"</p>
                  <div className="flex items-center justify-center gap-2">
                    <PlayerAvatar name={winner.playerName} size="sm" />
                    <span className="font-medium">{winner.playerName}</span>
                    <span className="text-accent-yellow font-bold">+{winner.votes}</span>
                  </div>
                </div>
              ))}
            </Card>
          </motion.div>
        )}

        {/* Other answers */}
        <div className="space-y-2">
          <p className="text-white/50 text-sm">All Answers</p>
          {roundResults
            .filter(r => !winners.some(w => w.oderId === r.oderId))
            .map((result, index) => (
              <motion.div
                key={result.oderId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="p-3">
                  <p className="text-white/80 mb-2">"{result.answerText}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar name={result.playerName} size="sm" />
                      <span className="text-sm text-white/70">{result.playerName}</span>
                    </div>
                    <span className="text-white/50 text-sm">
                      {result.votes} vote{result.votes !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
        </div>

        {/* Scoreboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/50 text-sm mb-2">Scoreboard</p>
          <Card className="p-4">
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    player.id === playerId ? 'bg-accent-purple/10' : ''
                  }`}
                >
                  <span className="w-6 text-center font-bold text-white/50">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <PlayerAvatar name={player.name} size="sm" />
                  <span className="flex-1 truncate">
                    {player.name}
                    {player.id === playerId && (
                      <span className="text-accent-purple ml-1">(You)</span>
                    )}
                  </span>
                  <span className="font-bold text-accent-yellow">{player.score}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Ready button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4 space-y-3 safe-bottom"
      >
        {!isReady ? (
          <Button onClick={handleReady} fullWidth size="lg">
            Ready for Next Round ✓
          </Button>
        ) : (
          <div className="text-center py-3">
            <span className="text-success">✓ You're ready!</span>
          </div>
        )}

        {/* Ready status */}
        <div className="flex items-center justify-center gap-1 text-sm text-white/50">
          <span>{readyCount}/{connectedPlayers.length} players ready</span>
        </div>
        
        <div className="flex flex-wrap gap-1 justify-center">
          {connectedPlayers.map((player) => (
            <div
              key={player.id}
              className={`w-3 h-3 rounded-full transition-colors ${
                player.isReady ? 'bg-success' : 'bg-dark-500'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

