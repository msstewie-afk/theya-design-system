#!/usr/bin/env node
/**
 * RTL guard: components use logical Tailwind utilities (ms/me, ps/pe,
 * start/end, text-start/end, border-s/e, rounded-s/e…) so the layout mirrors
 * under dir="rtl". This fails on physical ones (ml-, pr-, left-, text-right,
 * border-l, rounded-tr…) inside string literals of src/components.
 *
 * Allowed on purpose:
 * - left-1/2 / right-1/2 (and 50% forms): centering is symmetric;
 * - drawer.tsx: vaul positions and animates by physical side; Drawer maps
 *   direction="start" | "end" to it using the reading direction.
 *
 *   node scripts/check-rtl.mjs        list physical utilities (exit 1)
 *   node scripts/check-rtl.mjs --fix  rewrite them to the logical form
 *
 * Runs as part of `pnpm api:check`, so CI enforces it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIX = process.argv.includes('--fix');
const ALLOW_FILES = new Set(['drawer.tsx']);
const PHYS = /^(-?)(?:(rounded-(?:tl|tr|bl|br|l|r)|border-(?:l|r)|text-left|text-right|float-left)(?=-|$|\[)|(scroll-m[lr]|scroll-p[lr]|ml|mr|pl|pr|left|right)(?=-[0-9a-z[]|-px\b))(.*)$/;
const MAP = { ml: 'ms', mr: 'me', pl: 'ps', pr: 'pe', left: 'start', right: 'end', 'rounded-tl': 'rounded-ss', 'rounded-tr': 'rounded-se', 'rounded-bl': 'rounded-es', 'rounded-br': 'rounded-ee', 'rounded-l': 'rounded-s', 'rounded-r': 'rounded-e', 'border-l': 'border-s', 'border-r': 'border-e', 'text-left': 'text-start', 'text-right': 'text-end', 'float-left': 'float-start', 'scroll-ml': 'scroll-ms', 'scroll-mr': 'scroll-me', 'scroll-pl': 'scroll-ps', 'scroll-pr': 'scroll-pe' };

/** Split "md:hover:pl-2" into the variant prefix and the utility, ignoring ':' inside [...]. */
function splitUtil(tok) {
  let depth = 0;
  let last = -1;
  for (let i = 0; i < tok.length; i++) {
    if (tok[i] === '[') depth++;
    else if (tok[i] === ']') depth--;
    else if (tok[i] === ':' && depth === 0) last = i;
  }
  return [tok.slice(0, last + 1), tok.slice(last + 1)];
}

/** The logical form of a token, or null when it is fine as it is. */
function logical(tok) {
  const [pre, util] = splitUtil(tok);
  let u = util;
  let bangPre = '';
  let bangPost = '';
  if (u.startsWith('!')) [bangPre, u] = ['!', u.slice(1)];
  else if (u.endsWith('!')) [bangPost, u] = ['!', u.slice(0, -1)];
  const m = u.match(PHYS);
  if (!m) return null;
  const [, neg, a, b, rest] = m;
  const name = a ?? b;
  if ((name === 'left' || name === 'right') && /^-(1\/2|\[50%\]|\[calc\(50%)/.test(rest)) return null;
  return pre + bangPre + neg + MAP[name] + rest + bangPost;
}

const found = [];
function checkFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const scan = (start, end) => {
    const text = src.slice(start, end);
    let changed = false;
    const out = text.replace(/[^\s]+/g, (tok) => {
      const next = logical(tok);
      if (next === null) return tok;
      changed = true;
      const { line } = sf.getLineAndCharacterOfPosition(start);
      found.push(`${path.relative(ROOT, file)}:${line + 1}  ${tok} → ${next}`);
      return next;
    });
    if (changed) edits.push([start, end, out]);
  };
  const visit = (n) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      if (!ts.isImportDeclaration(n.parent) && !ts.isExportDeclaration(n.parent)) scan(n.getStart(sf) + 1, n.getEnd() - 1);
    } else if (ts.isTemplateExpression(n)) {
      for (const p of [n.head, ...n.templateSpans.map((s) => s.literal)]) scan(p.getStart(sf) + 1, p.getEnd() - (ts.isTemplateTail(p) ? 1 : 2));
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (FIX && edits.length) {
    let out = src;
    for (const [s, e, t] of edits.sort((x, y) => y[0] - x[0])) out = out.slice(0, s) + t + out.slice(e);
    fs.writeFileSync(file, out);
  }
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.tsx?$/.test(e.name) && !/\.(stories|guidelines)\.tsx?$/.test(e.name) && !ALLOW_FILES.has(e.name) ? [p] : [];
  });
for (const file of walk(path.join(ROOT, 'src/components')).sort()) checkFile(file);

if (found.length && !FIX) {
  console.error(`${found.length} physical direction utilit${found.length === 1 ? 'y' : 'ies'} (breaks RTL; run \`node scripts/check-rtl.mjs --fix\`):\n  ${found.join('\n  ')}`);
  process.exit(1);
}
console.log(FIX ? `RTL: ${found.length} utilit${found.length === 1 ? 'y' : 'ies'} made logical` : 'RTL: logical utilities only');
