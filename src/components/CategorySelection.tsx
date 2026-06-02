/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Film, Trophy, Utensils, Compass, Cpu, Dog, Gamepad2, Sparkles, Mountain, Shuffle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { ComponentType } from 'react';
import { GameStats } from '../types';

interface CategorySelectionProps {
  stats: GameStats;
  onSelectCategory: (category: string) => void;
  onBack: () => void;
}

interface CategoryItem {
  id: string;
  name: string;
  icon: ComponentType<{ size: number; className?: string }>;
  color: string;
  borderColor: string;
  description: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'Food', name: 'Food', icon: Utensils, color: 'text-amber-400 bg-amber-500/10', borderColor: 'border-amber-500/10 hover:border-amber-500/30', description: 'Momo, Pizza, Spices...' },
  { id: 'Movies', name: 'Movies', icon: Film, color: 'text-rose-400 bg-rose-500/10', borderColor: 'border-rose-500/10 hover:border-rose-500/30', description: 'Titanic, Avatar, Shrek...' },
  { id: 'Sports', name: 'Sports', icon: Trophy, color: 'text-emerald-400 bg-emerald-500/10', borderColor: 'border-emerald-500/10 hover:border-emerald-500/30', description: 'Football, Cricket, Golf...' },
  { id: 'Places', name: 'Places', icon: Compass, color: 'text-cyan-400 bg-cyan-500/10', borderColor: 'border-cyan-500/10 hover:border-cyan-500/30', description: 'Paris, Grand Canyon, Rome...' },
  { id: 'Technology', name: 'Technology', icon: Cpu, color: 'text-indigo-400 bg-indigo-500/10', borderColor: 'border-indigo-500/10 hover:border-indigo-500/30', description: 'Internet, Bitcoin, AI...' },
  { id: 'Animals', name: 'Animals', icon: Dog, color: 'text-violet-400 bg-violet-500/10', borderColor: 'border-violet-500/10 hover:border-violet-500/30', description: 'Lion, Gorilla, Dolphin...' },
  { id: 'Games', name: 'Games', icon: Gamepad2, color: 'text-fuchsia-400 bg-fuchsia-500/10', borderColor: 'border-fuchsia-500/10 hover:border-fuchsia-500/30', description: 'Minecraft, Chess, Ludo...' },
  { id: 'Celebrities', name: 'Celebrities', icon: Sparkles, color: 'text-pink-400 bg-pink-500/10', borderColor: 'border-pink-500/10 hover:border-pink-500/30', description: 'Messi, Elon Musk, Taylor...' },
  { id: 'Nepal', name: 'Nepal', icon: Mountain, color: 'text-teal-400 bg-teal-500/10', borderColor: 'border-teal-500/10 hover:border-teal-500/30', description: 'Everest, Kathmandu, Kukri...' },
  { id: 'Random', name: 'Random', icon: Shuffle, color: 'text-white bg-slate-500/10', borderColor: 'border-slate-500/15 hover:border-slate-500/40', description: 'Mix of all categories!' },
];

export default function CategorySelection({ stats, onSelectCategory, onBack }: CategorySelectionProps) {
  return (
    <div id="category-selection-screen" className="w-full max-w-2xl mx-auto flex flex-col min-h-screen justify-between py-6 px-4">
      {/* Top Bar */}
      <div id="category-selection-navbar" className="flex items-center mb-6">
        <button
          id="category-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Lobby</span>
        </button>
        <span className="ml-[15%] font-sans font-bold text-lg text-white">Select Category</span>
      </div>

      {/* Main card */}
      <div id="category-panel-card" className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl mb-6 flex flex-col justify-between">
        
        {/* Help label */}
        <div id="category-guide" className="mb-5 text-center sm:text-left">
          <p className="text-sm font-sans text-slate-200 font-medium">Select a thematic deck</p>
          <p className="text-xs text-slate-400 mt-1">
            Word Impostor selects one secret word from these themes. Ensure players have general familiarity with your choice!
          </p>
        </div>

        {/* Grid Area */}
        <div id="categories-grid" className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-3 mb-4 overflow-y-auto max-h-[480px] p-0.5">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const playedCount = stats.categoryStats[cat.id] || 0;
            return (
              <motion.button
                id={`cat-button-${cat.id}`}
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col text-left p-4 bg-slate-950/60 rounded-xl border border-solid ${cat.borderColor} hover:bg-slate-950 transition-all duration-150 active:scale-98 group cursor-pointer h-[120px] justify-between relative overflow-hidden`}
              >
                {/* Stats bubble absolute top right */}
                {playedCount > 0 && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 font-mono text-[9px] bg-indigo-500/20 text-indigo-400 rounded-md border border-indigo-500/10">
                    {playedCount}x Played
                  </span>
                )}

                {/* Vector Icon */}
                <div className={`p-2 rounded-lg ${cat.color} w-fit group-hover:scale-105 transition-transform duration-150`}>
                  <Icon size={18} />
                </div>

                {/* Texts */}
                <div className="mt-2">
                  <h3 className="font-sans font-bold text-sm text-slate-200 group-hover:text-white transition-colors">{cat.name}</h3>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate max-w-[130px]">{cat.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic Category Stats review */}
        <div id="category-stats-panel" className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 font-mono mt-2">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">
            <span>Play count tracking</span>
            <span>Total: {stats.totalGames} games</span>
          </div>
          <p>The current session data tracks category spikes. Pick a new item to equalize statistics!</p>
        </div>
      </div>
    </div>
  );
}
