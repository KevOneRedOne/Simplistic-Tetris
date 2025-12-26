/**
 * FPS Counter
 * Tracks and displays frames per second
 */

export class FPSCounter {
  private frames: number = 0;
  private startTime: number = performance.now();
  private fps: number = 0;
  private fpsElement: HTMLElement | null;

  constructor(elementId: string = 'fpsValue') {
    this.fpsElement = document.getElementById(elementId);
  }

  /**
   * Update FPS counter (call this in your game loop)
   */
  public update(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.startTime;

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frames * 1000) / deltaTime);
      this.frames = 0;
      this.startTime = currentTime;
      this.render();
    }

    this.frames++;
  }

  /**
   * Render FPS to the DOM
   */
  private render(): void {
    if (this.fpsElement) {
      this.fpsElement.textContent = this.fps.toString();
    }
  }

  /**
   * Get current FPS value
   */
  public getFPS(): number {
    return this.fps;
  }

  /**
   * Reset the counter
   */
  public reset(): void {
    this.frames = 0;
    this.startTime = performance.now();
    this.fps = 0;
  }
}

