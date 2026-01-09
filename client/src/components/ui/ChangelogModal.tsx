import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANGELOG_DATA = {
  version: '1.1.0',
  lastUpdated: 'January 9, 2026',
  releases: [
    {
      version: '1.1.0',
      date: 'January 9, 2026',
      changes: [
        {
          type: 'fix',
          title: 'State Resume Fix',
          description: 'Fixed game state resumption when players leave and rejoin the game. Players can now properly rejoin ongoing games without losing their progress.',
        },
        {
          type: 'feature',
          title: 'Questions System Overhaul',
          description: 'New question seeding with 1000+ curated questions, usage tracking to prevent repetition, and improved game variety.',
        },
      ],
    },
    {
      version: '1.0.0',
      date: 'Initial Release',
      changes: [
        {
          type: 'feature',
          title: 'Launch',
          description: 'Real-time multiplayer party game with room codes, anonymous voting, and point-based scoring.',
        },
      ],
    },
  ],
};

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md max-h-[85vh] bg-surface-dark border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Release Notes</h2>
            <p className="text-sm text-white/50 mt-0.5">
              v{CHANGELOG_DATA.version} • Updated {CHANGELOG_DATA.lastUpdated}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {CHANGELOG_DATA.releases.map((release) => (
            <div key={release.version}>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 bg-accent-purple/20 text-accent-purple text-sm font-semibold rounded-full">
                  v{release.version}
                </span>
                <span className="text-sm text-white/40">{release.date}</span>
              </div>
              
              <div className="space-y-3">
                {release.changes.map((change, idx) => (
                  <div
                    key={idx}
                    className="pl-4 border-l-2 border-white/10 hover:border-accent-cyan/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium uppercase tracking-wide ${
                          change.type === 'feature'
                            ? 'text-accent-cyan'
                            : change.type === 'fix'
                            ? 'text-success'
                            : 'text-warning'
                        }`}
                      >
                        {change.type === 'feature' ? '✨ Feature' : change.type === 'fix' ? '🐛 Fix' : '📝 Update'}
                      </span>
                    </div>
                    <h4 className="text-white font-medium">{change.title}</h4>
                    <p className="text-sm text-white/60 mt-1">{change.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-surface-darker/50">
          <p className="text-xs text-white/40 text-center">
            Made with 💜 by the Who Said It team
          </p>
        </div>
      </motion.div>
    </div>
  );
}

