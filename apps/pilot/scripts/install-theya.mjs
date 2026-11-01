#!/usr/bin/env node
/**
 * Packs @theya/shadcn the way it would be published and installs the
 * tarball here, so the pilot sees exactly what an outside app would get.
 *
 *   npm run theya      (from apps/pilot)
 *
 * pnpm pack runs the package's prepack (scripts/build-package.mjs), which
 * needs the token CSS, so the tokens are built first.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(APP, '../..');
const VENDOR = path.join(APP, 'vendor');
const run = (cmd, cwd = REPO) => execSync(cmd, { cwd, stdio: 'inherit' });

fs.rmSync(VENDOR, { recursive: true, force: true });
fs.mkdirSync(VENDOR);
run('pnpm --filter @theya/tokens build');
run(`pnpm --dir packages/theya-shadcn pack --pack-destination "${VENDOR}"`);
const [tgz] = fs.readdirSync(VENDOR).filter((f) => f.endsWith('.tgz'));
fs.renameSync(path.join(VENDOR, tgz), path.join(VENDOR, 'theya-shadcn.tgz'));
// A fresh copy every time: npm caches file: tarballs by integrity.
fs.rmSync(path.join(APP, 'node_modules/@theya'), { recursive: true, force: true });
run('npm install --no-audit --no-fund', APP);
