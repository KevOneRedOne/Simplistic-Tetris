/**
 * Tetromino shapes and factory
 * Migrated from tetrominoes.js with TypeScript types
 */

import { TetrominoType } from '@/types/index';
import type { TetrominoShape, Tetromino, Position, TetrominoMatrix } from '@/types/index';
import { TETROMINO_COLORS, SPAWN_POSITION } from '@constants/config';

/**
 * Tetromino shape definitions
 * 0 = empty, 1 = occupied
 */

const I_SHAPE: TetrominoMatrix[] = [
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
  ],
  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
];

const J_SHAPE: TetrominoMatrix[] = [
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
  ],
  [
    [0, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
  ],
  [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ],
];

const L_SHAPE: TetrominoMatrix[] = [
  [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 0, 0],
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
];

const O_SHAPE: TetrominoMatrix[] = [
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
];

const S_SHAPE: TetrominoMatrix[] = [
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  [
    [0, 1, 0],
    [0, 1, 1],
    [0, 0, 1],
  ],
  [
    [0, 0, 0],
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
  ],
];

const T_SHAPE: TetrominoMatrix[] = [
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 1, 0],
    [0, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0],
  ],
];

const Z_SHAPE: TetrominoMatrix[] = [
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 0, 1],
    [0, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 0, 0],
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 0],
    [1, 0, 0],
  ],
];

/**
 * Tetromino shape definitions by type
 */
export const TETROMINO_SHAPES: Record<TetrominoType, TetrominoShape> = {
  [TetrominoType.I]: {
    shape: I_SHAPE,
    color: TETROMINO_COLORS.I,
    name: TetrominoType.I,
  },
  [TetrominoType.J]: {
    shape: J_SHAPE,
    color: TETROMINO_COLORS.J,
    name: TetrominoType.J,
  },
  [TetrominoType.L]: {
    shape: L_SHAPE,
    color: TETROMINO_COLORS.L,
    name: TetrominoType.L,
  },
  [TetrominoType.O]: {
    shape: O_SHAPE,
    color: TETROMINO_COLORS.O,
    name: TetrominoType.O,
  },
  [TetrominoType.S]: {
    shape: S_SHAPE,
    color: TETROMINO_COLORS.S,
    name: TetrominoType.S,
  },
  [TetrominoType.T]: {
    shape: T_SHAPE,
    color: TETROMINO_COLORS.T,
    name: TetrominoType.T,
  },
  [TetrominoType.Z]: {
    shape: Z_SHAPE,
    color: TETROMINO_COLORS.Z,
    name: TetrominoType.Z,
  },
};

/**
 * All tetromino types for random selection
 */
export const ALL_TETROMINO_TYPES = [
  TetrominoType.I,
  TetrominoType.J,
  TetrominoType.L,
  TetrominoType.O,
  TetrominoType.S,
  TetrominoType.T,
  TetrominoType.Z,
];

/**
 * Create a tetromino of a specific type
 */
export function createTetromino(type: TetrominoType, position?: Position): Tetromino {
  const tetrominoShape = TETROMINO_SHAPES[type];
  const firstShape = tetrominoShape.shape[0];

  if (!firstShape) {
    throw new Error(`No shape defined for tetromino type ${type}`);
  }

  return {
    type,
    color: tetrominoShape.color,
    shape: firstShape,
    rotation: 0,
    position: position || { ...SPAWN_POSITION },
  };
}

/**
 * Create a random tetromino
 */
export function createRandomTetromino(position?: Position): Tetromino {
  const randomType = ALL_TETROMINO_TYPES[Math.floor(Math.random() * ALL_TETROMINO_TYPES.length)];
  if (!randomType) {
    throw new Error('Failed to generate random tetromino');
  }
  return createTetromino(randomType, position);
}

/**
 * Rotate a tetromino clockwise
 */
export function rotateTetromino(tetromino: Tetromino): Tetromino {
  const shapes = TETROMINO_SHAPES[tetromino.type]?.shape;
  if (!shapes || shapes.length === 0) {
    return tetromino;
  }

  const newRotation = (tetromino.rotation + 1) % shapes.length;
  const newShape = shapes[newRotation];

  if (!newShape || newShape.length === 0) {
    return tetromino;
  }

  return {
    ...tetromino,
    rotation: newRotation,
    shape: newShape as number[][],
  };
}

/**
 * Move a tetromino to a new position
 */
export function moveTetromino(tetromino: Tetromino, dx: number, dy: number): Tetromino {
  return {
    ...tetromino,
    position: {
      x: tetromino.position.x + dx,
      y: tetromino.position.y + dy,
    },
  };
}

/**
 * Clone a tetromino (for testing collision without mutating)
 */
export function cloneTetromino(tetromino: Tetromino): Tetromino {
  return {
    ...tetromino,
    position: { ...tetromino.position },
    shape: tetromino.shape.map((row) => [...row]),
  };
}

/**
 * Get all occupied cells of a tetromino (absolute positions on board)
 */
export function getTetrominoOccupiedCells(tetromino: Tetromino): Position[] {
  const cells: Position[] = [];

  for (let row = 0; row < tetromino.shape.length; row++) {
    const shapeRow = tetromino.shape[row];
    if (!shapeRow) continue;

    for (let col = 0; col < shapeRow.length; col++) {
      if (shapeRow[col] === 1) {
        cells.push({
          x: tetromino.position.x + col,
          y: tetromino.position.y + row,
        });
      }
    }
  }

  return cells;
}
