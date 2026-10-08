// Builds the payload that keeps the Figma file's variables in sync with
// packages/tokens/src (code is the source of truth since 2026-10-02).
//
//   node scripts/figma-payload.mjs        -> build/figma/payload.json
//
// The payload is keyed by "slugged" Figma variable paths (lowercase, spaces
// and commas -> "-", everything else non-alphanumeric dropped), which is how
// scripts/figma/check.js and scripts/figma/sync.js match code tokens to the
// Figma variables whose names use spaces ("size control/…", "blue a/…") or
// title case ("Heading/Heading XL/Size").
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

function flatten(tree, prefix = []) {
  const out = {};
  for (const [k, v] of Object.entries(tree)) {
    if (v && typeof v === 'object' && 'value' in v && typeof v.value !== 'object') out[[...prefix, k].join('/')] = v.value;
    else if (v && typeof v === 'object') Object.assign(out, flatten(v, [...prefix, k]));
  }
  return out;
}
const isRef = (v) => typeof v === 'string' && v.startsWith('{') && v.endsWith('}');
const refPath = (v) => v.slice(1, -1).split('.');

// ---- Color primitives (collection "1. Color Primitive Variables") ----
// src/primitive/color.json: color.<ramp>.<step>; alpha ramps are "<x>-a" groups.
// src/code/color.json adds top-level white-a*/black-a* (Figma: "white a/…", "black a/…").
const colorPrim = {};
for (const [k, v] of Object.entries(flatten(read('src/primitive/color.json')))) colorPrim[k.replace(/^color\//, '')] = v;
const codeColor = read('src/code/color.json');
for (const [k, v] of Object.entries(codeColor)) {
  const m = k.match(/^(white|black)-a\d+$/);
  if (m) colorPrim[`${m[1]}-a/${k}`] = v.value;
}
const normHex = (v) => {
  const s = String(v).trim().toLowerCase();
  const m = s.match(/^rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)(?:\s*[,/]\s*([\d.]+))?\)$/);
  if (m) {
    const h = (x) => (+x).toString(16).padStart(2, '0');
    return '#' + h(m[1]) + h(m[2]) + h(m[3]) + (m[4] !== undefined && +m[4] < 0.999 ? h(Math.round(+m[4] * 255)) : '');
  }
  return s;
};
const primByHex = {};
for (const [k, v] of Object.entries(colorPrim)) (primByHex[normHex(v)] ||= []).push(k);

// A semantic value: either "@<primitive path>" (alias) or a literal color.
function colorRef(v) {
  if (isRef(v)) {
    const p = refPath(v);
    // The dark code.* set aliases the fixed code.*-inverse tokens (src/code/color.json):
    // follow that hop so Figma gets the primitive (or literal) behind it.
    if (p[0] === 'color' && p[1] === 'code') return colorRef(flatten(codeColor)[p.join('/')]);
    if (p[0] === 'color') return '@' + p.slice(1).join('/');
    const m = p[0].match(/^(white|black)-a\d+$/);
    if (m) return `@${m[1]}-a/${p[0]}`;
    throw new Error('Unknown color ref ' + v);
  }
  // A literal that equals exactly one primitive becomes an alias to it.
  const hits = primByHex[normHex(v)];
  return hits && hits.length === 1 ? '@' + hits[0] : normHex(v);
}

// ---- Color semantic (collection "2. Color Semantic Variables", modes default/dark) ----
const light = flatten(read('src/semantic/color.default.json'));
const dark = flatten(read('src/semantic/color.dark.json'));
const colorSem = {};
for (const k of Object.keys(light)) colorSem[k.replace(/^color\//, '')] = { default: colorRef(light[k]), dark: colorRef(dark[k]) };
// Theme-independent code tokens (on-primary set, charts). In Figma they live
// in the semantic collection with the same value in both modes; chart and
// primary-on-primary tokens sit one group deeper to keep bg/ tidy.
for (const [k, v] of Object.entries(flatten(codeColor))) {
  if (!k.startsWith('color/')) continue;
  let name = k.replace(/^color\//, '');
  name = name.replace(/^bg\/chart-/, 'bg/chart/chart-').replace(/^bg\/primary-on-primary/, 'bg/primary/primary-on-primary');
  const ref = colorRef(v);
  colorSem[name] = { default: ref, dark: ref };
}

// ---- Sizes ----
const sizePrim = {};
for (const [k, v] of Object.entries(flatten(read('src/primitive/size.json')))) sizePrim[k.replace(/^size\//, '')] = Number(v);
const sizeSem = {};
for (const [k, v] of Object.entries(flatten(read('src/semantic/size.json')))) {
  const name = k.replace(/^size\//, '');
  sizeSem[name] = isRef(v) ? '@' + refPath(v).slice(1).join('/') : Number(v);
}

// ---- Typography ----
const typoPrim = {};
for (const [k, v] of Object.entries(flatten(read('src/primitive/typography.json')))) {
  const name = k.replace(/^typography\//, '');
  if (name.startsWith('font-family/')) typoPrim[name] = String(v).split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  else if (name.startsWith('weight/')) typoPrim[name] = Number(v);
  else typoPrim[name] = String(v);
}
const typoSem = {};
for (const [k, v] of Object.entries(flatten(read('src/semantic/typography.json')))) {
  const name = k.replace(/^typography\//, '');
  if (!isRef(v)) { typoSem[name] = v; continue; }
  const p = refPath(v);
  typoSem[name] = p[0] === 'size' ? '@size:' + p.slice(1).join('/') : '@typo:' + p.slice(1).join('/');
}

const payload = {
  generatedFrom: 'packages/tokens/src',
  collections: {
    '1.': { kind: 'COLOR', modes: ['*'], vars: Object.fromEntries(Object.entries(colorPrim).map(([k, v]) => [k, normHex(v)])) },
    '2.': { kind: 'COLOR', modes: ['default', 'dark'], aliasTo: '1.', vars: colorSem },
    '3.': { kind: 'FLOAT', modes: ['*'], vars: sizePrim },
    '4.': { kind: 'FLOAT', modes: ['*'], aliasTo: '3.', vars: sizeSem },
    '5.': { kind: 'MIXED', modes: ['*'], vars: typoPrim },
    '6.': { kind: 'MIXED', modes: ['*'], vars: typoSem },
  },
};
const out = join(ROOT, 'build/figma/payload.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload));
const counts = Object.fromEntries(Object.entries(payload.collections).map(([k, c]) => [k, Object.keys(c.vars).length]));
console.log('build/figma/payload.json', counts);
