#!/usr/bin/env node
/**
 * Raw design values guard: components take motion and color from tokens,
 * not from numbers typed into a class or a script. The commit gate already
 * blocks hex colors; this catches what it doesn't:
 *   - a duration in ms (animate-[pop_320ms_…], [animation-delay:300ms]);
 *   - a cubic-bezier( curve;
 *   - an rgb( / rgba( color;
 *   - a numeric `duration:` passed to element.animate or a library.
 * Use the token instead (duration-slow, var(--transition-duration-slow),
 * ease-spring, var(--color-…)); in JS read it with getComputedStyle, since
 * element.animate takes plain values.
 *
 * A deliberate exception (a stagger step, a one-off curve, a timer that
 * isn't motion) carries `raw-ok: <reason>` on the same line or the line
 * above. A `duration: 0` (reduced motion) and a fallback after reading the
 * token with getPropertyValue(…) are fine. Stories, guidelines and tests
 * are not checked.
 *
 *   node scripts/check-raw-values.mjs     list raw values (exit 1)
 *
 * Runs as part of `pnpm api:check`, so CI enforces it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'src/components');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e.name) && !/\.(stories|guidelines|test)\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const RULES = [
  { name: 'ms duration', re: /(?<![A-Za-z0-9$.])\d+(?:\.\d+)?ms(?![A-Za-z0-9])/ },
  { name: 'cubic-bezier', re: /cubic-bezier\(/ },
  { name: 'rgb color', re: /\brgba?\(/ },
  { name: 'numeric duration', re: /\bduration:\s*[1-9]/ },
];
const COMMENT = /^\s*(\/\/|\*|\/\*|\{\/\*)/;

const problems = [];
const files = walk(DIR);
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (COMMENT.test(line)) return;
    if (line.includes('raw-ok') || (i > 0 && lines[i - 1].includes('raw-ok'))) return;
    // Reading a token with getPropertyValue(…) || fallback: the fallback is the token's own value.
    if (line.includes('getPropertyValue(')) return;
    for (const r of RULES) {
      if (r.re.test(line)) problems.push(`${path.relative(ROOT, f)}:${i + 1}  ${r.name}: ${line.trim().slice(0, 110)}`);
    }
  });
}

if (problems.length) {
  console.error(`check-raw-values: ${problems.length} raw value(s) instead of tokens:\n  ${problems.join('\n  ')}`);
  console.error('Use a motion or color token; for a deliberate exception add `raw-ok: <reason>` on the line or the line above.');
  process.exit(1);
}
console.log(`check-raw-values: ${files.length} files, motion and color come from tokens.`);
