/**
 * Settings UI: toggles (music, sound, colorblind) and modal chrome
 * (mode selection button, score mode toggle, clear scores, pause modal).
 * All wiring is done via a single context to keep main.ts thin.
 */

import type { BoardGrid, Tetromino } from '@/types/index';
import { GameMode } from '@/types/index';
import { i18n } from '@i18n/i18n';
import type { AnimationEngine } from '@rendering/AnimationEngine';
import type { CanvasRenderer } from '@rendering/CanvasRenderer';
import type { AudioManager } from '@ui/AudioManager';
import type { HighScoreManager } from '@ui/HighScoreManager';
import type { MusicManager } from '@ui/MusicManager';
import type { UIManager } from '@ui/UIManager';

/** Snapshot used to re-render after colorblind toggle */
export interface GameStateSnapshot {
  board: BoardGrid;
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  holdPiece: Tetromino | null;
  ghostPiece: Tetromino | null;
}

export interface SettingsUIContext {
  renderer: CanvasRenderer;
  uiManager: UIManager;
  highScoreManager: HighScoreManager;
  musicManager: MusicManager;
  audioManager: AudioManager;
  animationEngine: AnimationEngine;
  getGameStateSnapshot: () => GameStateSnapshot | null;
  getDisplayedScoreMode: () => GameMode;
  setDisplayedScoreMode: (mode: GameMode) => void;
  updateHighScoresDisplay: (mode: GameMode) => void;
  getCurrentMode: () => GameMode;
  restart: (mode: GameMode) => void;
  togglePause: () => void;
  /** Called when user clicks "change mode" (stop game, hide modals, stop music, reload). */
  onModeSelectionClick: () => void;
}

export function setupSettingsUI(ctx: SettingsUIContext): void {
  setupMusicToggle(ctx);
  setupColorblindModeToggle(ctx);
  setupModeSelectionButton(ctx);
  setupScoreModeToggle(ctx);
  setupClearScoresButton(ctx);
  setupClearScoresModal(ctx);
  setupPauseModalButtons(ctx);
}

function setupMusicToggle(ctx: SettingsUIContext): void {
  const { musicManager, audioManager } = ctx;
  const musicButton = document.getElementById('music-toggle');
  if (musicButton) {
    musicButton.addEventListener('click', () => {
      musicManager.toggle();
      const isPlaying = musicManager.isCurrentlyPlaying();
      const icon = musicButton.querySelector('.iconify');
      if (icon) {
        icon.setAttribute('data-icon', isPlaying ? 'mdi:music' : 'mdi:music-off');
      }
      if (isPlaying) {
        musicButton.classList.add('active');
        musicButton.classList.remove('muted');
      } else {
        musicButton.classList.remove('active');
        musicButton.classList.add('muted');
      }
    });
    musicButton.classList.add('muted');
    const icon = musicButton.querySelector('.iconify');
    if (icon) {
      icon.setAttribute('data-icon', 'mdi:music-off');
    }
  }

  const soundButton = document.getElementById('sound-toggle');
  let soundEnabled = true;
  if (soundButton) {
    soundButton.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      audioManager.setEnabled(soundEnabled);
      const icon = soundButton.querySelector('.iconify');
      if (icon) {
        icon.setAttribute('data-icon', soundEnabled ? 'mdi:volume-high' : 'mdi:volume-off');
      }
      if (soundEnabled) {
        soundButton.classList.add('active');
        soundButton.classList.remove('muted');
      } else {
        soundButton.classList.remove('active');
        soundButton.classList.add('muted');
      }
    });
    soundButton.classList.add('active');
  }
}

function setupColorblindModeToggle(ctx: SettingsUIContext): void {
  const { renderer, getGameStateSnapshot } = ctx;
  const colorblindButton = document.getElementById('colorblind-toggle');
  if (!colorblindButton) return;

  const savedMode = localStorage.getItem('tetris_v2_colorblind_mode');
  let colorblindEnabled = savedMode === 'true';

  const updateIcon = (enabled: boolean): void => {
    const iconName = enabled ? 'mdi:eye' : 'mdi:eye-off-outline';
    colorblindButton.innerHTML = `<span class="iconify" data-icon="${iconName}" data-width="20"></span>`;
  };

  if (colorblindEnabled) {
    colorblindButton.classList.add('active');
    colorblindButton.classList.remove('muted');
    renderer.setColorBlindMode(true);
    updateIcon(true);
  } else {
    colorblindButton.classList.add('muted');
    colorblindButton.classList.remove('active');
    updateIcon(false);
  }

  colorblindButton.addEventListener('click', () => {
    colorblindEnabled = !colorblindEnabled;
    renderer.setColorBlindMode(colorblindEnabled);

    if (colorblindEnabled) {
      colorblindButton.classList.add('active');
      colorblindButton.classList.remove('muted');
      updateIcon(true);
    } else {
      colorblindButton.classList.remove('active');
      colorblindButton.classList.add('muted');
      updateIcon(false);
    }

    try {
      localStorage.setItem('tetris_v2_colorblind_mode', colorblindEnabled.toString());
    } catch {
      // ignore
    }

    const snapshot = getGameStateSnapshot();
    if (snapshot) {
      renderer.render(snapshot.board, snapshot.currentPiece, snapshot.ghostPiece);
      if (snapshot.nextPiece) {
        const nextCanvas = document.getElementById('next-canvas') as HTMLCanvasElement;
        if (nextCanvas) renderer.drawPreviewPiece(snapshot.nextPiece, nextCanvas);
      }
      if (snapshot.holdPiece) {
        const holdCanvas = document.getElementById('hold-canvas') as HTMLCanvasElement;
        if (holdCanvas) renderer.drawPreviewPiece(snapshot.holdPiece, holdCanvas);
      }
    }
  });
}

function setupModeSelectionButton(ctx: SettingsUIContext): void {
  const button = document.getElementById('show-mode-selection-button');
  if (button) {
    button.addEventListener('click', () => {
      ctx.onModeSelectionClick();
      ctx.musicManager.stop();
      window.location.reload();
    });
  }
}

function setupScoreModeToggle(ctx: SettingsUIContext): void {
  const toggleButton = document.getElementById('highscores-mode-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      const next =
        ctx.getDisplayedScoreMode() === GameMode.CLASSIC ? GameMode.ULTRA : GameMode.CLASSIC;
      ctx.setDisplayedScoreMode(next);
      ctx.updateHighScoresDisplay(next);
    });
  }
}

function setupClearScoresButton(ctx: SettingsUIContext): void {
  const clearButton = document.getElementById('highscores-clear');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      const mode = ctx.getDisplayedScoreMode();
      const modeLabel = mode === GameMode.CLASSIC ? i18n.t('modes.classic') : i18n.t('modes.ultra');
      const messageElement = document.getElementById('clear-scores-message');
      if (messageElement) {
        messageElement.textContent = i18n.t('messages.confirmClearScoresDescription', {
          mode: modeLabel,
        });
      }
      ctx.uiManager.showModal('clear-scores-modal');
    });
  }
}

function setupClearScoresModal(ctx: SettingsUIContext): void {
  const { uiManager, highScoreManager, updateHighScoresDisplay, getDisplayedScoreMode } = ctx;

  const confirmButton = document.getElementById('confirm-clear-scores-button');
  if (confirmButton) {
    confirmButton.addEventListener('click', () => {
      const mode = getDisplayedScoreMode();
      const modeLabel = mode === GameMode.CLASSIC ? i18n.t('modes.classic') : i18n.t('modes.ultra');
      highScoreManager.clearHighScores(mode);
      updateHighScoresDisplay(mode);
      uiManager.hideModal('clear-scores-modal');
      uiManager.showNotification(
        i18n.t('messages.scoresCleared', { mode: modeLabel }),
        'success',
        3000
      );
    });
  }

  const cancelButton = document.getElementById('cancel-clear-scores-button');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => uiManager.hideModal('clear-scores-modal'));
  }

  const clearScoresModal = document.getElementById('clear-scores-modal');
  const closeButton = clearScoresModal?.querySelector('.modal-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => uiManager.hideModal('clear-scores-modal'));
  }
}

function setupPauseModalButtons(ctx: SettingsUIContext): void {
  const { uiManager, restart, getCurrentMode, togglePause } = ctx;

  const continueButton = document.getElementById('continue-button');
  if (continueButton) {
    continueButton.addEventListener('click', () => togglePause());
  }

  const restartFromPauseButton = document.getElementById('restart-from-pause-button');
  if (restartFromPauseButton) {
    restartFromPauseButton.addEventListener('click', () => {
      uiManager.hidePause();
      restart(getCurrentMode());
    });
  }

  const pauseModal = document.getElementById('pause-modal');
  const closeButton = pauseModal?.querySelector('.modal-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => togglePause());
  }
}
