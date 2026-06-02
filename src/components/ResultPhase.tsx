/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Crown, Skull, Sparkles, Send, ShieldAlert, CheckCircle2, ChevronRight, HelpCircle, Users, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { Player, WordItem } from '../types';
import { wordDatabase } from '../data/words';

interface ResultPhaseProps {
  players: Player[];
  impostorId: string;
  currentWord: WordItem;
  votedOutId: string | null; // Null if tie
  votesRecord: Record<string, string>;
  onGameFinished: (winner: 'crewmates' | 'impostor', guessCorrect: boolean | null, votedId: string | null) => void;
  soundOn: boolean;
}

export default function ResultPhase({
  players,
  impostorId,
  currentWord,
  votedOutId,
  votesRecord,
  onGameFinished,
  soundOn,
}: ResultPhaseProps) {
  const [subStep, setSubStep] = useState<'eviction' | 'guess' | 'final-victory'>( 'eviction' );
  const [impostorGuess, setImpostorGuess] = useState('');
  const [finalWinner, setFinalWinner] = useState<'crewmates' | 'impostor' | null>(null);
  const [guessWasCorrect, setGuessWasCorrect] = useState<boolean | null>(null);

  // Math references
  const impostorPlayer = useMemo(() => players.find(p => p.id === impostorId)!, [players, impostorId]);
  const votedOutPlayer = useMemo(() => players.find(p => p.id === votedOutId), [players, votedOutId]);
  
  const isImpostorCaught = votedOutId === impostorId;

  if (votedOutId === 'direct-reveal-impostor') {
    return (
      <div id="result-phase-screen" className="w-full max-w-md mx-auto flex flex-col min-h-screen justify-between py-6 px-4">
        <div id="result-navbar" className="text-center mb-4">
          <h1 className="text-xl font-bold font-sans text-white uppercase tracking-wider">DIRECT REVEAL</h1>
          <p className="text-xs text-slate-400 mt-1">Secrets Unveiled</p>
        </div>

        <div id="result-main-card" className="flex-1 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl mb-6">
          <div className="text-center space-y-6 my-auto pt-4 pb-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 mx-auto animate-pulse">
              <ShieldAlert size={28} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">THE SECRET IMPOSTOR WAS</span>
              <h2 className="text-3xl font-black text-rose-400 tracking-tight">{impostorPlayer.name}</h2>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-left space-y-3 max-w-[320px] mx-auto font-sans">
              <div className="flex justify-between items-center border-b border-slate-900/60 pb-2">
                <span className="text-[9px] text-slate-500 font-mono uppercase">Category:</span>
                <span className="text-xs text-indigo-300 font-sans font-bold">{currentWord.category}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-900/60 pb-2">
                <span className="text-[9px] text-slate-500 font-mono uppercase">Secret Word:</span>
                <span className="text-sm text-emerald-400 font-sans font-black tracking-wide uppercase">{currentWord.secretWord}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 font-mono uppercase">Impostor's Hint:</span>
                <span className="text-xs text-slate-300 font-sans italic">"{currentWord.impostorHint}"</span>
              </div>
            </div>

            {/* Winner Assignment Selection */}
            <div className="space-y-3 pt-6">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Declare round victor & save scores:</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onGameFinished('crewmates', null, null);
                  }}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs rounded-xl transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20"
                >
                  <Crown size={14} />
                  <span>Crewmates Won</span>
                </button>
                <button
                  onClick={() => {
                    onGameFinished('impostor', null, null);
                  }}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-xs rounded-xl transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/20"
                >
                  <Skull size={14} />
                  <span>Impostor Won</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Curated guess options (correct one + several random ones from same category for a fun bento grid)
  const guessSuggestions = useMemo(() => {
    // Pick 5 other words from same category
    const sameCat = wordDatabase.filter(w => w.category === currentWord.category && w.secretWord !== currentWord.secretWord);
    const shuffled = [...sameCat].sort(() => 0.5 - Math.random());
    const slice = shuffled.slice(0, 5).map(w => w.secretWord);
    return [currentWord.secretWord, ...slice].sort(() => 0.5 - Math.random());
  }, [currentWord]);

  // Vote breakdown tally list
  const voteTally = useMemo(() => {
    const tally: Record<string, number> = {};
    Object.values(votesRecord).forEach(id => {
      tally[id] = (tally[id] || 0) + 1;
    });
    return tally;
  }, [votesRecord]);

  const playSynthesizerVictory = (isCrewWinners: boolean) => {
    if (!soundOn) return;
    try {
      const audio = new AudioContext();
      const playFreq = (f: number, delay: number, dur: number) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.frequency.setValueAtTime(f, audio.currentTime + delay);
        gain.gain.setValueAtTime(0.04, audio.currentTime + delay);
        osc.start(audio.currentTime + delay);
        osc.stop(audio.currentTime + delay + dur);
      };

      if (isCrewWinners) {
        // High bright arpeggio
        playFreq(523.25, 0, 0.15); // C5
        playFreq(659.25, 0.15, 0.15); // E5
        playFreq(783.99, 0.3, 0.45); // G5
      } else {
        // Dramatic low fall
        playFreq(349.23, 0, 0.2); // F4
        playFreq(293.66, 0.2, 0.2); // D4
        playFreq(220.00, 0.4, 0.6); // A3
      }
    } catch (e) {}
  };

  const handleRevealIdentity = () => {
    if (isImpostorCaught) {
      // Impostor caught! Let's go to guess substep
      setSubStep('guess');
    } else {
      // Impostor survived! Impostor wins immediately
      setFinalWinner('impostor');
      setGuessWasCorrect(null);
      setSubStep('final-victory');
      playSynthesizerVictory(false);
    }
  };

  const submitImpostorGuess = (guessWord: string) => {
    const trimmedGuess = guessWord.trim().toLowerCase();
    const isCorrect = trimmedGuess === currentWord.secretWord.toLowerCase();
    
    setGuessWasCorrect(isCorrect);
    const winner = isCorrect ? 'impostor' : 'crewmates';
    setFinalWinner(winner);
    setSubStep('final-victory');
    playSynthesizerVictory(winner === 'crewmates');
  };

  const handleFinishAndSave = () => {
    if (finalWinner) {
      onGameFinished(finalWinner, guessWasCorrect, votedOutId);
    }
  };

  return (
    <div id="result-phase-screen" className="w-full max-w-md mx-auto flex flex-col min-h-screen justify-between py-6 px-4">
      {/* Upper header title depending on sub-step */}
      <div id="result-navbar" className="text-center mb-4">
        <h1 className="text-xl font-bold font-sans text-white uppercase tracking-wider">TRIBUNAL VERDICT</h1>
        <p className="text-xs text-slate-400 mt-1">
          {subStep === 'eviction' && "The votes are in..."}
          {subStep === 'guess' && "Final standoff!"}
          {subStep === 'final-victory' && "Game Over"}
        </p>
      </div>

      {/* Main card box */}
      <div id="result-main-card" className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl mb-6 flex flex-col justify-between overflow-hidden">
        
        <AnimatePresence mode="wait">
          
          {/* SUB-STEP 1: EVICTION REVEAL */}
          {subStep === 'eviction' && (
            <motion.div
              id="eviction-substep-view"
              key="eviction"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div id="eviction-alert-box" className="text-center space-y-6 my-auto py-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 mx-auto animate-pulse">
                  <Skull size={28} />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">HIGHEST VOTED PLAYER</span>
                  {votedOutPlayer ? (
                    <h2 className="text-3xl font-black text-rose-400 tracking-tight">{votedOutPlayer.name}</h2>
                  ) : (
                    <h2 className="text-3xl font-black text-amber-400 tracking-tight">TIE GAME</h2>
                  )}
                  {votedOutPlayer && (
                    <div className="flex justify-center items-center gap-1 text-slate-400 text-xs font-mono">
                      <span>Received:</span>
                      <strong className="text-white bg-slate-800 px-2 py-0.5 rounded text-[11px]">{voteTally[votedOutId!] || 0} votes</strong>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 max-w-[280px] mx-auto text-xs leading-relaxed text-slate-400 font-sans">
                  {votedOutPlayer ? (
                    <>
                      The local group selected <strong className="text-slate-200">{votedOutPlayer.name}</strong> to be ejected. Let's reveal their secret role!
                    </>
                  ) : (
                    <>
                      The votes were perfectly split! No single player achieved majority. Under standard rules, <strong>the Impostor remains hidden and unharmed!</strong>
                    </>
                  )}
                </div>
              </div>

              <button
                id="eviction-reveal-btn"
                onClick={handleRevealIdentity}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-505 hover:to-indigo-610 text-white font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg shadow-indigo-950/20"
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* SUB-STEP 2: IMPOSTOR FINAL GUESS */}
          {subStep === 'guess' && (
            <motion.div
              id="guess-substep-view"
              key="guess"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div id="guess-prompt-headline" className="space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mx-auto">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <span className="text-amber-500 font-mono text-[9px] font-bold tracking-[0.2em] uppercase block">IMPOSTOR CAUGHT!</span>
                  <h2 className="text-2xl font-black text-white tracking-tight">{impostorPlayer.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    You were voted out! But you can steal the game. <strong>Guess the Secret Word</strong> from this category: <strong className="text-indigo-400">{currentWord.category}</strong>!
                  </p>
                </div>
              </div>

              {/* Suggestions Grid */}
              <div id="guess-suggestion-section" className="my-5">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-2 text-center">Curated Guess Options</span>
                <div className="grid grid-cols-2 gap-2">
                  {guessSuggestions.map((word) => (
                    <button
                      id={`suggestion-word-${word}`}
                      key={word}
                      onClick={() => setImpostorGuess(word)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition cursor-pointer ${
                        impostorGuess.toLowerCase() === word.toLowerCase()
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Typing inputs fallback */}
              <div id="guess-typing-row" className="flex gap-2">
                <input
                  id="target-guess-typed"
                  type="text"
                  placeholder="Or type custom guess..."
                  value={impostorGuess}
                  onChange={(e) => setImpostorGuess(e.target.value)}
                  className="flex-1 py-3 px-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  id="target-guess-submit"
                  onClick={() => submitImpostorGuess(impostorGuess)}
                  disabled={!impostorGuess.trim()}
                  className="px-4 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-955 font-bold rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* SUB-STEP 3: FINAL VICTORY DISPLAY */}
          {subStep === 'final-victory' && finalWinner && (
            <motion.div
              id="victory-substep-view"
              key="victory"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div id="victory-core-summary" className="text-center space-y-5 my-auto overflow-y-auto max-h-[380px] p-1">
                
                {/* Crown glow representation */}
                <div className="relative inline-block">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                    finalWinner === 'crewmates' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    <Crown size={32} className="animate-bounce" />
                  </div>
                  <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
                </div>

                <div>
                  <span className="text-slate-500 font-mono text-[9px] uppercase tracking-[0.22em] block">GAME VICTORS</span>
                  <h2 className={`text-4xl font-black tracking-tight mt-0.5 ${
                    finalWinner === 'crewmates' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {finalWinner === 'crewmates' ? 'CREWMATES WIN!' : 'IMPOSTOR WINS!'}
                  </h2>
                </div>

                {/* Secret Stats card reveal */}
                <div className="bg-slate-955 p-4 rounded-xl border border-slate-800/80 space-y-3.5 text-xs text-left">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-500 font-mono uppercase text-[10px]">Real Impostor:</span>
                    <span className="text-white font-sans font-bold">{impostorPlayer.name}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-500 font-mono uppercase text-[10px]">Secret Word:</span>
                    <span className="text-indigo-400 font-sans font-black text-sm tracking-wide">{currentWord.secretWord}</span>
                  </div>

                  {guessWasCorrect !== null && (
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-slate-500 font-mono uppercase text-[10px]">Impostor Guess:</span>
                      <span className={`font-sans font-semibold inline-flex items-center gap-1.5 ${
                        guessWasCorrect ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        <span>"{impostorGuess}"</span>
                        <span>({guessWasCorrect ? 'Correct' : 'Incorrect'})</span>
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-mono uppercase text-[10px]">Ejected Player:</span>
                    <span className="text-white font-sans">
                      {votedOutPlayer ? (
                        <span className="font-semibold text-rose-400">{votedOutPlayer.name}</span>
                      ) : (
                        <span className="text-amber-400 font-medium">None (Tie)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Vote Registry details display */}
                <div id="vote-detailed-tally-list" className="bg-slate-950/30 p-3 rounded-lg border border-slate-800/80 text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-2 flex items-center gap-1.5">
                    <Users size={12} className="text-indigo-400" />
                    <span>VOTES CAST SUMMARY</span>
                  </span>
                  
                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                    {players.map(voter => {
                      const votedId = votesRecord[voter.id];
                      const votedName = players.find(p => p.id === votedId)?.name || 'Nobody';
                      return (
                        <div key={voter.id} className="flex justify-between text-[11px] font-mono border-b border-slate-800/40 pb-1 last:border-b-0 last:pb-0">
                          <span className="text-slate-400">{voter.name}</span>
                          <span className="text-slate-500">voted for</span>
                          <span className="text-slate-300 font-semibold">{votedName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <button
                id="result-finish-btn"
                onClick={handleFinishAndSave}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-505 hover:to-indigo-610 text-white font-sans font-bold text-sm rounded-xl shadow-lg transition duration-150 active:scale-98 flex items-center justify-center cursor-pointer"
              >
                <span>Return To Lobby</span>
              </button>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
