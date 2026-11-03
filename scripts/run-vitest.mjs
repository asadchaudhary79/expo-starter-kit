import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';

const cwd = realpathSync.native(process.cwd());
const result = spawnSync('npx vitest run', {
  cwd,
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
