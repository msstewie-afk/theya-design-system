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
  // Effect styles bind "2." variables: they go with the part that writes "2.".
  if (!only.includes('2.')) delete full.effects;
}
// --vars=brand/ keeps only the variables under that group; --vars=!brand/ keeps
// the rest. "2." (Theme) is over the limit as one script, so it runs in two
// parts. Variables outside the part are not reported as extra (lib.js inPart).
const vars = (process.argv.find((a) => a.startsWith('--vars=')) || '').slice(7);
if (vars) {
  const exclude = vars.startsWith('!'); const prefix = vars.replace(/^!/, '');
  full.part = { prefix, exclude };
  for (const c of Object.values(full.collections)) c.vars = Object.fromEntries(Object.entries(c.vars).filter(([n]) => n.startsWith(prefix) !== exclude));
  // The shadow layers are not brand variables: effect styles go with the other part.
  if (!exclude) delete full.effects;
}
const payload = JSON.stringify(full);
const lib = readFileSync(join(ROOT, 'scripts/figma/lib.js'), 'utf8');
const body = readFileSync(join(ROOT, `scripts/figma/${action}.js`), 'utf8');
const partName = vars ? '-' + (vars.startsWith('!') ? 'not-' : '') + vars.replace(/^!/, '').replace(/\W+/g, '') : '';
const out = join(ROOT, `build/figma/${action}${only.length ? '-' + only.join('-').replace(/\./g, '') : ''}${partName}.js`);
const code = `const PAYLOAD = ${payload};\n${lib}\n${body}`;
writeFileSync(out, code);
console.log(out, code.length + ' chars');
