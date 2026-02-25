/**
 * One play session: owns GameEngine, InputHandler, and GameLoop.
 * Exposes start(mode), restart(mode), quit() and gives access to engine/input for UI context.
 */

import { GameMode } from '@/types/index';
import { GameEngine } from '@core/GameEngine';
import { getDropSpeed } from '@core/ScoringSystem';
import { InputHandler } from '@input/InputHandler';
import { AnimationEngine } from '@rendering/AnimationEngine';
import { CanvasRenderer } from '@rendering/CanvasRenderer';
import { AudioManager } from '@ui/AudioManager';
import { FPSCounter } from '@ui/FPSCounter';
import { UIManager } from '@ui/UIManager';
import { GameLoop } from './GameLoop';
import {
  bindInputToGame,
  registerGameEventHandlers,
  type GameOverData,
} from './gameSessionHandlers';

export interface GameSessionCallbacks {
  onGameOver: (data: GameOverData) => void;
  onRestart: (mode: GameMode) => void;
  onQuit: () => void;
}

export interface GameSessionDeps {
  renderer: CanvasRenderer;
  animationEngine: AnimationEngine;
  uiManager: UIManager;
  audioManager: AudioManager;
  fpsCounter: FPSCounter;
  callbacks: GameSessionCallbacks;
}

export class GameSession {
  private deps: GameSessionDeps;
  private gameEngine: GameEngine | null = null;
  private inputHandler: InputHandler | null = null;
  private loop: GameLoop | null = null;

  constructor(deps: GameSessionDeps) {
    this.deps = deps;
  }

  /** Start a new game in the given mode. */
  start(mode: GameMode): void {
    const { renderer, animationEngine, uiManager, audioManager, fpsCounter, callbacks } = this.deps;

    this.gameEngine = new GameEngine(mode);
    this.inputHandler = new InputHandler();

    bindInputToGame(this.inputHandler, this.gameEngine, audioManager, {
      onRestart: callbacks.onRestart,
      onQuit: callbacks.onQuit,
    });

    registerGameEventHandlers({
      gameEngine: this.gameEngine,
      audioManager,
      animationEngine,
      renderer,
      uiManager,
      onGameOver: callbacks.onGameOver,
      onLevelUp: () => this.updateInputSpeedScaling(),
    });

    this.updateInputSpeedScaling();

    this.loop = new GameLoop({
      gameEngine: this.gameEngine,
      animationEngine,
      renderer,
      uiManager,
      fpsCounter,
    });
    this.loop.start();
  }

  /** Restart the current game (same or new mode). Call after stopping music/UI if needed. */
  restart(mode: GameMode): void {
    if (!this.loop || !this.gameEngine) return;

    this.loop.stop();
    this.gameEngine.restart(mode);
    this.loop.start();
  }

  /** Stop the session and clear references. */
  quit(): void {
    if (this.loop) {
      this.loop.stop();
      this.loop = null;
    }
    this.deps.animationEngine.clearAll();
    this.gameEngine = null;
    this.inputHandler = null;
  }

  getEngine(): GameEngine | null {
    return this.gameEngine;
  }

  getInputHandler(): InputHandler | null {
    return this.inputHandler;
  }

  private updateInputSpeedScaling(): void {
    if (!this.gameEngine || !this.inputHandler) return;

    const state = this.gameEngine.getState();
    const currentDrop = getDropSpeed(state.level);
    const baseDrop = getDropSpeed(0);
    const speedFactor = baseDrop / currentDrop;
    this.inputHandler.updateSpeedScaling(speedFactor);
  }
}
