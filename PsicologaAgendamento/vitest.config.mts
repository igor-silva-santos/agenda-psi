import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.mts'],
    globals: true,
    coverage: {
      provider: '@vitest/coverage-v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/types/',
        'src/lib/supabase.ts',
        'src/middleware.ts',
        'src/app/layout.tsx',
        'src/app/providers.tsx',
        'src/components/ui/',
        '**/__tests__/',
        'vitest.setup.mts',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});