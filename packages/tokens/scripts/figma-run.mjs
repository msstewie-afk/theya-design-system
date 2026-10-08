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
const payload = readFileSync(join(ROOT, 'build/figma/payload.json'), 'utf8');
const lib = readFileSync(join(ROOT, 'scripts/figma/lib.js'), 'utf8');
const body = readFileSync(join(ROOT, `scripts/figma/${action}.js`), 'utf8');
const out = join(ROOT, `build/figma/${action}.js`);
const code = `const PAYLOAD = ${payload};\n${lib}\n${body}`;
writeFileSync(out, code);
console.log(out, code.length + ' chars');
