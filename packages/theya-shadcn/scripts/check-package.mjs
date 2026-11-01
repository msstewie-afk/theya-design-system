#!/usr/bin/env node
/**
 * Checks the publishable build (scripts/build-package.mjs) the way an app
 * outside the monorepo would meet it:
 * - every module in dist/ imports in plain Node ESM (explicit extensions,
 *   no TypeScript left, no browser globals touched at import time);
 * - every module that needs the browser still starts with 'use client';
 * - publishConfig.exports point at files that exist.
 *
 *   node scripts/check-package.mjs        (builds dist/ first)
 *
 * apps/pilot (Next.js on the packed tarball) is the full end-to-end check;
 * this is the quick one that runs in CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-package.mjs')], { stdio: 'inherit' });

const files = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith('.js')) files.push(p);
  }
};
walk(DIST);

const problems = [];
for (const file of files) {
  try {
    await import(pathToFileURL(file).href);
  } catch (error) {
    problems.push(`${path.relative(ROOT, file)}: ${String(error).split('\n')[0]}`);
  }
  // A source module with 'use client' must keep it in the build.
  const src = path.join(ROOT, 'src', path.relative(DIST, file)).replace(/\.js$/, '');
  const source = ['.tsx', '.ts'].map((ext) => src + ext).find((f) => fs.existsSync(f));
  if (source && /^['"]use client['"]/.test(fs.readFileSync(source, 'utf8')) && !/^['"]use client['"]/.test(fs.readFileSync(file, 'utf8'))) {
    problems.push(`${path.relative(ROOT, file)}: lost 'use client'`);
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
for (const [key, target] of Object.entries(pkg.publishConfig.exports)) {
  for (const t of typeof target === 'string' ? [target] : Object.values(target)) {
    const dir = path.dirname(path.join(ROOT, t.replace(/\*.*$/, 'x')));
    if (!fs.existsSync(dir)) problems.push(`publishConfig.exports["${key}"] → ${t}: ${path.relative(ROOT, dir)} doesn't exist`);
  }
}

if (problems.length) {
  console.error(`check-package: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`check-package: ${files.length} modules import in Node, 'use client' kept, exports resolve.`);
