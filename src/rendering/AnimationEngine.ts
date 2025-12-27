/**
 * Animation Engine for Tetris V2
 * Handles visual effects and animations
 */

import type { ParticleConfig } from '@/types/index';
import { ANIMATION_DURATIONS, PARTICLE_CONFIGS } from '@constants/config';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
}

export class AnimationEngine {
  private particles: Particle[] = [];
  private animations: Map<string, Animation> = new Map();

  /**
   * Update all animations
   */
  public update(deltaTime: number): void {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      if (!particle) continue;

      particle.x += (particle.vx * deltaTime) / 16;
      particle.y += (particle.vy * deltaTime) / 16;
      particle.lifetime -= deltaTime;

      if (particle.lifetime <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update other animations
    this.animations.forEach((animation, key) => {
      animation.currentTime += deltaTime;
      if (animation.currentTime >= animation.duration) {
        this.animations.delete(key);
        if (animation.onComplete) {
          animation.onComplete();
        }
      }
    });
  }

  /**
   * Render all animations
   */
  public render(ctx: CanvasRenderingContext2D): void {
    // Render particles
    for (const particle of this.particles) {
      const alpha = particle.lifetime / particle.maxLifetime;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.fillRect(
        particle.x - particle.size / 2,
        particle.y - particle.size / 2,
        particle.size,
        particle.size
      );
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Create particle explosion
   */
  public createParticles(x: number, y: number, config: ParticleConfig): void {
    for (let i = 0; i < config.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * config.speed + 1;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: config.colors[Math.floor(Math.random() * config.colors.length)] || '#fff',
        size: config.size,
        lifetime: config.lifetime,
        maxLifetime: config.lifetime,
      });
    }
  }

  /**
   * Line clear animation
   */
  public animateLineClear(lineIndices: number[], cellSize: number): void {
    for (const lineIndex of lineIndices) {
      const y = lineIndex * cellSize + cellSize / 2;

      for (let col = 0; col < 10; col++) {
        const x = col * cellSize + cellSize / 2;
        this.createParticles(x, y, PARTICLE_CONFIGS.LINE_CLEAR);
      }
    }

    this.animations.set('line_clear', {
      currentTime: 0,
      duration: ANIMATION_DURATIONS.LINE_CLEAR,
    });
  }

  /**
   * Game over animation
   */
  public animateGameOver(canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    this.createParticles(centerX, centerY, PARTICLE_CONFIGS.GAME_OVER);

    this.animations.set('game_over', {
      currentTime: 0,
      duration: ANIMATION_DURATIONS.GAME_OVER,
    });
  }

  /**
   * Level up animation
   */
  public animateLevelUp(canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    this.createParticles(centerX, centerY, PARTICLE_CONFIGS.LEVEL_UP);

    this.animations.set('level_up', {
      currentTime: 0,
      duration: ANIMATION_DURATIONS.LEVEL_UP,
    });
  }

  /**
   * Flash effect
   */
  public flash(ctx: CanvasRenderingContext2D, color = 'white', opacity = 0.5): void {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  /**
   * Check if animation is playing
   */
  public isAnimating(name: string): boolean {
    return this.animations.has(name);
  }

  /**
   * Clear all animations
   */
  public clearAll(): void {
    this.particles = [];
    this.animations.clear();
  }

  /**
   * Get particle count
   */
  public getParticleCount(): number {
    return this.particles.length;
  }
}

interface Animation {
  currentTime: number;
  duration: number;
  onComplete?: () => void;
}
