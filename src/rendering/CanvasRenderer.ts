/**
 * Canvas Renderer for Tetris V2
 * Handles all drawing operations on the game canvas
 */

import type { BoardGrid, Tetromino } from '@/types/index';
import {
  BOARD_COLS,
  BOARD_ROWS,
  CELL_SIZE,
  GHOST_PIECE_OPACITY,
  VACANT_COLOR,
} from '@constants/config';
import { getTetrominoOccupiedCells } from '@core/Tetromino';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private colorBlindMode: boolean = false;

  constructor(canvas: HTMLCanvasElement, cellSize: number = CELL_SIZE) {
    this.canvas = canvas;
    this.cellSize = cellSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;

    // Set canvas dimensions
    this.canvas.width = BOARD_COLS * this.cellSize;
    this.canvas.height = BOARD_ROWS * this.cellSize;
  }

  /**
   * Clear the entire canvas
   */
  public clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw a single square with optional 3D effects
   */
  private drawSquare(x: number, y: number, color: string, opacity = 1, with3D = false): void {
    // Don't draw if off-screen (above board)
    if (y < 0) {
      return;
    }

    const prevAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = opacity;

    const xPos = x * this.cellSize;
    const yPos = y * this.cellSize;

    if (with3D) {
      // Fill with subtle gradient for soft 3D effect
      const gradient = this.ctx.createLinearGradient(xPos, yPos, xPos, yPos + this.cellSize);
      gradient.addColorStop(0, this.lightenColor(color, 15));
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, this.darkenColor(color, 12));
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(xPos, yPos, this.cellSize, this.cellSize);

      // Add subtle highlight at the top
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      this.ctx.fillRect(xPos + 1, yPos + 1, this.cellSize - 2, this.cellSize * 0.25);

      // Add very subtle shadow at the bottom
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.fillRect(
        xPos + 1,
        yPos + this.cellSize * 0.75,
        this.cellSize - 2,
        this.cellSize * 0.25 - 1
      );

      // Thin outer border
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(xPos, yPos, this.cellSize, this.cellSize);

      // Very subtle inner light border (top and left)
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos + this.cellSize - 1, yPos + 1);
      this.ctx.lineTo(xPos + 1, yPos + 1);
      this.ctx.lineTo(xPos + 1, yPos + this.cellSize - 1);
      this.ctx.stroke();

      // Very subtle inner dark border (bottom and right)
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos + 1, yPos + this.cellSize - 1);
      this.ctx.lineTo(xPos + this.cellSize - 1, yPos + this.cellSize - 1);
      this.ctx.lineTo(xPos + this.cellSize - 1, yPos + 1);
      this.ctx.stroke();

      // Draw pattern in colorblind mode
      if (this.colorBlindMode) {
        this.drawColorBlindPattern(xPos, yPos, color);
      }
    } else {
      // Simple fill for board squares (no 3D effect)
      this.ctx.fillStyle = color;
      this.ctx.fillRect(xPos, yPos, this.cellSize, this.cellSize);

      // Simple border
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(xPos, yPos, this.cellSize, this.cellSize);
    }

    this.ctx.globalAlpha = prevAlpha;
  }

  /**
   * Draw the game board (with 3D effects only for occupied cells)
   */
  public drawBoard(board: BoardGrid): void {
    for (let row = 0; row < BOARD_ROWS; row++) {
      const boardRow = board[row];
      if (!boardRow) continue;

      for (let col = 0; col < BOARD_COLS; col++) {
        const color = boardRow[col];
        // Only draw if cell is not vacant
        if (color && color !== VACANT_COLOR) {
          this.drawSquare(col, row, color, 1, true); // With 3D effect for occupied cells
        }
      }
    }
  }

  /**
   * Draw grid lines (subtle and visible)
   */
  public drawGrid(): void {
    this.ctx.strokeStyle = 'rgba(120, 120, 120, 0.12)';
    this.ctx.lineWidth = 0.5;

    // Vertical lines
    for (let col = 0; col <= BOARD_COLS; col++) {
      this.ctx.beginPath();
      this.ctx.moveTo(col * this.cellSize, 0);
      this.ctx.lineTo(col * this.cellSize, this.canvas.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let row = 0; row <= BOARD_ROWS; row++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, row * this.cellSize);
      this.ctx.lineTo(this.canvas.width, row * this.cellSize);
      this.ctx.stroke();
    }
  }

  /**
   * Draw a tetromino (with 3D effects)
   */
  public drawTetromino(tetromino: Tetromino, opacity = 1): void {
    const cells = getTetrominoOccupiedCells(tetromino);

    for (const cell of cells) {
      this.drawSquare(cell.x, cell.y, tetromino.color, opacity, true); // With 3D effect
    }
  }

  /**
   * Draw ghost piece
   */
  public drawGhostPiece(ghostPiece: Tetromino): void {
    this.drawTetromino(ghostPiece, GHOST_PIECE_OPACITY);
  }

  /**
   * Draw preview piece (smaller scale) with gradient and highlight
   */
  public drawPreviewPiece(tetromino: Tetromino, previewCanvas: HTMLCanvasElement): void {
    const previewCtx = previewCanvas.getContext('2d');
    if (!previewCtx) return;

    // Clear preview canvas
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    const previewCellSize = this.cellSize * 0.7;
    const shape = tetromino.shape;

    // Center the piece in preview
    const pieceWidth = shape[0]?.length || 0;
    const pieceHeight = shape.length;
    const offsetX = (previewCanvas.width - pieceWidth * previewCellSize) / 2;
    const offsetY = (previewCanvas.height - pieceHeight * previewCellSize) / 2;

    for (let row = 0; row < shape.length; row++) {
      const shapeRow = shape[row];
      if (!shapeRow) continue;

      for (let col = 0; col < shapeRow.length; col++) {
        if (shapeRow[col] === 1) {
          const xPos = offsetX + col * previewCellSize;
          const yPos = offsetY + row * previewCellSize;

          // Fill with subtle gradient
          const gradient = previewCtx.createLinearGradient(
            xPos,
            yPos,
            xPos,
            yPos + previewCellSize
          );
          gradient.addColorStop(0, this.lightenColor(tetromino.color, 15));
          gradient.addColorStop(0.5, tetromino.color);
          gradient.addColorStop(1, this.darkenColor(tetromino.color, 12));
          previewCtx.fillStyle = gradient;
          previewCtx.fillRect(xPos, yPos, previewCellSize, previewCellSize);

          // Add subtle highlight at the top
          previewCtx.fillStyle = 'rgba(255, 255, 255, 0.18)';
          previewCtx.fillRect(xPos + 1, yPos + 1, previewCellSize - 2, previewCellSize * 0.25);

          // Add very subtle shadow at the bottom
          previewCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          previewCtx.fillRect(
            xPos + 1,
            yPos + previewCellSize * 0.75,
            previewCellSize - 2,
            previewCellSize * 0.25 - 1
          );

          // Thin outer border
          previewCtx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
          previewCtx.lineWidth = 1;
          previewCtx.strokeRect(xPos, yPos, previewCellSize, previewCellSize);

          // Very subtle inner light border (top and left)
          previewCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          previewCtx.lineWidth = 1;
          previewCtx.beginPath();
          previewCtx.moveTo(xPos + previewCellSize - 1, yPos + 1);
          previewCtx.lineTo(xPos + 1, yPos + 1);
          previewCtx.lineTo(xPos + 1, yPos + previewCellSize - 1);
          previewCtx.stroke();

          // Very subtle inner dark border (bottom and right)
          previewCtx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
          previewCtx.lineWidth = 1;
          previewCtx.beginPath();
          previewCtx.moveTo(xPos + 1, yPos + previewCellSize - 1);
          previewCtx.lineTo(xPos + previewCellSize - 1, yPos + previewCellSize - 1);
          previewCtx.lineTo(xPos + previewCellSize - 1, yPos + 1);
          previewCtx.stroke();

          // Draw pattern in colorblind mode
          if (this.colorBlindMode) {
            this.drawColorBlindPatternPreview(
              previewCtx,
              xPos,
              yPos,
              previewCellSize,
              tetromino.color
            );
          }
        }
      }
    }
  }

  /**
   * Render complete frame
   */
  public render(
    board: BoardGrid,
    currentPiece: Tetromino | null,
    ghostPiece: Tetromino | null
  ): void {
    this.clear();
    this.drawBoard(board);
    this.drawGrid();

    if (ghostPiece) {
      this.drawGhostPiece(ghostPiece);
    }

    if (currentPiece) {
      this.drawTetromino(currentPiece);
    }
  }

  /**
   * Highlight line clear animation
   */
  public highlightLines(lineIndices: number[], color = 'white'): void {
    for (const lineIndex of lineIndices) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, lineIndex * this.cellSize, this.canvas.width, this.cellSize);
    }
  }

  /**
   * Resize canvas
   */
  public resize(newCellSize: number): void {
    this.cellSize = newCellSize;
    this.canvas.width = BOARD_COLS * this.cellSize;
    this.canvas.height = BOARD_ROWS * this.cellSize;
  }

  /**
   * Auto-resize canvas based on container size (responsive)
   */
  public autoResize(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate optimal cell size based on container
    const maxWidthBasedSize = Math.floor(containerWidth / BOARD_COLS);
    const maxHeightBasedSize = Math.floor(containerHeight / BOARD_ROWS);

    // Use the smaller of the two to ensure it fits
    const optimalCellSize = Math.min(
      maxWidthBasedSize,
      maxHeightBasedSize,
      CELL_SIZE // Don't exceed default max size
    );

    // Only resize if there's a significant change (avoid constant redraws)
    if (Math.abs(this.cellSize - optimalCellSize) > 1) {
      this.resize(optimalCellSize);
    }
  }

  /**
   * Get canvas dimensions
   */
  public getDimensions(): { width: number; height: number } {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  /**
   * Get cell size
   */
  public getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Get canvas element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get canvas rendering context
   */
  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Enable or disable colorblind mode
   */
  public setColorBlindMode(enabled: boolean): void {
    this.colorBlindMode = enabled;
  }

  /**
   * Get colorblind mode status
   */
  public isColorBlindMode(): boolean {
    return this.colorBlindMode;
  }

  /**
   * Draw pattern for colorblind mode based on color
   */
  private drawColorBlindPattern(xPos: number, yPos: number, color: string): void {
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.lineWidth = 1.5;

    const center = this.cellSize / 2;
    const padding = this.cellSize * 0.2;

    // Pattern based on Tetromino color
    switch (color) {
      case '#00f0f0': // I - Cyan - Horizontal lines
        for (let i = 1; i <= 3; i++) {
          const y = yPos + (this.cellSize / 4) * i;
          this.ctx.beginPath();
          this.ctx.moveTo(xPos + padding, y);
          this.ctx.lineTo(xPos + this.cellSize - padding, y);
          this.ctx.stroke();
        }
        break;

      case '#f0a000': // J - Orange - L shape
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + padding, yPos + padding);
        this.ctx.lineTo(xPos + padding, yPos + this.cellSize - padding);
        this.ctx.lineTo(xPos + this.cellSize - padding, yPos + this.cellSize - padding);
        this.ctx.stroke();
        break;

      case '#0000f0': // L - Blue - Reversed L shape
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + this.cellSize - padding, yPos + padding);
        this.ctx.lineTo(xPos + this.cellSize - padding, yPos + this.cellSize - padding);
        this.ctx.lineTo(xPos + padding, yPos + this.cellSize - padding);
        this.ctx.stroke();
        break;

      case '#f0f000': // O - Yellow - Square
        this.ctx.strokeRect(
          xPos + padding,
          yPos + padding,
          this.cellSize - padding * 2,
          this.cellSize - padding * 2
        );
        break;

      case '#00f000': // S - Green - Diagonal /
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + padding, yPos + this.cellSize - padding);
        this.ctx.lineTo(xPos + this.cellSize - padding, yPos + padding);
        this.ctx.stroke();
        break;

      case '#a000f0': // T - Purple - T shape
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + padding, yPos + center);
        this.ctx.lineTo(xPos + this.cellSize - padding, yPos + center);
        this.ctx.moveTo(xPos + center, yPos + center);
        this.ctx.lineTo(xPos + center, yPos + this.cellSize - padding);
        this.ctx.stroke();
        break;

      case '#f00000': // Z - Red - Diagonal \
        this.ctx.beginPath();
        this.ctx.moveTo(xPos + padding, yPos + padding);
        this.ctx.lineTo(xPos + this.cellSize - padding, yPos + this.cellSize - padding);
        this.ctx.stroke();
        break;

      default:
        break;
    }
  }

  /**
   * Draw pattern for colorblind mode in preview canvas
   */
  private drawColorBlindPatternPreview(
    ctx: CanvasRenderingContext2D,
    xPos: number,
    yPos: number,
    cellSize: number,
    color: string
  ): void {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1.2;

    const center = cellSize / 2;
    const padding = cellSize * 0.2;

    // Pattern based on Tetromino color
    switch (color) {
      case '#00f0f0': // I - Cyan - Horizontal lines
        for (let i = 1; i <= 3; i++) {
          const y = yPos + (cellSize / 4) * i;
          ctx.beginPath();
          ctx.moveTo(xPos + padding, y);
          ctx.lineTo(xPos + cellSize - padding, y);
          ctx.stroke();
        }
        break;

      case '#f0a000': // J - Orange - L shape
        ctx.beginPath();
        ctx.moveTo(xPos + padding, yPos + padding);
        ctx.lineTo(xPos + padding, yPos + cellSize - padding);
        ctx.lineTo(xPos + cellSize - padding, yPos + cellSize - padding);
        ctx.stroke();
        break;

      case '#0000f0': // L - Blue - Reversed L shape
        ctx.beginPath();
        ctx.moveTo(xPos + cellSize - padding, yPos + padding);
        ctx.lineTo(xPos + cellSize - padding, yPos + cellSize - padding);
        ctx.lineTo(xPos + padding, yPos + cellSize - padding);
        ctx.stroke();
        break;

      case '#f0f000': // O - Yellow - Square
        ctx.strokeRect(
          xPos + padding,
          yPos + padding,
          cellSize - padding * 2,
          cellSize - padding * 2
        );
        break;

      case '#00f000': // S - Green - Diagonal /
        ctx.beginPath();
        ctx.moveTo(xPos + padding, yPos + cellSize - padding);
        ctx.lineTo(xPos + cellSize - padding, yPos + padding);
        ctx.stroke();
        break;

      case '#a000f0': // T - Purple - T shape
        ctx.beginPath();
        ctx.moveTo(xPos + padding, yPos + center);
        ctx.lineTo(xPos + cellSize - padding, yPos + center);
        ctx.moveTo(xPos + center, yPos + center);
        ctx.lineTo(xPos + center, yPos + cellSize - padding);
        ctx.stroke();
        break;

      case '#f00000': // Z - Red - Diagonal \
        ctx.beginPath();
        ctx.moveTo(xPos + padding, yPos + padding);
        ctx.lineTo(xPos + cellSize - padding, yPos + cellSize - padding);
        ctx.stroke();
        break;

      default:
        break;
    }
  }

  /**
   * Lighten a hex color by a percentage
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  /**
   * Darken a hex color by a percentage
   */
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }
}
