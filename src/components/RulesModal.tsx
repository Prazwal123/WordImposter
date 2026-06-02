/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, HelpCircle, User, Award, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div id="rules-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            id="rules-modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl p-6 md:p-8"
          >
            {/* Close Button */}
            <button
              id="rules-close-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/50 hover:bg-slate-800 rounded-full"
              aria-label="Close rules"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div id="rules-header" className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <HelpCircle size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-sans font-bold tracking-tight text-white">How To Play</h2>
                <p className="text-xs text-slate-400 font-mono">Word Impostor: Party Deduction Game</p>
              </div>
            </div>

            {/* Core Rules List */}
            <div id="rules-body" className="space-y-6 text-sm text-slate-300">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg shrink-0 mt-0.5">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-white text-base mb-1">1. Local Setup</h3>
                  <p>
                    Gather <span className="text-white font-medium">3 to 15 players</span> around a single mobile device. Since this is a pass-and-play game, you'll share a phone to view secret roles.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2 bg-cyan-400/10 text-cyan-400 rounded-lg shrink-0 mt-0.5">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-white text-base mb-1">2. Secret Revelation</h3>
                  <p>
                    Pass the device to each player. Each clicks to inspect their role privately:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 pl-1 text-xs text-slate-400">
                    <li>
                      <span className="text-emerald-400 font-medium">Crewmate View:</span> Sees the exact <span className="text-white font-medium">Secret Word</span> (e.g., <span className="italic">"Momo"</span>).
                    </li>
                    <li>
                      <span className="text-rose-400 font-medium">Impostor View:</span> Sees a broader related <span className="text-white font-medium">Impostor Hint</span> (e.g., <span className="italic">"Nepali Food"</span>). They stay unaware of the exact word.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0 mt-0.5">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-white text-base mb-1">3. The Discussion</h3>
                  <p>
                    Take turns giving a one-word or short-phrase description of what you saw. 
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    <span className="text-white">Crewmates</span> should describe it vaguely enough that the Impostor can't easily guess it, but clearly enough to prove they are a Crewmate.
                    The <span className="text-white">Impostor</span> must lie, improvise, and blend in based on their hint to avoid suspicion!
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0 mt-0.5">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-white text-base mb-1">4. Voting and Winning</h3>
                  <p>
                    Once discussion concludes, everyone casts a vote to evict the Impostor.
                  </p>
                  <div className="mt-2 bg-slate-950/40 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <p>
                      🔴 <span className="text-white font-medium">If the Impostor isn't voted out:</span> The Impostor wins!
                    </p>
                    <p>
                      🟢 <span className="text-white font-medium">If the Impostor is successfully voted out:</span> They get <span className="text-yellow-400 font-bold">one final guess</span> to declare the Secret Word!
                    </p>
                    <p className="pl-4 text-slate-400">
                      • If the Impostor guesses the word perfectly → <span className="text-rose-400">Impostor Wins!</span><br />
                      • If the Impostor guesses incorrectly → <span className="text-emerald-400">Crewmates Win!</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acknowledgment button */}
            <div id="rules-action-container" className="mt-8">
              <button
                id="rules-got-it-btn"
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-sans font-semibold rounded-xl shadow-lg shadow-indigo-900/30 active:scale-98 transition duration-150 cursor-pointer"
              >
                Let's Play!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
