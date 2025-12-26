/**
 * Scoring system for Tetris V2
 * Migrated from main.js and Piece.js with improvements
 */

import type { ScoreInfo } from '@/types/index';
import {
  SCORE_BASE,
  SCORE_MULTIPLIERS,
  LINES_PER_LEVEL,
  MAX_LEVEL,
  LEVEL_SPEEDS,
} from '@constants/config';

/**
 * Calculate score for cleared lines
 */
export function calculateLineScore(linesCleared: number, currentLevel: number): number {
  if (linesCleared === 0) {
    return 0;
  }

  const multiplier = SCORE_MULTIPLIERS[linesCleared as keyof typeof SCORE_MULTIPLIERS] || 1;
  const baseScore = SCORE_BASE * multiplier;
  const levelBonus = currentLevel * SCORE_BASE;

  return Math.floor(baseScore + levelBonus);
}

/**
 * Calculate soft drop bonus (points per cell dropped)
 */
export function calculateSoftDropBonus(cellsDropped: number): number {
  return cellsDropped * 0.5;
}

/**
 * Calculate hard drop bonus (points per cell dropped)
 */
export function calculateHardDropBonus(cellsDropped: number): number {
  return cellsDropped * 2;
}

/**
 * Calculate new level based on total lines cleared
 */
export function calculateLevel(totalLines: number): number {
  const level = Math.floor(totalLines / LINES_PER_LEVEL);
  return Math.min(level, MAX_LEVEL);
}

/**
 * Check if player should level up
 */
export function shouldLevelUp(previousLines: number, newLines: number): boolean {
  const previousLevel = calculateLevel(previousLines);
  const newLevel = calculateLevel(newLines);
  return newLevel > previousLevel;
}

/**
 * Get drop speed for a given level (in milliseconds)
 */
export function getDropSpeed(level: number): number {
  const clampedLevel = Math.min(Math.max(level, 0), MAX_LEVEL);
  return LEVEL_SPEEDS[clampedLevel] ?? LEVEL_SPEEDS[MAX_LEVEL] ?? 40;
}

/**
 * Calculate progress to next level (0 to 1)
 */
export function getLevelProgress(totalLines: number): number {
  const linesInCurrentLevel = totalLines % LINES_PER_LEVEL;
  return linesInCurrentLevel / LINES_PER_LEVEL;
}

/**
 * Get lines needed for next level
 */
export function getLinesUntilNextLevel(totalLines: number): number {
  const linesInCurrentLevel = totalLines % LINES_PER_LEVEL;
  return LINES_PER_LEVEL - linesInCurrentLevel;
}

/**
 * Update score after line clear
 */
export function updateScoreAfterLineClear(
  currentScore: number,
  currentLines: number,
  currentLevel: number,
  linesCleared: number
): ScoreInfo {
  if (linesCleared === 0) {
    return {
      points: currentScore,
      linesCleared: currentLines,
      level: currentLevel,
      bonus: 0,
    };
  }

  const lineScore = calculateLineScore(linesCleared, currentLevel);
  const newScore = currentScore + lineScore;
  const newLines = currentLines + linesCleared;
  const newLevel = calculateLevel(newLines);

  return {
    points: newScore,
    linesCleared: newLines,
    level: newLevel,
    bonus: lineScore,
  };
}

/**
 * Update score after soft drop
 */
export function updateScoreAfterSoftDrop(
  currentScore: number,
  cellsDropped: number
): number {
  const bonus = calculateSoftDropBonus(cellsDropped);
  return currentScore + bonus;
}

/**
 * Update score after hard drop
 */
export function updateScoreAfterHardDrop(
  currentScore: number,
  cellsDropped: number
): number {
  const bonus = calculateHardDropBonus(cellsDropped);
  return currentScore + bonus;
}

/**
 * Get grade/rank based on score (for fun)
 */
export function getScoreGrade(score: number): string {
  if (score < 1000) return 'D';
  if (score < 2500) return 'C';
  if (score < 5000) return 'B';
  if (score < 10000) return 'A';
  if (score < 20000) return 'S';
  return 'SS';
}

/**
 * Calculate statistics for game session
 */
export interface GameStatistics {
  score: number;
  lines: number;
  level: number;
  linesPerMinute: number;
  averageScore: number;
  grade: string;
}

export function calculateGameStatistics(
  score: number,
  lines: number,
  durationSeconds: number
): GameStatistics {
  const level = calculateLevel(lines);
  const durationMinutes = durationSeconds / 60;
  const linesPerMinute = durationMinutes > 0 ? lines / durationMinutes : 0;
  const averageScore = lines > 0 ? score / lines : 0;
  const grade = getScoreGrade(score);

  return {
    score,
    lines,
    level,
    linesPerMinute: Math.round(linesPerMinute * 10) / 10,
    averageScore: Math.round(averageScore),
    grade,
  };
}

/**
 * Check for special achievements (Tetris, back-to-back, etc.)
 */
export interface Achievement {
  type: 'tetris' | 'back_to_back' | 'combo' | 'perfect_clear';
  title: string;
  bonus: number;
}

export function checkAchievement(
  linesCleared: number,
  previousLinesCleared: number,
  combo: number
): Achievement | null {
  // Tetris (4 lines at once)
  if (linesCleared === 4) {
    return {
      type: 'tetris',
      title: 'TETRIS!',
      bonus: 800,
    };
  }

  // Back-to-back Tetris
  if (linesCleared === 4 && previousLinesCleared === 4) {
    return {
      type: 'back_to_back',
      title: 'BACK-TO-BACK TETRIS!',
      bonus: 1200,
    };
  }

  // Combo (multiple line clears in a row)
  if (combo >= 3) {
    return {
      type: 'combo',
      title: `${combo}x COMBO!`,
      bonus: combo * 50,
    };
  }

  return null;
}

