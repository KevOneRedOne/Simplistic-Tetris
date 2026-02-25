/**
 * Mode selection modal: create DOM and wire Classic / Ultra buttons.
 */

import { i18n } from '@i18n/i18n';

export interface CreateModeSelectionModalOptions {
  appVersion: string;
  onClassic: () => void;
  onUltra: () => void;
}

/**
 * Creates the mode selection modal, appends it to document.body, and wires close + mode buttons.
 */
export function createModeSelectionModal(options: CreateModeSelectionModalOptions): void {
  const { appVersion, onClassic, onUltra } = options;

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'mode-select-modal';

  modal.innerHTML = `
    <div class="modal-content start-modal">
      <button class="modal-close" aria-label="${i18n.t('buttons.close')}">&times;</button>
      <div class="modal-logo">
        <img src="/icons/android-chrome-192x192.png" alt="Tetris" width="80" height="80" loading="lazy" style="margin: 0 auto 1rem;">
      </div>
      <h2 class="modal-title">${i18n.t('game.title')}</h2>
      <p class="modal-subtitle">${i18n.t('game.subtitle', { version: appVersion })}</p>
      <p class="modal-description">
        ${i18n.t('game.description')}
      </p>
      <h3 class="modal-section-title">${i18n.t('modes.selectMode')}</h3>
      <div class="modal-buttons">
        <button class="game-button mode-button" id="mode-classic">
          <span class="mode-icon"><span class="iconify" data-icon="mdi:gamepad-variant" data-width="24" aria-hidden="true"></span></span>
          <span class="mode-title">${i18n.t('modes.classic')}</span>
          <span class="mode-desc">${i18n.t('modes.classicDesc')}</span>
        </button>
        <button class="game-button mode-button" id="mode-ultra">
          <span class="mode-icon"><span class="iconify" data-icon="mdi:lightning-bolt" data-width="24" aria-hidden="true"></span></span>
          <span class="mode-title">${i18n.t('modes.ultra')}</span>
          <span class="mode-desc">${i18n.t('modes.ultraDesc')}</span>
        </button>
      </div>
      <h3 class="modal-section-title">${i18n.t('controls.title')}</h3>
      <div class="modal-controls-hint">
        <div class="controls-grid">
          <div class="control-item">
            <span class="desc">${i18n.t('controls.move')}</span>
            <span class="key">⬅️ ➡️</span>
          </div>
          <div class="control-item">
            <span class="desc">${i18n.t('controls.rotate')}</span>
            <span class="key">⬆️</span>
          </div>
          <div class="control-item">
            <span class="desc">${i18n.t('controls.softDrop')}</span>
            <span class="key">⬇️</span>
          </div>
          <div class="control-item">
            <span class="desc">${i18n.t('controls.hardDrop')}</span>
            <span class="key">${i18n.t('controls.keySpace')}</span>
          </div>
          <div class="control-item">
            <span class="desc">${i18n.t('controls.holdSwap')}</span>
            <span class="key">${i18n.t('controls.keyShift')}</span>
          </div>
          <div class="control-item">
            <span class="desc">${i18n.t('controls.pauseGame')}</span>
            <span class="key">${i18n.t('controls.keyEsc')} / ${i18n.t('controls.keyP')}</span>
          </div>
          <div class="control-item">
            <span class="desc">${i18n.t('controls.restartGame')}</span>
            <span class="key">${i18n.t('controls.keyEnter')} / ${i18n.t('controls.keyR')}</span>
          </div>
          <div class="control-item">
            <span class="desc">${i18n.t('controls.quitGame')}</span>
            <span class="key">${i18n.t('controls.keyTab')}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeButton = modal.querySelector('.modal-close');
  closeButton?.addEventListener('click', () => {
    modal.classList.remove('active');
    modal.style.display = 'none';
  });

  const classicBtn = modal.querySelector('#mode-classic');
  classicBtn?.addEventListener('click', () => {
    modal.remove();
    onClassic();
  });

  const ultraBtn = modal.querySelector('#mode-ultra');
  ultraBtn?.addEventListener('click', () => {
    modal.remove();
    onUltra();
  });
}
