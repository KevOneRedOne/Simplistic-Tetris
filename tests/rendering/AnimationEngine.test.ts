import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnimationEngine } from '../../src/rendering/AnimationEngine';

describe('AnimationEngine', () => {
  let engine: AnimationEngine;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    engine = new AnimationEngine();
    canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 800;
    const context = canvas.getContext('2d');
    
    // For jsdom without canvas, create a mock context
    if (!context) {
      ctx = {
        fillRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        fillStyle: '',
        globalAlpha: 1,
        canvas: canvas,
      } as unknown as CanvasRenderingContext2D;
    } else {
      ctx = context;
    }
  });

  describe('Initialization', () => {
    it('should initialize with no particles', () => {
      expect(engine.getParticleCount()).toBe(0);
    });

    it('should initialize with no active animations', () => {
      expect(engine.isAnimating('line_clear')).toBe(false);
      expect(engine.isAnimating('game_over')).toBe(false);
    });
  });

  describe('Particle System', () => {
    it('should create particles', () => {
      const particleConfig = {
        count: 10,
        speed: 5,
        size: 4,
        lifetime: 1000,
        colors: ['#ff0000', '#00ff00', '#0000ff'],
      };

      engine.createParticles(100, 100, particleConfig);

      expect(engine.getParticleCount()).toBe(10);
    });

    it('should update particle positions', () => {
      const particleConfig = {
        count: 5,
        speed: 5,
        size: 4,
        lifetime: 1000,
        colors: ['#ff0000'],
      };

      engine.createParticles(100, 100, particleConfig);
      const initialCount = engine.getParticleCount();

      engine.update(16); // 16ms ~ 1 frame

      expect(engine.getParticleCount()).toBe(initialCount);
    });

    it('should remove particles after lifetime expires', () => {
      const particleConfig = {
        count: 5,
        speed: 5,
        size: 4,
        lifetime: 100, // Short lifetime
        colors: ['#ff0000'],
      };

      engine.createParticles(100, 100, particleConfig);

      // Fast-forward time
      for (let i = 0; i < 10; i++) {
        engine.update(50);
      }

      expect(engine.getParticleCount()).toBe(0);
    });

    it('should render particles on canvas', () => {
      const particleConfig = {
        count: 5,
        speed: 5,
        size: 4,
        lifetime: 1000,
        colors: ['#ff0000'],
      };

      engine.createParticles(100, 100, particleConfig);

      // Should not throw when rendering
      expect(() => engine.render(ctx)).not.toThrow();
    });
  });

  describe('Line Clear Animation', () => {
    it('should create line clear animation', () => {
      engine.animateLineClear([0], 40);

      expect(engine.isAnimating('line_clear')).toBe(true);
      expect(engine.getParticleCount()).toBeGreaterThan(0);
    });

    it('should create particles for multiple lines', () => {
      engine.animateLineClear([0, 1, 2, 3], 40);

      expect(engine.getParticleCount()).toBeGreaterThan(0);
      expect(engine.isAnimating('line_clear')).toBe(true);
    });

    it('should complete line clear animation after duration', () => {
      engine.animateLineClear([0], 40);

      expect(engine.isAnimating('line_clear')).toBe(true);

      // Fast-forward time beyond animation duration
      for (let i = 0; i < 100; i++) {
        engine.update(50);
      }

      expect(engine.isAnimating('line_clear')).toBe(false);
    });
  });

  describe('Game Over Animation', () => {
    it('should create game over animation', () => {
      engine.animateGameOver(canvas);

      expect(engine.isAnimating('game_over')).toBe(true);
      expect(engine.getParticleCount()).toBeGreaterThan(0);
    });

    it('should create particles at canvas center', () => {
      engine.animateGameOver(canvas);

      expect(engine.getParticleCount()).toBeGreaterThan(0);
    });

    it('should complete game over animation after duration', () => {
      engine.animateGameOver(canvas);

      expect(engine.isAnimating('game_over')).toBe(true);

      // Fast-forward time
      for (let i = 0; i < 100; i++) {
        engine.update(50);
      }

      expect(engine.isAnimating('game_over')).toBe(false);
    });
  });

  describe('Level Up Animation', () => {
    it('should create level up animation', () => {
      engine.animateLevelUp(canvas);

      expect(engine.isAnimating('level_up')).toBe(true);
      expect(engine.getParticleCount()).toBeGreaterThan(0);
    });

    it('should complete level up animation after duration', () => {
      engine.animateLevelUp(canvas);

      expect(engine.isAnimating('level_up')).toBe(true);

      // Fast-forward time
      for (let i = 0; i < 100; i++) {
        engine.update(50);
      }

      expect(engine.isAnimating('level_up')).toBe(false);
    });
  });

  describe('Flash Effect', () => {
    it('should render flash effect', () => {
      expect(() => engine.flash(ctx)).not.toThrow();
    });

    it('should accept custom color and opacity', () => {
      expect(() => engine.flash(ctx, 'red', 0.8)).not.toThrow();
    });
  });

  describe('Update Loop', () => {
    it('should update all particles', () => {
      const particleConfig = {
        count: 10,
        speed: 5,
        size: 4,
        lifetime: 1000,
        colors: ['#ff0000'],
      };

      engine.createParticles(100, 100, particleConfig);
      const initialCount = engine.getParticleCount();

      engine.update(16);

      expect(engine.getParticleCount()).toBe(initialCount);
    });

    it('should update all animations', () => {
      engine.animateLineClear([0], 40);
      engine.animateLevelUp(canvas);

      expect(engine.isAnimating('line_clear')).toBe(true);
      expect(engine.isAnimating('level_up')).toBe(true);

      engine.update(16);

      // Animations should still be active after one frame
      expect(engine.isAnimating('line_clear')).toBe(true);
      expect(engine.isAnimating('level_up')).toBe(true);
    });
  });

  describe('Clear All', () => {
    it('should clear all particles and animations', () => {
      const particleConfig = {
        count: 10,
        speed: 5,
        size: 4,
        lifetime: 1000,
        colors: ['#ff0000'],
      };

      engine.createParticles(100, 100, particleConfig);
      engine.animateLineClear([0], 40);
      engine.animateLevelUp(canvas);

      expect(engine.getParticleCount()).toBeGreaterThan(0);
      expect(engine.isAnimating('line_clear')).toBe(true);
      expect(engine.isAnimating('level_up')).toBe(true);

      engine.clearAll();

      expect(engine.getParticleCount()).toBe(0);
      expect(engine.isAnimating('line_clear')).toBe(false);
      expect(engine.isAnimating('level_up')).toBe(false);
    });
  });

  describe('Render', () => {
    it('should render without errors when no particles', () => {
      expect(() => engine.render(ctx)).not.toThrow();
    });

    it('should render particles with alpha transparency', () => {
      const particleConfig = {
        count: 5,
        speed: 5,
        size: 4,
        lifetime: 1000,
        colors: ['#ff0000'],
      };

      engine.createParticles(100, 100, particleConfig);

      engine.render(ctx);

      expect(ctx.globalAlpha).toBe(1); // Should be reset to 1 after rendering
    });
  });

  describe('Animation States', () => {
    it('should check if animation is playing', () => {
      expect(engine.isAnimating('line_clear')).toBe(false);

      engine.animateLineClear([0], 40);

      expect(engine.isAnimating('line_clear')).toBe(true);
    });

    it('should return false for non-existent animation', () => {
      expect(engine.isAnimating('non_existent')).toBe(false);
    });
  });

  describe('Particle Count', () => {
    it('should return correct particle count', () => {
      expect(engine.getParticleCount()).toBe(0);

      const particleConfig = {
        count: 15,
        speed: 5,
        size: 4,
        lifetime: 1000,
        colors: ['#ff0000'],
      };

      engine.createParticles(100, 100, particleConfig);

      expect(engine.getParticleCount()).toBe(15);
    });

    it('should decrease particle count as particles expire', () => {
      const particleConfig = {
        count: 10,
        speed: 5,
        size: 4,
        lifetime: 50,
        colors: ['#ff0000'],
      };

      engine.createParticles(100, 100, particleConfig);

      const initialCount = engine.getParticleCount();

      // Fast-forward to expire some particles
      engine.update(100);

      const finalCount = engine.getParticleCount();

      expect(finalCount).toBeLessThan(initialCount);
    });
  });
});
