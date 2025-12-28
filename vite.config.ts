import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

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
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('iconify')) {
              return 'vendor-iconify';
            }
            return 'vendor';
          }
          // Split game chunks
          if (id.includes('/core/')) {
            return 'game-core';
          }
          if (id.includes('/rendering/')) {
            return 'rendering';
          }
          if (id.includes('/ui/')) {
            return 'ui';
          }
          if (id.includes('/i18n/')) {
            return 'i18n';
          }
        },
        // Optimize chunk size
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.test.ts'],
    },
  },
});

