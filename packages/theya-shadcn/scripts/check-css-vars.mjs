#!/usr/bin/env node
/**
 * Dangling CSS variable guard: every `var(--name)` in src must point at a
 * custom property that something declares. A missing one fails silently in
 * the browser: the whole declaration is dropped. That is how ColorPicker's
 * thumb lost its outer ring for months (`--black-a300` was never a token)
 * and how Topbar's search results lost their max height (`--available-height`
 * instead of Radix's `--radix-popover-content-available-height`).
 *
 * Declared = custom properties set in
 *   - the token build (packages/tokens/build/css) and src/**\/*.css,
 *   - Tailwind's own theme and tw-animate-css,
 *   - TS/TSX: style keys ('--x': …, ['--x' as string]: …), setProperty('--x'),
 *     arbitrary properties ([--x:value]).
 * Also allowed:
 *   - --radix-* (Radix sets them at runtime) and --tw-* (Tailwind internals);
 *   - a reference with a fallback, var(--x, value): optional by design;
 *   - names built in a template literal (var(--color-code-${name})), which
 *     can't be resolved statically;
 *   - lines that are comments, and name patterns ending in '-' (…-radius-*).
 *
 *   node scripts/check-css-vars.mjs     list undeclared references (exit 1)
 *
 * Runs as part of `pnpm api:check`, so CI enforces it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const TOKENS = path.resolve(ROOT, '../tokens/build/css');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const srcFiles = walk(SRC).filter((f) => /\.(tsx?|css|mdx)$/.test(f));
const cssFiles = [
  ...fs.readdirSync(TOKENS).filter((f) => f.endsWith('.css')).map((f) => path.join(TOKENS, f)),
  require.resolve('tailwindcss/theme.css'),
];
try {
  const twAnimate = path.dirname(require.resolve('tw-animate-css/package.json'));
  cssFiles.push(...walk(twAnimate).filter((f) => f.endsWith('.css')));
} catch {
  // tw-animate-css is optional for this check.
}

const declared = new Set();
const add = (re, text) => {
  for (const m of text.matchAll(re)) declared.add(m[1]);
};
for (const f of cssFiles) add(/(--[\w-]+)\s*:/g, fs.readFileSync(f, 'utf8'));
for (const f of srcFiles) {
  const t = fs.readFileSync(f, 'utf8');
  add(/(--[\w-]+)\s*:/g, t); // CSS declarations, and CSS inside template strings
  add(/['"`](--[\w-]+)['"`]/g, t); // style keys, setProperty('--x'), ['--x' as string]
  add(/\[(--[\w-]+):/g, t); // Tailwind arbitrary property [--x:value]
}

const COMMENT = /^\s*(\/\/|\*|\/\*|\{\/\*)/;
const REF = /var\((--[\w-]+)(\$\{)?\s*(,)?|[\w\]]-\((--[\w-]+)\)/g;
const problems = [];
for (const f of srcFiles) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (COMMENT.test(line)) return;
    for (const m of line.matchAll(REF)) {
      const name = m[1] ?? m[4];
      const templated = Boolean(m[2]);
      const fallback = Boolean(m[3]);
      // A name ending in '-' is a pattern in prose (var(--size-…-radius-*)), not a reference.
      if (templated || fallback || name.endsWith('-') || name.startsWith('--radix-') || name.startsWith('--tw-')) continue;
      if (!declared.has(name)) problems.push(`${path.relative(ROOT, f)}:${i + 1}  ${name}`);
    }
  });
}

if (problems.length) {
  console.error(`check-css-vars: ${problems.length} reference(s) to CSS variables nothing declares:\n  ${problems.join('\n  ')}`);
  console.error('Use an existing token (packages/tokens/build/css), declare the variable, or give var() a fallback if it is optional.');
  process.exit(1);
}
console.log(`check-css-vars: ${srcFiles.length} files, every var(--…) resolves.`);
