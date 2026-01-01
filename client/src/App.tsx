import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider, useGame } from './context/GameContext';
import { Toast } from './components/ui/Toast';

// Screens
import { Landing } from './components/screens/Landing';
import { Lobby } from './components/screens/Lobby';
import { WaitingRoom } from './components/screens/WaitingRoom';
import { AnswerPhase } from './components/screens/AnswerPhase';
import { VotingPhase } from './components/screens/VotingPhase';
import { ResultsPhase } from './components/screens/ResultsPhase';
import { GameOver } from './components/screens/GameOver';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function GameScreens() {
  const { screen, error, clearError, isLoading } = useGame();

  const renderScreen = () => {
    switch (screen) {
      case 'landing':
        return <Landing />;
      case 'lobby':
        return <Lobby />;
      case 'waiting':
        return <WaitingRoom />;
      case 'answering':
        return <AnswerPhase />;
      case 'voting':
        return <VotingPhase />;
      case 'results':
        return <ResultsPhase />;
      case 'gameOver':
        return <GameOver />;
      default:
        return <Landing />;
    }
  };

  return (
    <>
      {/* Error toast */}
      <Toast
        message={error || ''}
        type="error"
        isVisible={!!error}
        onClose={clearError}
      />

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
              <p className="text-white/70">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="min-h-[100dvh]"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <GameProvider>
      <GameScreens />
    </GameProvider>
  );
}

export default App;

