#!/usr/bin/env node
/**
 * Export @theya/tokens as W3C Design Tokens (DTCG) JSON, so Figma Variables,
 * Tokens Studio and other platforms read the same source as the CSS build.
 *
 * Reads src/ (the source of truth) and writes two flavours:
 *
 *   build/dtcg/            DTCG 2025.10, spec-strict values:
 *                          color = { colorSpace, components, alpha, hex },
 *                          dimension = { value, unit }, duration = { value, unit }.
 *   build/tokens-studio/   Same sets, string values ("#0068de", "16px", "100ms")
 *                          plus $metadata.json and $themes.json, for Tokens
 *                          Studio and tools that read the pre-2025 draft.
 *
 * Sets (one file each; later sets override earlier ones):
 *   primitive        color, size, font families and weights; white-a / black-a
 *   base             semantic size + typography, motion, layer
 *   color-shared     theme-independent code colors (on-primary set, charts)
 *   color-light      semantic colors + elevation, light   ┐ pick one
 *   color-dark       semantic colors + elevation, dark    ┘
 *   brand-<name>     a theme's mode-independent overrides: re-hued
 *                    primitive ramps, typeface, weights, radii
 *   brand-<name>-light / -dark   its semantic color overrides per mode
 *   density-default  density tokens (row heights, item padding, space delta)
 *   density-compact  overrides on top of density-default  ┐ optional, pick one
 *   density-comfortable                                   ┘ (incl. padding / gap / margin)
 *
 * Themes (Iris, Lime) are computed by build-profiles.mjs (OKLCH ramps,
 * contrast checks), so they are read from its output, build/css/profiles.json:
 * run build:profiles first (`npm run build` does). A theme option in the
 * "theme" group is the plain color set plus the brand sets, e.g.
 * iris-dark = color-dark + brand-iris + brand-iris-dark. Only values that
 * differ from what the aliases already give are written, so most semantic
 * tokens stay aliases and follow the re-hued primitives.
 *
 * Density spacing (padding / gap / margin) is computed with the same rule as
 * the CSS (lib/density-spacing.mjs) and written into the compact and
 * comfortable sets, as an alias to a size primitive when one has that value.
 *
 * Aliases stay aliases ({color.blue.blue-500}), so the primitive → semantic
 * chain survives the export. Source tokens carry no $type, so the type is
 * inferred from the token path (see typeOf); an unknown path fails the build
 * instead of being exported untyped.
 *
 * Not exported:
 * - typography.italic.* and the semantic `italic` properties: they are Figma
 *   font-style names ("SemiBold Italic"), and DTCG has no font-style type.
 * - A theme's one-radius-for-all-buttons / -fields (--theme-radius-button,
 *   --theme-radius-field): they are component settings, not tokens. The
 *   scaled radius ramp is exported.
 * - Numeric Tailwind spacing utilities scaled by density (p-4, gap-6…):
 *   CSS only; the equivalent tokens are exported as above.
 *
 * Checks (the build fails on any of them): every alias resolves in every
 * theme combination, an alias points at a token of the same type, no alias
 * cycles, and a token is defined in two sets only when the later set is a
 * density override.
 *
 * Run as part of `npm run build` (or alone: `npm run build:dtcg`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spaced, SPACING_PATH } from './lib/density-spacing.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

// --- sets -------------------------------------------------------------------

/** Pick top-level keys of a source file. */
const pick = (json, keys) => Object.fromEntries(keys.filter((k) => k in json).map((k) => [k, json[k]]));
const omit = (json, keys) => Object.fromEntries(Object.entries(json).filter(([k]) => !keys.includes(k)));

const codeColor = read('src/code/color.json');

const SETS = [
  {
    name: 'primitive',
    description: 'Raw palette, size scale, font families and weights.',
    sources: [read('src/primitive/color.json'), read('src/primitive/size.json'), read('src/primitive/typography.json'), omit(codeColor, ['color'])],
  },
  {
    name: 'base',
    description: 'Semantic size and typography, motion and layers. Theme-independent.',
    sources: [read('src/semantic/size.json'), read('src/semantic/typography.json'), read('src/code/foundation.json')],
  },
  {
    name: 'color-shared',
    description: 'Theme-independent semantic colors: content on primary fills, chart series.',
    sources: [pick(codeColor, ['color'])],
  },
  { name: 'color-light', description: 'Semantic colors and elevation, light theme.', sources: [read('src/semantic/color.default.json'), read('src/code/elevation.json')] },
  { name: 'color-dark', description: 'Semantic colors and elevation, dark theme.', sources: [read('src/semantic/color.dark.json'), read('src/code/elevation.dark.json')] },
  ...['default', 'compact', 'comfortable'].map((mode) => {
    const json = read(`src/density/${mode}.json`);
    return { name: `density-${mode}`, description: json.description, sources: [omit(json, ['description'])], override: mode !== 'default' };
  }),
];

/** Theme combinations: one set from each group, in this order. */
const GROUPS = [
  { group: 'foundation', options: { foundation: ['primitive', 'base', 'color-shared'] } },
  { group: 'theme', options: { light: ['color-light'], dark: ['color-dark'] } },
  {
    group: 'density',
    options: { default: ['density-default'], compact: ['density-default', 'density-compact'], comfortable: ['density-default', 'density-comfortable'] },
  },
];

// --- types ------------------------------------------------------------------

const TYPO_PROPS = {
  font: 'fontFamily',
  weight: 'fontWeight',
  'weight-emphasize': 'fontWeight',
  'weight-strong': 'fontWeight',
  size: 'dimension',
  'line-height': 'dimension',
  'letter-spacing': 'dimension',
  'letter-spacing-uppercase': 'dimension',
  'paragraph-spacing': 'dimension',
  italic: null,
};

/** DTCG $type for a token path, null to skip the token, throws if unknown. */
function typeOf(p) {
  const [a, b] = p;
  if (p.length === 1 && /^(white|black)-a\d+$/.test(a)) return 'color';
  if (a === 'color') return 'color';
  if (a === 'size') return p.at(-1) === 'density-space-delta' ? 'number' : 'dimension';
  if (a === 'typography') {
    if (b === 'font-family') return 'fontFamily';
    if (b === 'weight') return 'fontWeight';
    if (b === 'italic') return null;
    if (p.at(-1) in TYPO_PROPS) return TYPO_PROPS[p.at(-1)];
  }
  if (a === 'elevation') return 'shadow';
  if (a === 'motion' && b === 'duration') return 'duration';
  if (a === 'motion' && b === 'easing') return 'cubicBezier';
  if (a === 'layer') return 'number';
  throw new Error(`No DTCG type rule for ${p.join('.')} — add one to typeOf()`);
}

// --- value conversion ---------------------------------------------------------

const ALIAS = /^\{([^{}]+)\}$/;
const round = (n, d = 4) => Number(n.toFixed(d));
const hex2 = (n) => Math.round(n * 255).toString(16).padStart(2, '0');

/** Any source color → { r, g, b, a } with channels 0..1. */
function parseColor(v, where) {
  if (v && typeof v === 'object' && 'r' in v) return { r: v.r, g: v.g, b: v.b, a: v.a ?? 1 };
  const s = String(v).trim();
  let m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i);
  if (m) {
    const alpha = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : Number(m[4]);
    return { r: m[1] / 255, g: m[2] / 255, b: m[3] / 255, a: alpha };
  }
  throw new Error(`${where}: cannot parse color ${JSON.stringify(v)}`);
}

function color(v, where, flavour) {
  const { r, g, b, a } = parseColor(v, where);
  const hex = `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  if (flavour === 'studio') {
    return a === 1 ? hex : `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${round(a, 3)})`;
  }
  return { colorSpace: 'srgb', components: [round(r), round(g), round(b)], alpha: round(a), hex };
}

function dimension(v, where, flavour) {
  let value;
  let unit = 'px';
  if (typeof v === 'number') value = v;
  else {
    const m = String(v).match(/^(-?\d*\.?\d+)(px|rem)?$/);
    if (!m) throw new Error(`${where}: cannot parse dimension ${JSON.stringify(v)}`);
    value = Number(m[1]);
    unit = m[2] ?? 'px';
  }
  return flavour === 'studio' ? `${value}${unit}` : { value, unit };
}

function duration(v, where, flavour) {
  const m = String(v).match(/^(\d*\.?\d+)(ms|s)$/);
  if (!m) throw new Error(`${where}: cannot parse duration ${JSON.stringify(v)}`);
  const ms = m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]);
  return flavour === 'studio' ? `${ms}ms` : { value: ms, unit: 'ms' };
}

function cubicBezier(v, where) {
  const m = String(v).match(/^cubic-bezier\(([^)]+)\)$/);
  const nums = m?.[1].split(',').map(Number);
  if (!nums || nums.length !== 4 || nums.some(Number.isNaN)) throw new Error(`${where}: cannot parse easing ${JSON.stringify(v)}`);
  return nums;
}

/** Split on commas that are not inside parentheses. */
const splitTop = (s) => {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

function shadow(v, where, flavour) {
  const layers = splitTop(String(v)).map((layer) => {
    const inset = /\binset\b/.test(layer);
    const colorMatch = layer.match(/(rgba?\([^)]*\)|#[0-9a-f]{3,8})/i);
    if (!colorMatch) throw new Error(`${where}: shadow layer without a color: ${layer}`);
    const lengths = layer.replace(colorMatch[0], '').replace('inset', '').trim().split(/\s+/);
    if (lengths.length < 2 || lengths.length > 4) throw new Error(`${where}: cannot parse shadow layer ${layer}`);
    const [x, y, blur = '0', spread = '0'] = lengths;
    const d = (s) => dimension(s === '0' ? 0 : s, where, flavour);
    const out = { color: color(colorMatch[0], where, flavour), offsetX: d(x), offsetY: d(y), blur: d(blur), spread: d(spread) };
    if (inset) out.inset = true;
    return out;
  });
  return layers.length === 1 ? layers[0] : layers;
}

function fontFamily(v, flavour) {
  if (flavour === 'studio') return v;
  const stack = splitTop(String(v)).map((f) => f.replace(/^['"]|['"]$/g, ''));
  return stack.length === 1 ? stack[0] : stack;
}

function number(v, where) {
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`${where}: not a number ${JSON.stringify(v)}`);
  return n;
}

function convert(type, v, where, flavour) {
  if (typeof v === 'string' && ALIAS.test(v.trim())) return v.trim();
  switch (type) {
    case 'color': return color(v, where, flavour);
    case 'dimension': return dimension(v, where, flavour);
    case 'duration': return duration(v, where, flavour);
    case 'cubicBezier': return cubicBezier(v, where);
    case 'shadow': return shadow(v, where, flavour);
    case 'fontFamily': return fontFamily(v, flavour);
    case 'fontWeight': return number(v, where);
    case 'number': return number(v, where);
    default: throw new Error(`${where}: unhandled type ${type}`);
  }
}

// --- walk -------------------------------------------------------------------

const isToken = (n) => n && typeof n === 'object' && 'value' in n;

/** Source JSON → { tokens: Map(path → { type, value }), skipped: [path] } */
function collect(sources, setName) {
  const tokens = new Map();
  const skipped = [];
  const walk = (node, trail) => {
    if (isToken(node)) {
      const id = trail.join('.');
      const type = typeOf(trail);
      if (type === null) skipped.push(id);
      else {
        if (tokens.has(id)) throw new Error(`${setName}: ${id} defined twice in the same set`);
        tokens.set(id, { type, value: node.value, description: node.description });
      }
      return;
    }
    if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, [...trail, k]);
  };
  for (const s of sources) walk(s, []);
  return { tokens, skipped };
}

/** Flat Map → nested DTCG object. */
function nest(tokens, flavour, description) {
  const root = {};
  if (description) root.$description = description;
  for (const [id, t] of tokens) {
    const keys = id.split('.');
    let node = root;
    for (const k of keys.slice(0, -1)) node = node[k] ??= {};
    const leaf = { $type: t.type, $value: convert(t.type, t.value, id, flavour) };
    if (t.description) leaf.$description = t.description;
    node[keys.at(-1)] = leaf;
  }
  return root;
}

// --- build + checks ------------------------------------------------------------

const collected = SETS.map((set) => ({ ...set, ...collect(set.sources, set.name) }));
const byName = Object.fromEntries(collected.map((s) => [s.name, s]));

/** Follow aliases inside a scope (Map id → token) to the raw value. */
const rawValue = (scope, id, depth = 0) => {
  const t = scope.get(id);
  const m = t && typeof t.value === 'string' && t.value.trim().match(ALIAS);
  return m && depth < 20 ? rawValue(scope, m[1], depth + 1) : t?.value;
};
const scopeOf = (...names) => new Map(names.flatMap((n) => [...byName[n].tokens]));

// Density spacing: the compact / comfortable values of padding, gap, margin.
{
  const base = scopeOf('primitive', 'base');
  const pxOf = (v) => (typeof v === 'number' ? v : parseFloat(v));
  const primitiveFor = new Map(
    [...byName.primitive.tokens].filter(([id, t]) => /^size\.size\d+$/.test(id) && t.type === 'dimension').map(([id, t]) => [pxOf(t.value), id]),
  );
  for (const s of collected.filter((x) => x.name.startsWith('density-') && x.override)) {
    const delta = Number(s.tokens.get('size.density.density-space-delta')?.value ?? 0);
    if (!delta) continue;
    for (const [id, t] of byName.base.tokens) {
      if (!SPACING_PATH.test(id) || s.tokens.has(id)) continue;
      const px = pxOf(rawValue(base, id));
      const next = spaced(px, delta);
      if (next !== px) s.tokens.set(id, { type: 'dimension', value: primitiveFor.has(next) ? `{${primitiveFor.get(next)}}` : `${next}px` });
    }
  }
}

// Themes: brand-<name>, brand-<name>-light, brand-<name>-dark from build-profiles.
const brandSkipped = new Set();
{
  const file = path.join(ROOT, 'build/css/profiles.json');
  if (!fs.existsSync(file)) {
    console.error('DTCG export: build/css/profiles.json is missing — run `npm run build:profiles` first.');
    process.exit(1);
  }
  const { profiles } = JSON.parse(fs.readFileSync(file, 'utf8'));
  // css var → token id, from every set the CSS is built from.
  const byVar = new Map();
  for (const n of ['primitive', 'base', 'color-shared', 'color-light', 'color-dark']) for (const [id, t] of byName[n].tokens) byVar.set(`--${id.replaceAll('.', '-')}`, { id, type: t.type });
  const norm = (type, v) => {
    if (v === undefined) return undefined;
    if (type === 'color') {
      const { r, g, b, a } = parseColor(v, 'compare');
      return [r, g, b, a].map((n) => Math.round(n * 255)).join();
    }
    return String(v).replace(/['"\s]/g, '').toLowerCase();
  };
  /** CSS var → value map → tokens that change something in `scope`. */
  const toTokens = (vars, scope) => {
    const out = new Map();
    for (const [cssVar, value] of Object.entries(vars)) {
      const hit = byVar.get(cssVar);
      if (!hit) {
        brandSkipped.add(cssVar);
        continue;
      }
      const ref = String(value).match(/^var\((--[a-z0-9-]+)\)$/);
      if (ref) {
        const target = byVar.get(ref[1]);
        if (!target) throw new Error(`${cssVar}: var(${ref[1]}) is not a token`);
        out.set(hit.id, { type: hit.type, value: `{${target.id}}` });
        continue;
      }
      if (norm(hit.type, value) === norm(hit.type, rawValue(scope, hit.id))) continue;
      out.set(hit.id, { type: hit.type, value });
    }
    return out;
  };
  const themeGroup = GROUPS.find((g) => g.group === 'theme').options;
  const at = collected.findIndex((s) => s.name === 'color-dark') + 1;
  const added = [];
  for (const p of profiles) {
    const label = p.name[0].toUpperCase() + p.name.slice(1);
    const brandScope = scopeOf('primitive', 'base', 'color-shared');
    const brand = toTokens({ ...p.primitives, ...p.shared }, brandScope);
    const sets = [{ name: `brand-${p.name}`, description: `${label}: re-hued ramps, typeface, weights and radii. ${p.description}`.trim(), tokens: brand }];
    for (const mode of ['light', 'dark']) {
      const scope = new Map([...brandScope, ...byName[`color-${mode}`].tokens, ...brand]);
      sets.push({ name: `brand-${p.name}-${mode}`, description: `${label}, ${mode}: semantic colors that differ from the aliases.`, tokens: toTokens(p[mode], scope) });
    }
    for (const s of sets) Object.assign(s, { override: true, brand: true, skipped: [] });
    added.push(...sets);
    themeGroup[`${p.name}-light`] = ['color-light', `brand-${p.name}`, `brand-${p.name}-light`];
    themeGroup[`${p.name}-dark`] = ['color-dark', `brand-${p.name}`, `brand-${p.name}-dark`];
  }
  collected.splice(at, 0, ...added);
  for (const s of added) byName[s.name] = s;
}

// Convert once per flavour up front, so a malformed value fails before writing.
// (Collected after the computed sets above, so their values are checked too.)
for (const s of collected) for (const [id, t] of s.tokens) for (const f of ['dtcg', 'studio']) convert(t.type, t.value, `${s.name} ${id}`, f);

const errors = [];

// Overlaps between sets: only density overrides may redefine a token.
const owner = new Map();
for (const s of collected) {
  for (const id of s.tokens.keys()) {
    const prev = owner.get(id);
    if (prev && !s.override && !(prev.startsWith('color-') && s.name.startsWith('color-') && prev !== 'color-shared' && s.name !== 'color-shared')) {
      errors.push(`${id} is defined in both ${prev} and ${s.name}`);
    }
    if (!prev) owner.set(id, s.name);
  }
}
for (const s of collected.filter((x) => x.override)) {
  const targets = s.brand ? ['primitive', 'base', 'color-shared', 'color-light', 'color-dark'] : ['base', 'density-default'];
  for (const id of s.tokens.keys()) if (!targets.some((n) => byName[n].tokens.has(id))) errors.push(`${s.name}: ${id} overrides a token that does not exist`);
}

// Every combination: aliases resolve, types match, no cycles.
const combos = [];
const expand = (i, chosen, label) => {
  if (i === GROUPS.length) return combos.push({ label: label.join(' / '), sets: chosen });
  for (const [opt, sets] of Object.entries(GROUPS[i].options)) expand(i + 1, [...chosen, ...sets], [...label, opt]);
};
expand(0, [], []);

for (const combo of combos) {
  const scope = new Map();
  for (const name of combo.sets) for (const [id, t] of byName[name].tokens) scope.set(id, t);
  const resolveType = (id, seen) => {
    const t = scope.get(id);
    if (!t) return undefined;
    const m = typeof t.value === 'string' && t.value.trim().match(ALIAS);
    if (!m) return t.type;
    if (seen.has(id)) throw new Error(`alias cycle: ${[...seen, id].join(' → ')}`);
    return resolveType(m[1], new Set([...seen, id]));
  };
  for (const [id, t] of scope) {
    const m = typeof t.value === 'string' && t.value.trim().match(ALIAS);
    if (!m) continue;
    let target;
    try {
      target = resolveType(m[1], new Set([id]));
    } catch (e) {
      errors.push(`[${combo.label}] ${e.message}`);
      continue;
    }
    if (target === undefined) errors.push(`[${combo.label}] ${id} → {${m[1]}} does not resolve`);
    else if (target !== t.type) errors.push(`[${combo.label}] ${id} (${t.type}) → {${m[1]}} (${target})`);
  }
}

if (errors.length) {
  console.error(`DTCG export failed, ${errors.length} problem(s):`);
  for (const e of [...new Set(errors)].slice(0, 50)) console.error(`  ${e}`);
  process.exit(1);
}

// --- write -------------------------------------------------------------------

const write = (dir, file, data) => {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), `${JSON.stringify(data, null, 2)}\n`);
};

const dtcgDir = path.join(ROOT, 'build/dtcg');
const studioDir = path.join(ROOT, 'build/tokens-studio');
fs.rmSync(dtcgDir, { recursive: true, force: true });
fs.rmSync(studioDir, { recursive: true, force: true });

for (const s of collected) {
  write(dtcgDir, `${s.name}.tokens.json`, nest(s.tokens, 'dtcg', s.description));
  write(studioDir, `${s.name}.json`, nest(s.tokens, 'studio', s.description));
}

// Tokens Studio: set order + one theme per option of every group.
write(studioDir, '$metadata.json', { tokenSetOrder: collected.map((s) => s.name) });
const themes = [];
for (const { group, options } of GROUPS) {
  for (const [opt, sets] of Object.entries(options)) {
    const selectedTokenSets = {};
    for (const s of collected) if (sets.includes(s.name)) selectedTokenSets[s.name] = 'enabled';
    // Sets a theme needs for aliases but does not own stay as source only.
    if (group !== 'foundation') for (const n of GROUPS[0].options.foundation) selectedTokenSets[n] = 'source';
    themes.push({ id: `${group}-${opt}`, name: opt, group, selectedTokenSets });
  }
}
write(studioDir, '$themes.json', themes);

// Plain manifest for everything else: which files make which combination.
write(dtcgDir, 'manifest.json', {
  $description: 'Load the sets of one option per group, in order; later sets override earlier ones.',
  sets: collected.map((s) => ({ name: s.name, file: `${s.name}.tokens.json`, tokens: s.tokens.size })),
  groups: GROUPS.map(({ group, options }) => ({ group, options })),
  default: { foundation: 'foundation', theme: 'light', density: 'default' },
});

const total = collected.reduce((n, s) => n + s.tokens.size, 0);
const skipped = collected.flatMap((s) => s.skipped);
console.log(`DTCG: ${total} tokens in ${collected.length} sets, ${combos.length} combinations checked.`);
console.log(`  ${collected.map((s) => `${s.name} ${s.tokens.size}`).join(', ')}`);
console.log(`  skipped ${skipped.length} italic style-name tokens (no DTCG type).`);
if (brandSkipped.size) console.log(`  themes: not tokens, CSS only: ${[...brandSkipped].join(', ')}`);
console.log('  → build/dtcg/*.tokens.json, build/tokens-studio/');
