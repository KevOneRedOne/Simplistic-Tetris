/**
 * Game Engine for Tetris V2
 * Orchestrates all game logic with event-driven architecture
 */

import { GameMode, GameEventType } from '@/types/index';
import type { GameState, Tetromino, GameEvent, GameEventCallback } from '@/types/index';
import { createBoard, lockPiece, clearCompleteLines, isPieceAboveBoard } from './Board';
import { createRandomTetromino, rotateTetromino, moveTetromino } from './Tetromino';
import {
  checkCollision,
  canMoveDown,
  canRotate,
  findGhostPosition,
  calculateHardDropDistance,
} from './CollisionDetector';
import {
  updateScoreAfterLineClear,
  updateScoreAfterSoftDrop,
  updateScoreAfterHardDrop,
  shouldLevelUp,
  getDropSpeed,
} from './ScoringSystem';
import { isTimeUp, getRemainingTime, shouldTriggerTimeWarning } from './GameModes';
import { TIME_WARNINGS } from '@constants/config';

export class GameEngine {
  private state: GameState;
  private eventListeners: Map<GameEventType, GameEventCallback[]>;
  private lastDropTime: number;
  private elapsedTime: number;
  private isPaused: boolean;
  private combo: number;

  constructor(mode: GameMode = GameMode.CLASSIC) {
    this.state = this.createInitialState(mode);
    this.eventListeners = new Map();
    this.lastDropTime = Date.now();
    this.elapsedTime = 0;
    this.isPaused = false;
    this.combo = 0;
  }

  /**
   * Create initial game state
   */
  private createInitialState(mode: GameMode): GameState {
    return {
      board: createBoard(),
      currentPiece: createRandomTetromino(),
      nextPiece: createRandomTetromino(),
      holdPiece: null,
      canHold: true,
      score: 0,
      lines: 0,
      level: 0,
      isGameOver: false,
      isPaused: false,
      gameMode: mode,
    };
  }

  /**
   * Get current game state (immutable)
   */
  public getState(): Readonly<GameState> {
    return { ...this.state };
  }

  /**
   * Subscribe to game events
   */
  public addEventListener(type: GameEventType, callback: GameEventCallback): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)?.push(callback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(type: GameEventType, callback: GameEventCallback): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  private emit(type: GameEventType, data?: unknown): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const event: GameEvent = { type, data };
      listeners.forEach((callback) => callback(event));
    }
  }

  /**
   * Update game (called every frame)
   */
  public update(deltaTime: number): void {
    if (this.state.isGameOver || this.isPaused) {
      return;
    }

    // Update elapsed time
    this.elapsedTime += deltaTime / 1000;

    // Check time limit for Ultra mode
    this.checkTimeLimit();

    // Auto-drop piece based on level speed
    this.handleAutoDrop();
  }

  /**
   * Check time limit and trigger warnings
   */
  private checkTimeLimit(): void {
    if (this.state.gameMode === GameMode.ULTRA) {
      const previousElapsed = this.elapsedTime - 1 / 60; // approximate previous frame

      // Check for time warnings
      for (const warningTime of TIME_WARNINGS) {
        if (
          shouldTriggerTimeWarning(
            this.state.gameMode,
            previousElapsed,
            this.elapsedTime,
            warningTime
          )
        ) {
          this.emit(GameEventType.TIME_WARNING, { secondsRemaining: warningTime });
        }
      }

      // Check if time is up
      if (isTimeUp(this.state.gameMode, this.elapsedTime)) {
        this.emit(GameEventType.TIME_UP);
        this.gameOver();
      }
    }
  }

  /**
   * Handle automatic piece drop
   */
  private handleAutoDrop(): void {
    const now = Date.now();
    const dropSpeed = getDropSpeed(this.state.level);

    if (now - this.lastDropTime >= dropSpeed) {
      this.moveDown();
      this.lastDropTime = now;
    }
  }

  /**
   * Move piece left
   */
  public moveLeft(): boolean {
    if (this.state.isGameOver || this.isPaused || !this.state.currentPiece) {
      return false;
    }

    const movedPiece = moveTetromino(this.state.currentPiece, -1, 0);

    if (!checkCollision(this.state.board, movedPiece).hasCollision) {
      this.state.currentPiece = movedPiece;
      this.emit(GameEventType.PIECE_MOVED, { direction: 'left' });
      return true;
    }

    return false;
  }

  /**
   * Move piece right
   */
  public moveRight(): boolean {
    if (this.state.isGameOver || this.isPaused || !this.state.currentPiece) {
      return false;
    }

    const movedPiece = moveTetromino(this.state.currentPiece, 1, 0);

    if (!checkCollision(this.state.board, movedPiece).hasCollision) {
      this.state.currentPiece = movedPiece;
      this.emit(GameEventType.PIECE_MOVED, { direction: 'right' });
      return true;
    }

    return false;
  }

  /**
   * Move piece down (soft drop)
   */
  public moveDown(): boolean {
    if (this.state.isGameOver || this.isPaused || !this.state.currentPiece) {
      return false;
    }

    if (canMoveDown(this.state.board, this.state.currentPiece)) {
      this.state.currentPiece = moveTetromino(this.state.currentPiece, 0, 1);
      this.state.score = updateScoreAfterSoftDrop(this.state.score, 1);
      this.emit(GameEventType.PIECE_MOVED, { direction: 'down' });
      return true;
    } else {
      // Lock piece
      this.lockCurrentPiece();
      return false;
    }
  }

  /**
   * Rotate piece
   */
  public rotate(): boolean {
    if (this.state.isGameOver || this.isPaused || !this.state.currentPiece) {
      return false;
    }

    const rotated = rotateTetromino(this.state.currentPiece);
    const kick = canRotate(this.state.board, this.state.currentPiece, rotated);

    if (kick !== null) {
      const finalPiece = moveTetromino(rotated, kick, 0);
      this.state.currentPiece = finalPiece;
      this.emit(GameEventType.PIECE_ROTATED);
      return true;
    }

    return false;
  }

  /**
   * Hard drop piece
   */
  public hardDrop(): void {
    if (this.state.isGameOver || this.isPaused || !this.state.currentPiece) {
      return;
    }

    const distance = calculateHardDropDistance(this.state.board, this.state.currentPiece);
    const ghostPosition = findGhostPosition(this.state.board, this.state.currentPiece);

    this.state.currentPiece = moveTetromino(
      this.state.currentPiece,
      ghostPosition.x - this.state.currentPiece.position.x,
      ghostPosition.y - this.state.currentPiece.position.y
    );

    this.state.score = updateScoreAfterHardDrop(this.state.score, distance);
    this.lockCurrentPiece();
  }

  /**
   * Hold current piece
   */
  public hold(): boolean {
    if (this.state.isGameOver || this.isPaused || !this.state.currentPiece || !this.state.canHold) {
      return false;
    }

    if (this.state.holdPiece === null) {
      // First hold - put current piece in hold and spawn next
      this.state.holdPiece = createRandomTetromino();
      this.state.holdPiece.type = this.state.currentPiece.type;
      this.state.currentPiece = this.state.nextPiece;
      this.state.nextPiece = createRandomTetromino();
    } else {
      // Swap current with hold
      const temp = this.state.currentPiece.type;
      this.state.currentPiece = createRandomTetromino();
      this.state.currentPiece.type = this.state.holdPiece.type;
      this.state.holdPiece.type = temp;
    }

    this.state.canHold = false;
    return true;
  }

  /**
   * Lock current piece on the board
   */
  private lockCurrentPiece(): void {
    if (!this.state.currentPiece) {
      return;
    }

    // Check game over condition
    if (isPieceAboveBoard(this.state.currentPiece)) {
      this.gameOver();
      return;
    }

    // Lock piece
    this.state.board = lockPiece(this.state.board, this.state.currentPiece);
    this.emit(GameEventType.PIECE_LOCKED);

    // Clear lines
    const { board: newBoard, linesCleared } = clearCompleteLines(this.state.board);
    this.state.board = newBoard;

    if (linesCleared > 0) {
      // Update score and level
      const previousLines = this.state.lines;
      const scoreInfo = updateScoreAfterLineClear(
        this.state.score,
        this.state.lines,
        this.state.level,
        linesCleared
      );

      this.state.score = scoreInfo.points;
      this.state.lines = scoreInfo.linesCleared;
      this.state.level = scoreInfo.level;

      this.emit(GameEventType.LINE_CLEARED, { count: linesCleared, bonus: scoreInfo.bonus });

      // Check level up
      if (shouldLevelUp(previousLines, this.state.lines)) {
        this.emit(GameEventType.LEVEL_UP, { level: this.state.level });
      }

      this.emit(GameEventType.SCORE_UPDATED, { score: this.state.score });
      this.combo++;
    } else {
      this.combo = 0;
    }

    // Spawn next piece
    this.state.currentPiece = this.state.nextPiece;
    this.state.nextPiece = createRandomTetromino();
    this.state.canHold = true;

    // Check if new piece can be placed (game over)
    if (
      this.state.currentPiece &&
      checkCollision(this.state.board, this.state.currentPiece).hasCollision
    ) {
      this.gameOver();
    }
  }

  /**
   * Pause game
   */
  public pause(): void {
    if (this.state.isGameOver) {
      return;
    }

    this.isPaused = true;
    this.state.isPaused = true;
    this.emit(GameEventType.GAME_PAUSED);
  }

  /**
   * Resume game
   */
  public resume(): void {
    if (this.state.isGameOver) {
      return;
    }

    this.isPaused = false;
    this.state.isPaused = false;
    this.lastDropTime = Date.now(); // Reset drop timer
    this.emit(GameEventType.GAME_RESUMED);
  }

  /**
   * Toggle pause
   */
  public togglePause(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /**
   * Game over
   */
  private gameOver(): void {
    this.state.isGameOver = true;
    this.emit(GameEventType.GAME_OVER, {
      score: this.state.score,
      lines: this.state.lines,
      level: this.state.level,
      duration: this.elapsedTime,
    });
  }

  /**
   * Restart game
   */
  public restart(mode?: GameMode): void {
    this.state = this.createInitialState(mode || this.state.gameMode);
    this.lastDropTime = Date.now();
    this.elapsedTime = 0;
    this.isPaused = false;
    this.combo = 0;
  }

  /**
   * Get elapsed time in seconds
   */
  public getElapsedTime(): number {
    return this.elapsedTime;
  }

  /**
   * Get remaining time for Ultra mode
   */
  public getRemainingTime(): number {
    return getRemainingTime(this.state.gameMode, this.elapsedTime);
  }

  /**
   * Get ghost piece position
   */
  public getGhostPosition(): Tetromino | null {
    if (!this.state.currentPiece) {
      return null;
    }

    try {
      const ghostPosition = findGhostPosition(this.state.board, this.state.currentPiece);
      return moveTetromino(
        this.state.currentPiece,
        ghostPosition.x - this.state.currentPiece.position.x,
        ghostPosition.y - this.state.currentPiece.position.y
      );
    } catch {
      return null;
    }
  }
}
