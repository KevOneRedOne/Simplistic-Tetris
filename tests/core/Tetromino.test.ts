import { describe, it, expect } from 'vitest';
import {
  createTetromino,
  createRandomTetromino,
  rotateTetromino,
  moveTetromino,
  getTetrominoOccupiedCells,
  TETROMINO_SHAPES,
} from '../../src/core/Tetromino';
import { TetrominoType } from '../../src/types/index';

describe('Tetromino', () => {
  describe('createTetromino', () => {
    it('should create a tetromino with correct type and color', () => {
      const tetromino = createTetromino(TetrominoType.I);
      expect(tetromino.type).toBe(TetrominoType.I);
      expect(tetromino.color).toBe(TETROMINO_SHAPES[TetrominoType.I].color);
    });

    it('should create tetromino at spawn position by default', () => {
      const tetromino = createTetromino(TetrominoType.O);
      expect(tetromino.position.x).toBe(3);
      expect(tetromino.position.y).toBe(-2);
    });

    it('should create tetromino at custom position', () => {
      const customPos = { x: 5, y: 10 };
      const tetromino = createTetromino(TetrominoType.T, customPos);
      expect(tetromino.position).toEqual(customPos);
    });

    it('should start at rotation 0', () => {
      const tetromino = createTetromino(TetrominoType.Z);
      expect(tetromino.rotation).toBe(0);
    });
  });

  describe('createRandomTetromino', () => {
    it('should create a valid tetromino', () => {
      const tetromino = createRandomTetromino();
      expect(tetromino).toBeDefined();
      expect(tetromino.type).toBeDefined();
      expect(tetromino.color).toBeDefined();
      expect(tetromino.shape).toBeDefined();
    });

    it('should create different tetrominoes on multiple calls', () => {
      const tetrominoes = Array.from({ length: 20 }, () => createRandomTetromino());
      const types = new Set(tetrominoes.map((t) => t.type));
      // With 20 attempts, we should get at least 2 different types (statistically)
      expect(types.size).toBeGreaterThan(1);
    });
  });

  describe('rotateTetromino', () => {
    it('should rotate tetromino clockwise', () => {
      const tetromino = createTetromino(TetrominoType.I);
      const rotated = rotateTetromino(tetromino);
      
      expect(rotated.rotation).toBe(1);
      expect(rotated.shape).not.toEqual(tetromino.shape);
    });

    it('should cycle through all rotations', () => {
      let tetromino = createTetromino(TetrominoType.T);
      const shapes = TETROMINO_SHAPES[TetrominoType.T].shape;
      
      for (let i = 0; i < shapes.length; i++) {
        tetromino = rotateTetromino(tetromino);
        expect(tetromino.rotation).toBe((i + 1) % shapes.length);
      }
    });

    it('should not modify original tetromino', () => {
      const original = createTetromino(TetrominoType.L);
      const originalRotation = original.rotation;
      
      rotateTetromino(original);
      
      expect(original.rotation).toBe(originalRotation);
    });
  });

  describe('moveTetromino', () => {
    it('should move tetromino horizontally', () => {
      const tetromino = createTetromino(TetrominoType.S);
      const moved = moveTetromino(tetromino, 2, 0);
      
      expect(moved.position.x).toBe(tetromino.position.x + 2);
      expect(moved.position.y).toBe(tetromino.position.y);
    });

    it('should move tetromino vertically', () => {
      const tetromino = createTetromino(TetrominoType.J);
      const moved = moveTetromino(tetromino, 0, 3);
      
      expect(moved.position.x).toBe(tetromino.position.x);
      expect(moved.position.y).toBe(tetromino.position.y + 3);
    });

    it('should not modify original tetromino', () => {
      const original = createTetromino(TetrominoType.Z);
      const originalPos = { ...original.position };
      
      moveTetromino(original, 1, 1);
      
      expect(original.position).toEqual(originalPos);
    });
  });

  describe('getTetrominoOccupiedCells', () => {
    it('should return correct occupied cells for O piece', () => {
      const tetromino = createTetromino(TetrominoType.O, { x: 0, y: 0 });
      const cells = getTetrominoOccupiedCells(tetromino);
      
      // O piece has 4 occupied cells
      expect(cells.length).toBe(4);
    });

    it('should return correct occupied cells for I piece', () => {
      const tetromino = createTetromino(TetrominoType.I, { x: 0, y: 0 });
      const cells = getTetrominoOccupiedCells(tetromino);
      
      // I piece has 4 occupied cells
      expect(cells.length).toBe(4);
    });

    it('should return cells with correct absolute positions', () => {
      const tetromino = createTetromino(TetrominoType.O, { x: 5, y: 10 });
      const cells = getTetrominoOccupiedCells(tetromino);
      
      cells.forEach((cell) => {
        expect(cell.x).toBeGreaterThanOrEqual(5);
        expect(cell.y).toBeGreaterThanOrEqual(10);
      });
    });
  });
});

