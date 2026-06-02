/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trophy, Users, ShieldAlert, Sparkles, User, ArrowLeft, RefreshCw, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { Player, GameStats } from '../types';

interface ScoreboardViewProps {
  players: Player[];
  stats: GameStats;
  onBack: () => void;
  onReset: () => void;
}

export default function ScoreboardView({
  players,
  stats,
  onBack,
  onReset,
}: ScoreboardViewProps) {
  // Sort players by total score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const calculatePercentage = (part: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  const crewWinPercent = calculatePercentage(stats.crewmateWins, stats.totalGames);
  const impWinPercent = calculatePercentage(stats.impostorWins, stats.totalGames);

  return (
    <div id="stats-scoreboard-screen" className="w-full max-w-md mx-auto flex flex-col min-h-screen justify-between py-6 px-4">
      {/* Top navbar */}
      <div id="scoreboard-navbar" className="flex items-center justify-between mb-4">
        <button
          id="scoreboard-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Menu</span>
        </button>
        <span className="font-sans font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/60 px-3 py-1.5 rounded-full">
          <BarChart3 size={14} className="text-indigo-400 animate-pulse" />
          <span>Hall Of Fame</span>
        </span>
      </div>

      {/* Main Stats container */}
      <div id="scoreboard-card-container" className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl mb-6 flex flex-col justify-between overflow-y-auto max-h-[80vh]">
        
        {/* Global bento grid metrics */}
        <div id="global-stats-bento" className="mb-6">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-2 px-1">Session Summary Data</span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-sans font-semibold">
            
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block text-[9px] uppercase">GAMES</span>
              <span className="text-indigo-400 font-mono text-xl font-black block mt-0.5">{stats.totalGames}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="text-emerald-400 block text-[9px] uppercase">CREW WT</span>
              <span className="text-slate-200 font-mono text-xl font-bold block mt-0.5">{crewWinPercent}%</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="text-rose-400 block text-[9px] uppercase">IMP WT</span>
              <span className="text-slate-200 font-mono text-xl font-bold block mt-0.5">{impWinPercent}%</span>
            </div>

          </div>
        </div>

        {/* Players Score Leaderboard */}
        <div id="leaderboard-body" className="flex-1">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-2 px-1">Player Rankings</span>
          
          {sortedPlayers.length === 0 ? (
            <div className="text-center text-slate-500 text-xs py-8 bg-slate-950/40 border border-slate-800/60 rounded-xl">
              <User size={24} className="mx-auto mb-1 opacity-45 text-slate-600" />
              <p>Add players in Setup to show scores!</p>
            </div>
          ) : (
            <div id="scoreboard-rows-stack" className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {sortedPlayers.map((p, idx) => {
                const isTop1 = idx === 0 && p.score > 0;
                const isTop2 = idx === 1 && p.score > 0;
                
                return (
                  <motion.div
                    id={`leaderboard-row-${p.id}`}
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.04 }}
                    className="flex justify-between items-center p-3 bg-slate-950/65 border border-slate-800/70 hover:border-slate-700/80 rounded-xl"
                  >
                    {/* Left Rank + Name */}
                    <div className="flex items-center gap-2.5">
                      {isTop1 ? (
                        <div className="w-5 h-5 flex items-center justify-center rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          <Trophy size={11} strokeWidth={2.5} />
                        </div>
                      ) : isTop2 ? (
                        <div className="w-5 h-5 flex items-center justify-center rounded bg-slate-400/10 text-slate-300 border border-slate-400/20">
                          <Trophy size={11} />
                        </div>
                      ) : (
                        <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-400 font-mono text-[9px] font-bold">
                          {idx + 1}
                        </span>
                      )}
                      <div>
                        <span className="font-sans font-bold text-slate-100 text-sm block">{p.name}</span>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono mt-0.5">
                          <span className="text-emerald-400">C:{p.crewWins}</span>
                          <span>•</span>
                          <span className="text-rose-400">I:{p.impWins}</span>
                          <span>•</span>
                          <span className="text-slate-400">V:{p.votedOutCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right points display */}
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-indigo-400">{p.score}</span>
                      <span className="font-sans text-[8px] text-slate-500 block uppercase font-medium">Points</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Categories performance review */}
        <div id="category-stats-breakdown" className="mt-5 pt-4 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-2 px-1">Theme Activity Density</span>
          <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl max-h-[110px] overflow-y-auto space-y-1.5 text-[11px] font-mono text-slate-400 pr-1">
            {Object.keys(stats.categoryStats).length === 0 ? (
              <p className="text-slate-500 text-center text-[10px] py-2">No category logs recorded yet.</p>
            ) : (
              Object.entries(stats.categoryStats)
                .sort((a,b) => b[1] - a[1]) // heaviest first
                .map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center bg-slate-900/40 px-2 py-1.5 rounded border border-slate-800/30">
                    <span className="text-slate-300 font-sans font-semibold text-[10px]">{cat}</span>
                    <span className="text-indigo-400 font-bold">{count}x Played</span>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>

      {/* Footer Return Home */}
      <div id="scoreboard-footer" className="w-full">
        <button
          id="scoreboard-home-btn"
          onClick={onBack}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-white font-sans font-bold rounded-xl border border-slate-700 transition duration-150 text-center text-sm cursor-pointer"
        >
          Menu Main Menu
        </button>
      </div>
    </div>
  );
}
