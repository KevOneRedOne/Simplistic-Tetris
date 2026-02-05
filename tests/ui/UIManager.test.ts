import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UIManager } from '../../src/ui/UIManager';
import { GameMode } from '../../src/types/index';
import type { GameState } from '../../src/types/index';

describe('UIManager', () => {
  let manager: UIManager;

  beforeEach(() => {
    // Create DOM elements for testing
    document.body.innerHTML = `
      <div id="score">0</div>
      <div id="lines">0</div>
      <div id="level">0</div>
      <div id="timer">0:00</div>
      <div id="mode">CLASSIC</div>
      <canvas id="next-canvas"></canvas>
      <canvas id="hold-canvas"></canvas>
      <div id="game-over-modal" class="modal">
        <div id="game-over-score">0</div>
        <div id="game-over-lines">0</div>
        <div id="game-over-level">0</div>
        <div id="game-over-time">0:00</div>
        <div id="high-score-input-container"></div>
        <input id="player-name-input" />
        <div id="not-high-score-message"></div>
        <div id="not-high-score-text"></div>
        <button class="modal-close">×</button>
      </div>
      <div id="pause-modal" class="modal">
        <button class="modal-close">×</button>
      </div>
      <div id="mode-select-modal" class="modal"></div>
      <div id="settings-modal" class="modal"></div>
    `;

    manager = new UIManager();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should initialize and cache elements', () => {
      expect(manager).toBeInstanceOf(UIManager);
    });

    it('should refresh cache', () => {
      expect(() => manager.refreshCache()).not.toThrow();
    });
  });

  describe('Score Updates', () => {
    it('should update score display', () => {
      manager.updateScore(1234);
      const scoreElement = document.getElementById('score');
      expect(scoreElement?.textContent).toBe('1234');
    });

    it('should round score to integer', () => {
      manager.updateScore(1234.56);
      const scoreElement = document.getElementById('score');
      expect(scoreElement?.textContent).toBe('1235');
    });

    it('should handle zero score', () => {
      manager.updateScore(0);
      const scoreElement = document.getElementById('score');
      expect(scoreElement?.textContent).toBe('0');
    });
  });

  describe('Lines Updates', () => {
    it('should update lines display', () => {
      manager.updateLines(42);
      const linesElement = document.getElementById('lines');
      expect(linesElement?.textContent).toBe('42');
    });
  });

  describe('Level Updates', () => {
    it('should update level display', () => {
      manager.updateLevel(5);
      const levelElement = document.getElementById('level');
      expect(levelElement?.textContent).toBe('5');
    });
  });

  describe('Timer Updates', () => {
    it('should update timer display', () => {
      manager.updateTimer(65); // 1:05
      const timerElement = document.getElementById('timer');
      expect(timerElement?.textContent).toBeTruthy();
    });

    it('should format time correctly', () => {
      manager.updateTimer(125); // 2:05
      const timerElement = document.getElementById('timer');
      const text = timerElement?.textContent;
      expect(text).toMatch(/\d+:\d{2}/); // Matches M:SS format
    });
  });

  describe('Mode Updates', () => {
    it('should update mode display', () => {
      manager.updateMode(GameMode.ULTRA);
      const modeElement = document.getElementById('mode');
      expect(modeElement?.textContent).toBe('ULTRA');
    });

    it('should update to classic mode', () => {
      manager.updateMode(GameMode.CLASSIC);
      const modeElement = document.getElementById('mode');
      expect(modeElement?.textContent).toBe('CLASSIC');
    });
  });

  describe('Game Stats Updates', () => {
    it('should update all game stats at once', () => {
      const gameState: GameState = {
        board: [],
        currentPiece: null,
        nextPiece: null,
        holdPiece: null,
        canHold: true,
        score: 5000,
        lines: 25,
        level: 3,
        isGameOver: false,
        isPaused: false,
        gameMode: GameMode.ULTRA,
      };

      manager.updateGameStats(gameState, 60);

      expect(document.getElementById('score')?.textContent).toBe('5000');
      expect(document.getElementById('lines')?.textContent).toBe('25');
      expect(document.getElementById('level')?.textContent).toBe('3');
      expect(document.getElementById('mode')?.textContent).toBe('ULTRA');
    });
  });

  describe('Modal Management', () => {
    it('should show modal', () => {
      manager.showModal('game-over-modal');
      const modal = document.getElementById('game-over-modal');
      expect(modal?.classList.contains('active')).toBe(true);
      expect(modal?.style.display).toBe('flex');
    });

    it('should hide modal', () => {
      manager.showModal('game-over-modal');
      manager.hideModal('game-over-modal');
      const modal = document.getElementById('game-over-modal');
      expect(modal?.classList.contains('active')).toBe(false);
      expect(modal?.style.display).toBe('none');
    });

    it('should prevent background scroll when modal is shown', () => {
      manager.showModal('game-over-modal');
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore background scroll when all modals are hidden', () => {
      manager.showModal('game-over-modal');
      manager.hideModal('game-over-modal');
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Game Over Modal', () => {
    it('should show game over modal with stats', () => {
      manager.showGameOver(5000, 25, 3, 60);

      expect(document.getElementById('game-over-score')?.textContent).toBe('5000');
      expect(document.getElementById('game-over-lines')?.textContent).toBe('25');
      expect(document.getElementById('game-over-level')?.textContent).toBe('3');
    });

    it('should show game over modal for high score', () => {
      manager.showGameOver(10000, 50, 5, 120, true);

      const inputContainer = document.getElementById('high-score-input-container');
      expect(inputContainer?.style.display).toBe('block');
    });

    it('should show not high score message when applicable', () => {
      manager.showGameOver(100, 5, 1, 30, false, 500);

      const notHighScoreMessage = document.getElementById('not-high-score-message');
      expect(notHighScoreMessage?.style.display).toBe('block');
    });

    it('should hide not high score message for high scores', () => {
      manager.showGameOver(10000, 50, 5, 120, true);

      const notHighScoreMessage = document.getElementById('not-high-score-message');
      expect(notHighScoreMessage?.style.display).toBe('none');
    });
  });

  describe('Pause Modal', () => {
    it('should show pause modal', () => {
      manager.showPause();
      const modal = document.getElementById('pause-modal');
      expect(modal?.classList.contains('active')).toBe(true);
    });

    it('should hide pause modal', () => {
      manager.showPause();
      manager.hidePause();
      const modal = document.getElementById('pause-modal');
      expect(modal?.classList.contains('active')).toBe(false);
    });
  });

  describe('Mode Selection Modal', () => {
    it('should show mode select modal', () => {
      manager.showModeSelect();
      const modal = document.getElementById('mode-select-modal');
      expect(modal?.classList.contains('active')).toBe(true);
    });

    it('should hide mode select modal', () => {
      manager.showModeSelect();
      manager.hideModeSelect();
      const modal = document.getElementById('mode-select-modal');
      expect(modal?.classList.contains('active')).toBe(false);
    });
  });

  describe('Settings Modal', () => {
    it('should show settings modal', () => {
      manager.showSettings();
      const modal = document.getElementById('settings-modal');
      expect(modal?.classList.contains('active')).toBe(true);
    });

    it('should hide settings modal', () => {
      manager.showSettings();
      manager.hideSettings();
      const modal = document.getElementById('settings-modal');
      expect(modal?.classList.contains('active')).toBe(false);
    });
  });

  describe('Notifications', () => {
    it('should show notification', () => {
      manager.showNotification('Test message', 'info');
      const notification = document.querySelector('.notification');
      expect(notification).toBeTruthy();
      expect(notification?.textContent).toBe('Test message');
    });

    it('should show notification with different types', () => {
      manager.showNotification('Success!', 'success');
      const notification = document.querySelector('.notification-success');
      expect(notification).toBeTruthy();
    });

    it('should show error notification', () => {
      manager.showNotification('Error!', 'error');
      const notification = document.querySelector('.notification-error');
      expect(notification).toBeTruthy();
    });

    it('should show warning notification', () => {
      manager.showNotification('Warning!', 'warning');
      const notification = document.querySelector('.notification-warning');
      expect(notification).toBeTruthy();
    });

    it('should auto-remove notification after duration', (done) => {
      manager.showNotification('Test', 'info', 100);

      setTimeout(() => {
        const notification = document.querySelector('.notification');
        expect(notification).toBeFalsy();
        done();
      }, 500);
    });
  });

  describe('Time Warning', () => {
    it('should show time warning notification', () => {
      manager.showTimeWarning(30);
      const notification = document.querySelector('.notification');
      expect(notification).toBeTruthy();
      expect(notification?.textContent).toContain('30');
    });
  });

  describe('Button Management', () => {
    beforeEach(() => {
      document.body.innerHTML += '<button id="test-button">Test</button>';
      manager.refreshCache();
    });

    it('should enable button', () => {
      manager.updateButton('test-button', true);
      const button = document.getElementById('test-button') as HTMLButtonElement;
      expect(button?.disabled).toBe(false);
    });

    it('should disable button', () => {
      manager.updateButton('test-button', false);
      const button = document.getElementById('test-button') as HTMLButtonElement;
      expect(button?.disabled).toBe(true);
    });

    it('should set button text', () => {
      manager.setButtonText('test-button', 'New Text');
      const button = document.getElementById('test-button');
      expect(button?.textContent).toBe('New Text');
    });
  });

  describe('Element Visibility', () => {
    beforeEach(() => {
      document.body.innerHTML += '<div id="test-element">Test</div>';
      manager.refreshCache();
    });

    it('should show element', () => {
      manager.toggleElement('test-element', true);
      const element = document.getElementById('test-element');
      expect(element?.style.display).toBe('block');
    });

    it('should hide element', () => {
      manager.toggleElement('test-element', false);
      const element = document.getElementById('test-element');
      expect(element?.style.display).toBe('none');
    });
  });

  describe('CSS Class Management', () => {
    beforeEach(() => {
      document.body.innerHTML += '<div id="test-element">Test</div>';
      manager.refreshCache();
    });

    it('should add CSS class', () => {
      manager.addClass('test-element', 'active');
      const element = document.getElementById('test-element');
      expect(element?.classList.contains('active')).toBe(true);
    });

    it('should remove CSS class', () => {
      const element = document.getElementById('test-element');
      element?.classList.add('active');
      manager.removeClass('test-element', 'active');
      expect(element?.classList.contains('active')).toBe(false);
    });
  });

  describe('Button Creation', () => {
    it('should create button with event listener', () => {
      const callback = vi.fn();
      const button = manager.createButton('Click Me', callback);

      expect(button.textContent).toBe('Click Me');
      expect(button.className).toBe('game-button');

      button.click();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Modal Close Buttons', () => {
    it('should add close button handler when showing modal', () => {
      manager.showModal('game-over-modal');
      const closeButton = document.querySelector('#game-over-modal .modal-close');
      expect(closeButton?.hasAttribute('data-listener')).toBe(true);
    });

    it('should close modal when close button is clicked', () => {
      manager.showModal('game-over-modal');
      const closeButton = document.querySelector('#game-over-modal .modal-close') as HTMLElement;
      closeButton?.click();

      setTimeout(() => {
        const modal = document.getElementById('game-over-modal');
        expect(modal?.classList.contains('active')).toBe(false);
      }, 100);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing elements gracefully', () => {
      expect(() => manager.updateScore(100)).not.toThrow();
      expect(() => manager.showModal('non-existent-modal')).not.toThrow();
      expect(() => manager.hideModal('non-existent-modal')).not.toThrow();
    });
  });
});
