/**
 * Music Manager for Tetris V2
 * Generates Tetris-inspired music using Web Audio API
 * Inspired by Korobeiniki (public domain Russian folk song)
 */

export class MusicManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentNoteIndex = 0;
  private tempo = 108; // BPM (ralenti de 144 à 108)
  private intervalId: number | null = null;
  private audio: HTMLAudioElement | null = null;
  private useMp3 = false;

  // Tetris theme melody (simplified version inspired by Korobeiniki)
  // Notes: E5, B4, C5, D5, C5, B4, A4, A4, C5, E5, D5, C5, B4, C5, D5, E5, C5, A4, A4
  private melody = [
    { note: 'E5', duration: 0.25 },
    { note: 'B4', duration: 0.125 },
    { note: 'C5', duration: 0.125 },
    { note: 'D5', duration: 0.25 },
    { note: 'C5', duration: 0.125 },
    { note: 'B4', duration: 0.125 },
    { note: 'A4', duration: 0.25 },
    { note: 'A4', duration: 0.125 },
    { note: 'C5', duration: 0.125 },
    { note: 'E5', duration: 0.25 },
    { note: 'D5', duration: 0.125 },
    { note: 'C5', duration: 0.125 },
    { note: 'B4', duration: 0.375 },
    { note: 'C5', duration: 0.125 },
    { note: 'D5', duration: 0.25 },
    { note: 'E5', duration: 0.25 },
    { note: 'C5', duration: 0.25 },
    { note: 'A4', duration: 0.25 },
    { note: 'A4', duration: 0.25 },
    { note: 'REST', duration: 0.125 },

    { note: 'D5', duration: 0.25 },
    { note: 'F5', duration: 0.125 },
    { note: 'A5', duration: 0.25 },
    { note: 'G5', duration: 0.125 },
    { note: 'F5', duration: 0.125 },
    { note: 'E5', duration: 0.375 },
    { note: 'C5', duration: 0.125 },
    { note: 'E5', duration: 0.25 },
    { note: 'D5', duration: 0.125 },
    { note: 'C5', duration: 0.125 },
    { note: 'B4', duration: 0.25 },
    { note: 'B4', duration: 0.125 },
    { note: 'C5', duration: 0.125 },
    { note: 'D5', duration: 0.25 },
    { note: 'E5', duration: 0.25 },
    { note: 'C5', duration: 0.25 },
    { note: 'A4', duration: 0.25 },
    { note: 'A4', duration: 0.25 },
  ];

  // Note frequencies (Hz)
  private noteFrequencies: Record<string, number> = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.0,
    A4: 440.0,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
    A5: 880.0,
    REST: 0,
  };

  constructor(mp3Path?: string) {
    if (mp3Path) {
      this.useMp3 = true;
      this.initMp3Audio(mp3Path);
    } else {
      this.initAudioContext();
    }
  }

  private initMp3Audio(mp3Path: string): void {
    this.audio = new Audio(mp3Path);
    this.audio.loop = true;
    this.audio.volume = 0.3;
  }

  private initAudioContext(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Default volume
    } catch {
      console.warn('Web Audio API not supported');
    }
  }

  private playNote(frequency: number, duration: number): void {
    if (!this.audioContext || !this.masterGain || frequency === 0) {
      return;
    }

    const now = this.audioContext.currentTime;

    // Create oscillator for main tone
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Square wave for retro sound
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;

    // ADSR envelope for more natural sound
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05); // Decay
    gainNode.gain.setValueAtTime(0.2, now + duration - 0.05); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  private playNextNote(): void {
    if (!this.isPlaying) {
      return;
    }

    const note = this.melody[this.currentNoteIndex];
    if (!note) {
      this.currentNoteIndex = 0;
      return;
    }

    const frequency = this.noteFrequencies[note.note] || 0;
    const duration = (60 / this.tempo) * note.duration;

    this.playNote(frequency, duration);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;

    // Schedule next note
    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
    }
    this.intervalId = window.setTimeout(() => {
      this.playNextNote();
    }, duration * 1000);
  }

  /**
   * Resume AudioContext (required for mobile browsers)
   * Must be called after user interaction
   */
  public async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('Failed to resume MusicManager AudioContext:', e);
      }
    }
  }

  public play(): void {
    if (this.isPlaying) {
      return;
    }

    if (this.useMp3 && this.audio) {
      this.audio.play().catch((error) => {
        console.warn('Audio play failed:', error);
      });
      this.isPlaying = true;
    } else if (this.audioContext) {
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {
          // Ignore resume errors
        });
      }

      this.isPlaying = true;
      this.currentNoteIndex = 0;
      this.playNextNote();
    }
  }

  public stop(): void {
    this.isPlaying = false;

    if (this.useMp3 && this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  public setVolume(volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume));

    if (this.useMp3 && this.audio) {
      this.audio.volume = normalizedVolume * 0.3;
    } else if (this.masterGain) {
      this.masterGain.gain.value = normalizedVolume * 0.3;
    }
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }
}
