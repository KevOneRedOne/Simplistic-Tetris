/**
 * Board management for Tetris V2
 * Handles the game grid state and operations
 */

import type { BoardGrid, CellValue, Tetromino, Position } from '@/types/index';
import { BOARD_ROWS, BOARD_COLS, VACANT_COLOR } from '@constants/config';
import { getTetrominoOccupiedCells } from './Tetromino';

/**
 * Create an empty board
 */
export function createBoard(): BoardGrid {
  const board: BoardGrid = [];

  for (let row = 0; row < BOARD_ROWS; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_COLS; col++) {
      if (!board[row]) {
        board[row] = [];
      }
      board[row]![col] = VACANT_COLOR;
    }
  }

  return board;
}

/**
 * Check if a position is within board bounds
 */
export function isValidPosition(position: Position): boolean {
  return position.x >= 0 && position.x < BOARD_COLS && position.y >= 0 && position.y < BOARD_ROWS;
}

/**
 * Check if a cell is vacant on the board
 */
export function isCellVacant(board: BoardGrid, position: Position): boolean {
  // If position is above the board (negative y), consider it vacant
  if (position.y < 0) {
    return true;
  }

  // If position is out of bounds, it's not vacant
  if (!isValidPosition(position)) {
    return false;
  }

  const row = board[position.y];
  if (!row) {
    return false;
  }

  return row[position.x] === VACANT_COLOR;
}

/**
 * Lock a tetromino piece onto the board
 */
export function lockPiece(board: BoardGrid, tetromino: Tetromino): BoardGrid {
  const newBoard = cloneBoard(board);
  const occupiedCells = getTetrominoOccupiedCells(tetromino);

  for (const cell of occupiedCells) {
    // Only lock cells that are within the board
    if (isValidPosition(cell)) {
      const row = newBoard[cell.y];
      if (row) {
        row[cell.x] = tetromino.color;
      }
    }
  }

  return newBoard;
}

/**
 * Check if any part of a tetromino is above the board (game over condition)
 */
export function isPieceAboveBoard(tetromino: Tetromino): boolean {
  const occupiedCells = getTetrominoOccupiedCells(tetromino);

  for (const cell of occupiedCells) {
    if (cell.y < 0) {
      return true;
    }
  }

  return false;
}

/**
 * Find and return all complete lines (row indices)
 */
export function findCompleteLines(board: BoardGrid): number[] {
  const completeLines: number[] = [];

  for (let row = 0; row < BOARD_ROWS; row++) {
    const boardRow = board[row];
    if (!boardRow) continue;

    let isComplete = true;

    for (let col = 0; col < BOARD_COLS; col++) {
      if (boardRow[col] === VACANT_COLOR) {
        isComplete = false;
        break;
      }
    }

    if (isComplete) {
      completeLines.push(row);
    }
  }

  return completeLines;
}

/**
 * Clear specified lines and shift rows down
 */
export function clearLines(board: BoardGrid, lineIndices: number[]): BoardGrid {
  if (lineIndices.length === 0) {
    return board;
  }

  const newBoard = cloneBoard(board);

  // Sort line indices in descending order to clear from bottom to top
  const sortedLines = [...lineIndices].sort((a, b) => b - a);

  for (const lineIndex of sortedLines) {
    // Remove the complete line
    newBoard.splice(lineIndex, 1);

    // Add a new empty line at the top
    const emptyLine: CellValue[] = new Array(BOARD_COLS).fill(VACANT_COLOR);
    newBoard.unshift(emptyLine);
  }

  return newBoard;
}

/**
 * Clear complete lines and return the new board with the count of cleared lines
 */
export function clearCompleteLines(board: BoardGrid): { board: BoardGrid; linesCleared: number } {
  const completeLines = findCompleteLines(board);
  const linesCleared = completeLines.length;

  if (linesCleared === 0) {
    return { board, linesCleared: 0 };
  }

  const newBoard = clearLines(board, completeLines);

  return { board: newBoard, linesCleared };
}

/**
 * Clone a board (deep copy)
 */
export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map((row) => [...row]);
}

/**
 * Get the value of a cell on the board
 */
export function getCellValue(board: BoardGrid, position: Position): CellValue | null {
  if (!isValidPosition(position)) {
    return null;
  }

  const row = board[position.y];
  if (!row) {
    return null;
  }

  const cell = row[position.x];
  return cell !== undefined ? cell : null;
}

/**
 * Set the value of a cell on the board (returns new board)
 */
export function setCellValue(board: BoardGrid, position: Position, value: CellValue): BoardGrid {
  if (!isValidPosition(position)) {
    return board;
  }

  const newBoard = cloneBoard(board);
  const row = newBoard[position.y];

  if (row) {
    row[position.x] = value;
  }

  return newBoard;
}

/**
 * Count the number of filled cells on the board
 */
export function countFilledCells(board: BoardGrid): number {
  let count = 0;

  for (let row = 0; row < BOARD_ROWS; row++) {
    const boardRow = board[row];
    if (!boardRow) continue;

    for (let col = 0; col < BOARD_COLS; col++) {
      if (boardRow[col] !== VACANT_COLOR) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Check if the board is empty
 */
export function isBoardEmpty(board: BoardGrid): boolean {
  return countFilledCells(board) === 0;
}

/**
 * Get the highest occupied row (for visual effects)
 */
export function getHighestOccupiedRow(board: BoardGrid): number {
  for (let row = 0; row < BOARD_ROWS; row++) {
    const boardRow = board[row];
    if (!boardRow) continue;

    for (let col = 0; col < BOARD_COLS; col++) {
      if (boardRow[col] !== VACANT_COLOR) {
        return row;
      }
    }
  }

  return BOARD_ROWS - 1;
}

/**
 * Get board state as a simple string (for debugging/testing)
 */
export function boardToString(board: BoardGrid): string {
  return board
    .map((row) => row.map((cell) => (cell === VACANT_COLOR ? '.' : 'X')).join(''))
    .join('\n');
}
