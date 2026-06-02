/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSquare2, ShieldAlert, Vote, Check, Eye, Layers, Zap, EyeOff, Users, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Player } from '../types';

interface VotingPhaseProps {
  players: Player[];
  onVotingFinished: (votedOutId: string | null, votesRecord: Record<string, string>) => void;
  soundOn: boolean;
}

export default function VotingPhase({
  players,
  onVotingFinished,
  soundOn,
}: VotingPhaseProps) {
  const [votingMode, setVotingMode] = useState<'selection' | 'secret' | 'direct'>('selection');
  
  // State for secret ballot mode
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [ballotActive, setBallotActive] = useState(false);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({}); // voterId -> suspectId

  // State for direct group eviction mode
  const [directEjectId, setDirectEjectId] = useState<string | null>(null);

  const activeVoter = players[currentVoterIdx];

  // Candidates list for secret ballot: Everyone except the current voter
  const candidatesForActiveVoter = players.filter(p => p.id !== activeVoter?.id);

  const handleToggleBallot = () => {
    setBallotActive(!ballotActive);
    setSelectedSuspectId(null);
  };

  const playChime = (freq: number, dur: number) => {
    if (!soundOn) return;
    try {
      const audio = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.frequency.setValueAtTime(freq, audio.currentTime);
      gain.gain.setValueAtTime(0.04, audio.currentTime);
      osc.start();
      osc.stop(audio.currentTime + dur);
    } catch (e) {}
  };

  const handleSubmitSecretVote = () => {
    if (!selectedSuspectId) return;

    // Log vote
    const nextVotes = {
      ...votes,
      [activeVoter.id]: selectedSuspectId,
    };
    setVotes(nextVotes);

    playChime(400, 0.15);

    // Advance index
    if (currentVoterIdx < players.length - 1) {
      setCurrentVoterIdx(currentVoterIdx + 1);
      setBallotActive(false);
      setSelectedSuspectId(null);
    } else {
      // All votes cast! Calculate results
      calculateLeaderAndFinish(nextVotes);
    }
  };

  const calculateLeaderAndFinish = (finalVotes: Record<string, string>) => {
    const counts: Record<string, number> = {};
    
    // Tally counts
    Object.values(finalVotes).forEach(suspectId => {
      counts[suspectId] = (counts[suspectId] || 0) + 1;
    });

    // Find highest vote count
    let maxVotes = 0;
    let leaders: string[] = [];

    Object.entries(counts).forEach(([suspectId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        leaders = [suspectId];
      } else if (count === maxVotes) {
        leaders.push(suspectId);
      }
    });

    // If there is a tie or no votes, the impostor is safe!
    const uniqueVotedOutId = leaders.length === 1 ? leaders[0] : null;
    onVotingFinished(uniqueVotedOutId, finalVotes);
  };

  const handleDirectEvict = () => {
    if (!directEjectId) return;
    playChime(420, 0.25);
    // Instant evict: no votes logs, just the direct target selected by index
    onVotingFinished(directEjectId, {});
  };

  const handleDirectRevealAll = () => {
    playChime(580, 0.3);
    // Special marker for ResultsScreen to directly show who the Impostor is
    onVotingFinished('direct-reveal-impostor', {});
  };

  return (
    <div id="voting-phase-screen" className="w-full max-w-md mx-auto flex flex-col min-h-screen justify-between py-6 px-4">
      
      {/* 1. SELECTION SCREEN */}
      {votingMode === 'selection' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-sans font-black text-white tracking-wider flex items-center gap-2 justify-center">
              <Vote className="text-indigo-400" />
              <span>THE TRIBUNAL</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Select how you want to conduct the verdict this round</p>
          </div>

          <div className="space-y-4 my-auto">
            {/* Secret Ballot Card */}
            <button
              id="select-secret-btn"
              onClick={() => {
                setVotingMode('secret');
                playChime(520, 0.15);
              }}
              className="w-full p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-2xl text-left transition duration-200 cursor-pointer group flex gap-3.5"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Eye size={22} className="group-hover:scale-115 transition-transform" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-sans font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">🗳️ Secret Pass-and-Play Ballot</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Pass the device secretly around for everyone to private vote. Extreme suspense!</p>
              </div>
            </button>

            {/* Direct Eviction Card */}
            <button
              id="select-direct-btn"
              onClick={() => {
                setVotingMode('direct');
                playChime(520, 0.15);
              }}
              className="w-full p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-2xl text-left transition duration-200 cursor-pointer group flex gap-3.5"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Zap size={22} className="group-hover:scale-115 transition-transform" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-sans font-bold text-sm text-white group-hover:text-amber-300 transition-colors">⚡ Direct Group Eviction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Discuss out loud as a group, agree on a suspect, and elect them directly in one-tap.</p>
              </div>
            </button>

            {/* Direct Reveal Card */}
            <button
              id="select-reveal-btn"
              onClick={handleDirectRevealAll}
              className="w-full p-4 bg-slate-900/40 hover:bg-slate-900 hover:border-rose-500/40 border border-slate-800/80 rounded-2xl text-left transition duration-200 cursor-pointer group flex gap-3.5"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <EyeOff size={22} className="group-hover:scale-115 transition-transform" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-sans font-bold text-sm text-white group-hover:text-rose-300 transition-colors">🔍 No Voting, Direct Reveal Impostor</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Bypass voting completely. Instantly reveal who the Impostor was and what the Secret Word was.</p>
              </div>
            </button>
          </div>

          <p className="text-[10px] text-slate-500 font-mono text-center mt-6">
            Tip: Direct Reveal is ideal for quick local resolutions
          </p>
        </div>
      )}

      {/* 2. SECRET BALLOT INTERFACE */}
      {votingMode === 'secret' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Upper Progress Tracker */}
          <div id="voting-navbar" className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-mono text-slate-400 mb-4">
            <button
              onClick={() => setVotingMode('selection')}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={12} />
              <span>Menu</span>
            </button>
            <span className="flex items-center gap-1 font-bold uppercase tracking-wide text-indigo-400">
              <Eye size={12} />
              <span>SECRET BALLOT</span>
            </span>
            <span>
              <strong className="text-white">{currentVoterIdx + 1}</strong> / {players.length}
            </span>
          </div>

          <div id="voting-panel-card" className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col justify-between mb-4">
            <AnimatePresence mode="wait">
              {!ballotActive ? (
                /* PASSPORT CHECKPOINT */
                <motion.div
                  id="voter-reveal-prompt"
                  key="prompt"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-1 flex flex-col justify-center items-center text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                    <UserSquare2 size={28} className="animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-mono tracking-wider uppercase">Active Ballot Voter</span>
                    <h2 className="text-2xl font-black text-white tracking-tight">{activeVoter.name}</h2>
                  </div>

                  <p className="text-xs text-slate-400 max-w-[210px] leading-relaxed">
                    Pass the device to <strong className="text-slate-200">{activeVoter.name}</strong>. Keep other players outside of viewing distance!
                  </p>

                  <button
                    id="enter-ballot-btn"
                    onClick={handleToggleBallot}
                    className="w-full max-w-[240px] py-3 bg-indigo-600 hover:bg-indigo-505 text-white font-sans font-bold text-sm rounded-xl transition duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-950"
                  >
                    <Eye size={16} />
                    <span>Enter Secret Ballot</span>
                  </button>
                </motion.div>
              ) : (
                /* BALLOT ROOM */
                <motion.div
                  id="voter-ballot-room"
                  key="ballot"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-1 flex flex-col justify-between"
                >
                  <div id="ballot-header" className="mb-4 text-center">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block tracking-wider">SECRET BALLOT</span>
                    <h3 className="font-sans font-extrabold text-white text-base">Who is the Impostor?</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Voted by: <strong className="text-indigo-400">{activeVoter.name}</strong></p>
                  </div>

                  <div id="candidates-scroll-box" className="flex-1 bg-slate-950/40 rounded-xl border border-slate-800/80 p-3 overflow-y-auto max-h-[260px] mb-4 space-y-2">
                    {candidatesForActiveVoter.map((cand) => {
                      const isSelected = selectedSuspectId === cand.id;
                      return (
                        <button
                          id={`suspect-option-${cand.id}`}
                          key={cand.id}
                          onClick={() => setSelectedSuspectId(cand.id)}
                          className={`w-full flex justify-between items-center p-2.5 rounded-xl border transition duration-150 text-left cursor-pointer ${
                            isSelected 
                              ? 'bg-rose-500/10 text-white border-rose-500/40 font-bold shadow-md' 
                              : 'bg-slate-900 text-slate-300 border-slate-800/60 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-sm font-medium">{cand.name}</span>
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center border border-rose-450 border-rose-400">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-950" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    id="submit-vote-btn"
                    onClick={handleSubmitSecretVote}
                    disabled={!selectedSuspectId}
                    className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-450 hover:to-rose-505 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-sans font-bold text-sm rounded-xl shadow-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Confirm Secret Vote</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 3. DIRECT GROUP EVICTION INTERFACE */}
      {votingMode === 'direct' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Upper Navigation */}
          <div id="voting-navbar" className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-mono text-slate-400 mb-4">
            <button
              onClick={() => setVotingMode('selection')}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={12} />
              <span>Back</span>
            </button>
            <span className="flex items-center gap-1 font-bold uppercase tracking-wide text-amber-500 animate-pulse">
              <Zap size={12} />
              <span>DIRECT GROUP EVICTION</span>
            </span>
            <span className="text-white text-[10px]">FAST PLAY</span>
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col justify-between mb-4">
            <div className="mb-4 text-center">
              <span className="text-[10px] text-amber-500 font-mono uppercase block tracking-wider font-bold">GROUP CONSENSUS MODE</span>
              <h3 className="font-sans font-extrabold text-white text-base">Select the accused suspect to eject</h3>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                Discuss out loud. When the group makes their majority decision, click that player to initiate eviction.
              </p>
            </div>

            <div className="flex-1 bg-slate-950/40 rounded-xl border border-slate-800/80 p-3 overflow-y-auto max-h-[300px] mb-4 space-y-2">
              {players.map((p) => {
                const isSelected = directEjectId === p.id;
                return (
                  <button
                    id={`direct-option-${p.id}`}
                    key={p.id}
                    onClick={() => setDirectEjectId(p.id)}
                    className={`w-full flex justify-between items-center p-3 rounded-xl border transition duration-150 text-left cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-500/10 text-white border-amber-500/40 font-bold shadow-md shadow-amber-950/20' 
                        : 'bg-slate-900 text-slate-300 border-slate-800/60 hover:border-slate-705'
                    }`}
                  >
                    <span className="text-sm font-semibold">{p.name}</span>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center border border-amber-400">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-950" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              id="confirm-direct-evict-btn"
              onClick={handleDirectEvict}
              disabled={!directEjectId}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-505 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-955 font-sans font-black text-sm rounded-xl shadow-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Evict Impostor Suspect</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

