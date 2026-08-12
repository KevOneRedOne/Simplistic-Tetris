import { resolve } from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vitest/config';

const rootDir = import.meta.dirname;
const isAnalyze = process.env['ANALYZE'] === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: isAnalyze
    ? [
        visualizer({
          open: true,
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
      ]
    : [],
  resolve: {
    alias: {
      '@': resolve(rootDir, './src'),
      '@core': resolve(rootDir, './src/core'),
      '@rendering': resolve(rootDir, './src/rendering'),
      '@input': resolve(rootDir, './src/input'),
      '@ui': resolve(rootDir, './src/ui'),
      '@i18n': resolve(rootDir, './src/i18n'),
      '@types': resolve(rootDir, './src/types'),
      '@constants': resolve(rootDir, './src/constants'),
      '@styles': resolve(rootDir, './src/styles'),
      '@assets': resolve(rootDir, './src/assets'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        codeSplitting: {
          groups: [
            { name: 'vendor-iconify', test: /[\\/]node_modules[\\/].*iconify/ },
            { name: 'vendor', test: /[\\/]node_modules[\\/]/ },
            { name: 'game-core', test: /[\\/]core[\\/]/ },
            { name: 'rendering', test: /[\\/]rendering[\\/]/ },
            { name: 'ui', test: /[\\/]ui[\\/]/ },
            { name: 'i18n', test: /[\\/]i18n[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/types/**',
        '**/constants/**',
        'vite.config.ts',
        'dist/**',
        'scripts/**',
      ],
      include: ['src/**/*.ts'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});

