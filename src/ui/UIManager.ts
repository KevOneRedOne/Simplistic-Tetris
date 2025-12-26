/**
 * UI Manager for Tetris V2
 * Handles all UI updates and modal displays
 */

import type { GameState, GameMode } from '@/types/index';
import { formatTime } from '@core/GameModes';

export class UIManager {
  private elements: Map<string, HTMLElement>;

  constructor() {
    this.elements = new Map();
    this.cacheElements();
  }

  /**
   * Cache frequently accessed DOM elements
   */
  private cacheElements(): void {
    const elementIds = [
      'score',
      'lines',
      'level',
      'timer',
      'mode',
      'next-canvas',
      'hold-canvas',
      'game-over-modal',
      'pause-modal',
      'mode-select-modal',
      'settings-modal',
    ];

    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        this.elements.set(id, element);
      }
    });
  }

  /**
   * Get cached element
   */
  private getElement(id: string): HTMLElement | null {
    return this.elements.get(id) || document.getElementById(id);
  }

  /**
   * Update score display
   */
  public updateScore(score: number): void {
    const element = this.getElement('score');
    if (element) {
      element.textContent = Math.round(score).toString();
    }
  }

  /**
   * Update lines display
   */
  public updateLines(lines: number): void {
    const element = this.getElement('lines');
    if (element) {
      element.textContent = lines.toString();
    }
  }

  /**
   * Update level display
   */
  public updateLevel(level: number): void {
    const element = this.getElement('level');
    if (element) {
      element.textContent = level.toString();
    }
  }

  /**
   * Update timer display
   */
  public updateTimer(seconds: number): void {
    const element = this.getElement('timer');
    if (element) {
      element.textContent = formatTime(seconds);
    }
  }

  /**
   * Update game mode display
   */
  public updateMode(mode: GameMode): void {
    const element = this.getElement('mode');
    if (element) {
      element.textContent = mode.toUpperCase();
    }
  }

  /**
   * Update all game stats
   */
  public updateGameStats(state: GameState, elapsedTime: number): void {
    this.updateScore(state.score);
    this.updateLines(state.lines);
    this.updateLevel(state.level);
    this.updateTimer(elapsedTime);
    this.updateMode(state.gameMode);
  }

  /**
   * Show modal
   */
  public showModal(modalId: string): void {
    const modal = this.getElement(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
      
      // Add close button handler if not already added
      const closeButton = modal.querySelector('.modal-close');
      if (closeButton && !closeButton.hasAttribute('data-listener')) {
        closeButton.setAttribute('data-listener', 'true');
        closeButton.addEventListener('click', (e) => {
          e.stopPropagation();
          // Completely hide the modal to view the game
          modal.classList.remove('active');
          modal.style.display = 'none';
          
          // Re-enable background scroll
          const openModals = document.querySelectorAll('.modal.active');
          if (openModals.length === 0) {
            document.body.style.overflow = '';
          }
        });
      }
    }
  }

  /**
   * Hide modal
   */
  public hideModal(modalId: string): void {
    const modal = this.getElement(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      
      // Re-enable background scroll if no other modals are open
      const openModals = document.querySelectorAll('.modal.active');
      if (openModals.length === 0) {
        document.body.style.overflow = '';
      }
    }
  }

  /**
   * Show game over modal
   */
  public showGameOver(score: number, lines: number, level: number, duration: number): void {
    const modal = this.getElement('game-over-modal');
    if (!modal) {
      console.error('Game over modal not found');
      return;
    }

    // Update modal content with the correct IDs
    const scoreEl = document.getElementById('game-over-score');
    const linesEl = document.getElementById('game-over-lines');
    const levelEl = document.getElementById('game-over-level');
    const timeEl = document.getElementById('game-over-time');

    if (scoreEl) scoreEl.textContent = Math.round(score).toString();
    if (linesEl) linesEl.textContent = lines.toString();
    if (levelEl) levelEl.textContent = level.toString();
    if (timeEl) timeEl.textContent = formatTime(duration);

    this.showModal('game-over-modal');
  }

  /**
   * Show pause modal
   */
  public showPause(): void {
    this.showModal('pause-modal');
  }

  /**
   * Hide pause modal
   */
  public hidePause(): void {
    this.hideModal('pause-modal');
  }

  /**
   * Show mode selection modal
   */
  public showModeSelect(): void {
    this.showModal('mode-select-modal');
  }

  /**
   * Hide mode selection modal
   */
  public hideModeSelect(): void {
    this.hideModal('mode-select-modal');
  }

  /**
   * Show settings modal
   */
  public showSettings(): void {
    this.showModal('settings-modal');
  }

  /**
   * Hide settings modal
   */
  public hideSettings(): void {
    this.hideModal('settings-modal');
  }

  /**
   * Show notification message
   */
  public showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 3000): void {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Remove after duration
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }

  /**
   * Show time warning
   */
  public showTimeWarning(secondsRemaining: number): void {
    this.showNotification(`${secondsRemaining} seconds remaining!`, 'warning', 2000);
  }

  /**
   * Update button state
   */
  public updateButton(buttonId: string, enabled: boolean): void {
    const button = this.getElement(buttonId);
    if (button instanceof HTMLButtonElement) {
      button.disabled = !enabled;
    }
  }

  /**
   * Set button text
   */
  public setButtonText(buttonId: string, text: string): void {
    const button = this.getElement(buttonId);
    if (button) {
      button.textContent = text;
    }
  }

  /**
   * Toggle element visibility
   */
  public toggleElement(elementId: string, visible: boolean): void {
    const element = this.getElement(elementId);
    if (element) {
      element.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Add CSS class to element
   */
  public addClass(elementId: string, className: string): void {
    const element = this.getElement(elementId);
    if (element) {
      element.classList.add(className);
    }
  }

  /**
   * Remove CSS class from element
   */
  public removeClass(elementId: string, className: string): void {
    const element = this.getElement(elementId);
    if (element) {
      element.classList.remove(className);
    }
  }

  /**
   * Create button with event listener
   */
  public createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'game-button';
    button.addEventListener('click', onClick);
    return button;
  }

  /**
   * Refresh element cache
   */
  public refreshCache(): void {
    this.cacheElements();
  }
}

