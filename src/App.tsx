/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, HelpCircle, Settings, Target, BarChart3, History, Play, UserCircle, RotateCcw } from 'lucide-react';

// Type declarations
import { Player, GameSettings, GameStats, GameHistory, GameStep, WordItem } from './types';

// State services
import { GameService } from './lib/gameService';
import { wordDatabase } from './data/words';

// Screen components
import RulesModal from './components/RulesModal';
import SettingsModal from './components/SettingsModal';
import PlayerSetup from './components/PlayerSetup';
import CategorySelection from './components/CategorySelection';
import PassDeviceReveal from './components/PassDeviceReveal';
import DiscussionTimer from './components/DiscussionTimer';
import VotingPhase from './components/VotingPhase';
import ResultPhase from './components/ResultPhase';
import ScoreboardView from './components/ScoreboardView';
import GameHistoryView from './components/GameHistoryView';

export default function App() {
  // Master states loaded from Local Storage
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<GameSettings>({ darkMode: true, soundOn: true, discussionDuration: 60 });
  const [stats, setStats] = useState<GameStats>({ totalGames: 0, crewmateWins: 0, impostorWins: 0, categoryStats: {} });
  const [history, setHistory] = useState<GameHistory[]>([]);

  // Orchestrator State Tracker
  const [step, setStep] = useState<GameStep>('home');

  // Modal states
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Active game iteration variables
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [impostorId, setImpostorId] = useState<string | null>(null);
  const [gamePlayers, setGamePlayers] = useState<Player[]>([]); // Shuffled player list
  
  const [votedOutId, setVotedOutId] = useState<string | null>(null);
  const [votesRecord, setVotesRecord] = useState<Record<string, string>>({});

  // Bootstrap data on mount
  useEffect(() => {
    setPlayers(GameService.getPlayers());
    setSettings(GameService.getSettings());
    setStats(GameService.getStats());
    setHistory(GameService.getHistory());
  }, []);

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    GameService.saveSettings(newSettings);
  };

  const handleResetStats = () => {
    GameService.resetStats();
    setPlayers(GameService.getPlayers());
    setStats(GameService.getStats());
    setHistory([]);
  };

  const handleClearHistory = () => {
    GameService.saveHistory([]);
    setHistory([]);
  };

  const handleStartGameInit = () => {
    setStep('player-setup');
  };

  const handlePlayersSaved = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    GameService.savePlayers(updatedPlayers);
    setStep('category-select');
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    
    // Choose appropriate words deck
    let pool = wordDatabase;
    if (category !== 'Random') {
      pool = wordDatabase.filter(w => w.category.toLowerCase() === category.toLowerCase());
    }
    
    if (pool.length === 0) {
      pool = wordDatabase; // safe backup
    }

    // Pick random secret word
    const randomWordIdx = Math.floor(Math.random() * pool.length);
    const chosenWord = pool[randomWordIdx];
    setCurrentWord(chosenWord);

    // Pick random impostor
    const basePlayers = GameService.getPlayers().filter(p => players.some(active => active.id === p.id));
    const randomPlayerIdx = Math.floor(Math.random() * basePlayers.length);
    const chosenImpostor = basePlayers[randomPlayerIdx];
    setImpostorId(chosenImpostor.id);

    // Requirement: "Random player order every game"
    // Shuffle the active players sequence for device reveal & description round!
    const shuffled = [...basePlayers].sort(() => 0.5 - Math.random());
    setGamePlayers(shuffled);

    setVotedOutId(null);
    setVotesRecord({});
    setStep('reveal');
  };

  const handleRevealAllFinished = () => {
    setStep('discussion');
  };

  const handleFinishedDiscussion = () => {
    setStep('voting');
  };

  const handleVotingTallyCompleted = (evictedId: string | null, votes: Record<string, string>) => {
    setVotedOutId(evictedId);
    setVotesRecord(votes);
    setStep('result');
  };

  const handleGameFinishedAndSave = (
    winner: 'crewmates' | 'impostor',
    guessCorrect: boolean | null,
    votedId: string | null
  ) => {
    if (!currentWord || !impostorId) return;

    // Get authentic player profiles matching game
    const impostorPlayer = players.find(p => p.id === impostorId)!;
    const crewmatePlayers = players.filter(p => p.id !== impostorId);

    // Commit statistics and scores atomically
    GameService.completeGame(
      winner,
      impostorPlayer,
      crewmatePlayers,
      selectedCategory,
      currentWord.secretWord,
      votedId,
      guessCorrect
    );

    // Reload sync
    setPlayers(GameService.getPlayers());
    setStats(GameService.getStats());
    setHistory(GameService.getHistory());

    setStep('home');
  };

  return (
    <div id="applet-viewport" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center font-sans">
      
      {/* Background radial atmosphere */}
      <div id="ambient-radial-glow" className="fixed inset-0 bg-radial-gradient from-indigo-950/20 via-slate-950 to-slate-950 z-0 pointer-events-none" />

      {/* Main Orchestrator Screen Loader */}
      <main id="app-canvas-container" className="relative w-full z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* 1. HOME SCREEN */}
          {step === 'home' && (
            <motion.div
              id="home-screen"
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm mx-auto flex flex-col min-h-screen justify-between py-8 px-4"
            >
              {/* Top Banner logo */}
              <div id="home-logo-section" className="flex flex-col items-center justify-center pt-8 text-center space-y-4">
                
                {/* Visual animated badge */}
                <motion.div
                  id="shield-logo"
                  initial={{ rotate: -15, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                  className="w-20 h-20 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-950/20 relative"
                >
                  <Target size={40} className="text-indigo-400" />
                  <ShieldAlert size={20} className="text-red-500 absolute -bottom-1 -right-1" />
                </motion.div>

                <div>
                  <h1 className="text-3xl font-black font-sans leading-none text-white tracking-widest block uppercase">WORD IMPOSTOR</h1>
                  <span className="text-[10px] text-slate-500 font-mono tracking-[0.25em] uppercase block mt-1">Local Party Deduction Game</span>
                </div>
              </div>

              {/* Main Landing Menu Stack */}
              <div id="home-menu-items" className="space-y-3.5 my-8">
                
                <button
                  id="btn-play-game"
                  onClick={handleStartGameInit}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-505 hover:to-indigo-610 text-white font-sans font-bold rounded-xl shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 transition duration-200 active:scale-98 cursor-pointer"
                >
                  <Play size={18} fill="currentColor" />
                  <span>Start New Campaign</span>
                </button>

                {/* Quick replay shortcut if players available */}
                {players.length >= 3 && (
                  <button
                    id="btn-quick-replay"
                    onClick={() => setStep('category-select')}
                    className="w-full py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 font-sans font-bold rounded-xl flex items-center justify-center gap-2 transition duration-200 active:scale-98 cursor-pointer"
                  >
                    <RotateCcw size={16} className="text-indigo-400" />
                    <span>Quick Replay Lobby</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-open-scoreboard"
                    onClick={() => setStep('scoreboard')}
                    className="py-3 px-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 rounded-xl font-sans font-semibold text-xs text-slate-350 hover:text-white transition duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BarChart3 size={15} className="text-indigo-400" />
                    <span>Scoreboard</span>
                  </button>

                  <button
                    id="btn-open-history"
                    onClick={() => setStep('history')}
                    className="py-3 px-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 rounded-xl font-sans font-semibold text-xs text-slate-350 hover:text-white transition duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <History size={15} className="text-indigo-400" />
                    <span>Game Archives</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-open-rules"
                    onClick={() => setIsRulesOpen(true)}
                    className="py-3 px-4 bg-slate-950/40 hover:bg-slate-950/60 border border-slate-850 rounded-xl font-mono text-[10px] text-slate-400 hover:text-white transition duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle size={14} className="text-slate-500" />
                    <span>HOW TO PLAY</span>
                  </button>

                  <button
                    id="btn-open-settings"
                    onClick={() => setIsSettingsOpen(true)}
                    className="py-3 px-4 bg-slate-950/40 hover:bg-slate-950/60 border border-slate-850 rounded-xl font-mono text-[10px] text-slate-400 hover:text-white transition duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Settings size={14} className="text-slate-500" />
                    <span>SETTINGS</span>
                  </button>
                </div>

              </div>

              {/* Responsive Footer credits */}
              <div id="home-attribution-footer" className="text-center py-4 border-t border-slate-900">
                <span className="text-[9px] text-slate-500 font-mono tracking-widest block uppercase">CRAFTED FOR</span>
                <a 
                  id="domain-anchor"
                  href="https://prazwalbhusal.com.np" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-slate-400 hover:text-indigo-400 transition-colors font-medium mt-1 inline-block"
                >
                  prazwalbhusal.com.np
                </a>
              </div>
            </motion.div>
          )}

          {/* 2. PLAYER SETUP */}
          {step === 'player-setup' && (
            <motion.div
              id="player-setup-frame"
              key="setup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              <PlayerSetup
                initialPlayers={players}
                onSaveAndContinue={handlePlayersSaved}
                onBack={() => setStep('home')}
              />
            </motion.div>
          )}

          {/* 3. CATEGORY SELECTION */}
          {step === 'category-select' && (
            <motion.div
              id="category-frame"
              key="category"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <CategorySelection
                stats={stats}
                onSelectCategory={handleSelectCategory}
                onBack={() => setStep('player-setup')}
              />
            </motion.div>
          )}

          {/* 4. PASS REVEAL */}
          {step === 'reveal' && currentWord && impostorId && (
            <motion.div
              id="reveal-frame"
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <PassDeviceReveal
                players={gamePlayers}
                currentWord={currentWord}
                impostorId={impostorId}
                soundOn={settings.soundOn}
                onRevealFinished={handleRevealAllFinished}
              />
            </motion.div>
          )}

          {/* 5. DISCUSSION PHASE */}
          {step === 'discussion' && (
            <motion.div
              id="discussion-frame"
              key="discussion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <DiscussionTimer
                players={gamePlayers}
                duration={settings.discussionDuration}
                soundOn={settings.soundOn}
                onContinueToVoting={handleFinishedDiscussion}
              />
            </motion.div>
          )}

          {/* 6. VOTING PHASE */}
          {step === 'voting' && (
            <motion.div
              id="voting-frame"
              key="voting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <VotingPhase
                players={gamePlayers}
                soundOn={settings.soundOn}
                onVotingFinished={handleVotingTallyCompleted}
              />
            </motion.div>
          )}

          {/* 7. RESULT PHASE */}
          {step === 'result' && currentWord && impostorId && (
            <motion.div
              id="result-frame"
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <ResultPhase
                players={gamePlayers}
                impostorId={impostorId}
                currentWord={currentWord}
                votedOutId={votedOutId}
                votesRecord={votesRecord}
                soundOn={settings.soundOn}
                onGameFinished={handleGameFinishedAndSave}
              />
            </motion.div>
          )}

          {/* 8. SCOREBOARD VIEW */}
          {step === 'scoreboard' && (
            <motion.div
              id="scoreboard-frame"
              key="scoreboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <ScoreboardView
                players={players}
                stats={stats}
                onBack={() => setStep('home')}
                onReset={handleResetStats}
              />
            </motion.div>
          )}

          {/* 9. GAME ARCHIVES / HISTORY */}
          {step === 'history' && (
            <motion.div
              id="history-frame"
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <GameHistoryView
                history={history}
                onBack={() => setStep('home')}
                onClearHistory={handleClearHistory}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Persistent overlay modals */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetStats={handleResetStats}
      />

    </div>
  );
}
