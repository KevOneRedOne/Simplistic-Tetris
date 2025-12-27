/**
 * High Score Manager for Tetris V2
 * Migrated from main.js with improvements
 */

import { GameMode } from '@/types/index';
import type { HighScore } from '@/types/index';
import { MAX_HIGH_SCORES, PLAYER_NAME_MAX_LENGTH, STORAGE_KEYS } from '@constants/config';

export class HighScoreManager {
  private isLocalStorageAvailable: boolean;
  private fallbackScores: Map<string, HighScore[]> = new Map();

  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorage();
  }

  /**
   * Check if localStorage is available (can be blocked in private mode on mobile)
   */
  private checkLocalStorage(): boolean {
    try {
      const testKey = '__tetris_storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available. High scores will not persist.', e);
      return false;
    }
  }

  /**
   * Get high scores for a specific game mode
   */
  public getHighScores(mode: GameMode): HighScore[] {
    const key = this.getStorageKey(mode);

    // Try localStorage first
    if (this.isLocalStorageAvailable) {
      try {
        const stored = localStorage.getItem(key);
        if (!stored) {
          return [];
        }

        const scores = JSON.parse(stored) as HighScore[];
        return this.validateHighScores(scores);
      } catch (e) {
        console.error('Failed to load high scores from localStorage:', e);
        // Fall through to memory fallback
      }
    }

    // Fallback to in-memory storage
    return this.fallbackScores.get(key) || [];
  }

  /**
   * Add a new high score
   */
  public addHighScore(
    mode: GameMode,
    playerName: string,
    score: number,
    lines: number,
    level: number,
    duration?: string
  ): boolean {
    const highScore: HighScore = {
      playerName: this.sanitizePlayerName(playerName),
      score: Math.round(score),
      lines,
      level,
      mode,
      timestamp: Date.now(),
      duration,
    };

    const scores = this.getHighScores(mode);
    scores.push(highScore);

    // Sort by score (descending)
    scores.sort((a, b) => b.score - a.score);

    // Keep only top scores
    const topScores = scores.slice(0, MAX_HIGH_SCORES);

    // Check if the new score made it to the list
    const isHighScore = topScores.some((s) => s.timestamp === highScore.timestamp);

    // Save
    this.saveHighScores(mode, topScores);

    return isHighScore;
  }

  /**
   * Check if a score qualifies as a high score
   */
  public isHighScore(mode: GameMode, score: number): boolean {
    const scores = this.getHighScores(mode);

    if (scores.length < MAX_HIGH_SCORES) {
      return true;
    }

    const lowestHighScore = scores[scores.length - 1];
    return lowestHighScore ? score > lowestHighScore.score : true;
  }

  /**
   * Clear all high scores for a mode
   */
  public clearHighScores(mode: GameMode): void {
    const key = this.getStorageKey(mode);

    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear high scores:', e);
    }
  }

  /**
   * Export high scores as JSON
   */
  public exportHighScores(mode: GameMode): string {
    const scores = this.getHighScores(mode);
    return JSON.stringify(scores, null, 2);
  }

  /**
   * Import high scores from JSON
   */
  public importHighScores(mode: GameMode, jsonData: string): boolean {
    try {
      const scores = JSON.parse(jsonData) as HighScore[];
      const validScores = this.validateHighScores(scores);

      this.saveHighScores(mode, validScores);
      return true;
    } catch (e) {
      console.error('Failed to import high scores:', e);
      return false;
    }
  }

  /**
   * Get high score rank for a given score
   */
  public getRank(mode: GameMode, score: number): number {
    const scores = this.getHighScores(mode);
    let rank = 1;

    for (const highScore of scores) {
      if (score >= highScore.score) {
        return rank;
      }
      rank++;
    }

    return rank;
  }

  /**
   * Render high scores to HTML list
   */
  public renderHighScores(mode: GameMode, containerElement: HTMLElement): void {
    const scores = this.getHighScores(mode);

    if (scores.length === 0) {
      containerElement.innerHTML = '<li class="no-scores">No scores yet</li>';
      return;
    }

    containerElement.innerHTML = scores
      .map(
        (score, index) => `
        <li class="high-score-item">
          <span class="rank">${index + 1}.</span>
          <span class="name">${score.playerName}</span>
          <span class="score">${score.score}</span>
        </li>
      `
      )
      .join('');
  }

  /**
   * Get storage key for a game mode
   */
  private getStorageKey(mode: GameMode): string {
    switch (mode) {
      case GameMode.CLASSIC:
        return STORAGE_KEYS.HIGH_SCORES_CLASSIC;
      case GameMode.ULTRA:
        return STORAGE_KEYS.HIGH_SCORES_ULTRA;
      default:
        return 'tetris_v2_highscores_unknown';
    }
  }

  /**
   * Save high scores to localStorage (or memory fallback)
   */
  private saveHighScores(mode: GameMode, scores: HighScore[]): void {
    const key = this.getStorageKey(mode);

    // Try localStorage first
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.setItem(key, JSON.stringify(scores));
        return;
      } catch (e) {
        console.error('Failed to save high scores to localStorage:', e);
        // If localStorage fails (quota exceeded), disable it and use fallback
        this.isLocalStorageAvailable = false;
      }
    }

    // Fallback to in-memory storage
    this.fallbackScores.set(key, scores);
    console.warn('High scores saved to memory only (will not persist after page reload)');
  }

  /**
   * Validate and sanitize high scores array
   */
  private validateHighScores(scores: HighScore[]): HighScore[] {
    if (!Array.isArray(scores)) {
      return [];
    }

    return scores
      .filter((score) => {
        return (
          typeof score === 'object' &&
          score !== null &&
          typeof score.score === 'number' &&
          typeof score.playerName === 'string' &&
          score.score >= 0
        );
      })
      .slice(0, MAX_HIGH_SCORES);
  }

  /**
   * Sanitize player name
   */
  private sanitizePlayerName(name: string): string {
    if (!name || name.trim() === '') {
      return 'AAA';
    }

    return name
      .trim()
      .toUpperCase()
      .substring(0, PLAYER_NAME_MAX_LENGTH)
      .padEnd(PLAYER_NAME_MAX_LENGTH, 'A');
  }

  /**
   * Get statistics across all high scores
   */
  public getStatistics(mode: GameMode): {
    totalGames: number;
    highestScore: number;
    averageScore: number;
    totalLines: number;
  } {
    const scores = this.getHighScores(mode);

    if (scores.length === 0) {
      return {
        totalGames: 0,
        highestScore: 0,
        averageScore: 0,
        totalLines: 0,
      };
    }

    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
    const totalLines = scores.reduce((sum, score) => sum + score.lines, 0);
    const highestScore = Math.max(...scores.map((s) => s.score));

    return {
      totalGames: scores.length,
      highestScore,
      averageScore: Math.round(totalScore / scores.length),
      totalLines,
    };
  }
}
