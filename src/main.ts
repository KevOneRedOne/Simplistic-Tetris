/**
 * Main entry point for Tetris V2
 */

import './styles/main.scss';
import { GameEngine } from '@core/GameEngine';
import { CanvasRenderer } from '@rendering/CanvasRenderer';
import { AnimationEngine } from '@rendering/AnimationEngine';
import { ThemeManager } from '@rendering/ThemeManager';
import { InputHandler } from '@input/InputHandler';
import { UIManager } from '@ui/UIManager';
import { AudioManager } from '@ui/AudioManager';
import { HighScoreManager } from '@ui/HighScoreManager';
import { MusicManager } from '@ui/MusicManager';
import { FPSCounter } from '@ui/FPSCounter';
import { i18n } from '@i18n/i18n';
import { GameEventType, GameMode } from '@/types/index';

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
    this.musicManager = new MusicManager();
    this.fpsCounter = new FPSCounter();
    
    // Initialize canvas renderer
    const canvas = document.getElementById('tetris') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    
    this.renderer = new CanvasRenderer(canvas);
    this.animationEngine = new AnimationEngine();
    
    // Setup music toggle button
    this.setupMusicToggle();
    
    // Display default high scores (Classic mode)
    this.updateHighScoresDisplay(GameMode.CLASSIC);
    
    // Show mode selection
    this.showModeSelection();
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
      
      // Set initial state
      musicButton.classList.add('active');
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
  
  private showModeSelection(): void {
    // Create mode selection modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'mode-select-modal';
    
    modal.innerHTML = `
      <div class="modal-content start-modal">
        <button class="modal-close" aria-label="Close">&times;</button>
        <div class="modal-logo">
          <img src="/tetris128px.png" alt="Tetris" style="width: 80px; height: 80px; margin: 0 auto 1rem;">
        </div>
        <h2 class="modal-title">${i18n.t('game.title')}</h2>
        <p class="modal-subtitle">${i18n.t('game.subtitle')}</p>
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
      this.startGame(GameMode.CLASSIC);
      modal.remove();
    });
    
    document.getElementById('mode-ultra')?.addEventListener('click', () => {
      this.startGame(GameMode.ULTRA);
      modal.remove();
    });
  }
  
  private startGame(mode: GameMode): void {
    // Initialize game engine
    this.gameEngine = new GameEngine(mode);
    
    // Hide all modals
    this.uiManager.hidePause();
    this.uiManager.hideModal('game-over-modal');
    
    // Display high scores for current mode
    this.updateHighScoresDisplay(mode);
    
    // Start music
    this.musicManager.play();
    
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
    
    this.gameEngine.addEventListener(GameEventType.LEVEL_UP, () => {
      this.audioManager.play('levelUp');
      this.animationEngine.animateLevelUp(this.renderer['canvas']);
      this.uiManager.showNotification(i18n.t('messages.levelUp'), 'success', 2000);
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
  
  private handleGameOver(data: { score: number; lines: number; level: number; duration: number }): void {
    // Stop music on game over
    this.musicManager.stop();
    
    const mode = this.gameEngine.getState().gameMode;
    
    // Check if it's a high score
    if (this.highScoreManager.isHighScore(mode, data.score)) {
      const playerName = prompt(i18n.t('messages.enterName')) || 'AAA';
      this.highScoreManager.addHighScore(
        mode,
        playerName,
        data.score,
        data.lines,
        data.level
      );
      
      // Update high scores display
      this.updateHighScoresDisplay(mode);
      
      this.uiManager.showNotification(i18n.t('messages.newHighScore'), 'success', 3000);
    }
    
    // Show game over modal
    setTimeout(() => {
      this.uiManager.showGameOver(data.score, data.lines, data.level, data.duration);
    }, 1500);
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

