/**
 * Main entry point for Tetris V2
 */

import { TetrisGame } from '@/app/TetrisGame';
import './styles/main.scss';

document.addEventListener('DOMContentLoaded', () => {
  new TetrisGame();
});
