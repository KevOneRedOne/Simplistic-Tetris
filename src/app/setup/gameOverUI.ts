/**
 * Game over UI: high score form and Play Again button.
 */

import { GameMode } from '@/types/index';
import { i18n } from '@i18n/i18n';
import type { HighScoreManager } from '@ui/HighScoreManager';
import type { UIManager } from '@ui/UIManager';

export interface SetupHighScoreFormContext {
  mode: GameMode;
  score: number;
  lines: number;
  level: number;
  isHighScore: boolean;
  highScoreManager: HighScoreManager;
  uiManager: UIManager;
  displayedScoreMode: GameMode;
  onScoresUpdated: (displayedMode: GameMode) => void;
}

/**
 * Shows the high score input in the game over modal and handles save.
 */
export function setupHighScoreForm(context: SetupHighScoreFormContext): void {
  const {
    mode,
    score,
    lines,
    level,
    isHighScore,
    highScoreManager,
    uiManager,
    displayedScoreMode,
    onScoresUpdated,
  } = context;

  const inputContainer = document.getElementById('high-score-input-container');
  const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
  const saveButton = document.getElementById('save-score-button');

  if (!inputContainer || !nameInput || !saveButton) return;

  const newSaveButton = saveButton.cloneNode(true) as HTMLButtonElement;
  saveButton.parentNode?.replaceChild(newSaveButton, saveButton);

  inputContainer.style.display = 'block';

  const label = inputContainer.querySelector('label');
  if (label) {
    label.textContent = isHighScore
      ? i18n.t('messages.enterName')
      : i18n.t('messages.saveLastAttempt');
  }

  nameInput.value = '';

  setTimeout(() => {
    nameInput.focus();
    nameInput.select();
  }, 150);

  const handleEnter = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      newSaveButton.click();
    }
  };

  nameInput.addEventListener('keydown', handleEnter);

  const handleSave = (): void => {
    const playerName = nameInput.value.trim().toUpperCase() || 'AAA';

    const saved = highScoreManager.addHighScore(mode, playerName, score, lines, level);
    highScoreManager.saveLastAttempt(mode, playerName, score, lines, level);

    if (!saved && isHighScore) {
      uiManager.showNotification('Failed to save high score', 'error', 3000);
      return;
    }

    onScoresUpdated(displayedScoreMode);

    inputContainer.style.display = 'none';
    nameInput.blur();

    if (isHighScore) {
      const modeKey = mode === GameMode.CLASSIC ? 'modes.classic' : 'modes.ultra';
      const modeName = i18n.t(modeKey);
      uiManager.showNotification(
        i18n.t('messages.newHighScore', { score: Math.round(score).toString(), mode: modeName }),
        'success',
        3000
      );
    } else {
      uiManager.showNotification(
        i18n.t('messages.scoreSaved', { score: Math.round(score).toString() }),
        'success',
        3000
      );
    }

    nameInput.removeEventListener('keydown', handleEnter);
    newSaveButton.removeEventListener('click', handleSave);
  };

  newSaveButton.addEventListener('click', handleSave);
}

/**
 * Attaches the Play Again button in the game over modal.
 */
export function setupPlayAgainButton(onPlayAgain: () => void): void {
  const playAgainButton = document.getElementById('play-again-button');
  if (!playAgainButton) return;

  const newButton = playAgainButton.cloneNode(true) as HTMLElement;
  playAgainButton.parentNode?.replaceChild(newButton, playAgainButton);

  const textSpan = newButton.querySelector('span:not(.iconify)');
  if (textSpan) {
    textSpan.textContent = i18n.t('buttons.playAgain');
  }

  newButton.addEventListener('click', onPlayAgain);
}
