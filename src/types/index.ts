/**
 * Core game types for Tetris V2
 */

export type CellValue = string; // Color string or 'vacant'

export interface Position {
  x: number;
  y: number;
}

export type TetrominoMatrix = number[][];

export interface TetrominoShape {
  shape: TetrominoMatrix[];
  color: string;
  name: TetrominoType;
}

export enum TetrominoType {
  I = 'I',
  J = 'J',
  L = 'L',
  O = 'O',
  S = 'S',
  T = 'T',
  Z = 'Z',
}

export interface Tetromino {
  shape: TetrominoMatrix;
  color: string;
  type: TetrominoType;
  rotation: number;
  position: Position;
}

export type BoardGrid = CellValue[][];

export interface GameState {
  board: BoardGrid;
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  holdPiece: Tetromino | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
  gameMode: GameMode;
}

export enum GameMode {
  CLASSIC = 'classic',
  ULTRA = 'ultra',
}

export interface GameModeConfig {
  mode: GameMode;
  timeLimit?: number; // in seconds, undefined for infinite
  startLevel: number;
  speedCurve: Record<number, number>; // level -> drop interval in ms
}

export interface ScoreInfo {
  points: number;
  linesCleared: number;
  level: number;
  bonus: number;
}

export interface HighScore {
  playerName: string;
  score: number;
  lines: number;
  level: number;
  mode: GameMode;
  timestamp: number;
  duration?: string; // formatted time string
}

export interface CollisionResult {
  hasCollision: boolean;
  reason?: 'wall' | 'floor' | 'piece';
}

export interface GameEvent {
  type: GameEventType;
  data?: unknown;
}

export enum GameEventType {
  PIECE_MOVED = 'piece_moved',
  PIECE_ROTATED = 'piece_rotated',
  PIECE_LOCKED = 'piece_locked',
  LINE_CLEARED = 'line_cleared',
  LEVEL_UP = 'level_up',
  GAME_OVER = 'game_over',
  GAME_PAUSED = 'game_paused',
  GAME_RESUMED = 'game_resumed',
  SCORE_UPDATED = 'score_updated',
  TIME_WARNING = 'time_warning',
  TIME_UP = 'time_up',
}

export type GameEventCallback = (event: GameEvent) => void;

export interface Theme {
  name: string;
  colors: {
    background: string;
    boardBackground: string;
    gridLines: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    [key: string]: string;
  };
}

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  musicEnabled: boolean;
  musicVolume: number;
}

export interface GameSettings {
  theme: string;
  audio: AudioSettings;
  language: string;
  controls: ControlsConfig;
}

export interface ControlsConfig {
  moveLeft: string[];
  moveRight: string[];
  moveDown: string[];
  rotate: string[];
  hardDrop: string[];
  hold: string[];
  pause: string[];
  restart: string[];
  quit: string[];
}

export interface AnimationConfig {
  duration: number;
  easing?: string;
}

export interface ParticleConfig {
  count: number;
  colors: string[];
  size: number;
  speed: number;
  lifetime: number;
}
