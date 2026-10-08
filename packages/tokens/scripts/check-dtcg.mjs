#!/usr/bin/env node
/**
 * Cross-check the Tokens Studio export against the CSS build: for every
 * theme option (light, dark, iris-light, …) and density mode, resolve each
 * token through the exported sets and compare it with the value the CSS
 * build gives the same variable (variables*.css + profiles.json for
 * themes, density.css for density). Any difference fails.
 *
 * Covers color, typography and radius tokens for themes, and every token a
 * density mode overrides. Runs after build:dtcg in `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const cssVars = (text) => new Map([...text.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()]));
const varOf = (id) => `--${id.replaceAll('.', '-')}`;

/** Nested set → Map(id → $value). */
const flat = (node, trail = [], out = new Map()) => {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) out.set([...trail, k].join('.'), v.$value);
    else if (v && typeof v === 'object') flat(v, [...trail, k], out);
  }
  return out;
};

/** Same color / length written differently compares equal. */
const norm = (v) => {
  const s = String(v)
    .replace(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/, 'rgba($1,$2,$3,$4)')
    .replace(/\s|'|"/g, '')
    .toLowerCase();
  const hex = s.match(/^#([0-9a-f]{6})$/);
  if (hex) return `rgba(${[0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).join(',')},1)`;
  const rgba = s.match(/^rgba?\(([\d.]+),([\d.]+),([\d.]+)(?:,([\d.]+))?\)$/);
  return rgba ? `rgba(${rgba[1]},${rgba[2]},${rgba[3]},${Number(rgba[4] ?? 1)})` : s;
};

const order = json('build/tokens-studio/$metadata.json').tokenSetOrder;
const sets = Object.fromEntries(order.map((n) => [n, flat(json(`build/tokens-studio/${n}.json`))]));
const themes = json('build/tokens-studio/$themes.json');
const light = cssVars(fs.readFileSync(path.join(ROOT, 'build/css/variables.css'), 'utf8'));
const dark = new Map([...light, ...cssVars(fs.readFileSync(path.join(ROOT, 'build/css/variables-dark.css'), 'utf8'))]);
const profiles = Object.fromEntries(json('build/css/profiles.json').profiles.map((p) => [p.name, p]));
const densityCss = fs.readFileSync(path.join(ROOT, 'build/css/density.css'), 'utf8');

const resolver = (scope) => {
  const res = (id, depth = 0) => {
    const v = scope.get(id);
    const m = typeof v === 'string' && v.match(/^\{(.+)\}$/);
    return m && depth < 20 ? res(m[1], depth + 1) : v;
  };
  return res;
};
const FOUNDATION = ['primitive', 'base', 'color-shared'];
const problems = [];
let checked = 0;

for (const theme of themes.filter((t) => t.group === 'theme')) {
  const scope = new Map();
  for (const n of order) if (FOUNDATION.includes(n) || theme.selectedTokenSets[n] === 'enabled') for (const [k, v] of sets[n]) scope.set(k, v);
  const res = resolver(scope);
  const [brand, mode] = theme.name.includes('-') ? theme.name.split('-') : [null, theme.name];
  const expect = new Map(mode === 'dark' ? dark : light);
  if (brand) for (const part of [profiles[brand].primitives, profiles[brand].shared, profiles[brand][mode]]) for (const [k, v] of Object.entries(part)) expect.set(k, v);
  for (const id of scope.keys()) {
    if (!/^(color|typography)\.|^size\.border-radius\./.test(id)) continue;
    const want = expect.get(varOf(id));
    if (want === undefined || want.startsWith('var(')) continue;
    checked++;
    if (norm(res(id)) !== norm(want)) problems.push(`${theme.name}: ${id} exports ${res(id)}, CSS has ${want}`);
  }
}

for (const mode of ['compact', 'comfortable']) {
  const block = densityCss.split(`[data-density='${mode}']`)[1]?.split('}')[0] ?? '';
  const scope = new Map([...sets.primitive, ...sets.base, ...sets['density-default'], ...sets[`density-${mode}`]]);
  const res = resolver(scope);
  const idOf = new Map([...scope.keys()].map((id) => [varOf(id), id]));
  for (const [cssVar, want] of cssVars(block)) {
    checked++;
    const id = idOf.get(cssVar);
    if (!id) problems.push(`density ${mode}: ${cssVar} is in density.css but not exported`);
    else if (norm(res(id)) !== norm(want)) problems.push(`density ${mode}: ${id} exports ${res(id)}, CSS has ${want}`);
  }
}

if (problems.length) {
  console.error(`DTCG export differs from the CSS build in ${problems.length} place(s):\n  ${problems.slice(0, 40).join('\n  ')}`);
  process.exit(1);
}
console.log(`DTCG ↔ CSS: ${checked} values match.`);
