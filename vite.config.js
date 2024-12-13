import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests',
    reporters: ['default', 'verbose'],
    transformMode: {
      web: [/\.jsx?$/], // transform JS/JSX  Ta bort?
      coverage: {
        provider: 'v8', // Använd V8:s inbyggda coverage-verktyg
        reporter: ['text', 'lcov'], // Text- och lcov-format
        statements: 70, // Minsta procentandel för täckning
      },
    },
  },
});
