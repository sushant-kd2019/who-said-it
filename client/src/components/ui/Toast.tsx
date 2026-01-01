import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = 'error',
  isVisible,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const bgColors = {
    error: 'bg-error/90',
    success: 'bg-success/90',
    info: 'bg-accent-purple/90',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50 flex justify-center"
        >
          <div
            className={`
              ${bgColors[type]}
              text-white px-6 py-3 rounded-xl
              shadow-lg backdrop-blur-sm
              flex items-center gap-3
              max-w-md
            `}
          >
            <span className="text-lg">
              {type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

