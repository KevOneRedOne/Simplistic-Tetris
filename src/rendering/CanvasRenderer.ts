/**
 * Canvas Renderer for Tetris V2
 * Handles all drawing operations on the game canvas
 */

import type { BoardGrid, Tetromino } from '@/types/index';
import { BOARD_COLS, BOARD_ROWS, CELL_SIZE, GHOST_PIECE_OPACITY } from '@constants/config';
import { getTetrominoOccupiedCells } from '@core/Tetromino';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;

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
   * Draw a single square
   */
  private drawSquare(x: number, y: number, color: string, opacity = 1): void {
    // Don't draw if off-screen (above board)
    if (y < 0) {
      return;
    }

    const prevAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = opacity;

    // Fill
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);

    // Border
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);

    this.ctx.globalAlpha = prevAlpha;
  }

  /**
   * Draw the game board
   */
  public drawBoard(board: BoardGrid): void {
    for (let row = 0; row < BOARD_ROWS; row++) {
      const boardRow = board[row];
      if (!boardRow) continue;

      for (let col = 0; col < BOARD_COLS; col++) {
        const color = boardRow[col];
        if (color) {
          this.drawSquare(col, row, color);
        }
      }
    }
  }

  /**
   * Draw grid lines
   */
  public drawGrid(): void {
    this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
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
   * Draw a tetromino
   */
  public drawTetromino(tetromino: Tetromino, opacity = 1): void {
    const cells = getTetrominoOccupiedCells(tetromino);

    for (const cell of cells) {
      this.drawSquare(cell.x, cell.y, tetromino.color, opacity);
    }
  }

  /**
   * Draw ghost piece
   */
  public drawGhostPiece(ghostPiece: Tetromino): void {
    this.drawTetromino(ghostPiece, GHOST_PIECE_OPACITY);
  }

  /**
   * Draw preview piece (smaller scale)
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
          previewCtx.fillStyle = tetromino.color;
          previewCtx.fillRect(
            offsetX + col * previewCellSize,
            offsetY + row * previewCellSize,
            previewCellSize,
            previewCellSize
          );

          previewCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          previewCtx.strokeRect(
            offsetX + col * previewCellSize,
            offsetY + row * previewCellSize,
            previewCellSize,
            previewCellSize
          );
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
}
