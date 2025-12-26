import { describe, it, expect } from 'vitest';
import {
  createBoard,
  isValidPosition,
  isCellVacant,
  findCompleteLines,
  clearLines,
  isBoardEmpty,
} from '../../src/core/Board';
import { BOARD_ROWS, BOARD_COLS, VACANT_COLOR } from '../../src/constants/config';

describe('Board', () => {
  describe('createBoard', () => {
    it('should create a board with correct dimensions', () => {
      const board = createBoard();
      expect(board.length).toBe(BOARD_ROWS);
      expect(board[0]?.length).toBe(BOARD_COLS);
    });

    it('should create an empty board filled with VACANT_COLOR', () => {
      const board = createBoard();
      board.forEach((row) => {
        row.forEach((cell) => {
          expect(cell).toBe(VACANT_COLOR);
        });
      });
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid positions', () => {
      expect(isValidPosition({ x: 0, y: 0 })).toBe(true);
      expect(isValidPosition({ x: 5, y: 10 })).toBe(true);
      expect(isValidPosition({ x: BOARD_COLS - 1, y: BOARD_ROWS - 1 })).toBe(true);
    });

    it('should return false for invalid positions', () => {
      expect(isValidPosition({ x: -1, y: 0 })).toBe(false);
      expect(isValidPosition({ x: 0, y: -1 })).toBe(false);
      expect(isValidPosition({ x: BOARD_COLS, y: 0 })).toBe(false);
      expect(isValidPosition({ x: 0, y: BOARD_ROWS })).toBe(false);
    });
  });

  describe('isCellVacant', () => {
    it('should return true for vacant cells', () => {
      const board = createBoard();
      expect(isCellVacant(board, { x: 0, y: 0 })).toBe(true);
      expect(isCellVacant(board, { x: 5, y: 10 })).toBe(true);
    });

    it('should return true for positions above the board', () => {
      const board = createBoard();
      expect(isCellVacant(board, { x: 0, y: -1 })).toBe(true);
      expect(isCellVacant(board, { x: 5, y: -5 })).toBe(true);
    });

    it('should return false for occupied cells', () => {
      const board = createBoard();
      if (board[0] && board[0][0]) {
        board[0][0] = 'red';
      }
      expect(isCellVacant(board, { x: 0, y: 0 })).toBe(false);
    });
  });

  describe('findCompleteLines', () => {
    it('should return empty array for empty board', () => {
      const board = createBoard();
      expect(findCompleteLines(board)).toEqual([]);
    });

    it('should detect complete lines', () => {
      const board = createBoard();
      // Fill first line completely
      if (board[0]) {
        for (let col = 0; col < BOARD_COLS; col++) {
          board[0][col] = 'red';
        }
      }
      expect(findCompleteLines(board)).toEqual([0]);
    });

    it('should detect multiple complete lines', () => {
      const board = createBoard();
      // Fill multiple lines
      [0, 2, 5].forEach((row) => {
        if (board[row]) {
          for (let col = 0; col < BOARD_COLS; col++) {
            board[row][col] = 'blue';
          }
        }
      });
      expect(findCompleteLines(board)).toEqual([0, 2, 5]);
    });
  });

  describe('clearLines', () => {
    it('should clear specified lines', () => {
      const board = createBoard();
      // Fill bottom line
      const lastRow = BOARD_ROWS - 1;
      if (board[lastRow]) {
        for (let col = 0; col < BOARD_COLS; col++) {
          board[lastRow][col] = 'green';
        }
      }

      const newBoard = clearLines(board, [lastRow]);
      
      // Check that cleared line is now at top and empty
      expect(newBoard[0]?.every((cell) => cell === VACANT_COLOR)).toBe(true);
    });
  });

  describe('isBoardEmpty', () => {
    it('should return true for empty board', () => {
      const board = createBoard();
      expect(isBoardEmpty(board)).toBe(true);
    });

    it('should return false for board with pieces', () => {
      const board = createBoard();
      if (board[0] && board[0][0]) {
        board[0][0] = 'yellow';
      }
      expect(isBoardEmpty(board)).toBe(false);
    });
  });
});

