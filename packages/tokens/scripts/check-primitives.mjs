#!/usr/bin/env node
/**
 * Primitives are never removed (Maria, 2026-11-08): a ramp keeps every step
 * whether or not a token uses it now — another palette, brand or design
 * system may. Twice a step went missing quietly (the azure ramp with the old
 * chart palette, red/orange 850 in a renumbering) and Figma drifted from code.
 *
 * primitives.lock.json lists every primitive token path. This check fails
 * when a listed path is gone from src/primitive/*.json, so a removal can only
 * happen by editing the lock on purpose, where the diff shows it.
 *
 *   node scripts/check-primitives.mjs           check (CI)
 *   node scripts/check-primitives.mjs --update  add new primitives to the lock
 *                                               (never drops one; to remove a
 *                                               step, edit the lock by hand)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/primitive');
const LOCK = path.join(ROOT, 'primitives.lock.json');

// Token paths: a leaf is an object with a `value`.
const leaves = (node, prefix = []) =>
  node && typeof node === 'object' && !Array.isArray(node)
    ? 'value' in node
      ? [prefix.join('.')]
      : Object.entries(node).flatMap(([k, v]) => leaves(v, [...prefix, k]))
    : [];

const current = new Set(
  fs.readdirSync(SRC).filter((f) => f.endsWith('.json')).sort()
    .flatMap((f) => leaves(JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'))).map((p) => `${f.replace(/\.json$/, '')}:${p}`)),
);
const lock = fs.existsSync(LOCK) ? JSON.parse(fs.readFileSync(LOCK, 'utf8')).primitives : [];

if (process.argv.includes('--update')) {
  const merged = [...new Set([...lock, ...current])].sort();
  fs.writeFileSync(
    LOCK,
    JSON.stringify({ $comment: 'Every primitive token path. scripts/check-primitives.mjs fails if one disappears from src/primitive. Removing a step = deleting its line here, on purpose.', primitives: merged }, null, 2) + '\n',
  );
  console.log(`primitives.lock.json: ${merged.length} primitives (${merged.length - lock.length} added)`);
} else {
  const missing = lock.filter((p) => !current.has(p));
  const unlocked = [...current].filter((p) => !lock.includes(p));
  if (missing.length) {
    console.error(`Primitives removed from src/primitive (they stay in the palette even when unused):\n${missing.map((p) => `  - ${p}`).join('\n')}\nRestore them, or, if the removal is intended, delete these lines from primitives.lock.json.`);
    process.exitCode = 1;
  }
  if (unlocked.length) {
    console.error(`New primitives not in primitives.lock.json:\n${unlocked.map((p) => `  + ${p}`).join('\n')}\nRun: node scripts/check-primitives.mjs --update`);
    process.exitCode = 1;
  }
  if (!process.exitCode) console.log(`check-primitives: ${current.size} primitives, none removed.`);
}
