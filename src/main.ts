/**
 * Main entry point for Tetris V2
 */

import { GameEventType, GameMode } from '@/types/index';
import { APP_VERSION, MAX_HIGH_SCORES } from '@constants/config';
import { GameEngine } from '@core/GameEngine';
import { i18n } from '@i18n/i18n';
import { InputHandler } from '@input/InputHandler';
import { AnimationEngine } from '@rendering/AnimationEngine';
import { CanvasRenderer } from '@rendering/CanvasRenderer';
import { ThemeManager } from '@rendering/ThemeManager';
import { AudioManager } from '@ui/AudioManager';
import { FPSCounter } from '@ui/FPSCounter';
import { HighScoreManager } from '@ui/HighScoreManager';
import { MusicCredits, MusicManager } from '@ui/MusicManager';
import { UIManager } from '@ui/UIManager';
import './styles/main.scss';

/**
 * Debounce utility function
 */
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

class TetrisGame {
  private gameEngine!: GameEngine;
  private renderer!: CanvasRenderer;
  private animationEngine!: AnimationEngine;
  private themeManager!: ThemeManager;
  private inputHandler!: InputHandler;
  private uiManager!: UIManager;
  private audioManager!: AudioManager;
  private highScoreManager!: HighScoreManager;
  private musicManager!: MusicManager;
  private fpsCounter!: FPSCounter;

  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private resizeHandler!: () => void;
  private currentMode: GameMode = GameMode.CLASSIC; // Store current game mode

  constructor() {
    this.init().catch(console.error);
  }

  private async init(): Promise<void> {
    // Initialize i18n
    await i18n.init();

    // Initialize managers
    this.themeManager = new ThemeManager();
    this.themeManager.loadSavedTheme();

    this.uiManager = new UIManager();
    this.audioManager = new AudioManager();
    this.highScoreManager = new HighScoreManager();

    // Initialize music manager with Pixabay music
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

    // Setup music credits display
    this.setupMusicCredits();

    // Initialize HTML translations
    this.initializeHTMLTranslations();

    // Setup language toggle (after translations are initialized)
    this.setupLanguageToggle();

    // Initialize canvas renderer
    const canvas = document.getElementById('tetris') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    this.renderer = new CanvasRenderer(canvas);
    this.animationEngine = new AnimationEngine();

    // Setup responsive canvas
    this.setupResponsiveCanvas();

    // Setup music toggle button
    this.setupMusicToggle();

    // Setup pause modal buttons
    this.setupPauseModalButtons();

    // Display default high scores (Classic mode)
    this.updateHighScoresDisplay(GameMode.CLASSIC);

    // Show mode selection
    this.showModeSelection();
  }

  /**
   * Setup language toggle button
   */
  private setupLanguageToggle(): void {
    const languageButton = document.getElementById('language-toggle');
    if (!languageButton) {
      return;
    }

    // Update button display based on current language
    this.updateLanguageButton();

    // Add click handler
    languageButton.addEventListener('click', () => {
      void (async (): Promise<void> => {
        const currentLocale = i18n.getLocale();
        const newLocale = currentLocale === 'en' ? 'fr' : 'en';

        await i18n.setLocale(newLocale);
        this.updateLanguageButton();
        this.initializeHTMLTranslations(); // Re-translate all elements first
        this.updateModalsTranslations(); // Then update modals (overrides data-i18n with proper emoji handling)
        this.setupMusicCredits(); // Update credits if needed
      })();
    });
  }

  /**
   * Update language button display
   */
  private updateLanguageButton(): void {
    const languageFlag = document.getElementById('language-flag');
    const languageText = document.getElementById('language-text');
    const currentLocale = i18n.getLocale();

    if (languageFlag) {
      languageFlag.textContent = currentLocale === 'en' ? '🇬🇧' : '🇫🇷';
    }

    if (languageText) {
      languageText.textContent = i18n.t('settings.language');
    }
  }

  /**
   * Update modals translations
   */
  private updateModalsTranslations(): void {
    // Update mode selection modal if it exists
    const modeModal = document.getElementById('mode-select-modal');
    if (modeModal) {
      const title = modeModal.querySelector('.modal-title');
      const subtitle = modeModal.querySelector('.modal-subtitle');
      const description = modeModal.querySelector('.modal-description');
      const sectionTitle = modeModal.querySelector('.modal-section-title');
      const classicTitle = modeModal.querySelector('#mode-classic .mode-title');
      const classicDesc = modeModal.querySelector('#mode-classic .mode-desc');
      const ultraTitle = modeModal.querySelector('#mode-ultra .mode-title');
      const ultraDesc = modeModal.querySelector('#mode-ultra .mode-desc');
      const controlsHint = modeModal.querySelector('.modal-controls-hint p');
      const closeButton = modeModal.querySelector('.modal-close');

      if (title) title.textContent = i18n.t('game.title');
      if (subtitle) subtitle.textContent = i18n.t('game.subtitle', { version: APP_VERSION });
      if (description) description.textContent = i18n.t('game.description');
      if (sectionTitle) sectionTitle.textContent = i18n.t('modes.selectMode');
      if (classicTitle) classicTitle.textContent = i18n.t('modes.classic');
      if (classicDesc) classicDesc.textContent = i18n.t('modes.classicDesc');
      if (ultraTitle) ultraTitle.textContent = i18n.t('modes.ultra');
      if (ultraDesc) ultraDesc.textContent = i18n.t('modes.ultraDesc');
      if (controlsHint) controlsHint.textContent = `💡 ${i18n.t('messages.controlsHint')}`;
      if (closeButton) closeButton.setAttribute('aria-label', i18n.t('buttons.close'));
    }

    // Update pause modal
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) {
      const pauseTitle = pauseModal.querySelector('h2');
      const pauseDesc = pauseModal.querySelector('p');
      const continueBtn = pauseModal.querySelector('#continue-button');
      const restartBtn = pauseModal.querySelector('#restart-from-pause-button');
      const closeBtn = pauseModal.querySelector('.modal-close');

      if (pauseTitle) pauseTitle.textContent = i18n.t('messages.paused');
      if (pauseDesc) pauseDesc.textContent = i18n.t('messages.pausedDescription');
      if (continueBtn) continueBtn.textContent = `▶️ ${i18n.t('buttons.continue')}`;
      if (restartBtn) restartBtn.textContent = `🔄 ${i18n.t('buttons.restart')}`;
      if (closeBtn) closeBtn.setAttribute('aria-label', i18n.t('buttons.close'));
    }

    // Update game over modal
    const gameOverModal = document.getElementById('game-over-modal');
    if (gameOverModal) {
      const gameOverTitle = gameOverModal.querySelector('h2');
      const playAgainBtn = gameOverModal.querySelector('#play-again-button');
      const closeBtn = gameOverModal.querySelector('.modal-close');
      const scoreLabel = gameOverModal.querySelector('.stats p:nth-child(1)');
      const linesLabel = gameOverModal.querySelector('.stats p:nth-child(2)');
      const levelLabel = gameOverModal.querySelector('.stats p:nth-child(3)');
      const timeLabel = gameOverModal.querySelector('.stats p:nth-child(4)');
      const enterNameLabel = gameOverModal.querySelector('#high-score-input-container label');
      const saveButton = gameOverModal.querySelector('#save-score-button');

      if (gameOverTitle) gameOverTitle.textContent = i18n.t('messages.gameOver');
      if (playAgainBtn) playAgainBtn.textContent = `🔄 ${i18n.t('buttons.playAgain')}`;
      if (closeBtn) closeBtn.setAttribute('aria-label', i18n.t('buttons.close'));
      if (enterNameLabel) enterNameLabel.textContent = i18n.t('messages.enterName');
      if (saveButton) saveButton.textContent = i18n.t('buttons.save');

      // Update labels while preserving the score values
      if (scoreLabel) {
        const scoreValue = scoreLabel.querySelector('#game-over-score')?.textContent || '0';
        scoreLabel.innerHTML = `<span data-i18n="results.finalScore">${i18n.t('results.finalScore')}:</span> <span id="game-over-score">${scoreValue}</span>`;
      }
      if (linesLabel) {
        const linesValue = linesLabel.querySelector('#game-over-lines')?.textContent || '0';
        linesLabel.innerHTML = `<span data-i18n="results.totalLines">${i18n.t('results.totalLines')}:</span> <span id="game-over-lines">${linesValue}</span>`;
      }
      if (levelLabel) {
        const levelValue = levelLabel.querySelector('#game-over-level')?.textContent || '0';
        levelLabel.innerHTML = `<span data-i18n="results.finalLevel">${i18n.t('results.finalLevel')}:</span> <span id="game-over-level">${levelValue}</span>`;
      }
      if (timeLabel) {
        const timeValue = timeLabel.querySelector('#game-over-time')?.textContent || '0:00';
        timeLabel.innerHTML = `<span data-i18n="results.playTime">${i18n.t('results.playTime')}:</span> <span id="game-over-time">${timeValue}</span>`;
      }
    }
  }

  /**
   * Initialize translations for static HTML elements
   */
  private initializeHTMLTranslations(): void {
    // Find all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const translation = i18n.t(key);
        if (element instanceof HTMLElement) {
          // Skip buttons that will be handled by updateModalsTranslations
          if (
            element.id === 'restart-from-pause-button' ||
            element.id === 'continue-button' ||
            element.id === 'play-again-button'
          ) {
            return; // Skip these, they're handled by updateModalsTranslations
          }

          // Preserve emoji prefix if present in original text
          const currentText = element.textContent || '';
          // Match emojis at the start of the text
          const emojiMatch = currentText.match(/^([\p{Emoji}\s]+)/u);
          if (emojiMatch && emojiMatch[1]) {
            // For buttons and links, keep normal case; for headings, use uppercase
            if (element.tagName === 'BUTTON' || element.tagName === 'A') {
              element.textContent = emojiMatch[1].trim() + ' ' + translation;
            } else {
              element.textContent = emojiMatch[1].trim() + ' ' + translation.toUpperCase();
            }
          } else {
            // Check if it's a heading that should be uppercase
            if (element.tagName === 'H2' || element.tagName === 'H3') {
              element.textContent = translation.toUpperCase();
            } else {
              element.textContent = translation;
            }
          }
        }
      }
    });

    // Handle data-i18n-title for title attributes
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach((element) => {
      const key = element.getAttribute('data-i18n-title');
      if (key && element instanceof HTMLElement) {
        element.title = i18n.t(key);
      }
    });

    // Handle data-i18n-aria-label for aria-label attributes
    const ariaLabelElements = document.querySelectorAll('[data-i18n-aria-label]');
    ariaLabelElements.forEach((element) => {
      const key = element.getAttribute('data-i18n-aria-label');
      if (key && element instanceof HTMLElement) {
        element.setAttribute('aria-label', i18n.t(key));
      }
    });
  }

  /**
   * Setup music credits display in footer
   */
  private setupMusicCredits(): void {
    const creditsElement = document.getElementById('music-credits');
    if (!creditsElement) {
      return;
    }

    const credits = this.musicManager.getCredits();

    // Only show credits if using MP3 with credits
    if (credits && this.musicManager.isUsingMp3()) {
      const creditsText = creditsElement.querySelector('.credits-text');
      if (creditsText) {
        let creditsHtml = `<span>${i18n.t('credits.music')}: `;

        if (credits.author) {
          creditsHtml += `${i18n.t('credits.musicBy')} ${credits.author} `;
        }

        creditsHtml += `(${credits.source})`;

        if (credits.licenseUrl) {
          creditsHtml += ` - <a href="${credits.licenseUrl}" target="_blank" rel="noopener noreferrer">${credits.license}</a>`;
        } else if (credits.license) {
          creditsHtml += ` - ${credits.license}`;
        }

        if (credits.trackUrl) {
          creditsHtml += ` - <a href="${credits.trackUrl}" target="_blank" rel="noopener noreferrer">${i18n.t('credits.musicSource')}</a>`;
        }

        creditsHtml += '</span>';
        creditsText.innerHTML = creditsHtml;
        creditsElement.style.display = 'block';
      }
    } else {
      creditsElement.style.display = 'none';
    }
  }

  /**
   * Setup responsive canvas resize handler
   */
  private setupResponsiveCanvas(): void {
    // Initial auto-resize
    this.renderer.autoResize();

    // Setup debounced resize handler
    this.resizeHandler = debounce(() => {
      this.renderer.autoResize();

      // Re-render current state if game is active
      if (this.gameEngine) {
        const state = this.gameEngine.getState();
        const ghostPiece = this.gameEngine.getGhostPosition();
        this.renderer.render(state.board, state.currentPiece, ghostPiece);
      }
    }, 250);

    // Listen to window resize and orientation change
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('orientationchange', this.resizeHandler);
  }

  private setupMusicToggle(): void {
    const musicButton = document.getElementById('music-toggle');
    if (musicButton) {
      musicButton.addEventListener('click', () => {
        this.musicManager.toggle();
        const isPlaying = this.musicManager.isCurrentlyPlaying();

        // Update icon
        const icon = musicButton.querySelector('.iconify');
        if (icon) {
          icon.setAttribute('data-icon', isPlaying ? 'mdi:music' : 'mdi:music-off');
        }

        // Toggle class
        if (isPlaying) {
          musicButton.classList.add('active');
          musicButton.classList.remove('muted');
        } else {
          musicButton.classList.remove('active');
          musicButton.classList.add('muted');
        }
      });

      // Set initial state (music off by default)
      musicButton.classList.add('muted');
      const icon = musicButton.querySelector('.iconify');
      if (icon) {
        icon.setAttribute('data-icon', 'mdi:music-off');
      }
    }

    // Setup sound toggle
    const soundButton = document.getElementById('sound-toggle');
    let soundEnabled = true;
    if (soundButton) {
      soundButton.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        this.audioManager.setEnabled(soundEnabled);

        // Update icon
        const icon = soundButton.querySelector('.iconify');
        if (icon) {
          icon.setAttribute('data-icon', soundEnabled ? 'mdi:volume-high' : 'mdi:volume-off');
        }

        // Toggle class
        if (soundEnabled) {
          soundButton.classList.add('active');
          soundButton.classList.remove('muted');
        } else {
          soundButton.classList.remove('active');
          soundButton.classList.add('muted');
        }
      });

      // Set initial state
      soundButton.classList.add('active');
    }
  }

  /**
   * Setup pause modal buttons (Continue and Restart)
   */
  private setupPauseModalButtons(): void {
    // Continue button
    const continueButton = document.getElementById('continue-button');
    if (continueButton) {
      continueButton.addEventListener('click', () => {
        if (this.gameEngine) {
          this.gameEngine.togglePause(); // This will resume if paused
        }
      });
    }

    // Restart button from pause modal
    const restartFromPauseButton = document.getElementById('restart-from-pause-button');
    if (restartFromPauseButton) {
      restartFromPauseButton.addEventListener('click', () => {
        if (this.gameEngine) {
          // Hide pause modal first
          this.uiManager.hidePause();
          // Restart game with current mode
          this.restart(this.currentMode);
        }
      });
    }

    // Close button in pause modal (also resumes)
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) {
      const closeButton = pauseModal.querySelector('.modal-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          if (this.gameEngine) {
            this.gameEngine.togglePause(); // This will resume if paused
          }
        });
      }
    }
  }

  private showModeSelection(): void {
    // Create mode selection modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'mode-select-modal';

    modal.innerHTML = `
      <div class="modal-content start-modal">
        <button class="modal-close" aria-label="${i18n.t('buttons.close')}">&times;</button>
        <div class="modal-logo">
          <img src="/icons/android-chrome-192x192.png" alt="Tetris" style="width: 80px; height: 80px; margin: 0 auto 1rem;">
        </div>
        <h2 class="modal-title">${i18n.t('game.title')}</h2>
        <p class="modal-subtitle">${i18n.t('game.subtitle', { version: APP_VERSION })}</p>
        <p class="modal-description">
          ${i18n.t('game.description')}
        </p>
        <h3 class="modal-section-title">${i18n.t('modes.selectMode')}</h3>
        <div class="modal-buttons">
          <button class="game-button mode-button" id="mode-classic">
            <span class="mode-icon">🎮</span>
            <span class="mode-title">${i18n.t('modes.classic')}</span>
            <span class="mode-desc">${i18n.t('modes.classicDesc')}</span>
          </button>
          <button class="game-button mode-button" id="mode-ultra">
            <span class="mode-icon">⚡</span>
            <span class="mode-title">${i18n.t('modes.ultra')}</span>
            <span class="mode-desc">${i18n.t('modes.ultraDesc')}</span>
          </button>
        </div>
        <div class="modal-controls-hint">
          <p style="font-size: 0.7rem; opacity: 0.7; margin-top: 1.5rem;">
            💡 ${i18n.t('messages.controlsHint')}
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close button handler - just hide, don't remove so game can still be started
    const closeButton = modal.querySelector('.modal-close');
    closeButton?.addEventListener('click', () => {
      modal.classList.remove('active');
      modal.style.display = 'none';
    });

    document.getElementById('mode-classic')?.addEventListener('click', () => {
      void this.startGame(GameMode.CLASSIC);
      modal.remove();
    });

    document.getElementById('mode-ultra')?.addEventListener('click', () => {
      void this.startGame(GameMode.ULTRA);
      modal.remove();
    });
  }

  private async startGame(mode: GameMode): Promise<void> {
    // Store current mode
    this.currentMode = mode;

    // Initialize game engine
    this.gameEngine = new GameEngine(mode);

    // Hide all modals
    this.uiManager.hidePause();
    this.uiManager.hideModal('game-over-modal');

    // Display high scores for current mode
    this.updateHighScoresDisplay(mode);

    // Resume audio contexts (required for mobile browsers after user interaction)
    try {
      await Promise.all([
        this.audioManager.resumeAudioContext(),
        this.musicManager.resumeAudioContext(),
      ]);

      // Notify user on mobile that audio is now enabled
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

    // Initialize input handler
    this.inputHandler = new InputHandler();

    // Setup input callbacks
    this.inputHandler.on('moveLeft', () => {
      if (this.gameEngine.moveLeft()) {
        this.audioManager.play('move');
      }
    });

    this.inputHandler.on('moveRight', () => {
      if (this.gameEngine.moveRight()) {
        this.audioManager.play('move');
      }
    });

    this.inputHandler.on('moveDown', () => {
      this.gameEngine.moveDown();
      this.audioManager.play('move');
    });

    this.inputHandler.on('rotate', () => {
      if (this.gameEngine.rotate()) {
        this.audioManager.play('rotate');
      }
    });

    this.inputHandler.on('hardDrop', () => {
      this.gameEngine.hardDrop();
      this.audioManager.play('drop');
    });

    this.inputHandler.on('hold', () => {
      if (this.gameEngine.hold()) {
        this.audioManager.play('hold');
      }
    });

    this.inputHandler.on('pause', () => {
      this.gameEngine.togglePause();
    });

    this.inputHandler.on('restart', () => {
      this.restart(mode);
    });

    // Setup game event listeners
    this.gameEngine.addEventListener(GameEventType.LINE_CLEARED, (event) => {
      this.audioManager.play('lineClear');
      const data = event.data as { count: number };
      this.animationEngine.animateLineClear([data.count], this.renderer.getCellSize());
    });

    this.gameEngine.addEventListener(GameEventType.LEVEL_UP, (event) => {
      this.audioManager.play('levelUp');
      this.animationEngine.animateLevelUp(this.renderer['canvas']);
      const data = event.data as { level: number };
      const message = i18n.t('messages.levelUp', { level: data.level });
      this.uiManager.showNotification(message, 'success', 2000);
    });

    this.gameEngine.addEventListener(GameEventType.GAME_OVER, (event) => {
      this.audioManager.play('gameOver');
      this.animationEngine.animateGameOver(this.renderer['canvas']);

      const data = event.data as { score: number; lines: number; level: number; duration: number };
      this.handleGameOver(data);
    });

    this.gameEngine.addEventListener(GameEventType.GAME_PAUSED, () => {
      this.uiManager.showPause();
    });

    this.gameEngine.addEventListener(GameEventType.GAME_RESUMED, () => {
      this.uiManager.hidePause();
    });

    this.gameEngine.addEventListener(GameEventType.TIME_WARNING, (event) => {
      const data = event.data as { secondsRemaining: number };
      this.uiManager.showTimeWarning(data.secondsRemaining);
    });

    this.gameEngine.addEventListener(GameEventType.TIME_UP, () => {
      this.uiManager.showNotification(i18n.t('messages.timeUp'), 'error', 3000);
    });

    // Start game loop
    this.startGameLoop();
  }

  private startGameLoop(): void {
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    // Update FPS counter
    this.fpsCounter.update();

    // Update game engine
    this.gameEngine.update(deltaTime);

    // Update animations
    this.animationEngine.update(deltaTime);

    // Get game state
    const state = this.gameEngine.getState();

    // Update UI
    this.uiManager.updateGameStats(state, this.gameEngine.getElapsedTime());

    // Render
    const ghostPiece = this.gameEngine.getGhostPosition();
    this.renderer.render(state.board, state.currentPiece, ghostPiece);

    // Render animations
    const ctx = this.renderer['ctx'];
    this.animationEngine.render(ctx);

    // Render preview pieces
    if (state.nextPiece) {
      const nextCanvas = document.getElementById('next-canvas') as HTMLCanvasElement;
      if (nextCanvas) {
        this.renderer.drawPreviewPiece(state.nextPiece, nextCanvas);
      }
    }

    if (state.holdPiece) {
      const holdCanvas = document.getElementById('hold-canvas') as HTMLCanvasElement;
      if (holdCanvas) {
        this.renderer.drawPreviewPiece(state.holdPiece, holdCanvas);
      }
    }

    this.lastFrameTime = currentTime;
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private handleGameOver(data: {
    score: number;
    lines: number;
    level: number;
    duration: number;
  }): void {
    // Stop music on game over
    this.musicManager.stop();

    const mode = this.gameEngine.getState().gameMode;

    // Check if it's a high score
    const isHighScore = this.highScoreManager.isHighScore(mode, data.score);

    // Get minimum score required for top 10
    const scores = this.highScoreManager.getHighScores(mode);
    const lastScore = scores.length >= MAX_HIGH_SCORES ? scores[scores.length - 1] : null;
    const minScoreRequired = lastScore ? lastScore.score + 1 : 0;

    // Debug log (removed for production)

    // Show game over modal
    setTimeout(() => {
      this.uiManager.showGameOver(
        data.score,
        data.lines,
        data.level,
        data.duration,
        isHighScore,
        minScoreRequired
      );

      // Update not high score message if needed
      if (!isHighScore && minScoreRequired > 0) {
        const notHighScoreText = document.getElementById('not-high-score-text');
        if (notHighScoreText) {
          notHighScoreText.textContent = i18n.t('messages.notHighScore', {
            minScore: minScoreRequired.toString(),
          });
        }
      }

      // Setup high score input (always show, even if not a high score)
      // Use a small delay to ensure modal is fully rendered
      setTimeout(() => {
        this.setupHighScoreInput(mode, data.score, data.lines, data.level, isHighScore);
      }, 100);

      // Setup "Play Again" button
      this.setupPlayAgainButton();
    }, 1500);
  }

  /**
   * Setup high score input in game over modal
   */
  private setupHighScoreInput(
    mode: GameMode,
    score: number,
    lines: number,
    level: number,
    isHighScore: boolean = false
  ): void {
    const inputContainer = document.getElementById('high-score-input-container');
    const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
    const saveButton = document.getElementById('save-score-button');

    if (!inputContainer || !nameInput || !saveButton) {
      return;
    }

    // Remove any existing event listeners by cloning the button
    const newSaveButton = saveButton.cloneNode(true) as HTMLButtonElement;
    saveButton.parentNode?.replaceChild(newSaveButton, saveButton);

    // Show input container (force display)
    inputContainer.style.display = 'block';

    // Update label based on whether it's a high score
    const label = inputContainer.querySelector('label');
    if (label) {
      if (isHighScore) {
        label.textContent = i18n.t('messages.enterName');
      } else {
        label.textContent = i18n.t('messages.saveLastAttempt');
      }
    }

    // Clear input
    nameInput.value = '';

    // Focus on input
    setTimeout(() => {
      nameInput.focus();
      nameInput.select();
    }, 150);

    // Handle Enter key on input
    const handleEnter = (e: KeyboardEvent): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        newSaveButton.click();
      }
    };

    nameInput.addEventListener('keydown', handleEnter);

    // Handle save button click
    const handleSave = (): void => {
      const playerName = nameInput.value.trim().toUpperCase() || 'AAA';

      // Always save the score (even if not a high score, it will be saved as last attempt)
      const saved = this.highScoreManager.addHighScore(mode, playerName, score, lines, level);

      // Always save as last attempt (even if it's a high score, to track the most recent)
      this.highScoreManager.saveLastAttempt(mode, playerName, score, lines, level);

      if (!saved && isHighScore) {
        this.uiManager.showNotification('Failed to save high score', 'error', 3000);
        return;
      }

      // Update high scores display (will show last attempt if not in top 10)
      this.updateHighScoresDisplay(mode);

      // Hide input container
      inputContainer.style.display = 'none';

      // Show appropriate message
      if (isHighScore) {
        // Get translated mode name
        const modeKey = mode === GameMode.CLASSIC ? 'modes.classic' : 'modes.ultra';
        const modeName = i18n.t(modeKey);
        const message = i18n.t('messages.newHighScore', {
          score: Math.round(score).toString(),
          mode: modeName,
        });
        this.uiManager.showNotification(message, 'success', 3000);
      } else {
        // Score saved but not in top 10
        const message = i18n.t('messages.scoreSaved', {
          score: Math.round(score).toString(),
        });
        this.uiManager.showNotification(message, 'success', 3000);
      }

      // Remove event listeners
      nameInput.removeEventListener('keydown', handleEnter);
      newSaveButton.removeEventListener('click', handleSave);
    };

    newSaveButton.addEventListener('click', handleSave);
  }

  /**
   * Setup Play Again button after game over
   */
  private setupPlayAgainButton(): void {
    const playAgainButton = document.getElementById('play-again-button');
    if (playAgainButton) {
      // Remove existing listeners
      const newButton = playAgainButton.cloneNode(true) as HTMLElement;
      playAgainButton.parentNode?.replaceChild(newButton, playAgainButton);

      // Ensure translation is applied after cloning
      newButton.textContent = `🔄 ${i18n.t('buttons.playAgain')}`;

      // Add new listener
      newButton.addEventListener('click', () => {
        // Hide game over modal
        this.uiManager.hideModal('game-over-modal');

        // Restart game with same mode
        this.restart(this.currentMode);
      });
    }
  }

  private updateHighScoresDisplay(mode: GameMode): void {
    const highScoresElement = document.getElementById('highScores');
    const modeElement = document.getElementById('highscores-mode');

    if (highScoresElement) {
      this.highScoreManager.renderHighScores(mode, highScoresElement);
    }

    // Update mode label
    if (modeElement) {
      const modeLabel = mode === GameMode.CLASSIC ? 'Classic Mode' : 'Ultra Mode';
      modeElement.textContent = modeLabel;
    }
  }

  private restart(mode: GameMode): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationEngine.clearAll();
    this.gameEngine.restart(mode);
    this.startGameLoop();
  }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TetrisGame();
});
