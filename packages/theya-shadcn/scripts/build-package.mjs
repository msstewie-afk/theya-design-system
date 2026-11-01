#!/usr/bin/env node
/**
 * Builds the publishable package into dist/, for apps outside the monorepo.
 *
 * Inside the workspace, `exports` point at the TypeScript sources and the
 * consuming bundler (Vite in Storybook and apps/sandbox) compiles them. An
 * app outside the monorepo installs a tarball and can't do that, so
 * `pnpm pack` / `pnpm publish` swap in `publishConfig.exports`, which point
 * here:
 *
 *   dist/components/**, dist/lib/**   JS + .d.ts, one file per source module
 *                                     (keeps each 'use client' boundary)
 *   dist/styles/globals.css           the single stylesheet to import; tokens,
 *                                     fonts and @source for Tailwind included
 *
 *   node scripts/build-package.mjs
 *
 * Steps: tsc (tsconfig.build.json) → add explicit .js extensions to relative
 * imports (Node ESM and strict bundlers resolve nothing without them) →
 * copy the styles and inline the @theya/tokens CSS and fonts, so the tarball
 * doesn't depend on the unpublished tokens package.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const TOKENS = path.resolve(ROOT, '../tokens');

fs.rmSync(DIST, { recursive: true, force: true });

// 1. Compile.
const tsc = require.resolve('typescript/bin/tsc');
execFileSync(process.execPath, [tsc, '-p', path.join(ROOT, 'tsconfig.build.json')], { stdio: 'inherit' });

// 2. Explicit extensions on relative specifiers, in .js and .d.ts alike.
const SPEC = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]*)\2/g;
function resolveSpec(fromFile, spec) {
  if (/\.(js|json|css)$/.test(spec)) return spec;
  const base = path.resolve(path.dirname(fromFile), spec);
  if (fs.existsSync(`${base}.js`) || fs.existsSync(`${base}.d.ts`)) return `${spec}.js`;
  if (fs.existsSync(path.join(base, 'index.js')) || fs.existsSync(path.join(base, 'index.d.ts'))) return `${spec}/index.js`;
  throw new Error(`build-package: can't resolve '${spec}' from ${path.relative(ROOT, fromFile)}`);
}
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
let files = 0;
for (const file of walk(DIST)) {
  if (!/\.(js|d\.ts)$/.test(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  const next = src.replace(SPEC, (_, lead, q, spec) => `${lead}${q}${resolveSpec(file, spec)}${q}`);
  if (next !== src) fs.writeFileSync(file, next);
  files++;
}

// 3. Styles, with the token CSS and fonts copied next to them.
const STYLES = path.join(DIST, 'styles');
fs.cpSync(path.join(ROOT, 'src/styles'), STYLES, { recursive: true });
for (const f of ['variables.css', 'variables-dark.css', 'profiles.css', 'density.css']) {
  const from = path.join(TOKENS, 'build/css', f);
  if (!fs.existsSync(from)) throw new Error(`build-package: ${path.relative(ROOT, from)} is missing; run pnpm build:tokens first`);
  fs.cpSync(from, path.join(STYLES, 'tokens', f));
}
fs.cpSync(path.join(TOKENS, 'fonts'), path.join(STYLES, 'tokens/fonts'), { recursive: true });
const globals = path.join(STYLES, 'globals.css');
const css = fs.readFileSync(globals, 'utf8')
  .replaceAll("'@theya/tokens/build/css/", "'./tokens/")
  .replaceAll("'@theya/tokens/fonts/", "'./tokens/fonts/");
if (/@import\s+['"]@theya\/tokens/.test(css)) throw new Error('build-package: an @theya/tokens import is left in globals.css');
fs.writeFileSync(globals, css);

// The compiled modules are ESM; the package root has no "type" (Storybook's
// CommonJS configs live there), so mark dist/ alone for Node.
fs.writeFileSync(path.join(DIST, 'package.json'), '{ "type": "module", "sideEffects": ["**/*.css"] }\n');

console.log(`build-package: ${files} modules → dist/, styles → dist/styles/`);
