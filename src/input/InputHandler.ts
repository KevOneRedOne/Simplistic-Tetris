/**
 * Input Handler for Tetris V2
 * Handles keyboard and touch controls
 */

import type { ControlsConfig } from '@/types/index';
import { DEFAULT_CONTROLS, INPUT_DEBOUNCE } from '@constants/config';

type InputAction =
  | 'moveLeft'
  | 'moveRight'
  | 'moveDown'
  | 'rotate'
  | 'hardDrop'
  | 'hold'
  | 'pause'
  | 'restart';

type ActionCallback = () => void;

export class InputHandler {
  private controls: ControlsConfig;
  private actionCallbacks: Map<InputAction, ActionCallback>;
  private pressedKeys: Set<string>;
  private lastActionTime: Map<InputAction, number>;
  private touchStartY: number | null = null;
  private touchStartX: number | null = null;
  private touchStartTime: number = 0;
  private lastTapTime: number = 0;
  private repeatIntervals: Map<string, ReturnType<typeof setInterval | typeof setTimeout>> = new Map();

  constructor(controls?: ControlsConfig) {
    this.controls = controls || DEFAULT_CONTROLS;
    this.actionCallbacks = new Map();
    this.pressedKeys = new Set();
    this.lastActionTime = new Map();

    this.setupEventListeners();
  }

  /**
   * Setup keyboard and touch event listeners
   */
  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Touch events (mobile support)
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
    });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  /**
   * Handle key down
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key;

    // Prevent default for game keys
    if (this.isGameKey(key)) {
      event.preventDefault();
    }

    const action = this.getActionForKey(key);
    
    // If key is already pressed, don't start another interval
    if (this.pressedKeys.has(key)) {
      return;
    }

    this.pressedKeys.add(key);

    // Execute action immediately
    if (action) {
      this.executeAction(action);
      
      // Setup repeat for movement actions only
      if (['moveLeft', 'moveRight', 'moveDown'].includes(action)) {
        // Initial delay before repeat starts
        const initialDelay = setTimeout(() => {
          // Then repeat continuously
          const interval = setInterval(() => {
            if (this.pressedKeys.has(key)) {
              this.executeAction(action);
            } else {
              clearInterval(interval);
            }
          }, 50); // Repeat every 50ms
          
          this.repeatIntervals.set(key, interval);
        }, 150); // Wait 150ms before starting repeat
        
        this.repeatIntervals.set(key + '_initial', initialDelay);
      }
    }
  }

  /**
   * Handle key up
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key;
    this.pressedKeys.delete(key);
    
    // Clear any repeat intervals
    const interval = this.repeatIntervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.repeatIntervals.delete(key);
    }
    
    const initialDelay = this.repeatIntervals.get(key + '_initial');
    if (initialDelay) {
      clearTimeout(initialDelay);
      this.repeatIntervals.delete(key + '_initial');
    }
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    if (!touch) return;

    event.preventDefault();

    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  /**
   * Handle touch move (swipe detection)
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.touchStartX || !this.touchStartY) return;

    const touch = event.touches[0];
    if (!touch) return;

    event.preventDefault();

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    // Adaptive threshold based on screen size (smaller on mobile)
    const threshold = window.innerWidth < 576 ? 20 : 30;

    // Horizontal swipe
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        this.executeAction('moveRight');
      } else {
        this.executeAction('moveLeft');
      }
      this.touchStartX = touch.clientX;
    }

    // Vertical swipe down
    if (deltaY > threshold && Math.abs(deltaY) > Math.abs(deltaX)) {
      this.executeAction('moveDown');
      this.touchStartY = touch.clientY;
    }
    
    // Vertical swipe up for rotate
    if (deltaY < -threshold && Math.abs(deltaY) > Math.abs(deltaX)) {
      this.executeAction('rotate');
      this.touchStartY = touch.clientY;
    }
  }

  /**
   * Handle touch end (tap detection)
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.touchStartX || !this.touchStartY) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = Math.abs(touch.clientX - this.touchStartX);
    const deltaY = Math.abs(touch.clientY - this.touchStartY);
    const touchDuration = Date.now() - this.touchStartTime;
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTapTime;

    // If it's a tap (not a swipe) and quick
    if (deltaX < 15 && deltaY < 15 && touchDuration < 300) {
      // Double tap detection (within 400ms)
      if (timeSinceLastTap < 400) {
        this.executeAction('hardDrop');
        this.lastTapTime = 0; // Reset to avoid triple tap
      } else {
        // Single tap = rotate
        this.executeAction('rotate');
        this.lastTapTime = now;
      }
    }

    this.touchStartX = null;
    this.touchStartY = null;
  }

  /**
   * Check if key is a game control key
   */
  private isGameKey(key: string): boolean {
    return Object.values(this.controls).some((keys) => keys.includes(key));
  }

  /**
   * Get action for a given key
   */
  private getActionForKey(key: string): InputAction | null {
    for (const [action, keys] of Object.entries(this.controls)) {
      if (keys.includes(key)) {
        return action as InputAction;
      }
    }
    return null;
  }

  /**
   * Execute action with debouncing
   */
  private executeAction(action: InputAction): void {
    // Check debounce for certain actions
    const debounceTime = INPUT_DEBOUNCE[action as keyof typeof INPUT_DEBOUNCE];
    if (debounceTime) {
      const lastTime = this.lastActionTime.get(action) || 0;
      const now = Date.now();

      if (now - lastTime < debounceTime) {
        return;
      }

      this.lastActionTime.set(action, now);
    }

    // Execute callback
    const callback = this.actionCallbacks.get(action);
    if (callback) {
      callback();
    }
  }

  /**
   * Register action callback
   */
  public on(action: InputAction, callback: ActionCallback): void {
    this.actionCallbacks.set(action, callback);
  }

  /**
   * Unregister action callback
   */
  public off(action: InputAction): void {
    this.actionCallbacks.delete(action);
  }

  /**
   * Update controls configuration
   */
  public setControls(controls: ControlsConfig): void {
    this.controls = controls;
  }

  /**
   * Get current controls
   */
  public getControls(): ControlsConfig {
    return { ...this.controls };
  }

  /**
   * Check if key is currently pressed
   */
  public isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key);
  }

  /**
   * Clear all pressed keys
   */
  public clearPressed(): void {
    this.pressedKeys.clear();
  }

  /**
   * Cleanup event listeners
   */
  public destroy(): void {
    // Clear all intervals
    this.repeatIntervals.forEach((interval) => {
      clearInterval(interval);
      clearTimeout(interval);
    });
    this.repeatIntervals.clear();
    
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    document.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
}

