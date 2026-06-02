/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Eye, EyeOff, ShieldAlert, Sparkles, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Player, WordItem } from '../types';

interface PassDeviceRevealProps {
  players: Player[];
  currentWord: WordItem;
  impostorId: string;
  onRevealFinished: () => void;
  soundOn: boolean;
}

export default function PassDeviceReveal({
  players,
  currentWord,
  impostorId,
  onRevealFinished,
  soundOn,
}: PassDeviceRevealProps) {
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const activePlayer = players[currentPlayerIdx];
  const isImpostor = activePlayer.id === impostorId;

  const handleRevealToggle = () => {
    setIsRevealed(!isRevealed);
    if (soundOn) {
      try {
        const audio = new AudioContext();
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.frequency.setValueAtTime(isRevealed ? 300 : 500, audio.currentTime);
        gain.gain.setValueAtTime(0.04, audio.currentTime);
        osc.start();
        osc.stop(audio.currentTime + 0.08);
      } catch (e) {
        // Fallback for sandboxed context
      }
    }
  };

  const handleNextPlayer = () => {
    setIsRevealed(false);
    if (currentPlayerIdx < players.length - 1) {
      setCurrentPlayerIdx(currentPlayerIdx + 1);
    } else {
      onRevealFinished();
    }
  };

  const getRoleCardClass = () => {
    if (!isRevealed) return "bg-slate-950 border-slate-800";
    return isImpostor 
      ? "bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-950/20" 
      : "bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-950/20";
  };

  return (
    <div id="role-reveal-screen" className="w-full max-w-md mx-auto flex flex-col min-h-screen justify-between py-6 px-4">
      
      {/* Top Header Tracker */}
      <div id="role-reveal-navbar" className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs font-mono text-slate-400 mb-6">
        <div className="flex items-center gap-1.5">
          <User size={14} className="text-indigo-400" />
          <span>Device Holder:</span>
        </div>
        <div>
          <span className="text-white font-bold">{currentPlayerIdx + 1}</span>
          <span className="text-slate-500"> / {players.length}</span>
        </div>
      </div>

      {/* Main Interactive Flip Box */}
      <div id="reveal-card-body" className="flex-1 flex flex-col justify-between mb-6">
        
        {/* Subtitle guidance */}
        <div id="reveal-guide-banner" className="text-center mb-4">
          <h2 className="text-sm font-sans font-medium text-slate-300">
            {!isRevealed ? "Pass device to next player" : "Inspection Active"}
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            {!isRevealed 
              ? `Only ${activePlayer.name} should watch now!` 
              : `Don't let any opponents peek at your screens!`}
          </p>
        </div>

        {/* The Card container */}
        <div 
          id="role-content-area" 
          className={`flex-1 flex flex-col justify-between p-6 rounded-2xl border ${getRoleCardClass()} transition-all duration-300 relative overflow-hidden mb-5`}
        >
          {/* Subtle background graphics depending on reveal state */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                id="role-reveal-bg-glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 pointer-events-none ${isImpostor ? 'bg-radial-gradient from-rose-500 to-transparent' : 'bg-radial-gradient from-emerald-500 to-transparent'}`}
              />
            )}
          </AnimatePresence>

          {/* Prompt header */}
          <div id="reveal-player-bubble" className="text-center mt-3">
            <span className="px-3.5 py-1.5 bg-slate-800 text-slate-300 font-sans font-semibold text-xs rounded-full border border-slate-700/60 shadow-sm uppercase tracking-wide">
              {activePlayer.name}'s TURN
            </span>
          </div>

          {/* Reveal Center display content */}
          <div id="reveal-interactive-zone" className="my-8 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {!isRevealed ? (
                /* Unrevealed View */
                <motion.div
                  id="unrevealed-illustration"
                  key="unrevealed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-center gap-4 text-center cursor-pointer"
                  onClick={handleRevealToggle}
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner group">
                    <Eye size={28} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="font-sans font-bold text-white text-base">Secret Role Locked</span>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[190px] mx-auto">
                      Click the button below to inspect your secret assignment
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* Revealed View */
                <motion.div
                  id="revealed-illustration"
                  key="revealed"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center w-full"
                >
                  {isImpostor ? (
                    /* IMPOSTOR VIEW */
                    <div id="impostor-role-box" className="space-y-4">
                      <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 mx-auto">
                        <ShieldAlert size={26} />
                      </div>
                      
                      <div>
                        <span className="text-rose-500 font-mono text-[10px] font-bold tracking-[0.2em] uppercase block">YOUR SECRET ROLE</span>
                        <h3 className="font-sans font-black text-rose-400 text-3xl mt-0.5 tracking-tight">IMPOSTOR</h3>
                      </div>

                      <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 max-w-[280px] mx-auto">
                        <span className="text-slate-500 font-mono text-[9px] uppercase">YOUR IMPOSTOR HINT</span>
                        <p className="text-slate-100 font-sans font-bold text-lg leading-tight mt-1">{currentWord.impostorHint}</p>
                      </div>

                      <p className="text-[10px] text-rose-300 max-w-[210px] mx-auto leading-relaxed">
                        Blend in! Guess what the Secret Word is by listening to description patterns!
                      </p>
                    </div>
                  ) : (
                    /* CREWMATE VIEW */
                    <div id="crewmate-role-box" className="space-y-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 mx-auto">
                        <Sparkles size={26} />
                      </div>

                      <div>
                        <span className="text-emerald-500 font-mono text-[10px] font-bold tracking-[0.2em] uppercase block">YOUR SECRET ROLE</span>
                        <h3 className="font-sans font-black text-emerald-400 text-3xl mt-0.5 tracking-tight">CREWMATE</h3>
                      </div>

                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 max-w-[280px] mx-auto">
                        <span className="text-slate-500 font-mono text-[9px] uppercase">THE SECRET WORD</span>
                        <p className="text-slate-100 font-sans font-bold text-xl leading-tight mt-1 tracking-wide">{currentWord.secretWord}</p>
                      </div>

                      <p className="text-[10px] text-emerald-300/80 max-w-[210px] mx-auto leading-relaxed">
                        Find the Impostor! Give slightly vague clues to identify other Crewmates!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reveal button */}
          <button
            id="reveal-state-toggle-btn"
            onClick={handleRevealToggle}
            className={`w-full py-3 rounded-xl border font-sans font-semibold text-xs tracking-wide uppercase transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
              isRevealed 
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
            }`}
          >
            {isRevealed ? (
              <>
                <EyeOff size={15} />
                <span>Hide My Card</span>
              </>
            ) : (
              <>
                <Eye size={15} />
                <span>Reveal Secret Card</span>
              </>
            )}
          </button>
        </div>

        {/* Transition proceed action */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              id="reveal-continue-wrapper"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full mt-2"
            >
              <button
                id="reveal-next-player-btn"
                onClick={handleNextPlayer}
                className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 text-white font-sans font-bold rounded-xl border border-slate-850 shadow-md flex items-center justify-center gap-2 cursor-pointer duration-150 active:scale-98"
              >
                {currentPlayerIdx < players.length - 1 ? (
                  <>
                    <span>Hide & Next Player</span>
                    <ArrowRight size={18} className="text-indigo-400" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-400 animate-bounce" />
                    <span>All Done! Let's Debate</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
