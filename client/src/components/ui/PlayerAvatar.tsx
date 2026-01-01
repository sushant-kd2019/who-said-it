import { motion } from 'framer-motion';

interface PlayerAvatarProps {
  name: string;
  isHost?: boolean;
  isConnected?: boolean;
  hasCompleted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
};

// Generate a consistent color based on name
function getColorFromName(name: string): string {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-violet-500',
    'from-blue-500 to-cyan-500',
    'from-teal-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500',
    'from-indigo-500 to-purple-500',
    'from-cyan-500 to-blue-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export function PlayerAvatar({
  name,
  isHost = false,
  isConnected = true,
  hasCompleted = false,
  size = 'md',
  showStatus = false,
}: PlayerAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const colorClass = getColorFromName(name);
  
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`
          ${sizes[size]}
          bg-gradient-to-br ${colorClass}
          rounded-full flex items-center justify-center
          font-bold text-white
          ${!isConnected ? 'opacity-40' : ''}
        `}
      >
        {initial}
      </motion.div>
      
      {/* Host crown */}
      {isHost && (
        <span className="absolute -top-2 -right-1 text-sm">👑</span>
      )}
      
      {/* Status indicator */}
      {showStatus && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`
            absolute -bottom-0.5 -right-0.5
            w-4 h-4 rounded-full
            flex items-center justify-center
            text-[10px]
            ${hasCompleted 
              ? 'bg-success text-dark-900' 
              : isConnected 
                ? 'bg-dark-500 border border-dark-400' 
                : 'bg-error/50'
            }
          `}
        >
          {hasCompleted ? '✓' : isConnected ? '' : '!'}
        </motion.span>
      )}
    </div>
  );
}

interface PlayerListItemProps {
  name: string;
  isHost?: boolean;
  isConnected?: boolean;
  hasCompleted?: boolean;
  score?: number;
  showScore?: boolean;
  isCurrentPlayer?: boolean;
}

export function PlayerListItem({
  name,
  isHost = false,
  isConnected = true,
  hasCompleted = false,
  score,
  showScore = false,
  isCurrentPlayer = false,
}: PlayerListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        flex items-center gap-3 p-3 rounded-xl
        ${isCurrentPlayer ? 'bg-accent-purple/10 border border-accent-purple/30' : 'bg-dark-600'}
        ${!isConnected ? 'opacity-50' : ''}
      `}
    >
      <PlayerAvatar
        name={name}
        isHost={isHost}
        isConnected={isConnected}
        hasCompleted={hasCompleted}
        showStatus
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {name}
          {isCurrentPlayer && <span className="text-accent-purple ml-2">(You)</span>}
        </p>
        {!isConnected && (
          <p className="text-xs text-white/50">Disconnected</p>
        )}
      </div>
      {showScore && typeof score === 'number' && (
        <div className="text-right">
          <p className="font-bold text-accent-yellow">{score}</p>
          <p className="text-xs text-white/50">pts</p>
        </div>
      )}
    </motion.div>
  );
}

