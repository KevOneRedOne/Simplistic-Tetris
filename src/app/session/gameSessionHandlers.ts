/**
 * Binds input and game engine events to audio, UI, and callbacks.
 * Used by GameSession to wire GameEngine + InputHandler without coupling to TetrisGame.
 */

import { GameEventType, GameMode } from '@/types/index';
import type { GameEngine } from '@core/GameEngine';
import { i18n } from '@i18n/i18n';
import type { InputHandler } from '@input/InputHandler';
import type { AnimationEngine } from '@rendering/AnimationEngine';
import type { CanvasRenderer } from '@rendering/CanvasRenderer';
import type { AudioManager } from '@ui/AudioManager';
import type { UIManager } from '@ui/UIManager';

export interface BindInputCallbacks {
  onRestart: (mode: GameMode) => void;
  onQuit: () => void;
}

export function bindInputToGame(
  inputHandler: InputHandler,
  gameEngine: GameEngine,
  audioManager: AudioManager,
  callbacks: BindInputCallbacks
): void {
  const { onRestart, onQuit } = callbacks;

  inputHandler.on('moveLeft', () => {
    if (gameEngine.moveLeft()) audioManager.play('move');
  });
  inputHandler.on('moveRight', () => {
    if (gameEngine.moveRight()) audioManager.play('move');
  });
  inputHandler.on('moveDown', () => {
    gameEngine.moveDown();
    audioManager.play('move');
  });
  inputHandler.on('rotate', () => {
    if (gameEngine.rotate()) audioManager.play('rotate');
  });
  inputHandler.on('hardDrop', () => {
    gameEngine.hardDrop();
    audioManager.play('drop');
  });
  inputHandler.on('hold', () => {
    if (gameEngine.hold()) audioManager.play('hold');
  });
  inputHandler.on('pause', () => gameEngine.togglePause());
  inputHandler.on('restart', () => onRestart(gameEngine.getState().gameMode));
  inputHandler.on('quit', onQuit);
}

export interface GameOverData {
  score: number;
  lines: number;
  level: number;
  duration: number;
}

export interface RegisterEventHandlersDeps {
  gameEngine: GameEngine;
  audioManager: AudioManager;
  animationEngine: AnimationEngine;
  renderer: CanvasRenderer;
  uiManager: UIManager;
  onGameOver: (data: GameOverData) => void;
  onLevelUp: () => void;
}

export function registerGameEventHandlers(deps: RegisterEventHandlersDeps): void {
  const { gameEngine, audioManager, animationEngine, renderer, uiManager, onGameOver, onLevelUp } =
    deps;

  gameEngine.addEventListener(GameEventType.LINE_CLEARED, (event) => {
    audioManager.play('lineClear');
    const data = event.data as { count: number };
    animationEngine.animateLineClear([data.count], renderer.getCellSize());
  });

  gameEngine.addEventListener(GameEventType.LEVEL_UP, (event) => {
    audioManager.play('levelUp');
    animationEngine.animateLevelUp(renderer.getCanvas());
    const data = event.data as { level: number };
    uiManager.showNotification(i18n.t('messages.levelUp', { level: data.level }), 'success', 2000);
    onLevelUp();
  });

  gameEngine.addEventListener(GameEventType.GAME_OVER, (event) => {
    audioManager.play('gameOver');
    animationEngine.animateGameOver(renderer.getCanvas());
    const data = event.data as GameOverData;
    onGameOver(data);
  });

  gameEngine.addEventListener(GameEventType.GAME_PAUSED, () => uiManager.showPause());
  gameEngine.addEventListener(GameEventType.GAME_RESUMED, () => uiManager.hidePause());

  gameEngine.addEventListener(GameEventType.TIME_WARNING, (event) => {
    const data = event.data as { secondsRemaining: number };
    uiManager.showTimeWarning(data.secondsRemaining);
  });

  gameEngine.addEventListener(GameEventType.TIME_UP, () => {
    uiManager.showNotification(i18n.t('messages.timeUp'), 'error', 3000);
  });
}
