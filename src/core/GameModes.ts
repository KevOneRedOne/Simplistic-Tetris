/**
 * Game modes for Tetris V2
 * Factory pattern for Classic and Ultra modes
 */

import { GameMode } from '@/types/index';
import type { GameModeConfig } from '@/types/index';
import { GAME_MODE_CONFIGS } from '@constants/config';

/**
 * Get configuration for a specific game mode
 */
export function getGameModeConfig(mode: GameMode): GameModeConfig {
  const config = GAME_MODE_CONFIGS[mode];
  if (!config) {
    throw new Error(`Unknown game mode: ${mode}`);
  }
  return config;
}

/**
 * Check if a game mode has a time limit
 */
export function hasTimeLimit(mode: GameMode): boolean {
  const config = getGameModeConfig(mode);
  return config.timeLimit !== undefined && config.timeLimit > 0;
}

/**
 * Get remaining time in seconds
 */
export function getRemainingTime(mode: GameMode, elapsedSeconds: number): number {
  const config = getGameModeConfig(mode);

  if (!config.timeLimit) {
    return Infinity;
  }

  const remaining = config.timeLimit - elapsedSeconds;
  return Math.max(0, remaining);
}

/**
 * Check if time is up
 */
export function isTimeUp(mode: GameMode, elapsedSeconds: number): boolean {
  const config = getGameModeConfig(mode);

  if (!config.timeLimit) {
    return false;
  }

  return elapsedSeconds >= config.timeLimit;
}

/**
 * Format time for display (MM:SS or HH:MM:SS)
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if a time warning should be triggered
 */
export function shouldTriggerTimeWarning(
  mode: GameMode,
  previousSeconds: number,
  currentSeconds: number,
  warningSeconds: number
): boolean {
  const config = getGameModeConfig(mode);

  if (!config.timeLimit) {
    return false;
  }

  const previousRemaining = config.timeLimit - previousSeconds;
  const currentRemaining = config.timeLimit - currentSeconds;

  // Trigger if we just crossed the warning threshold
  return previousRemaining > warningSeconds && currentRemaining <= warningSeconds;
}

/**
 * Get all game modes
 */
export function getAllGameModes(): GameMode[] {
  return [GameMode.CLASSIC, GameMode.ULTRA];
}

/**
 * Get game mode display name
 */
export function getGameModeName(mode: GameMode): string {
  switch (mode) {
    case GameMode.CLASSIC:
      return 'Classic';
    case GameMode.ULTRA:
      return 'Ultra';
    default:
      return 'Unknown';
  }
}

/**
 * Get game mode description
 */
export function getGameModeDescription(mode: GameMode): string {
  switch (mode) {
    case GameMode.CLASSIC:
      return 'Play until game over. Clear lines to level up and increase speed.';
    case GameMode.ULTRA:
      return 'Score as many points as possible in 2 minutes!';
    default:
      return '';
  }
}
