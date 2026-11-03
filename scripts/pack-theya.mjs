#!/usr/bin/env node
/**
 * Packs @theya/shadcn for an app outside this repository and writes the
 * tarball into that app's folder.
 *
 *   node scripts/pack-theya.mjs --out <folder>
 *   node scripts/pack-theya.mjs --out ../my-app/vendor --allow-dirty
 *
 * The file is named after the package version and the commit it was packed
 * from: theya-shadcn-<version>-<sha>.tgz. That name is the pin: the app
 * depends on one exact file, and a newer Theya arrives only when the app
 * changes the line in its package.json. A new name per commit also avoids
 * the package managers' cache, which keys `file:` tarballs by name.
 *
 * Steps: build the tokens (the package's prepack inlines their CSS and
 * fonts) → `pnpm pack` (runs prepack: dist/ with JS, .d.ts and one
 * stylesheet) → rename into --out → print the dependency line.
 *
 * Refuses to pack a working copy with uncommitted changes, since the sha in
 * the name would then not describe what is inside; --allow-dirty overrides
 * and marks the name with "-dirty".
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PKG_DIR = path.join(REPO, 'packages/theya-shadcn');

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outArg = outIdx >= 0 ? args[outIdx + 1] : undefined;
const allowDirty = args.includes('--allow-dirty');
if (!outArg) {
  console.error('Usage: node scripts/pack-theya.mjs --out <folder> [--allow-dirty]');
  process.exit(1);
}
const OUT = path.resolve(process.cwd(), outArg);

const sh = (cmd, opts = {}) => execSync(cmd, { cwd: REPO, encoding: 'utf8', ...opts });

// Only changes that end up in the tarball matter: the two packages it is built from.
const dirty = sh('git status --porcelain -- packages/theya-shadcn packages/tokens').trim();
if (dirty && !allowDirty) {
  console.error('Uncommitted changes in packages/theya-shadcn or packages/tokens:\n' + dirty);
  console.error('Commit them, or pass --allow-dirty for a throwaway build.');
  process.exit(1);
}

const { version } = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf8'));
const sha = sh('git rev-parse --short=7 HEAD').trim();
const name = `theya-shadcn-${version}-${sha}${dirty ? '-dirty' : ''}.tgz`;

sh('pnpm --filter @theya/tokens build', { stdio: 'inherit' });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'theya-pack-'));
sh(`pnpm --dir packages/theya-shadcn pack --pack-destination "${tmp}"`, { stdio: 'inherit' });
const [tgz] = fs.readdirSync(tmp).filter((f) => f.endsWith('.tgz'));
fs.mkdirSync(OUT, { recursive: true });
// copy + remove instead of rename: the temp folder may be on another disk.
fs.copyFileSync(path.join(tmp, tgz), path.join(OUT, name));
fs.rmSync(tmp, { recursive: true, force: true });

const target = path.join(OUT, name);
console.log(`\nWrote ${target}`);
console.log('In the app\'s package.json, with the path relative to the app folder:');
console.log(`  "@theya/shadcn": "file:<path-to>/${name}"`);
console.log('then install (pnpm install / npm install).');
