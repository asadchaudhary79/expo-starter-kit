import { realpathSync } from 'node:fs';

import { defineConfig } from 'vitest/config';

const root = realpathSync.native('.');

export default defineConfig({
  root,
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    clearMocks: true,
  },
});
