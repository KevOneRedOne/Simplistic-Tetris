import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@rendering': resolve(__dirname, './src/rendering'),
      '@input': resolve(__dirname, './src/input'),
      '@ui': resolve(__dirname, './src/ui'),
      '@i18n': resolve(__dirname, './src/i18n'),
      '@types': resolve(__dirname, './src/types'),
      '@constants': resolve(__dirname, './src/constants'),
      '@styles': resolve(__dirname, './src/styles'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Modern Sass architecture with @use - no need for global imports
        api: 'modern-compiler',
      },
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'game-core': ['./src/core/GameEngine.ts', './src/core/Board.ts', './src/core/Tetromino.ts'],
          'rendering': ['./src/rendering/CanvasRenderer.ts', './src/rendering/AnimationEngine.ts'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.test.ts'],
    },
  },
});

