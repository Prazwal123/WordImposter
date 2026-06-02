/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Play, Pause, RotateCcw, Vote, Volume2, VolumeX, CheckCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Player } from '../types';

interface DiscussionTimerProps {
  players: Player[];
  duration: number; // in seconds
  soundOn: boolean;
  onContinueToVoting: () => void;
}

export default function DiscussionTimer({
  players,
  duration,
  soundOn,
  onContinueToVoting,
}: DiscussionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  const [hasSpoken, setHasSpoken] = useState<Record<string, boolean>>({});
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play audio chimes
  const playPulseSound = (frequency: number, length: number) => {
    if (!soundOn) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      
      osc.start();
      osc.stop(ctx.currentTime + length);
    } catch (e) {
      console.warn("Audio Context blocked or failed to load", e);
    }
  };

  // Timer loop
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        const nextTime = timeLeft - 1;
        setTimeLeft(nextTime);
        
        // Final 3 seconds warning beeps
        if (nextTime <= 3 && nextTime > 0) {
          playPulseSound(880, 0.12);
        }
        // End buzzer
        if (nextTime === 0) {
          playPulseSound(440, 0.8);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isRunning]);

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setTimeLeft(duration);
    setIsRunning(false);
  };

  const handleToggleSpoken = (playerId: string) => {
    setHasSpoken(prev => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate stats
  const speakerCount = Object.values(hasSpoken).filter(Boolean).length;
  const progressPercent = (timeLeft / duration) * 100;

  return (
    <div id="discussion-timer-screen" className="w-full max-w-md mx-auto flex flex-col min-h-screen justify-between py-6 px-4">
      {/* Upper Tracker progress */}
      <div id="discussion-header" className="text-center mb-4">
        <h1 className="text-xl font-bold font-sans text-white">Discussion Phase</h1>
        <p className="text-xs text-slate-400 mt-1">Take turns describing your word/hint. Tap players who've spoken!</p>
      </div>

      {/* Main Panel card */}
      <div id="discussion-main-card" className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl mb-6 flex flex-col justify-between">
        
        {/* Animated Timer Clock Display */}
        <div id="countdown-wrapper" className="flex flex-col items-center justify-center py-4 relative">
          
          <div className="relative w-40 h-44 flex items-center justify-center">
            {/* Round progression ring via SVG */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="72"
                strokeWidth="6"
                stroke="#0f172a"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="72"
                strokeWidth="6"
                stroke={timeLeft <= 10 ? '#ef4444' : '#6366f1'}
                fill="transparent"
                strokeDasharray="452.38"
                strokeDashoffset={452.38 - (452.38 * progressPercent) / 100}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Inner Clock Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span id="timer-letters" className={`font-mono font-black text-4xl tracking-tight leading-none ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-100'}`}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-1.5 uppercase">
                {isRunning ? 'active' : 'paused'}
              </span>
            </div>
          </div>

          {/* Quick controls row */}
          <div id="timer-control-row" className="flex items-center gap-3 mt-1">
            <button
              id="btn-toggle-timer"
              onClick={handleToggleTimer}
              className={`p-3 rounded-full transition active:scale-95 border cursor-pointer ${
                isRunning 
                  ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200' 
                  : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-505 shadow-lg'
              }`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              id="btn-reset-timer"
              onClick={handleResetTimer}
              className="p-3 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition active:scale-95 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic Interactive checklists of players */}
        <div id="speakers-check-section" className="flex-1 mt-3">
          <div className="flex justify-between items-center mb-2.5 px-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>Speakers Queue</span>
              <span className="bg-slate-850 px-2 py-0.5 text-white rounded text-[10px]">{speakerCount}/{players.length}</span>
            </span>
            <span id="tracker-check-helper" className="text-[10px] text-slate-500 font-sans">Click to check off</span>
          </div>

          <div id="speakers-scroll-box" className="bg-slate-950/40 rounded-xl border border-slate-800/80 p-3 max-h-[180px] overflow-y-auto space-y-2">
            {players.map((p) => {
              const activeCheck = hasSpoken[p.id];
              return (
                <button
                  id={`speaker-check-${p.id}`}
                  key={p.id}
                  onClick={() => handleToggleSpoken(p.id)}
                  className={`w-full flex justify-between items-center p-2.5 rounded-lg border transition duration-150 text-left cursor-pointer ${
                    activeCheck 
                      ? 'bg-indigo-500/5 text-slate-400 border-indigo-500/10 line-through decoration-slate-600/60' 
                      : 'bg-slate-900 text-slate-200 border-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-medium">{p.name}</span>
                  {activeCheck ? (
                    <CheckCircle size={14} className="text-indigo-400" />
                  ) : (
                    <HelpCircle size={14} className="text-slate-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Persistent continue button */}
      <div id="discussion-footer" className="w-full">
        <button
          id="discussion-continue-btn"
          onClick={onContinueToVoting}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-sans font-bold rounded-xl shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 transition duration-150 active:scale-98 cursor-pointer"
        >
          <Vote size={18} />
          <span>Move to Voting Phase</span>
        </button>
      </div>
    </div>
  );
}
