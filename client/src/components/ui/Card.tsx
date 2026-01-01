import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  glow?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  selected = false,
  disabled = false,
  glow = false,
}: CardProps) {
  const isClickable = !!onClick && !disabled;
  
  return (
    <motion.div
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      onClick={isClickable ? onClick : undefined}
      className={`
        bg-dark-700 rounded-2xl p-4
        border-2 transition-all duration-200
        ${selected 
          ? 'border-accent-purple shadow-lg shadow-accent-purple/20' 
          : 'border-dark-500'
        }
        ${isClickable ? 'cursor-pointer hover:border-accent-purple/50' : ''}
        ${disabled ? 'opacity-50' : ''}
        ${glow ? 'animate-pulse-glow' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

export function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-2xl p-6 border border-white/10 ${className}`}>
      {children}
    </div>
  );
}

