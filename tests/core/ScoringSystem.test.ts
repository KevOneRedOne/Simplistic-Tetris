import { describe, it, expect } from 'vitest';
import {
  calculateLineScore,
  calculateSoftDropBonus,
  calculateHardDropBonus,
  calculateLevel,
  shouldLevelUp,
  getDropSpeed,
  getLinesUntilNextLevel,
} from '../../src/core/ScoringSystem';
import { LINES_PER_LEVEL } from '../../src/constants/config';

describe('ScoringSystem', () => {
  describe('calculateLineScore', () => {
    it('should return 0 for no lines cleared', () => {
      expect(calculateLineScore(0, 0)).toBe(0);
    });

    it('should calculate single line score correctly', () => {
      const score = calculateLineScore(1, 0);
      expect(score).toBeGreaterThan(0);
    });

    it('should give more points for multiple lines', () => {
      const single = calculateLineScore(1, 0);
      const double = calculateLineScore(2, 0);
      const triple = calculateLineScore(3, 0);
      const tetris = calculateLineScore(4, 0);
      
      expect(double).toBeGreaterThan(single);
      expect(triple).toBeGreaterThan(double);
      expect(tetris).toBeGreaterThan(triple);
    });

    it('should add level bonus to score', () => {
      const scoreLevel0 = calculateLineScore(1, 0);
      const scoreLevel5 = calculateLineScore(1, 5);
      
      expect(scoreLevel5).toBeGreaterThan(scoreLevel0);
    });
  });

  describe('calculateSoftDropBonus', () => {
    it('should calculate soft drop bonus', () => {
      expect(calculateSoftDropBonus(0)).toBe(0);
      expect(calculateSoftDropBonus(5)).toBe(2.5);
      expect(calculateSoftDropBonus(10)).toBe(5);
    });
  });

  describe('calculateHardDropBonus', () => {
    it('should calculate hard drop bonus', () => {
      expect(calculateHardDropBonus(0)).toBe(0);
      expect(calculateHardDropBonus(5)).toBe(10);
      expect(calculateHardDropBonus(10)).toBe(20);
    });

    it('should give more points than soft drop', () => {
      const cells = 10;
      expect(calculateHardDropBonus(cells)).toBeGreaterThan(calculateSoftDropBonus(cells));
    });
  });

  describe('calculateLevel', () => {
    it('should calculate level based on total lines', () => {
      expect(calculateLevel(0)).toBe(0);
      expect(calculateLevel(LINES_PER_LEVEL - 1)).toBe(0);
      expect(calculateLevel(LINES_PER_LEVEL)).toBe(1);
      expect(calculateLevel(LINES_PER_LEVEL * 2)).toBe(2);
    });

    it('should not exceed max level', () => {
      expect(calculateLevel(1000)).toBeLessThanOrEqual(25);
    });
  });

  describe('shouldLevelUp', () => {
    it('should return true when crossing level threshold', () => {
      const previousLines = LINES_PER_LEVEL - 1;
      const newLines = LINES_PER_LEVEL;
      
      expect(shouldLevelUp(previousLines, newLines)).toBe(true);
    });

    it('should return false when staying in same level', () => {
      expect(shouldLevelUp(0, 1)).toBe(false);
      expect(shouldLevelUp(5, 6)).toBe(false);
    });

    it('should return false when level does not change', () => {
      const lines = LINES_PER_LEVEL + 1;
      expect(shouldLevelUp(lines, lines + 1)).toBe(false);
    });
  });

  describe('getDropSpeed', () => {
    it('should return faster speed for higher levels', () => {
      const speed0 = getDropSpeed(0);
      const speed10 = getDropSpeed(10);
      
      expect(speed10).toBeLessThan(speed0);
    });

    it('should handle negative level', () => {
      expect(() => getDropSpeed(-1)).not.toThrow();
    });

    it('should handle level beyond max', () => {
      expect(() => getDropSpeed(100)).not.toThrow();
    });
  });

  describe('getLinesUntilNextLevel', () => {
    it('should calculate lines needed correctly', () => {
      expect(getLinesUntilNextLevel(0)).toBe(LINES_PER_LEVEL);
      expect(getLinesUntilNextLevel(1)).toBe(LINES_PER_LEVEL - 1);
      expect(getLinesUntilNextLevel(LINES_PER_LEVEL - 1)).toBe(1);
      expect(getLinesUntilNextLevel(LINES_PER_LEVEL)).toBe(LINES_PER_LEVEL);
    });
  });
});

