/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Settings, Volume2, VolumeX, Moon, Trash2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GameSettings } from '../types';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetStats: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetStats,
}: SettingsModalProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundOn: !settings.soundOn });
  };

  const setTimerDuration = (duration: number) => {
    onUpdateSettings({ ...settings, discussionDuration: duration });
  };

  const handleResetConfirm = () => {
    onResetStats();
    setShowConfirmReset(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="settings-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            id="settings-modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl p-6 md:p-8"
          >
            {/* Close */}
            <button
              id="settings-close-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/50 hover:bg-slate-800 rounded-full"
              aria-label="Close settings"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div id="settings-header" className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Settings size={28} />
              </div>
              <div>
                <h2 className="text-xl font-sans font-bold tracking-tight text-white">Settings</h2>
                <p className="text-xs text-slate-400 font-mono">Fine-tune gameplay parameters</p>
              </div>
            </div>

            {/* Options */}
            <div id="settings-options" className="space-y-6">
              {/* Sound Option */}
              <div id="setting-sound-row" className="flex items-center justify-between p-4 bg-slate-950/40 rounded-xl border border-slate-800/60">
                <div className="flex flex-col">
                  <span className="font-sans font-medium text-white text-sm">Game Sounds</span>
                  <span className="text-xs text-slate-400">Discussion beep, buzzer, reveal ticks</span>
                </div>
                <button
                  id="settings-sound-toggle-btn"
                  onClick={toggleSound}
                  className={`p-3 rounded-xl transition duration-150 active:scale-95 ${
                    settings.soundOn 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {settings.soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
              </div>

              {/* Theme (Informed constraint - Default is Dark Mode) */}
              <div id="setting-theme-row" className="flex items-center justify-between p-4 bg-slate-950/40 rounded-xl border border-slate-800/60">
                <div className="flex flex-col">
                  <span className="font-sans font-medium text-white text-sm">Dark Mode</span>
                  <span className="text-xs text-slate-400">Eye-safe slate layout (always active)</span>
                </div>
                <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                  <Moon size={20} />
                </div>
              </div>

              {/* Discussion Timer */}
              <div id="setting-timer-row" className="space-y-3">
                <div className="flex flex-col">
                  <span className="font-sans font-medium text-white text-sm">Discussion Timer</span>
                  <span className="text-xs text-slate-400">Time allowed for group debates</span>
                </div>
                
                <div id="settings-duration-selector" className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 120].map((dur) => (
                    <button
                      id={`timer-option-${dur}`}
                      key={dur}
                      onClick={() => setTimerDuration(dur)}
                      className={`py-3 text-sm font-semibold rounded-xl border transition-all active:scale-95 ${
                        settings.discussionDuration === dur
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/10'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Database / Stats */}
              <div id="setting-reset-section" className="pt-4 border-t border-slate-800">
                {!showConfirmReset ? (
                  <button
                    id="settings-reset-init-btn"
                    onClick={() => setShowConfirmReset(true)}
                    className="flex items-center justify-between w-full p-4 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 text-rose-400 hover:text-rose-300 font-sans font-semibold text-sm rounded-xl transition duration-150 cursor-pointer"
                  >
                    <span>Reset All Game Stats</span>
                    <Trash2 size={18} />
                  </button>
                ) : (
                  <div id="reset-confirm-box" className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-4">
                    <div className="flex items-start gap-2 text-rose-300 text-xs">
                      <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                      <p>
                        Are you sure? This will wipe your history, scoreboard, category stats, and reset player scores. This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button
                        id="reset-confirm-yes-btn"
                        onClick={handleResetConfirm}
                        className="flex-1 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-500 active:scale-95 transition-all text-center cursor-pointer"
                      >
                        Yes, Reset
                      </button>
                      <button
                        id="reset-confirm-no-btn"
                        onClick={() => setShowConfirmReset(false)}
                        className="flex-1 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 active:scale-95 transition-all text-center cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Back button */}
            <div id="settings-action-container" className="mt-8">
              <button
                id="settings-save-btn"
                onClick={onClose}
                className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-white font-sans font-semibold rounded-xl border border-slate-700 transition duration-150 cursor-pointer text-center text-sm"
              >
                Back To Main Menu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
