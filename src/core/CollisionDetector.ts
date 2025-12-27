/**
 * Collision detection for Tetris V2
 * Extracted from Piece.js HitWall logic
 */

import type { Tetromino, BoardGrid, CollisionResult, Position } from '@/types/index';
import { BOARD_COLS, BOARD_ROWS } from '@constants/config';
import { isCellVacant } from './Board';
import { getTetrominoOccupiedCells } from './Tetromino';

/**
 * Check if a tetromino would collide at a given position
 */
export function checkCollision(
  board: BoardGrid,
  tetromino: Tetromino,
  offsetX = 0,
  offsetY = 0
): CollisionResult {
  const occupiedCells = getTetrominoOccupiedCells(tetromino);

  for (const cell of occupiedCells) {
    const newX = cell.x + offsetX;
    const newY = cell.y + offsetY;

    // Check horizontal walls
    if (newX < 0 || newX >= BOARD_COLS) {
      return { hasCollision: true, reason: 'wall' };
    }

    // Check floor
    if (newY >= BOARD_ROWS) {
      return { hasCollision: true, reason: 'floor' };
    }

    // Skip if above board (newY < 0)
    if (newY < 0) {
      continue;
    }

    // Check collision with locked pieces
    if (!isCellVacant(board, { x: newX, y: newY })) {
      return { hasCollision: true, reason: 'piece' };
    }
  }

  return { hasCollision: false };
}

/**
 * Check if tetromino can move left
 */
export function canMoveLeft(board: BoardGrid, tetromino: Tetromino): boolean {
  const result = checkCollision(board, tetromino, -1, 0);
  return !result.hasCollision;
}

/**
 * Check if tetromino can move right
 */
export function canMoveRight(board: BoardGrid, tetromino: Tetromino): boolean {
  const result = checkCollision(board, tetromino, 1, 0);
  return !result.hasCollision;
}

/**
 * Check if tetromino can move down
 */
export function canMoveDown(board: BoardGrid, tetromino: Tetromino): boolean {
  const result = checkCollision(board, tetromino, 0, 1);
  return !result.hasCollision;
}

/**
 * Check if a tetromino at a specific position would collide
 */
export function canPlaceTetromino(
  board: BoardGrid,
  tetromino: Tetromino,
  position: Position
): boolean {
  const offsetX = position.x - tetromino.position.x;
  const offsetY = position.y - tetromino.position.y;

  const result = checkCollision(board, tetromino, offsetX, offsetY);
  return !result.hasCollision;
}

/**
 * Calculate wall kick offset for rotation
 * Returns the horizontal offset needed to kick the piece away from the wall
 */
export function calculateWallKick(
  board: BoardGrid,
  tetromino: Tetromino,
  rotatedTetromino: Tetromino
): number {
  // First, try without kick
  if (!checkCollision(board, rotatedTetromino).hasCollision) {
    return 0;
  }

  const occupiedCells = getTetrominoOccupiedCells(rotatedTetromino);

  // Find the leftmost and rightmost cells
  let minX = BOARD_COLS;
  let maxX = -1;

  for (const cell of occupiedCells) {
    minX = Math.min(minX, cell.x);
    maxX = Math.max(maxX, cell.x);
  }

  // If piece is on the right side, try kicking left
  if (tetromino.position.x > BOARD_COLS / 2) {
    // Try kicking left by 1, 2, or 3 spaces
    for (let kick = -1; kick >= -3; kick--) {
      if (!checkCollision(board, rotatedTetromino, kick, 0).hasCollision) {
        return kick;
      }
    }
  } else {
    // If piece is on the left side, try kicking right
    for (let kick = 1; kick <= 3; kick++) {
      if (!checkCollision(board, rotatedTetromino, kick, 0).hasCollision) {
        return kick;
      }
    }
  }

  // No valid kick found
  return 0;
}

/**
 * Check if rotation is possible (with wall kick if needed)
 * Returns the kick offset if rotation is possible, null otherwise
 */
export function canRotate(
  board: BoardGrid,
  tetromino: Tetromino,
  rotatedTetromino: Tetromino
): number | null {
  const kick = calculateWallKick(board, tetromino, rotatedTetromino);

  // Check if rotation with kick is valid
  if (!checkCollision(board, rotatedTetromino, kick, 0).hasCollision) {
    return kick;
  }

  return null;
}

/**
 * Find the ghost piece position (where the piece would land with hard drop)
 */
export function findGhostPosition(board: BoardGrid, tetromino: Tetromino): Position {
  let ghostY = tetromino.position.y;

  // Move down until collision
  while (!checkCollision(board, tetromino, 0, ghostY - tetromino.position.y + 1).hasCollision) {
    ghostY++;
  }

  return { x: tetromino.position.x, y: ghostY };
}

/**
 * Calculate hard drop distance
 */
export function calculateHardDropDistance(board: BoardGrid, tetromino: Tetromino): number {
  const ghostPosition = findGhostPosition(board, tetromino);
  return ghostPosition.y - tetromino.position.y;
}

/**
 * Check if game is over (new piece spawns in collision)
 */
export function isGameOverCollision(board: BoardGrid, tetromino: Tetromino): boolean {
  const result = checkCollision(board, tetromino);
  return result.hasCollision && tetromino.position.y <= 0;
}

/**
 * Get all valid positions for current tetromino (for AI/hints)
 */
export function getAllValidPositions(board: BoardGrid, tetromino: Tetromino): Position[] {
  const validPositions: Position[] = [];

  for (let x = 0; x < BOARD_COLS; x++) {
    for (let y = 0; y < BOARD_ROWS; y++) {
      if (canPlaceTetromino(board, tetromino, { x, y })) {
        validPositions.push({ x, y });
      }
    }
  }

  return validPositions;
}
