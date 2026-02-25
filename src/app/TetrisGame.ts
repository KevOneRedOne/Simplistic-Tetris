/**
 * Tetris application: orchestrates app init, GameSession (engine + loop + input), and UI flows.
 */

import { GameSession } from '@/app/session/GameSession';
import {
  initializeHTMLTranslations,
  setupLanguageToggle,
  setupMusicCredits,
} from '@/app/setup/domTranslations';
import { setupHighScoreForm, setupPlayAgainButton } from '@/app/setup/gameOverUI';
import { createModeSelectionModal } from '@/app/setup/modeSelectionModal';
import type { GameStateSnapshot, SettingsUIContext } from '@/app/setup/setupSettingsUI';
import { setupSettingsUI } from '@/app/setup/setupSettingsUI';
import { GameMode } from '@/types/index';
import { APP_VERSION, MAX_HIGH_SCORES } from '@constants/config';
import { i18n } from '@i18n/i18n';
import { AnimationEngine } from '@rendering/AnimationEngine';
import { CanvasRenderer } from '@rendering/CanvasRenderer';
import { ThemeManager } from '@rendering/ThemeManager';
import { AudioManager } from '@ui/AudioManager';
import { FPSCounter } from '@ui/FPSCounter';
import { HighScoreManager } from '@ui/HighScoreManager';
import { MusicCredits, MusicManager } from '@ui/MusicManager';
import { UIManager } from '@ui/UIManager';

function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>): void {
    const later = (): void => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export class TetrisGame {
  private session: GameSession | null = null;
  private renderer!: CanvasRenderer;
  private animationEngine!: AnimationEngine;
  private themeManager!: ThemeManager;
  private uiManager!: UIManager;
  private audioManager!: AudioManager;
  private highScoreManager!: HighScoreManager;
  private musicManager!: MusicManager;
  private fpsCounter!: FPSCounter;

  private resizeHandler!: () => void;
  private currentMode: GameMode = GameMode.CLASSIC;
  private displayedScoreMode: GameMode = GameMode.CLASSIC;

  constructor() {
    this.init().catch(console.error);
  }

  private async init(): Promise<void> {
    await i18n.init();

    this.themeManager = new ThemeManager();
    this.themeManager.loadSavedTheme();

    this.uiManager = new UIManager();
    this.audioManager = new AudioManager();
    this.highScoreManager = new HighScoreManager();

    const musicCredits: MusicCredits = {
      source: 'Pixabay',
      author: 'Gregor Quendel',
      license: 'Pixabay License',
      licenseUrl: 'https://pixabay.com/service/license-summary/',
      trackUrl:
        'https://pixabay.com/music/lullabies-tetris-theme-korobeiniki-rearranged-arr-for-music-box-184978/',
    };
    this.musicManager = new MusicManager(
      '/music/tetris-theme-korobeiniki-rearranged-arr-for-music-box-184978.mp3',
      musicCredits
    );

    this.fpsCounter = new FPSCounter();

    setupMusicCredits(this.musicManager);
    initializeHTMLTranslations();
    setupLanguageToggle({
      musicManager: this.musicManager,
      onLocaleChange: () => this.updateHighScoresDisplay(this.displayedScoreMode),
    });

    const canvas = document.getElementById('tetris') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    this.renderer = new CanvasRenderer(canvas);
    this.animationEngine = new AnimationEngine();

    this.setupResponsiveCanvas();

    setupSettingsUI(this.getSettingsUIContext());

    this.updateHighScoresDisplay(GameMode.CLASSIC);

    createModeSelectionModal({
      appVersion: APP_VERSION,
      onClassic: () => void this.startGame(GameMode.CLASSIC),
      onUltra: () => void this.startGame(GameMode.ULTRA),
    });
  }

  private getSettingsUIContext(): SettingsUIContext {
    return {
      renderer: this.renderer,
      uiManager: this.uiManager,
      highScoreManager: this.highScoreManager,
      musicManager: this.musicManager,
      audioManager: this.audioManager,
      animationEngine: this.animationEngine,
      getGameStateSnapshot: (): GameStateSnapshot | null => {
        const engine = this.session?.getEngine();
        if (!engine) return null;
        const state = engine.getState();
        const ghostPiece = engine.getGhostPosition();
        return {
          board: state.board,
          currentPiece: state.currentPiece,
          nextPiece: state.nextPiece,
          holdPiece: state.holdPiece,
          ghostPiece,
        };
      },
      getDisplayedScoreMode: () => this.displayedScoreMode,
      setDisplayedScoreMode: (mode: GameMode): void => {
        this.displayedScoreMode = mode;
      },
      updateHighScoresDisplay: (mode: GameMode) => this.updateHighScoresDisplay(mode),
      getCurrentMode: () => this.currentMode,
      restart: (mode: GameMode) => this.restart(mode),
      togglePause: () => this.session?.getEngine()?.togglePause(),
      onModeSelectionClick: (): void => {
        if (this.session) {
          this.session.quit();
          this.session = null;
        }
        this.uiManager.hidePause();
        const gameOverModal = document.getElementById('game-over-modal');
        if (gameOverModal) gameOverModal.style.display = 'none';
        const modeSelectModal = document.getElementById('mode-select-modal');
        if (modeSelectModal) modeSelectModal.style.display = 'none';
      },
    };
  }

  private setupResponsiveCanvas(): void {
    this.renderer.autoResize();

    this.resizeHandler = debounce(() => {
      this.renderer.autoResize();

      const engine = this.session?.getEngine();
      if (engine) {
        const state = engine.getState();
        const ghostPiece = engine.getGhostPosition();
        this.renderer.render(state.board, state.currentPiece, ghostPiece);
      }
    }, 250);

    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('orientationchange', this.resizeHandler);
  }

  private async startGame(mode: GameMode): Promise<void> {
    this.currentMode = mode;

    this.uiManager.hidePause();
    this.uiManager.hideModal('game-over-modal');

    this.updateHighScoresDisplay(this.displayedScoreMode);

    try {
      await Promise.all([
        this.audioManager.resumeAudioContext(),
        this.musicManager.resumeAudioContext(),
      ]);

      if ('ontouchstart' in window && window.innerWidth < 768) {
        this.uiManager.showNotification(
          i18n.t('messages.audioEnabled') || '🔊 Audio activé',
          'success',
          2000
        );
      }
    } catch (error) {
      console.warn('Failed to resume audio:', error);
    }

    this.musicManager.play();
    this.syncMusicButton();

    this.session = new GameSession({
      renderer: this.renderer,
      animationEngine: this.animationEngine,
      uiManager: this.uiManager,
      audioManager: this.audioManager,
      fpsCounter: this.fpsCounter,
      callbacks: {
        onGameOver: (data): void => this.handleGameOver(data),
        onRestart: (m): void => {
          this.session?.restart(m);
          this.musicManager.play();
          this.syncMusicButton();
        },
        onQuit: (): void => this.quit(),
      },
    });
    this.session.start(mode);
  }

  private handleGameOver(data: {
    score: number;
    lines: number;
    level: number;
    duration: number;
  }): void {
    this.musicManager.stop();

    const mode = this.session?.getEngine()?.getState().gameMode ?? GameMode.CLASSIC;

    const isHighScore = this.highScoreManager.isHighScore(mode, data.score);

    const scores = this.highScoreManager.getHighScores(mode);
    const lastScore = scores.length >= MAX_HIGH_SCORES ? scores[scores.length - 1] : null;
    const minScoreRequired = lastScore ? lastScore.score + 1 : 0;

    setTimeout(() => {
      this.uiManager.showGameOver(
        data.score,
        data.lines,
        data.level,
        data.duration,
        isHighScore,
        minScoreRequired
      );

      if (!isHighScore && minScoreRequired > 0) {
        const notHighScoreText = document.getElementById('not-high-score-text');
        if (notHighScoreText) {
          notHighScoreText.textContent = i18n.t('messages.notHighScore', {
            minScore: minScoreRequired.toString(),
          });
        }
      }

      setTimeout(() => {
        setupHighScoreForm({
          mode,
          score: data.score,
          lines: data.lines,
          level: data.level,
          isHighScore,
          highScoreManager: this.highScoreManager,
          uiManager: this.uiManager,
          displayedScoreMode: this.displayedScoreMode,
          onScoresUpdated: (m) => this.updateHighScoresDisplay(m),
        });
      }, 100);

      setupPlayAgainButton(() => {
        this.uiManager.hideModal('game-over-modal');
        this.restart(this.currentMode);
      });
    }, 1500);
  }

  private updateHighScoresDisplay(mode: GameMode): void {
    const highScoresElement = document.getElementById('highScores');
    const modeTextElement = document.getElementById('highscores-mode-text');

    if (highScoresElement) {
      this.highScoreManager.renderHighScores(mode, highScoresElement);
    }

    if (modeTextElement) {
      const modeLabel = mode === GameMode.CLASSIC ? i18n.t('modes.classic') : i18n.t('modes.ultra');
      modeTextElement.textContent = modeLabel;
    }
  }

  private restart(mode: GameMode): void {
    this.session?.restart(mode);
    this.musicManager.play();
    this.syncMusicButton();
  }

  private quit(): void {
    this.session?.quit();
    this.session = null;

    this.uiManager.hidePause();
    this.musicManager.stop();

    createModeSelectionModal({
      appVersion: APP_VERSION,
      onClassic: () => void this.startGame(GameMode.CLASSIC),
      onUltra: () => void this.startGame(GameMode.ULTRA),
    });
  }

  private syncMusicButton(): void {
    const musicButton = document.getElementById('music-toggle');
    if (musicButton) {
      musicButton.classList.add('active');
      musicButton.classList.remove('muted');
      const icon = musicButton.querySelector('.iconify');
      if (icon) {
        icon.setAttribute('data-icon', 'mdi:music');
      }
    }
  }
}
