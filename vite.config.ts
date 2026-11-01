import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  build: {
    target: 'es2018',
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: false,
    host: '127.0.0.1',
  },
  test: {
    include: ['src/test/**/*.test.ts'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
