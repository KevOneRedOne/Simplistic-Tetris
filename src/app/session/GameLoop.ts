/**
 * Game loop: runs update (engine + animations) and render (board, stats, previews) every frame.
 * Can be started and stopped; used by GameSession.
 */

import type { GameEngine } from '@core/GameEngine';
import type { AnimationEngine } from '@rendering/AnimationEngine';
import type { CanvasRenderer } from '@rendering/CanvasRenderer';
import type { UIManager } from '@ui/UIManager';
import type { FPSCounter } from '@ui/FPSCounter';

export interface GameLoopDeps {
  gameEngine: GameEngine;
  animationEngine: AnimationEngine;
  renderer: CanvasRenderer;
  uiManager: UIManager;
  fpsCounter: FPSCounter;
}

export class GameLoop {
  private deps: GameLoopDeps;
  private frameId: number | null = null;
  private lastFrameTime: number = 0;

  constructor(deps: GameLoopDeps) {
    this.deps = deps;
  }

  start(): void {
    this.lastFrameTime = performance.now();
    this.tick();
  }

  stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private tick = (): void => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    const { gameEngine, animationEngine, renderer, uiManager, fpsCounter } = this.deps;

    fpsCounter.update();

    gameEngine.update(deltaTime);
    animationEngine.update(deltaTime);

    const state = gameEngine.getState();
    uiManager.updateGameStats(state, gameEngine.getElapsedTime());

    const ghostPiece = gameEngine.getGhostPosition();
    renderer.render(state.board, state.currentPiece, ghostPiece);

    const ctx = renderer.getContext();
    animationEngine.render(ctx);

    if (state.nextPiece) {
      const nextCanvas = document.getElementById('next-canvas') as HTMLCanvasElement;
      if (nextCanvas) {
        renderer.drawPreviewPiece(state.nextPiece, nextCanvas);
      }
    }

    if (state.holdPiece) {
      const holdCanvas = document.getElementById('hold-canvas') as HTMLCanvasElement;
      if (holdCanvas) {
        renderer.drawPreviewPiece(state.holdPiece, holdCanvas);
      }
    }

    this.lastFrameTime = currentTime;
    this.frameId = requestAnimationFrame(this.tick);
  };
}
