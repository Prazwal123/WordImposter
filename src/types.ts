/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'crewmate' | 'impostor';

export interface Player {
  id: string;
  name: string;
  role?: Role;
  score: number;
  totalGames: number;
  crewWins: number;
  impWins: number;
  votedOutCount: number;
}

export interface WordItem {
  secretWord: string;
  impostorHint: string;
  category: string;
}

export interface GameSettings {
  darkMode: boolean;
  soundOn: boolean;
  discussionDuration: number; // 30 | 60 | 90 | 120 seconds
}

export interface GameStats {
  totalGames: number;
  crewmateWins: number;
  impostorWins: number;
  categoryStats: Record<string, number>; // category -> count
}

export interface GameHistory {
  id: string;
  date: string;
  players: string[];
  category: string;
  secretWord: string;
  impostorName: string;
  winner: 'crewmates' | 'impostor';
  guessWasCorrect: boolean | null; // null if not guessed, boolean if guessed
}

export type GameStep =
  | 'home'
  | 'player-setup'
  | 'category-select'
  | 'reveal'
  | 'discussion'
  | 'voting'
  | 'result'
  | 'scoreboard'
  | 'history';
