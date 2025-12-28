/**
 * Game configuration constants
 */

import type { ControlsConfig, GameModeConfig } from '@/types/index';
import { GameMode } from '@/types/index';
import packageJson from '../../package.json';

// Input action type for debounce configuration
type InputAction =
  | 'moveLeft'
  | 'moveRight'
  | 'moveDown'
  | 'rotate'
  | 'hardDrop'
  | 'hold'
  | 'pause'
  | 'restart'
  | 'quit';

// App version from package.json
export const APP_VERSION = packageJson.version;

// Board dimensions
export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;
export const CELL_SIZE = 40; // pixels

// Colors
export const VACANT_COLOR = 'black';

export const TETROMINO_COLORS = {
  I: '#00f0f0', // cyan
  J: '#f0a000', // orange
  L: '#0000f0', // blue
  O: '#f0f000', // yellow
  S: '#00f000', // green
  T: '#a000f0', // purple
  Z: '#f00000', // red
} as const;

// Speed levels (level -> drop interval in ms)
// Adjusted for better playability - slower progression after level 12
export const LEVEL_SPEEDS: Record<number, number> = {
  0: 750,
  1: 700,
  2: 650,
  3: 600,
  4: 550,
  5: 500,
  6: 450,
  7: 400,
  8: 350,
  9: 300,
  10: 250,
  11: 200,
  12: 180, // Slower than before (was 150)
  13: 165, // More gradual decrease
  14: 150,
  15: 140,
  16: 130,
  17: 120,
  18: 115,
  19: 110,
  20: 105,
  21: 100, // Minimum speed cap for playability
  22: 100,
  23: 100,
  24: 100,
  25: 100, // Cap at 100ms for maximum playability
};

// Scoring
export const SCORE_BASE = 40;
export const SCORE_MULTIPLIERS = {
  1: 1, // single line
  2: 2.5, // double
  3: 5, // triple
  4: 8, // tetris
};

export const LINES_PER_LEVEL = 4;
export const MAX_LEVEL = 25;

// Game modes
export const GAME_MODE_CONFIGS: Record<GameMode, GameModeConfig> = {
  [GameMode.CLASSIC]: {
    mode: GameMode.CLASSIC,
    timeLimit: undefined, // infinite
    startLevel: 0,
    speedCurve: LEVEL_SPEEDS,
  },
  [GameMode.ULTRA]: {
    mode: GameMode.ULTRA,
    timeLimit: 120, // 2 minutes
    startLevel: 0,
    speedCurve: LEVEL_SPEEDS,
  },
};

// Ultra mode time warnings (in seconds remaining)
export const TIME_WARNINGS = [30, 10, 5];

// Default controls
export const DEFAULT_CONTROLS: ControlsConfig = {
  moveLeft: ['ArrowLeft', 'q', 'Q'],
  moveRight: ['ArrowRight', 'd', 'D'],
  moveDown: ['ArrowDown'],
  rotate: ['ArrowUp'],
  hardDrop: [' '], // space
  hold: ['Shift'],
  pause: ['Escape', 'p', 'P'],
  restart: ['Enter', 'r', 'R'],
  quit: ['Tab'], // Universal key compatible with all keyboard layouts
};

// High scores
export const MAX_HIGH_SCORES = 10;
export const PLAYER_NAME_MAX_LENGTH = 3;

// Animation durations (ms)
export const ANIMATION_DURATIONS = {
  LINE_CLEAR: 300,
  PIECE_LOCK: 100,
  GAME_OVER: 1000,
  LEVEL_UP: 500,
  FADE_IN: 200,
  FADE_OUT: 200,
};

// Theme names
export const THEME_NAMES = {
  CLASSIC: 'classic',
  DARK: 'dark',
  NEON: 'neon',
  RETRO: 'retro',
} as const;

export const DEFAULT_THEME = THEME_NAMES.DARK;

// Audio
export const DEFAULT_AUDIO_SETTINGS = {
  enabled: true,
  volume: 0.5,
  musicEnabled: false,
  musicVolume: 0.3,
};

// LocalStorage keys
export const STORAGE_KEYS = {
  HIGH_SCORES_CLASSIC: 'tetris_v2_highscores_classic',
  HIGH_SCORES_ULTRA: 'tetris_v2_highscores_ultra',
  LAST_ATTEMPT_CLASSIC: 'tetris_v2_last_attempt_classic',
  LAST_ATTEMPT_ULTRA: 'tetris_v2_last_attempt_ultra',
  SETTINGS: 'tetris_v2_settings',
  THEME: 'tetris_v2_theme',
  LANGUAGE: 'tetris_v2_language',
};

// i18n
export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;
export const DEFAULT_LANGUAGE = 'en';

// Performance
export const TARGET_FPS = 60;
export const FRAME_TIME = 1000 / TARGET_FPS;

// Input debounce (ms)
export const INPUT_DEBOUNCE: Partial<Record<InputAction, number>> = {
  rotate: 150,
  hold: 200,
  quit: 300, // Prevent accidental quits
};

// Ghost piece opacity
export const GHOST_PIECE_OPACITY = 0.3;

// Particle effects
export const PARTICLE_CONFIGS = {
  LINE_CLEAR: {
    count: 20,
    colors: ['#ffffff', '#ffff00', '#00ffff'],
    size: 4,
    speed: 3,
    lifetime: 500,
  },
  GAME_OVER: {
    count: 50,
    colors: ['#ff0000', '#ff6600', '#ffff00'],
    size: 6,
    speed: 5,
    lifetime: 1000,
  },
  LEVEL_UP: {
    count: 30,
    colors: ['#00ff00', '#00ffff', '#ffffff'],
    size: 5,
    speed: 4,
    lifetime: 700,
  },
};

// Initial piece spawn position
export const SPAWN_POSITION = {
  x: 3,
  y: -2,
};
