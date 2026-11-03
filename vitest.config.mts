import { realpathSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

const root = realpathSync.native(fileURLToPath(new URL('.', import.meta.url)));

export default defineConfig({
  root,
  resolve: {
    alias: {
      '@': join(root, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    clearMocks: true,
  },
});
