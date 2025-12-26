/**
 * Audio Manager for Tetris V2
 * Handles sound effects and background music
 */

import type { AudioSettings } from '@/types/index';
import { DEFAULT_AUDIO_SETTINGS } from '@constants/config';

type SoundEffect = 'move' | 'rotate' | 'drop' | 'lineClear' | 'levelUp' | 'gameOver' | 'hold';

export class AudioManager {
  private settings: AudioSettings;
  private audioContext: AudioContext | null = null;
  private music: HTMLAudioElement | null = null;

  constructor(settings?: AudioSettings) {
    this.settings = settings || { ...DEFAULT_AUDIO_SETTINGS };
    this.initAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  /**
   * Resume AudioContext (required for mobile browsers)
   * Must be called after user interaction
   */
  public async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('AudioContext resumed successfully');
      } catch (e) {
        console.warn('Failed to resume AudioContext:', e);
      }
    }
  }

  /**
   * Play simple beep sound (synthesized)
   */
  private playBeep(frequency: number, duration: number, type: OscillatorType = 'square'): void {
    if (!this.settings.enabled || !this.audioContext) {
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(this.settings.volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Play move sound
   */
  public playMove(): void {
    this.playBeep(200, 0.05);
  }

  /**
   * Play rotate sound
   */
  public playRotate(): void {
    this.playBeep(300, 0.08);
  }

  /**
   * Play drop sound
   */
  public playDrop(): void {
    this.playBeep(150, 0.1);
  }

  /**
   * Play line clear sound
   */
  public playLineClear(): void {
    if (!this.settings.enabled || !this.audioContext) {
      return;
    }

    // Play ascending tones
    const frequencies = [440, 554, 659, 880];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playBeep(freq, 0.15, 'sine');
      }, index * 50);
    });
  }

  /**
   * Play level up sound
   */
  public playLevelUp(): void {
    if (!this.settings.enabled || !this.audioContext) {
      return;
    }

    // Play triumphant sound
    const frequencies = [523, 659, 784, 1047];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playBeep(freq, 0.2, 'sine');
      }, index * 80);
    });
  }

  /**
   * Play game over sound
   */
  public playGameOver(): void {
    if (!this.settings.enabled || !this.audioContext) {
      return;
    }

    // Play descending tones
    const frequencies = [440, 392, 349, 294, 262];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playBeep(freq, 0.3, 'triangle');
      }, index * 100);
    });
  }

  /**
   * Play hold sound
   */
  public playHold(): void {
    this.playBeep(350, 0.1, 'sine');
  }

  /**
   * Play sound by name
   */
  public play(sound: SoundEffect): void {
    switch (sound) {
      case 'move':
        this.playMove();
        break;
      case 'rotate':
        this.playRotate();
        break;
      case 'drop':
        this.playDrop();
        break;
      case 'lineClear':
        this.playLineClear();
        break;
      case 'levelUp':
        this.playLevelUp();
        break;
      case 'gameOver':
        this.playGameOver();
        break;
      case 'hold':
        this.playHold();
        break;
    }
  }

  /**
   * Enable/disable sounds
   */
  public setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
  }

  /**
   * Set volume
   */
  public setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Enable/disable music
   */
  public setMusicEnabled(enabled: boolean): void {
    this.settings.musicEnabled = enabled;

    if (this.music) {
      if (enabled) {
        this.music.play().catch(() => {
          // Ignore play errors
        });
      } else {
        this.music.pause();
      }
    }
  }

  /**
   * Set music volume
   */
  public setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));

    if (this.music) {
      this.music.volume = this.settings.musicVolume;
    }
  }

  /**
   * Get current settings
   */
  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  public updateSettings(settings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...settings };

    if (settings.enabled !== undefined) {
      this.setEnabled(settings.enabled);
    }

    if (settings.volume !== undefined) {
      this.setVolume(settings.volume);
    }

    if (settings.musicEnabled !== undefined) {
      this.setMusicEnabled(settings.musicEnabled);
    }

    if (settings.musicVolume !== undefined) {
      this.setMusicVolume(settings.musicVolume);
    }
  }

  /**
   * Stop all sounds
   */
  public stopAll(): void {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }
}

