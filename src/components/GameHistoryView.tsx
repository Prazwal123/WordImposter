/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Info, History, Calendar, Award, User, Tag, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { GameHistory } from '../types';

interface GameHistoryViewProps {
  history: GameHistory[];
  onBack: () => void;
  onClearHistory?: () => void;
}

export default function GameHistoryView({
  history,
  onBack,
  onClearHistory,
}: GameHistoryViewProps) {
  return (
    <div id="game-history-screen" className="w-full max-w-md mx-auto flex flex-col min-h-screen justify-between py-6 px-4">
      {/* Navbar header */}
      <div id="game-history-navbar" className="flex items-center justify-between mb-4">
        <button
          id="history-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Menu</span>
        </button>
        <span className="font-sans font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/60 px-3 py-1.5 rounded-full">
          <History size={14} className="text-indigo-400" />
          <span>Battle Archives</span>
        </span>
      </div>

      {/* Main panel card */}
      <div id="game-history-panel-card" className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl mb-6 flex flex-col justify-between overflow-hidden">
        
        {/* Title */}
        <div id="history-header" className="mb-4">
          <p className="text-sm font-sans text-slate-200 font-medium">Chronological Game Registry</p>
          <p className="text-xs text-slate-400 mt-1">Review past games outcome, suspect performance and secret codes.</p>
        </div>

        {/* History Scroll List */}
        <div id="history-scroll-column" className="flex-1 bg-slate-950/40 rounded-xl border border-slate-800/80 p-3 overflow-y-auto max-h-[460px] space-y-3 pr-1.5">
          {history.length === 0 ? (
            <div id="history-empty-hint" className="h-[250px] flex flex-col items-center justify-center text-slate-500 text-xs text-center">
              <Layers size={32} className="mb-2 text-slate-600 opacity-60 animate-pulse" />
              <p>The archives are currently empty</p>
              <p className="mt-0.5">Finalize a game in the lobby to log logs</p>
            </div>
          ) : (
            history.map((record, idx) => {
              const crewWon = record.winner === 'crewmates';
              return (
                <motion.div
                  id={`history-item-block-${record.id}`}
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="bg-slate-900 border border-slate-800/60 rounded-xl p-3.5 space-y-3 relative overflow-hidden"
                >
                  {/* Absolute subtle background color indicator */}
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${
                    crewWon ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />

                  {/* Header Row */}
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-b border-slate-800/40 pb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-indigo-400" />
                      <span>{record.date}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                      crewWon ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {crewWon ? 'CREWMATES WON' : 'IMPOSTOR WON'}
                    </span>
                  </div>

                  {/* Context stats bento */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                      <span className="text-slate-500 block text-[8px] font-mono uppercase">Category deck:</span>
                      <span className="text-slate-200 mt-0.5 font-bold truncate block">{record.category}</span>
                    </div>

                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                      <span className="text-slate-500 block text-[8px] font-mono uppercase">Secret Word:</span>
                      <span className="text-indigo-400 mt-0.5 font-black truncate block">{record.secretWord}</span>
                    </div>
                  </div>

                  {/* Bottom context: Suspect / Guess */}
                  <div className="text-[11px] font-mono text-slate-400 flex flex-col gap-1 pt-1.5 border-t border-slate-850/60">
                    <div className="flex justify-between">
                      <span>Impostor:</span>
                      <strong className="text-slate-200">{record.impostorName}</strong>
                    </div>

                    {record.guessWasCorrect !== null && (
                      <div className="flex justify-between">
                        <span>Terminal Guess:</span>
                        <span className={record.guessWasCorrect ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                          {record.guessWasCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Clear Action banner */}
        {onClearHistory && history.length > 0 && (
          <div className="text-center mt-3 pt-2">
            <button
              id="clear-archive-btn"
              onClick={onClearHistory}
              className="text-[10px] text-slate-500 hover:text-rose-400 font-mono underline uppercase tracking-wider cursor-pointer transition duration-150"
            >
              Clear complete battle archives
            </button>
          </div>
        )}

      </div>

      {/* Persistent Proceed Footer */}
      <div id="history-footer" className="w-full">
        <button
          id="history-home-btn"
          onClick={onBack}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-white font-sans font-bold rounded-xl border border-slate-700 transition duration-150 text-center text-sm cursor-pointer"
        >
          Menu Main Menu
        </button>
      </div>
    </div>
  );
}
