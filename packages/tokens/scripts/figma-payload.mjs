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
import { spaced } from './lib/density-spacing.mjs';

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
// Charts sit one group deeper in Figma ("bg/chart/chart-01"), wherever the code keeps them
// (semantic since 91fb7b9, code tokens before): one spelling, or sync makes duplicates.
const figmaName = (k) => k.replace(/^color\//, '').replace(/^bg\/chart-/, 'bg/chart/chart-');
for (const k of Object.keys(light)) colorSem[figmaName(k)] = { default: colorRef(light[k]), dark: colorRef(dark[k]) };
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

// ---- Density (collection "7. Density", modes Default/Compact/Comfortable) ----
// src/density/*.json override a few size tokens per mode. In Figma they live
// in their own collection, and the semantic control sizes in "4." alias them,
// so a frame switches density the way it switches the theme.
const DENSITY_MODES = { Default: 'default', Compact: 'compact', Comfortable: 'comfortable' };
const densityRaw = Object.fromEntries(Object.entries(DENSITY_MODES).map(([m, f]) => [m, flatten(read(`src/density/${f}.json`).size)]));
const sizeVal = (v) => (isRef(v) ? '@' + refPath(v).slice(1).join('/') : Number(String(v).replace(/px$/, '')));
const densityVars = {};
for (const name of new Set(Object.values(densityRaw).flatMap(Object.keys))) {
  densityVars[name] = Object.fromEntries(
    Object.keys(DENSITY_MODES).map((m) => {
      const v = densityRaw[m][name] ?? densityRaw.Default[name];
      // Default has no override: it is the semantic size from src/semantic/size.json.
      return [m, v === undefined ? sizeSem[name] : sizeVal(v)];
    }),
  );
  if (sizeSem[name] !== undefined) sizeSem[name] = '@density:' + name;
}
// Spacing (padding / gap / margin) follows the shared rule in lib/density-spacing.mjs,
// as in density.css: up to 8px unchanged, the rest ±40%, rounded to 2px. A result
// that is a primitive becomes an alias to it; the rest (10, 14, 18…) stays a number.
const delta = (m) => Number(densityRaw[m]['density/density-space-delta'] ?? 0);
for (const [name, ref] of Object.entries(sizeSem)) {
  if (!/^(padding|gap|margin)\//.test(name) || typeof ref !== 'string' || !ref.startsWith('@size')) continue;
  const px = sizePrim[ref.slice(1)];
  if (px === undefined || Object.values(DENSITY_MODES).every((_, i) => spaced(px, delta(Object.keys(DENSITY_MODES)[i])) === px)) continue;
  densityVars[name] = Object.fromEntries(
    Object.keys(DENSITY_MODES).map((m) => {
      const next = spaced(px, delta(m));
      return [m, next === px ? ref : sizePrim[`size${next}`] !== undefined ? `@size${next}` : next];
    }),
  );
  sizeSem[name] = '@density:' + name;
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

// ---- Brand themes (src/profiles/*.json, built by scripts/build-profiles.mjs) ----
// Values are the built results (build/css/profiles.json), so Figma shows what
// the browser renders.
// - Colors: modes of "2." — "<brand>" and "<brand> dark" beside default/dark.
//   A mode a profile leaves alone is not written: scripts/figma/lib.js want()
//   falls back to Theya's value in the same theme ("<brand> dark" -> dark).
// - Radii, font families and weights: collection "9. Brand" (modes theya /
//   <brand>…), the way "7. Density" holds the control sizes. The few variables
//   of "4.", "5." and "6." a profile overrides become aliases to the
//   same-named variable in "9."; those collections get no modes. The "theya"
//   mode holds what the variable held before (its alias or literal).
// - Radius roles with no variable of their own (--theme-radius-field /
//   -button) live in "9." too, with Theya's fallback from the components.
const BRAND_FILE = join(ROOT, 'build/css/profiles.json');
const brands = JSON.parse(readFileSync(BRAND_FILE, 'utf8')).profiles;
const BRAND_NAMES = brands.map((b) => b.name);
// Same naming as scripts/figma/lib.js cssName(): Figma variable path -> CSS variable.
const cssOf = (key, name) => {
  const dash = name.replace(/\//g, '-');
  if (key === '2.') {
    if (name.startsWith('bg/chart/') || name.startsWith('bg/primary/primary-on-primary')) return '--color-bg-' + name.split('/')[2];
    return '--color-' + dash;
  }
  if (key === '4.') return '--size-' + dash;
  return '--typography-' + dash;
};
const unmatched = {};
const miss = (b, css) => (unmatched[b] ||= new Set()).add(css);

// "2.": colors per brand and theme.
const colorModes = (() => {
  const byCss = new Map(Object.keys(colorSem).map((n) => [cssOf('2.', n), n]));
  for (const b of brands) for (const [theme, mode] of [['light', b.name], ['dark', b.name + ' dark']]) {
    for (const [css, v] of Object.entries(b[theme] ?? {})) {
      const n = byCss.get(css);
      if (!n) { miss(b.name, css); continue; }
      const ref = colorRef(v);
      if (ref !== colorSem[n][theme === 'light' ? 'default' : 'dark']) colorSem[n][mode] = ref;
    }
  }
  return ['default', 'dark', ...BRAND_NAMES.flatMap((b) => [b, b + ' dark'])];
})();

// "9. Brand".
const BRAND_MODES = ['theya', ...BRAND_NAMES];
const brandVars = {};
const firstFamily = (stack) => String(stack).split(',')[0].trim().replace(/^['"]|['"]$/g, '');
const sizeByCss = new Map(Object.keys(sizeSem).map((n) => [cssOf('4.', n), n]));
// A brand value as the "9." payload writes it: an alias where code names one, else a literal.
const brandValue = (css, v) => {
  const ref = String(v).match(/^var\((--size-[a-z0-9-]+)\)$/);
  if (ref) { const n = sizeByCss.get(ref[1]); if (!n) throw new Error(`${css}: ${v} has no variable in "4."`); return '@sem:' + n; }
  if (css.startsWith('--size-')) { const n = Number(String(v).replace(/px$/, '')); return sizePrim[`size${n}`] !== undefined ? `@size:size${n}` : n; }
  return /-font$|font-family-/.test(css) ? firstFamily(v) : Number(v);
};
// The value a moved variable had, as "9." spells it (aliases keep their target collection).
const asBrandAlias = (key, v) => {
  if (typeof v !== 'string' || !v.startsWith('@')) return v;
  if (v.startsWith('@density:')) throw new Error('A brand variable is also a density variable: ' + v + ' — decide which collection drives it first');
  if (v.startsWith('@typo:') || v.startsWith('@size:')) return v;
  if (key === '4.') return '@size:' + v.slice(1);
  throw new Error(`Unexpected alias ${v} in ${key}`);
};
for (const [key, vars, pick] of [
  ['4.', sizeSem, (k) => k.startsWith('--size-')],
  ['5.', typoPrim, (k) => /^--typography-(font-family|weight)-/.test(k)],
  ['6.', typoSem, (k) => k.startsWith('--typography-') && !/^--typography-(font-family|weight)-/.test(k)],
]) {
  const byCss = new Map(Object.keys(vars).map((n) => [cssOf(key, n), n]));
  for (const b of brands) for (const [css, v] of Object.entries(b.shared ?? {})) {
    if (!pick(css)) continue;
    const n = byCss.get(css);
    if (!n) { miss(b.name, css); continue; }
    if (!brandVars[n]) { brandVars[n] = { theya: asBrandAlias(key, vars[n]) }; vars[n] = '@brand:' + n; }
    brandVars[n][b.name] = brandValue(css, v);
  }
}
// Radius roles: Theya's fallback is the radius the components use without a profile.
const ROLE_FALLBACK = { field: 'border-radius/border-radius-lg', button: 'border-radius/border-radius-xl' };
for (const [role, fallback] of Object.entries(ROLE_FALLBACK)) {
  const n = 'theme-radius/' + role;
  for (const b of brands) { const v = b.shared?.['--theme-radius-' + role]; if (v === undefined) continue; (brandVars[n] ||= { theya: '@sem:' + fallback })[b.name] = brandValue('--theme-radius-' + role, v); }
}
for (const b of brands) for (const k of Object.keys(b.shared ?? {})) if (!/^--(size|typography|theme-radius)-/.test(k)) miss(b.name, k);

const payload = {
  generatedFrom: 'packages/tokens/src',
  // Order matters for sync: "9." first, so the "@brand:" aliases written into
  // "4.", "5." and "6." find their targets.
  collections: {
    // Created by sync when missing ("9. Brand"); new variables get scopes [] (hidden), like "7.".
    '9.': { kind: 'MIXED', modes: BRAND_MODES, create: '9. Brand', vars: brandVars },
    '1.': { kind: 'COLOR', modes: ['*'], vars: Object.fromEntries(Object.entries(colorPrim).map(([k, v]) => [k, normHex(v)])) },
    '2.': { kind: 'COLOR', modes: colorModes, aliasTo: '1.', vars: colorSem },
    '3.': { kind: 'FLOAT', modes: ['*'], vars: sizePrim },
    '4.': { kind: 'FLOAT', modes: ['*'], aliasTo: '3.', vars: sizeSem },
    '5.': { kind: 'MIXED', modes: ['*'], vars: typoPrim },
    '6.': { kind: 'MIXED', modes: ['*'], vars: typoSem },
    '7.': { kind: 'FLOAT', modes: Object.keys(DENSITY_MODES), aliasTo: '3.', vars: densityVars },
  },
  // Variables that exist only in Figma on purpose (Maria, 2026-10-05): negative
  // spacing for overlaps (avatar stacks, 1-2px nudges). Code writes those with
  // utilities (-space-x-1), not tokens. check / sync list them as figmaOnly,
  // not as extra. Collection key -> Figma variable names.
  figmaOnly: {
    // Palettes stay whole in Figma even where code has no such step (Maria,
    // 2026-11-08): red/orange 850 and the azure ramp may serve another system.
    '1.': ['red/red-850', 'orange/orange-850', ...['005', '010', '050', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map((s) => `azure/azure-${s}`)],
    '4.': ['padding/padding--3xs', 'padding/padding--2xs', 'gap/gap--2xs'],
  },
};
const out = join(ROOT, 'build/figma/payload.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload));
const counts = Object.fromEntries(Object.entries(payload.collections).map(([k, c]) => [k, Object.keys(c.vars).length]));
console.log('build/figma/payload.json', counts);
for (const [b, set] of Object.entries(unmatched)) console.log(`brand ${b}: no Figma variable for`, [...set].join(' '));
