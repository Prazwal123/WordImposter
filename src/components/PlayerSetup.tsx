/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, Trash2, ArrowRight, UserPlus, Users, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useRef, useEffect } from 'react';
import { Player } from '../types';

interface PlayerSetupProps {
  initialPlayers: Player[];
  onSaveAndContinue: (players: Player[]) => void;
  onBack: () => void;
}

export default function PlayerSetup({ initialPlayers, onSaveAndContinue, onBack }: PlayerSetupProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  
  const listEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to end of list when a player is added
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [players.length]);

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    
    if (players.length >= 15) {
      setErrorText("Maximum limit of 15 players reached!");
      return;
    }

    // Check duplicate
    if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorText("That name already exists in the lobby!");
      return;
    }

    setErrorText(null);

    const newPlayer: Player = {
      id: Math.random().toString(36).substring(2, 9),
      name: trimmed,
      score: 0,
      totalGames: 0,
      crewWins: 0,
      impWins: 0,
      votedOutCount: 0
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    setErrorText(null);
  };

  const handleContinue = () => {
    if (players.length < 3) {
      setErrorText("Minimum 3 players are required to start the game.");
      return;
    }
    if (players.length > 15) {
      setErrorText("Maximum 15 players allowed!");
      return;
    }
    onSaveAndContinue(players);
  };

  return (
    <div id="player-setup-screen" className="w-full max-w-md mx-auto flex flex-col min-h-screen justify-between py-6 px-4">
      
      {/* Top Bar with Back */}
      <div id="player-setup-navbar" className="flex items-center justify-between mb-4">
        <button
          id="player-setup-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Menu</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-full border border-slate-800/60">
          <Users size={14} className="text-indigo-400" />
          <span>Lobby: <strong className="text-white">{players.length}/15</strong></span>
        </div>
      </div>

      {/* Main Form container */}
      <div id="player-setup-card" className="flex-1 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl mb-6 overflow-hidden">
        
        {/* Title */}
        <div id="player-setup-intro" className="mb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <UserPlus size={20} />
            </div>
            <h1 className="text-xl font-bold text-white font-sans tracking-tight">Setup Players</h1>
          </div>
          <p className="text-xs text-slate-400">Add names of all friends playing standard phone mode</p>
        </div>

        {/* Input Field */}
        <form id="add-player-form" onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
          <input
            id="new-player-input"
            type="text"
            placeholder="Enter player name..."
            value={newPlayerName}
            maxLength={16}
            onChange={(e) => {
              setNewPlayerName(e.target.value);
              if (errorText) setErrorText(null);
            }}
            className="flex-1 py-3 px-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          />
          <button
            id="add-player-btn"
            type="submit"
            disabled={!newPlayerName.trim()}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            <Plus size={18} />
          </button>
        </form>

        {/* Error notification if any */}
        <AnimatePresence>
          {errorText && (
            <motion.div
              id="player-setup-error-banner"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/15 text-red-400 text-xs rounded-lg text-center font-sans overflow-hidden"
            >
              {errorText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Players List */}
        <div id="players-scrollable-area" className="flex-1 bg-slate-950/40 rounded-xl border border-slate-800/80 p-3 overflow-y-auto max-h-[300px] mb-4">
          {players.length === 0 ? (
            <div id="no-players-hint" className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
              <Users size={32} className="mb-2 text-slate-600 opacity-60" />
              <p>No players added yet</p>
              <p className="mt-0.5">Type names above to join the battle</p>
            </div>
          ) : (
            <div id="players-list-container" className="space-y-2">
              <AnimatePresence initial={false}>
                {players.map((player, index) => (
                  <motion.div
                    id={`player-row-${player.id}`}
                    key={player.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                    className="flex justify-between items-center py-2.5 px-3 bg-slate-900 border border-slate-800/50 hover:border-slate-700 rounded-xl group transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] font-semibold">
                        {index + 1}
                      </span>
                      <span className="font-sans text-sm font-medium text-slate-200">{player.name}</span>
                    </div>

                    <button
                      id={`remove-player-btn-${player.id}`}
                      onClick={() => handleRemovePlayer(player.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove Player"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={listEndRef} />
            </div>
          )}
        </div>

        {/* Requirements indicator */}
        <div id="lobby-status-indicator" className="text-center py-2 px-3 bg-slate-950/80 rounded-xl mb-2 text-xs border border-slate-800">
          {players.length < 3 ? (
            <span className="text-amber-400 font-sans">
              ⚠️ Needs <strong>{3 - players.length}</strong> more player{3 - players.length > 1 ? 's' : ''} to unlock game
            </span>
          ) : (
            <span className="text-emerald-400 font-sans font-medium flex items-center justify-center gap-1.5">
              <span>✓ Lobby ready ({players.length} players)</span>
            </span>
          )}
        </div>
      </div>

      {/* Persistent Proceed Footer */}
      <div id="player-setup-footer" className="w-full">
        <button
          id="player-setup-continue-btn"
          onClick={handleContinue}
          disabled={players.length < 3 || players.length > 15}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-sans font-bold rounded-xl shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 transition duration-150 active:scale-98 cursor-pointer"
        >
          <span>Pick Category</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
