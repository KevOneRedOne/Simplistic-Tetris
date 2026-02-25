/**
 * DOM translations: apply i18n to static HTML and modals.
 * Keeps all translation-related DOM updates in one place.
 */

import { APP_VERSION } from '@constants/config';
import { i18n } from '@i18n/i18n';
import type { MusicCredits } from '@ui/MusicManager';

/** Minimal interface for music credits display */
export interface MusicCreditsProvider {
  getCredits(): MusicCredits | null;
  isUsingMp3(): boolean;
}

/** Options for the language toggle setup */
export interface SetupLanguageToggleOptions {
  /** Called after locale change (e.g. refresh high scores display) */
  onLocaleChange?: () => void;
  /** Used to refresh music credits text in footer */
  musicManager?: MusicCreditsProvider;
}

/**
 * Initialize translations for static HTML elements (data-i18n, data-i18n-title, data-i18n-aria-label).
 */
export function initializeHTMLTranslations(): void {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const translation = i18n.t(key);
      if (element instanceof HTMLElement) {
        if (
          element.id === 'restart-from-pause-button' ||
          element.id === 'continue-button' ||
          element.id === 'play-again-button'
        ) {
          return;
        }

        const currentText = element.textContent || '';
        const emojiMatch = currentText.match(/^([\p{Emoji}\s]+)/u);
        if (emojiMatch && emojiMatch[1]) {
          if (element.tagName === 'BUTTON' || element.tagName === 'A') {
            element.textContent = emojiMatch[1].trim() + ' ' + translation;
          } else {
            element.textContent = emojiMatch[1].trim() + ' ' + translation.toUpperCase();
          }
        } else {
          if (element.tagName === 'H2' || element.tagName === 'H3') {
            element.textContent = translation.toUpperCase();
          } else {
            element.textContent = translation;
          }
        }
      }
    }
  });

  const titleElements = document.querySelectorAll('[data-i18n-title]');
  titleElements.forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key && element instanceof HTMLElement) {
      element.title = i18n.t(key);
    }
  });

  const ariaLabelElements = document.querySelectorAll('[data-i18n-aria-label]');
  ariaLabelElements.forEach((element) => {
    const key = element.getAttribute('data-i18n-aria-label');
    if (key && element instanceof HTMLElement) {
      element.setAttribute('aria-label', i18n.t(key));
    }
  });
}

/**
 * Update modal contents with current locale (mode select, pause, game over).
 */
export function updateModalsTranslations(appVersion: string = APP_VERSION): void {
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
    if (subtitle) subtitle.textContent = i18n.t('game.subtitle', { version: appVersion });
    if (description) description.textContent = i18n.t('game.description');
    if (sectionTitle) sectionTitle.textContent = i18n.t('modes.selectMode');
    if (classicTitle) classicTitle.textContent = i18n.t('modes.classic');
    if (classicDesc) classicDesc.textContent = i18n.t('modes.classicDesc');
    if (ultraTitle) ultraTitle.textContent = i18n.t('modes.ultra');
    if (ultraDesc) ultraDesc.textContent = i18n.t('modes.ultraDesc');
    if (controlsHint) controlsHint.textContent = `💡 ${i18n.t('messages.controlsHint')}`;
    if (closeButton) closeButton.setAttribute('aria-label', i18n.t('buttons.close'));
  }

  const pauseModal = document.getElementById('pause-modal');
  if (pauseModal) {
    const pauseTitle = pauseModal.querySelector('h2');
    const pauseDesc = pauseModal.querySelector('p');
    const continueBtn = pauseModal.querySelector('#continue-button');
    const restartBtn = pauseModal.querySelector('#restart-from-pause-button');
    const closeBtn = pauseModal.querySelector('.modal-close');

    if (pauseTitle) pauseTitle.textContent = i18n.t('messages.paused');
    if (pauseDesc) pauseDesc.textContent = i18n.t('messages.pausedDescription');

    if (continueBtn) {
      const textSpan = continueBtn.querySelector('span:not(.iconify)');
      if (textSpan) {
        textSpan.textContent = i18n.t('buttons.continue');
      }
    }
    if (restartBtn) {
      const textSpan = restartBtn.querySelector('span:not(.iconify)');
      if (textSpan) {
        textSpan.textContent = i18n.t('buttons.restart');
      }
    }
    if (closeBtn) closeBtn.setAttribute('aria-label', i18n.t('buttons.close'));
  }

  const gameOverModal = document.getElementById('game-over-modal');
  if (gameOverModal) {
    const gameOverTitle = gameOverModal.querySelector('h2');
    const playAgainBtn = gameOverModal.querySelector('#play-again-button');
    const closeBtn = gameOverModal.querySelector('.modal-close');
    const enterNameLabel = gameOverModal.querySelector('#high-score-input-container label');
    const saveButton = gameOverModal.querySelector('#save-score-button');

    const statLabels = gameOverModal.querySelectorAll('.stat-label');
    statLabels.forEach((label) => {
      const key = label.getAttribute('data-i18n');
      if (key) {
        label.textContent = i18n.t(key);
      }
    });

    if (gameOverTitle) gameOverTitle.textContent = i18n.t('messages.gameOver');

    if (playAgainBtn) {
      const textSpan = playAgainBtn.querySelector('span:not(.iconify)');
      if (textSpan) {
        textSpan.textContent = i18n.t('buttons.playAgain');
      }
    }
    if (closeBtn) closeBtn.setAttribute('aria-label', i18n.t('buttons.close'));
    if (enterNameLabel) enterNameLabel.textContent = i18n.t('messages.enterName');
    if (saveButton) saveButton.textContent = i18n.t('buttons.save');
  }
}

/**
 * Update the language toggle button (flag icon, title, aria-label, label text).
 */
export function updateLanguageButton(): void {
  const languageFlag = document.getElementById('language-flag');
  const languageButton = document.getElementById('language-toggle');
  const languageText = document.getElementById('language-text');
  const currentLocale = i18n.getLocale();

  if (languageFlag) {
    const icon = languageFlag.querySelector('.iconify');
    if (icon) {
      icon.setAttribute(
        'data-icon',
        currentLocale === 'en' ? 'twemoji:flag-united-kingdom' : 'twemoji:flag-france'
      );
    } else {
      const newIcon = document.createElement('span');
      newIcon.className = 'iconify';
      newIcon.setAttribute(
        'data-icon',
        currentLocale === 'en' ? 'twemoji:flag-united-kingdom' : 'twemoji:flag-france'
      );
      newIcon.setAttribute('data-width', '20');
      newIcon.setAttribute('aria-hidden', 'true');
      languageFlag.appendChild(newIcon);
    }
  }

  if (languageButton) {
    const languageLabel = i18n.t('settings.language');
    const currentLanguage = currentLocale === 'en' ? 'English' : 'Français';
    const nextLanguage = currentLocale === 'en' ? 'Français' : 'English';

    languageButton.setAttribute(
      'title',
      `${languageLabel} (${currentLanguage}) - Click to switch to ${nextLanguage}`
    );
    languageButton.setAttribute(
      'aria-label',
      `${languageLabel}: ${currentLanguage}. Click to switch to ${nextLanguage}`
    );
  }

  if (languageText) {
    languageText.textContent = i18n.t('settings.language');
  }
}

/**
 * Setup the music credits block in the footer (visibility and translated text).
 */
export function setupMusicCredits(musicManager: MusicCreditsProvider): void {
  const creditsElement = document.getElementById('music-credits');
  if (!creditsElement) {
    return;
  }

  const credits = musicManager.getCredits();

  if (credits && musicManager.isUsingMp3()) {
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
 * Attach the language toggle button handler and run initial button update.
 * After each locale change, re-runs DOM translations and optionally a custom callback.
 */
export function setupLanguageToggle(options: SetupLanguageToggleOptions = {}): void {
  const languageButton = document.getElementById('language-toggle');
  if (!languageButton) {
    return;
  }

  const { onLocaleChange, musicManager } = options;

  updateLanguageButton();

  languageButton.addEventListener('click', () => {
    void (async (): Promise<void> => {
      const currentLocale = i18n.getLocale();
      const newLocale = currentLocale === 'en' ? 'fr' : 'en';

      await i18n.setLocale(newLocale);

      initializeHTMLTranslations();
      updateLanguageButton();
      updateModalsTranslations();

      if (musicManager) {
        setupMusicCredits(musicManager);
      }

      onLocaleChange?.();
    })();
  });
}
