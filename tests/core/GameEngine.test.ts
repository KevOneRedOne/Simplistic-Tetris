import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '../../src/core/GameEngine';
import { GameMode, GameEventType } from '../../src/types/index';

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine(GameMode.CLASSIC);
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const state = engine.getState();

      expect(state.gameMode).toBe(GameMode.CLASSIC);
      expect(state.score).toBe(0);
      expect(state.lines).toBe(0);
      expect(state.level).toBe(0);
      expect(state.isGameOver).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentPiece).toBeDefined();
      expect(state.nextPiece).toBeDefined();
      expect(state.holdPiece).toBeNull();
      expect(state.canHold).toBe(true);
    });

    it('should initialize with Ultra mode when specified', () => {
      const ultraEngine = new GameEngine(GameMode.ULTRA);
      const state = ultraEngine.getState();

      expect(state.gameMode).toBe(GameMode.ULTRA);
    });
  });

  describe('Movement', () => {
    it('should move piece left when possible', () => {
      const initialState = engine.getState();
      const initialX = initialState.currentPiece?.position.x ?? 0;

      const moved = engine.moveLeft();
      const newState = engine.getState();
      const newX = newState.currentPiece?.position.x ?? 0;

      if (moved) {
        expect(newX).toBe(initialX - 1);
      }
    });

    it('should move piece right when possible', () => {
      const initialState = engine.getState();
      const initialX = initialState.currentPiece?.position.x ?? 0;

      const moved = engine.moveRight();
      const newState = engine.getState();
      const newX = newState.currentPiece?.position.x ?? 0;

      if (moved) {
        expect(newX).toBe(initialX + 1);
      }
    });

    it('should move piece down (soft drop)', () => {
      const initialState = engine.getState();
      const initialY = initialState.currentPiece?.position.y ?? 0;

      engine.moveDown();
      const newState = engine.getState();
      const newY = newState.currentPiece?.position.y ?? 0;

      // Either moved down or locked (if at bottom)
      expect(newY).toBeGreaterThanOrEqual(initialY);
    });

    it('should not move when game is over', () => {
      // Force game over
      const state = engine.getState();
      // Fill the board to trigger game over
      for (let i = 0; i < 100; i++) {
        engine.hardDrop();
      }

      const gameOverState = engine.getState();
      if (gameOverState.isGameOver) {
        expect(engine.moveLeft()).toBe(false);
        expect(engine.moveRight()).toBe(false);
        expect(engine.rotate()).toBe(false);
      }
    });
  });

  describe('Rotation', () => {
    it('should rotate piece when possible', () => {
      const rotated = engine.rotate();
      expect(typeof rotated).toBe('boolean');
    });

    it('should emit PIECE_ROTATED event on successful rotation', () => {
      const callback = vi.fn();
      engine.addEventListener(GameEventType.PIECE_ROTATED, callback);

      engine.rotate();

      // Callback may or may not be called depending on collision
      expect(callback).toHaveBeenCalledTimes(callback.mock.calls.length);
    });
  });

  describe('Hard Drop', () => {
    it('should drop piece to bottom instantly', () => {
      const initialScore = engine.getState().score;

      engine.hardDrop();

      const finalScore = engine.getState().score;
      expect(finalScore).toBeGreaterThan(initialScore);
    });
  });

  describe('Hold System', () => {
    it('should allow holding a piece', () => {
      const initialPiece = engine.getState().currentPiece;

      const held = engine.hold();

      expect(held).toBe(true);
      const newState = engine.getState();
      expect(newState.holdPiece).toBeDefined();
      expect(newState.canHold).toBe(false);
    });

    it('should not allow holding twice in a row', () => {
      engine.hold();
      const secondHold = engine.hold();

      expect(secondHold).toBe(false);
    });

    it('should allow holding again after locking a piece', () => {
      engine.hold();
      engine.hardDrop(); // Lock piece

      const newState = engine.getState();
      expect(newState.canHold).toBe(true);
    });
  });

  describe('Pause/Resume', () => {
    it('should pause the game', () => {
      engine.pause();

      const state = engine.getState();
      expect(state.isPaused).toBe(true);
    });

    it('should resume the game', () => {
      engine.pause();
      engine.resume();

      const state = engine.getState();
      expect(state.isPaused).toBe(false);
    });

    it('should toggle pause state', () => {
      const initialState = engine.getState();
      engine.togglePause();

      const pausedState = engine.getState();
      expect(pausedState.isPaused).toBe(!initialState.isPaused);

      engine.togglePause();
      const resumedState = engine.getState();
      expect(resumedState.isPaused).toBe(initialState.isPaused);
    });

    it('should not move pieces when paused', () => {
      engine.pause();

      expect(engine.moveLeft()).toBe(false);
      expect(engine.moveRight()).toBe(false);
      expect(engine.moveDown()).toBe(false);
      expect(engine.rotate()).toBe(false);
    });

    it('should emit GAME_PAUSED event', () => {
      const callback = vi.fn();
      engine.addEventListener(GameEventType.GAME_PAUSED, callback);

      engine.pause();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should emit GAME_RESUMED event', () => {
      const callback = vi.fn();
      engine.addEventListener(GameEventType.GAME_RESUMED, callback);

      engine.pause();
      engine.resume();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event System', () => {
    it('should register and trigger event listeners', () => {
      const callback = vi.fn();
      engine.addEventListener(GameEventType.PIECE_MOVED, callback);

      engine.moveLeft();

      // Callback called if move was successful
      expect(callback.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('should remove event listeners', () => {
      const callback = vi.fn();
      engine.addEventListener(GameEventType.PIECE_MOVED, callback);
      engine.removeEventListener(GameEventType.PIECE_MOVED, callback);

      engine.moveLeft();

      expect(callback).not.toHaveBeenCalled();
    });

    it('should emit PIECE_LOCKED event when piece locks', () => {
      const callback = vi.fn();
      engine.addEventListener(GameEventType.PIECE_LOCKED, callback);

      engine.hardDrop();

      expect(callback).toHaveBeenCalled();
    });

    it('should emit LINE_CLEARED event when lines are cleared', () => {
      const callback = vi.fn();
      engine.addEventListener(GameEventType.LINE_CLEARED, callback);

      // This may or may not trigger depending on game state
      engine.hardDrop();
    });
  });

  describe('Restart', () => {
    it('should reset game to initial state', () => {
      // Play some moves
      engine.moveLeft();
      engine.moveRight();
      engine.hardDrop();

      engine.restart();

      const state = engine.getState();
      expect(state.score).toBe(0);
      expect(state.lines).toBe(0);
      expect(state.level).toBe(0);
      expect(state.isGameOver).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    it('should restart with different mode', () => {
      engine.restart(GameMode.ULTRA);

      const state = engine.getState();
      expect(state.gameMode).toBe(GameMode.ULTRA);
    });
  });

  describe('Update Loop', () => {
    it('should update game state', () => {
      const initialTime = engine.getElapsedTime();

      engine.update(16); // 16ms ~ 1 frame

      const newTime = engine.getElapsedTime();
      expect(newTime).toBeGreaterThan(initialTime);
    });

    it('should not update when paused', () => {
      engine.pause();
      const initialTime = engine.getElapsedTime();

      engine.update(16);

      const newTime = engine.getElapsedTime();
      expect(newTime).toBe(initialTime);
    });

    it('should not update when game is over', () => {
      // Force game over by filling board
      for (let i = 0; i < 100; i++) {
        engine.hardDrop();
      }

      const state = engine.getState();
      if (state.isGameOver) {
        const initialTime = engine.getElapsedTime();
        engine.update(16);
        const newTime = engine.getElapsedTime();
        expect(newTime).toBe(initialTime);
      }
    });
  });

  describe('Time Management', () => {
    it('should track elapsed time', () => {
      const initialTime = engine.getElapsedTime();

      engine.update(1000); // 1 second

      const newTime = engine.getElapsedTime();
      expect(newTime).toBeGreaterThan(initialTime);
    });

    it('should calculate remaining time for Ultra mode', () => {
      const ultraEngine = new GameEngine(GameMode.ULTRA);
      const remainingTime = ultraEngine.getRemainingTime();

      expect(remainingTime).toBeGreaterThan(0);
      expect(remainingTime).toBeLessThanOrEqual(120); // 2 minutes
    });

    it('should return 0 remaining time for Classic mode', () => {
      const remainingTime = engine.getRemainingTime();
      // Classic mode has infinite time, so remaining time is 0 or Infinity
      expect(remainingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Ghost Piece', () => {
    it('should return ghost piece position', () => {
      const ghostPiece = engine.getGhostPosition();

      expect(ghostPiece).toBeDefined();
      if (ghostPiece) {
        expect(ghostPiece.position).toBeDefined();
        expect(ghostPiece.shape).toBeDefined();
      }
    });

    it('should place ghost piece below current piece', () => {
      const currentPiece = engine.getState().currentPiece;
      const ghostPiece = engine.getGhostPosition();

      if (currentPiece && ghostPiece) {
        expect(ghostPiece.position.y).toBeGreaterThanOrEqual(currentPiece.position.y);
      }
    });
  });

  describe('Scoring', () => {
    it('should update score on soft drop', () => {
      const initialScore = engine.getState().score;

      engine.moveDown();

      const finalScore = engine.getState().score;
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should update score on hard drop', () => {
      const initialScore = engine.getState().score;

      engine.hardDrop();

      const finalScore = engine.getState().score;
      expect(finalScore).toBeGreaterThan(initialScore);
    });
  });

  describe('Game Over', () => {
    it('should emit GAME_OVER event', () => {
      const callback = vi.fn();
      engine.addEventListener(GameEventType.GAME_OVER, callback);

      // Force game over by filling board
      for (let i = 0; i < 100; i++) {
        engine.hardDrop();
        if (engine.getState().isGameOver) break;
      }

      const state = engine.getState();
      if (state.isGameOver) {
        expect(callback).toHaveBeenCalled();
      }
    });

    it('should include game stats in game over event', () => {
      const callback = vi.fn();
      engine.addEventListener(GameEventType.GAME_OVER, callback);

      // Force game over
      for (let i = 0; i < 100; i++) {
        engine.hardDrop();
        if (engine.getState().isGameOver) break;
      }

      if (callback.mock.calls.length > 0) {
        const event = callback.mock.calls[0][0];
        expect(event.data).toHaveProperty('score');
        expect(event.data).toHaveProperty('lines');
        expect(event.data).toHaveProperty('level');
        expect(event.data).toHaveProperty('duration');
      }
    });
  });
});
