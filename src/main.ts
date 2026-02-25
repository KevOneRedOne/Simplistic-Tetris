/**
 * Main entry point for Tetris V2
 */

import { TetrisGame } from '@/app/TetrisGame';
import { APP_VERSION, REPO_RELEASES_URL } from '@constants/config';
import './styles/main.scss';

document.addEventListener('DOMContentLoaded', () => {
  const versionLink = document.getElementById('app-version-link');
  if (versionLink && versionLink instanceof HTMLAnchorElement) {
    versionLink.textContent = `v${APP_VERSION}`;
    versionLink.href = `${REPO_RELEASES_URL}/tag/v${APP_VERSION}`;
  }
  new TetrisGame();
});
