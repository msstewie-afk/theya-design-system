// Prints a ready-to-run Figma plugin script for the Figma MCP `use_figma` tool:
//
//   node scripts/figma-run.mjs check   -> build/figma/check.js  (read-only diff)
//   node scripts/figma-run.mjs sync    -> build/figma/sync.js   (writes Figma)
//
// Run `node scripts/figma-payload.mjs` first so the payload is current.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const action = process.argv[2];
if (!['check', 'sync'].includes(action)) { console.error('usage: figma-run.mjs check|sync'); process.exit(1); }
// --only=2.,4. keeps those collections (use_figma takes at most 50 000 characters);
// the rest are still loaded as alias targets, but not checked or written.
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const full = JSON.parse(readFileSync(join(ROOT, 'build/figma/payload.json'), 'utf8'));
full.creatable = Object.keys(full.collections).filter((k) => full.collections[k].create);
if (only.length) {
  full.alsoLoad = Object.keys(full.collections).filter((k) => !only.includes(k));
  full.collections = Object.fromEntries(Object.entries(full.collections).filter(([k]) => only.includes(k)));
}
const payload = JSON.stringify(full);
const lib = readFileSync(join(ROOT, 'scripts/figma/lib.js'), 'utf8');
const body = readFileSync(join(ROOT, `scripts/figma/${action}.js`), 'utf8');
const out = join(ROOT, `build/figma/${action}${only.length ? '-' + only.join('-').replace(/\./g, '') : ''}.js`);
const code = `const PAYLOAD = ${payload};\n${lib}\n${body}`;
writeFileSync(out, code);
console.log(out, code.length + ' chars');
