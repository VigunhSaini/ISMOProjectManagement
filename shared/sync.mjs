// shared/sync.mjs
// Copies shared/ source files into backend/src/shared, web/src/shared, mobile/src/shared
// Run: node shared/sync.mjs
// This avoids npm workspaces symlinks which break Metro bundler and EAS/Render builds.

import { cpSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SRC = resolve(__dirname); // shared/

const TARGETS = [
  resolve(root, 'backend', 'src', 'shared'),
  resolve(root, 'web', 'src', 'shared'),
  resolve(root, 'mobile', 'src', 'shared'),
];

for (const target of TARGETS) {
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }
  cpSync(SRC, target, {
    recursive: true,
    filter: (src) => {
      // Skip the sync script itself and node_modules
      if (src.includes('sync.mjs')) return false;
      if (src.includes('node_modules')) return false;
      return true;
    },
  });
  console.log(`✓ Synced shared/ → ${target.replace(root, '')}`);
}

console.log('\n✅ All shared contracts synced successfully.\n');

