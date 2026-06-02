/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, GameSettings, GameStats, GameHistory } from '../types';

const PLAYERS_KEY = 'word_impostor_players';
const SETTINGS_KEY = 'word_impostor_settings';
const STATS_KEY = 'word_impostor_stats';
const HISTORY_KEY = 'word_impostor_history';

// Default Settings
const DEFAULT_SETTINGS: GameSettings = {
  darkMode: true, // Dark mode default
  soundOn: true,
  discussionDuration: 60, // 60 seconds default
};

// Default Stats
const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  crewmateWins: 0,
  impostorWins: 0,
  categoryStats: {},
};

/**
 * Game Service Interface
 * 
 * Future Firebase Migration Guide:
 * To migrate to Firebase (Firestore), replace the localStorage calls inside these 
 * functions with standard Firestore SDK calls:
 * - import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
 * - Use firebaseAuth.currentUser.uid to scope players or settings if multi-user is needed.
 * - Under this architecture, the rest of your React app remains 100% untouched because
 *   it interacts solely with this abstract service!
 */
export const GameService = {
  // --- SETTINGS ---
  getSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading settings", e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving settings", e);
    }
  },

  // --- PLAYERS ---
  getPlayers(): Player[] {
    try {
      const stored = localStorage.getItem(PLAYERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading players", e);
    }
    // Return default initial list of players if empty
    return [
      { id: '1', name: 'Raj', score: 0, totalGames: 0, crewWins: 0, impWins: 0, votedOutCount: 0 },
      { id: '2', name: 'Priya', score: 0, totalGames: 0, crewWins: 0, impWins: 0, votedOutCount: 0 },
      { id: '3', name: 'Milan', score: 0, totalGames: 0, crewWins: 0, impWins: 0, votedOutCount: 0 },
    ];
  },

  savePlayers(players: Player[]): void {
    try {
      localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    } catch (e) {
      console.error("Error saving players", e);
    }
  },

  // --- STATS ---
  getStats(): GameStats {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading stats", e);
    }
    return DEFAULT_STATS;
  },

  saveStats(stats: GameStats): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error("Error saving stats", e);
    }
  },

  resetStats(): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(DEFAULT_STATS));
      localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
      
      // Also reset individual player stats
      const players = this.getPlayers();
      const resetPlayers = players.map(p => ({
        ...p,
        score: 0,
        totalGames: 0,
        crewWins: 0,
        impWins: 0,
        votedOutCount: 0
      }));
      this.savePlayers(resetPlayers);
    } catch (e) {
      console.error("Error resetting stats", e);
    }
  },

  // --- HISTORY ---
  getHistory(): GameHistory[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading history", e);
    }
    return [];
  },

  saveHistory(history: GameHistory[]): void {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Error saving history", e);
    }
  },

  /**
   * Complete a game and save all scores, history, and statistics atomically
   */
  completeGame(
    winner: 'crewmates' | 'impostor',
    impostorPlayer: Player,
    crewmatePlayers: Player[],
    category: string,
    secretWord: string,
    votedOutId: string | null,
    guessCorrect: boolean | null
  ): void {
    const allHistory = this.getHistory();
    const allStats = this.getStats();
    const allPlayers = this.getPlayers();

    // 1. Create history item
    const newHistoryItem: GameHistory = {
      id: Math.random().toString(36).substring(2, 11),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      players: [impostorPlayer.name, ...crewmatePlayers.map(c => c.name)],
      category,
      secretWord,
      impostorName: impostorPlayer.name,
      winner,
      guessWasCorrect: guessCorrect
    };

    allHistory.unshift(newHistoryItem); // newest first
    this.saveHistory(allHistory);

    // 2. Update stats
    allStats.totalGames += 1;
    if (winner === 'crewmates') {
      allStats.crewmateWins += 1;
    } else {
      allStats.impostorWins += 1;
    }
    
    // Update category frequency
    allStats.categoryStats[category] = (allStats.categoryStats[category] || 0) + 1;
    this.saveStats(allStats);

    // 3. Update player records in local storage registry
    const updatedPlayers = allPlayers.map(p => {
      // Find matches in current game
      const isImpostor = p.id === impostorPlayer.id;
      const isCrewmate = crewmatePlayers.some(c => c.id === p.id);
      
      if (isImpostor || isCrewmate) {
        const totalGames = p.totalGames + 1;
        let crewWins = p.crewWins;
        let impWins = p.impWins;
        let score = p.score;
        let votedOutCount = p.votedOutCount;

        if (isImpostor) {
          if (winner === 'impostor') {
            impWins += 1;
            score += 15; // Impostors win big
          }
        } else {
          if (winner === 'crewmates') {
            crewWins += 1;
            score += 10; // Crewmates get 10pts
          }
        }

        if (p.id === votedOutId) {
          votedOutCount += 1;
        }

        return {
          ...p,
          totalGames,
          crewWins,
          impWins,
          votedOutCount,
          score
        };
      }
      return p;
    });

    this.savePlayers(updatedPlayers);
  }
};
