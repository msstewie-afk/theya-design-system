#!/usr/bin/env node
/**
 * Product profiles (themes): `<html data-brand="<name>">` recolors Theya for
 * a product — primary, neutrals/secondary and surfaces, in light and dark —
 * without touching any component.
 *
 * A profile is src/profiles/<name>.json. Two shapes:
 *
 * 1. Simple: { "hue": 300, "chroma"?: 1 } re-hues the primary (blue) ramp.
 *
 * 2. Full theme:
 *    {
 *      "primary": "#743de4",            // brand fill, exact in both modes
 *      "onPrimary"?: "#ffffff",         // text/icons on the fill (auto: white or the darkest ramp step)
 *      "neutral"?: { "hue": 255, "chroma": 0.15 },  // re-hue slate/gray/graphite; chroma = multiplier
 *      "light"?: { "primary"?, "onPrimary"?, "status"?: { "warning": { "hue": 84 } }, "tokens": { "bg-surface-bg-surface-base": "#f9fbfc", … } },
 *      "dark"?:  { … same … },
 *      "accept"?: ["light: bg-primary-bg-primary on bg-surface-bg-surface-base", "primary hue vs success"],
 *      "font"?: "Manrope",              // replaces Theya's typeface (must be in fonts/fonts.css)
 *      "headingFont"?: "Playfair Display",   // headings, display and eyebrow (a stack in HEADING_STACKS)
 *      "shadow"?: { "hue"?: 60, "chroma"?: 1 },  // re-hue the light shadow tint (hue default: neutral.hue)
 *      "typography"?: { "display-display-s-letter-spacing": "0.4px" },  // typography tokens, after the fonts
 *      "radius"?: { "scale": 1.5, "button": "max", "field": "3xl" }
 *    }
 *    `font`: every typography token that names Geologica switches to this
 *    family, and the weight tokens go back to nominal values (Theya's are
 *    shifted −125 because Geologica reads heavy: regular 275 → 400 …).
 *    `radius.scale` multiplies the radius ramp (sm…5xl, rounded to whole px;
 *    max stays a pill); `button` / `field` set one radius for every Button /
 *    TextField + Select trigger — a ramp step name ("xl", "max") or a px
 *    value — through --theme-radius-button / --theme-radius-field.
 *    Token keys are semantic token names without the `--color-` prefix;
 *    `tokens` are applied last, so they win over everything generated.
 *
 * How the colors are made (OKLCH):
 * - Ramps keep Theya's lightness (L) per step and change only hue and
 *   chroma, so every step stays in its place on the scale and contrast stays
 *   close to Theya's. The primary ramp takes the anchor's hue, its chroma is
 *   scaled so step 500 matches the anchor's chroma; neutrals take
 *   `neutral.hue` with their chroma multiplied by `neutral.chroma`. Colors
 *   outside sRGB are pulled back by lowering chroma only.
 * - The primary fill tokens (bg-primary, -on-dark) get the anchor exactly;
 *   hover / pressed are the anchor 0.05 / 0.10 darker in L. Links, icons,
 *   borders and tonal fills come from the re-hued ramp.
 * - Every semantic token that points at an overridden ramp (light, dark and
 *   code sources) is re-pointed to the new step; the primitive variables are
 *   overridden too, for components that use them directly.
 *
 * Checks (the build fails):
 * - contrast: text on surfaces 4.5:1, on-primary text on the fill 4.5:1,
 *   icons / borders / the fill against the page 3:1 — only where Theya itself
 *   passes, so a theme can't make things worse. A known, deliberate drop can
 *   be listed in `accept` (it is then printed, not failed);
 * - the primary hue within 20° of a status color (success, warning, danger,
 *   info) — a primary button would read as a status. Also acceptable via
 *   `accept` ("primary hue vs success") when the brand really is that color.
 *
 * Output: build/css/profiles.css (generated). Run as part of `pnpm build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

/* ---------------------------- color math ---------------------------- */

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToOklch([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), (((Math.atan2(B, A) * 180) / Math.PI) + 360) % 360];
}
const hexToOklch = (hex) => rgbToOklch(hexToRgb(hex));

function oklchToLinear([L, C, H]) {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** OKLCH → sRGB hex, lowering chroma (never lightness or hue) until it fits. */
function oklchToHex([L, C, H]) {
  let c = C;
  let lin = oklchToLinear([L, c, H]);
  while (lin.some((v) => v < -1e-4 || v > 1 + 1e-4) && c > 0) {
    c -= 0.002;
    lin = oklchToLinear([L, Math.max(c, 0), H]);
  }
  return '#' + lin.map((v) => Math.round(Math.min(1, Math.max(0, fromLinear(Math.min(1, Math.max(0, v))))) * 255).toString(16).padStart(2, '0')).join('');
}

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
/** `fg` at `alpha` over `bg`, as an opaque hex (sRGB, like the browser composites). */
const over = (fg, bg, alpha) =>
  '#' + hexToRgb(fg).map((c, i) => Math.round((c * alpha + hexToRgb(bg)[i] * (1 - alpha)) * 255).toString(16).padStart(2, '0')).join('');

/** `rgb(r g b / a)` or `rgba(r, g, b, a)` over an opaque `bg`, as a hex; anything else unchanged. */
function flatten(v, bg) {
  const m = typeof v === 'string' && v.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*[/,]\s*([\d.]+)\s*\)$/);
  if (!m || !isHex(bg)) return v;
  const hex = '#' + m.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
  return over(hex, bg, Number(m[4]));
}

/** Halfway between two colors in OKLab (straight line, so no hue swing). */
function mixOklab(x, y) {
  const lab = (hex) => {
    const [L, C, H] = hexToOklch(hex);
    return [L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)];
  };
  const [L, a, b] = lab(x).map((v, i) => (v + lab(y)[i]) / 2);
  return oklchToHex([L, Math.hypot(a, b), (((Math.atan2(b, a) * 180) / Math.PI) + 360) % 360]);
}

/* ----------------------------- tokens ------------------------------- */

const primitive = read('src/primitive/color.json').color;
const rampOf = (family) => Object.fromEntries(Object.entries(primitive[family]).map(([k, v]) => [k, v.value.toLowerCase()]));

const PRIMARY = ['blue'];
const PRIMARY_ALPHA = ['blue-a'];
const NEUTRAL = ['slate', 'gray', 'graphite'];
const NEUTRAL_ALPHA = ['slate-a', 'gray-a'];

/** css var → { family, step } for every token that references a color step. */
function refsOf(file) {
  const out = new Map();
  const walk = (node, trail) => {
    if (node && typeof node === 'object' && 'value' in node && typeof node.value === 'string') {
      const m = node.value.match(/^\{color\.([a-z-]+)\.([a-z0-9-]+)\}$/);
      if (m) out.set(`--${trail.join('-')}`, { family: m[1], step: m[2] });
      return;
    }
    if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, [...trail, k]);
  };
  walk(read(file), []);
  return out;
}
// src/code/color.json is in both the light and the dark source set.
const codeRefs = refsOf('src/code/color.json');
const lightRefs = new Map([...refsOf('src/semantic/color.default.json'), ...codeRefs]);
const darkRefs = new Map([...refsOf('src/semantic/color.dark.json'), ...codeRefs]);

/** Built values (for contrast): light = variables.css, dark = light + variables-dark.css. */
function builtValues(file, { raw = false } = {}) {
  const css = fs.readFileSync(path.join(ROOT, file), 'utf8');
  return new Map([...css.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/gi)].map((m) => [m[1], raw ? m[2].trim() : m[2].trim().toLowerCase()]));
}
const builtLight = builtValues('build/css/variables.css');
const builtDark = new Map([...builtLight, ...builtValues('build/css/variables-dark.css')]);

/* ----------------------------- ramps -------------------------------- */

/** Re-hue a hex ramp: keep L, set hue, map chroma through `chromaOf(stepC)`. */
const rehue = (ramp, hue, chromaOf) =>
  Object.fromEntries(
    Object.entries(ramp).map(([step, hex]) => {
      const [L, C] = hexToOklch(hex);
      return [step, oklchToHex([L, chromaOf(C), hue])];
    }),
  );

/** Alpha ramp: same alphas, base color re-hued the same way. */
function rehueAlpha(ramp, hue, chromaOf) {
  const first = Object.values(ramp)[0].match(/rgba\((\d+),\s*(\d+),\s*(\d+),/);
  const baseHex = '#' + first.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
  const [L, C] = hexToOklch(baseHex);
  const [r, g, b] = hexToRgb(oklchToHex([L, chromaOf(C), hue])).map((v) => Math.round(v * 255));
  return Object.fromEntries(Object.entries(ramp).map(([step, value]) => [step, `rgba(${r}, ${g}, ${b}, ${value.match(/,\s*([\d.]+)\)$/)[1]})`]));
}

const shiftL = (hex, dL) => {
  const [L, C, H] = hexToOklch(hex);
  return oklchToHex([Math.max(0, L + dL), C, H]);
};

/* --------------------------- profiles ------------------------------- */

const LIGHT_SURFACE = '#ffffff';
const DARK_SURFACE = '#151529';

const profilesDir = path.join(ROOT, 'src/profiles');
const profiles = fs.existsSync(profilesDir)
  ? fs.readdirSync(profilesDir).filter((f) => f.endsWith('.json')).sort().map((f) => ({ name: f.replace(/\.json$/, ''), ...read(`src/profiles/${f}`) }))
  : [];

const problems = [];
const accepted = [];

// The primary hue must stay this far from every status fill, in each mode,
// as the theme finally sets them (a theme may re-hue a status: `status`).
const STATUS_GAP = 20;
const STATUSES = ['success', 'warning', 'danger', 'info'];

/** Contrast pairs: [foreground, background, floor]. */
const SURFACES = ['bg-surface-bg-surface-base', 'bg-surface-bg-surface'];
const PAIRS = [
  ...['text-text', 'text-text-subtle', 'text-text-subtler', 'text-text-link'].flatMap((fg) => SURFACES.map((bg) => [fg, bg, 4.5])),
  ...['icon-icon', 'icon-icon-primary', 'border-border-primary'].flatMap((fg) => SURFACES.map((bg) => [fg, bg, 3])),
  ['text-text-on-primary', 'bg-primary-bg-primary', 4.5],
  ['text-text-on-primary', 'bg-primary-bg-primary-hover', 4.5],
  ['text-text-on-primary', 'bg-primary-bg-primary-on-dark', 4.5],
  ['text-text-subtle-on-primary', 'bg-primary-bg-primary', 4.5],
  ['bg-primary-bg-primary', 'bg-surface-bg-surface-base', 3],
];

/** Heading typefaces a theme can name in `headingFont`, with their fallbacks. */
// Weight range of each heading face as loaded in fonts/fonts.css.
const HEADING_WEIGHTS = { 'EB Garamond': [400, 800], 'Playfair Display': [400, 900] };
const HEADING_STACKS = {
  'EB Garamond': "'EB Garamond', ui-serif, Georgia, 'Times New Roman', serif",
  'Playfair Display': "'Playfair Display', ui-serif, Georgia, 'Times New Roman', serif",
};

const exported = [];
const css = [`/**\n * Product profiles — generated by scripts/build-profiles.mjs from src/profiles/*.json. Do not edit.\n * Use: <html data-brand="<name>"> (together with data-theme for dark).\n */`];

for (const profile of profiles) {
  const full = Boolean(profile.primary);
  const primaryHex = (mode) => (profile[mode]?.primary ?? profile.primary)?.toLowerCase();

  // Primary hue/chroma: from the anchor (full) or from hue/chroma (simple).
  const blue500 = hexToOklch(rampOf('blue')['blue-500']);
  const anchor = full ? hexToOklch(primaryHex('light')) : null;
  const pHue = full ? anchor[2] : profile.hue;
  const pScale = full ? anchor[1] / blue500[1] : profile.chroma ?? 1;

  // One message per status, however many modes collide.
  const hueReported = new Set();

  // New primitive ramps: family → { step → value }
  const ramps = {};
  for (const f of PRIMARY) ramps[f] = rehue(rampOf(f), pHue, (c) => c * pScale);
  for (const f of PRIMARY_ALPHA) ramps[f] = rehueAlpha(rampOf(f), pHue, (c) => c * pScale);
  if (profile.neutral) {
    const { hue, chroma = 1 } = profile.neutral;
    for (const f of NEUTRAL) ramps[f] = rehue(rampOf(f), hue, (c) => c * chroma);
    for (const f of NEUTRAL_ALPHA) ramps[f] = rehueAlpha(rampOf(f), hue, (c) => c * chroma);
  }

  const modeBlock = (mode) => {
    const refs = mode === 'light' ? lightRefs : darkRefs;
    const built = mode === 'light' ? builtLight : builtDark;
    const out = new Map();
    for (const [token, { family, step }] of refs) if (ramps[family]?.[step]) out.set(token, ramps[family][step]);

    if (full) {
      const fill = primaryHex(mode);
      for (const t of ['bg-primary-bg-primary', 'bg-primary-bg-primary-on-dark']) out.set(`--color-${t}`, fill);
      out.set('--color-bg-primary-bg-primary-hover', shiftL(fill, -0.05));
      out.set('--color-bg-primary-bg-primary-pressed', shiftL(fill, -0.1));
      let on = (profile[mode]?.onPrimary ?? profile.onPrimary)?.toLowerCase();
      if (!on) {
        on = contrast('#ffffff', fill) >= 4.5 ? '#ffffff' : ramps.blue['blue-900'];
      }
      out.set('--color-text-text-on-primary', on);
      out.set('--color-icon-icon-on-primary', on);
      // Theya's on-primary helpers are white with alpha (subtle text,
      // borders, focus ring on a filled card or bulk bar). With dark ink on
      // a light fill (lime), white would vanish: derive them from the ink
      // instead, at the same weights.
      if (on !== '#ffffff') {
        out.set('--color-text-text-subtle-on-primary', over(on, fill, 0.8));
        out.set('--color-border-border-on-primary', over(on, fill, 0.6));
        out.set('--color-focus-focus-ring-on-primary', over(on, fill, 0.3));
        // Dividers stay a light line, not a darker tint of the fill: white
        // at 30% vanishes on a light fill, 60% reads as a clean line.
        out.set('--color-border-border-subtler-on-primary', 'rgba(255, 255, 255, 0.6)');
      }
    }
    // `status`: re-hue every token of one status family in this mode (fills,
    // text, icons, borders, tonal and alpha backgrounds), keeping each
    // token's lightness, so the family keeps its contrast. For a status that
    // sits too close to the primary hue: an orange theme moves dark warning
    // from orange to amber, as light warning already is.
    for (const [status, { hue, chroma = 1 }] of Object.entries(profile[mode]?.status ?? {})) {
      if (!STATUSES.includes(status)) problems.push(`${profile.name} (${mode}): unknown status ${status}`);
      for (const [token, value] of built) {
        if (!token.startsWith('--color-') || !token.includes(`-${status}`)) continue;
        if (isHex(value)) {
          const [L, C] = hexToOklch(value);
          out.set(token, oklchToHex([L, C * chroma, hue]));
        } else {
          const m = value.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
          if (!m) continue;
          const hex = '#' + m.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
          const [L, C] = hexToOklch(hex);
          const [r, g, b] = hexToRgb(oklchToHex([L, C * chroma, hue])).map((v) => Math.round(v * 255));
          out.set(token, `rgba(${r}, ${g}, ${b}, ${m[4]})`);
        }
      }
    }
    // `shadow`: light shadows are tinted toward Theya's indigo slate
    // (rgba(61, 72, 143, a)); a warm theme re-hues that tint (default: the
    // neutral hue), keeping its lightness and every alpha, so the shadows are
    // as strong, just not blue. `chroma` multiplies the tint's chroma. Dark
    // shadows are black and stay so; the dark block writes them back because
    // the light override sits on [data-brand] and would reach dark too.
    if (profile.shadow) {
      const TINT = /rgba\(61, 72, 143, /g;
      const tinted = [...builtLight].filter(([, v]) => String(v).includes('rgba(61, 72, 143, '));
      if (!tinted.length) problems.push(`${profile.name}: shadow set, but no tinted shadow token found`);
      if (mode === 'light') {
        const { hue = profile.neutral?.hue, chroma = 1 } = profile.shadow;
        if (!Number.isFinite(hue)) problems.push(`${profile.name}: shadow needs a hue (or neutral.hue)`);
        const [L, C] = hexToOklch('#3d488f');
        const [r, g, b] = hexToRgb(oklchToHex([L, C * chroma, hue])).map((v) => Math.round(v * 255));
        for (const [token, value] of tinted) out.set(token, value.replace(TINT, `rgba(${r}, ${g}, ${b}, `));
      } else {
        for (const [token] of tinted) out.set(token, builtDark.get(token));
      }
    }
    for (const [key, value] of Object.entries(profile[mode]?.tokens ?? {})) {
      const token = `--color-${key}`;
      if (!built.has(token)) problems.push(`${profile.name} (${mode}): unknown token ${key}`);
      out.set(token, String(value).toLowerCase());
    }

    // Contrast: only where Theya passes and the theme drops below the floor.
    const final = new Map([...built, ...out]);
    const resolve = (v, seen = 0) => (v?.startsWith('var(') && seen < 5 ? resolve(final.get(v.slice(4, -1).split(',')[0].trim()), seen + 1) : v);

    // border-subtle (cards, tables) sits halfway between border (fields)
    // and border-subtler (dividers). When a theme sets either end by hand,
    // recompute the middle from the final values so the three stay in
    // order, unless the theme sets border-subtle itself.
    const own = profile[mode]?.tokens ?? {};
    // bg-surface-page is the theme's page colour unless the theme tints it
    // (T14): follow the theme's own surface-base, not the re-hued default.
    if (!('bg-surface-bg-surface-page' in own)) out.set('--color-bg-surface-bg-surface-page', final.get('--color-bg-surface-bg-surface-base'));
    if (!('border-border-subtle' in own) && ('border-border' in own || 'border-border-subtler' in own)) {
      const [hi, lo] = [resolve(final.get('--color-border-border')), resolve(final.get('--color-border-border-subtler'))];
      if (isHex(hi) && isHex(lo)) {
        const mid = mixOklab(hi, lo);
        out.set('--color-border-border-subtle', mid);
        final.set('--color-border-border-subtle', mid);
      }
    }
    for (const status of STATUSES) {
      const fill = resolve(final.get(`--color-bg-${status}-bg-${status}`));
      if (!isHex(fill)) continue;
      const sHue = hexToOklch(fill)[2];
      const gap = Math.abs(((pHue - sHue + 540) % 360) - 180);
      const id = `primary hue vs ${status}`;
      if (gap >= STATUS_GAP || hueReported.has(id)) continue;
      hueReported.add(id);
      const msg = `${profile.name}: ${id} — ${pHue.toFixed(0)}° is ${gap.toFixed(0)}° from ${status} (${sHue.toFixed(0)}°, ${mode}); keep at least ${STATUS_GAP}°`;
      (profile.accept ?? []).includes(id) ? accepted.push(msg) : problems.push(msg);
    }
    // A re-hued status keeps its contrast only roughly (same OKLCH L is not
    // the same WCAG luminance), so its own pairs are checked too.
    const statusPairs = Object.keys(profile[mode]?.status ?? {}).flatMap((s) => [
      [`text-text-on-dark`, `bg-${s}-bg-${s}`, 4.5],
      [`text-text-${s}`, `bg-${s}-bg-${s}`, 4.5],
      ...SURFACES.flatMap((bg) => [[`text-text-${s}`, bg, 4.5], [`icon-icon-${s}`, bg, 3], [`border-border-${s}`, bg, 3]]),
    ]);
    for (const [fgKey, bgKey, floor] of [...PAIRS, ...statusPairs]) {
      const [fg, bg] = [`--color-${fgKey}`, `--color-${bgKey}`];
      // A translucent foreground (Theya's subtle-on-primary is white at 90%) is
      // composited over its background first, as the browser draws it.
      const [b, b0] = [resolve(final.get(bg)), resolve(built.get(bg))];
      const [a, a0] = [flatten(resolve(final.get(fg)), b), flatten(resolve(built.get(fg)), b0)];
      if (![a, b, a0, b0].every(isHex)) continue;
      if (contrast(a0, b0) >= floor && contrast(a, b) < floor) {
        const id = `${mode}: ${fgKey} on ${bgKey}`;
        const msg = `${profile.name} ${id} ${contrast(a, b).toFixed(2)}:1, under ${floor}:1 (Theya ${contrast(a0, b0).toFixed(2)})`;
        (profile.accept ?? []).some((x) => id.includes(x) || x.includes(id)) ? accepted.push(msg) : problems.push(msg);
      }
    }
    return out;
  };

  // Mode-independent: typeface and radii (go in the light block, which also
  // applies under dark — the dark block only overrides colors).
  const shared = new Map();
  if (profile.font) {
    for (const [token, value] of builtValues('build/css/variables.css', { raw: true })) {
      if (/^geologica,/i.test(value)) shared.set(token, value.replace(/^geologica/i, `'${profile.font}'`));
    }
    // Theya's extralight and thin are both 100, so tokens built from
    // {typography.weight.extralight} are found by their source alias.
    const extralightAliases = new Set();
    const walkTypo = (node, trail) => {
      if (node && typeof node === 'object' && 'value' in node) {
        if (node.value === '{typography.weight.extralight}') extralightAliases.add(`--${trail.join('-')}`);
        return;
      }
      if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walkTypo(v, [...trail, k]);
    };
    walkTypo(read('src/semantic/typography.json'), []);
    const NOMINAL = { 175: 300, 275: 400, 375: 500, 475: 600, 575: 700, 675: 800, 775: 900 };
    for (const [token, value] of builtLight) {
      if (!/^--typography-[a-z0-9-]*weight[a-z0-9-]*$/.test(token)) continue;
      if (token === '--typography-weight-extralight' || extralightAliases.has(token)) shared.set(token, '200');
      else if (NOMINAL[value]) shared.set(token, String(NOMINAL[value]));
    }
    if (![...shared.keys()].some((k) => k.includes('font-family'))) problems.push(`${profile.name}: font set, but no Geologica token found to replace`);
  }
  // `headingFont`: a second typeface for headings only (body, buttons and
  // UI text keep `font` or Geologica). Heading weights go back to nominal,
  // as with `font`: the −125 shift is for Geologica.
  if (profile.headingFont) {
    const stack = HEADING_STACKS[profile.headingFont];
    if (!stack) problems.push(`${profile.name}: headingFont "${profile.headingFont}" has no stack; add it to HEADING_STACKS (and its @font-face to fonts/fonts.css)`);
    else {
      shared.set('--typography-font-family-heading', stack);
      const NOMINAL = { 175: 300, 275: 400, 375: 500, 475: 600, 575: 700, 675: 800, 775: 900 };
      for (const [token, value] of builtLight) {
        // display and eyebrow styles are set in the heading face too
        if (/^--typography-(heading|display|eyebrow)-[a-z0-9-]+-font$/.test(token)) shared.set(token, stack);
        else if (/^--typography-(heading|display|eyebrow)-[a-z0-9-]+-weight$/.test(token)) {
          // Nominal weight, kept inside the face's loaded range (EB Garamond: 400–800):
          // the browser would snap an out-of-range weight to the nearest anyway
          // (3xl's extralight 100 → 400); writing it keeps Figma and code in step.
          const [min, max] = HEADING_WEIGHTS[profile.headingFont] ?? [100, 900];
          const w = NOMINAL[value] ?? Number(value);
          if (Number.isFinite(w)) shared.set(token, String(Math.min(max, Math.max(min, w))));
        }
      }
    }
  }
  // `typography`: a theme's own values for typography tokens, keyed by the
  // name after --typography- ("display-display-s-letter-spacing": "0.4px").
  // Applied after `font` / `headingFont`, so it wins. For a face that needs
  // other spacing than Geologica: Playfair Display at 40px extrabold touched
  // its letters at Theya's -1px (T8).
  for (const [key, value] of Object.entries(profile.typography ?? {})) {
    const token = `--typography-${key}`;
    if (!builtLight.has(token)) problems.push(`${profile.name}: unknown typography token ${key}`);
    shared.set(token, String(value));
  }
  if (profile.radius) {
    const { button, field, anchor } = profile.radius;
    const RADIUS = '--size-border-radius-border-radius-';
    // `anchor: { "lg": 2 }` pins one step to a px value and scales the rest
    // of the ramp by the same factor (here 2 / 6): "fields are 2px, build
    // everything else from that". Otherwise `scale` is the factor itself.
    let scale = profile.radius.scale ?? 1;
    if (anchor) {
      const [[step, px]] = Object.entries(anchor);
      const base = parseFloat(builtLight.get(RADIUS + step));
      if (!base) problems.push(`${profile.name}: radius anchor "${step}" is not a radius step`);
      else scale = px / base;
    }
    const stepRef = (v) => {
      if (/^\d+(\.\d+)?px$/.test(v)) return v;
      if (!builtLight.has(RADIUS + v)) problems.push(`${profile.name}: unknown radius step "${v}"`);
      return `var(${RADIUS}${v})`;
    };
    if (scale !== 1) {
      for (const [token, value] of builtLight) {
        if (!token.startsWith(RADIUS) || token.endsWith('-max')) continue;
        shared.set(token, `${Math.round(parseFloat(value) * scale)}px`);
      }
    }
    if (button) shared.set('--theme-radius-button', stepRef(button));
    if (field) shared.set('--theme-radius-field', stepRef(field));
  }

  const light = modeBlock('light');
  const dark = modeBlock('dark');
  const primitives = Object.entries(ramps).flatMap(([family, steps]) => Object.entries(steps).map(([step, value]) => `  --color-${family}-${step}: ${value};`));
  const decl = (map) => [...map].map(([k, v]) => `  ${k}: ${v};`).join('\n');
  const summary = full
    ? `primary ${profile.primary}${profile.neutral ? `, neutrals ${profile.neutral.hue}° ×${profile.neutral.chroma ?? 1}` : ''}`
    : `hue ${profile.hue}°, chroma ×${profile.chroma ?? 1}`;
  const radiusNote = profile.radius && (profile.radius.anchor ? `radius ${Object.entries(profile.radius.anchor).map(([k, v]) => `${k} = ${v}px`).join('')}` : `radius ×${profile.radius.scale ?? 1}`);
  const extras = [profile.font && `font ${profile.font}`, profile.headingFont && `headings ${profile.headingFont}`, radiusNote && `${radiusNote}${profile.radius.button ? `, buttons ${profile.radius.button}` : ''}`].filter(Boolean).join(', ');
  exported.push({
    name: profile.name,
    description: profile.description ?? '',
    primitives: Object.fromEntries(Object.entries(ramps).flatMap(([family, steps]) => Object.entries(steps).map(([step, value]) => [`--color-${family}-${step}`, value]))),
    shared: Object.fromEntries(shared),
    light: Object.fromEntries(light),
    dark: Object.fromEntries(dark),
  });
  css.push(
    `/* ${profile.name}: ${summary}${extras ? `, ${extras}` : ''}${profile.description ? ` — ${profile.description}` : ''} */`,
    `[data-brand='${profile.name}'] {\n${primitives.join('\n')}${shared.size ? `\n${decl(shared)}` : ''}\n${decl(light)}\n}`,
    `[data-theme='dark'][data-brand='${profile.name}'],\n[data-theme='dark'] [data-brand='${profile.name}'] {\n${decl(dark)}\n}`,
  );
}

fs.mkdirSync(path.join(ROOT, 'build/css'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'build/css/profiles.css'), css.join('\n\n') + '\n');
// The same overrides as data, for the DTCG / Tokens Studio export (build-dtcg.mjs).
fs.writeFileSync(path.join(ROOT, 'build/css/profiles.json'), JSON.stringify({ $comment: 'Generated by scripts/build-profiles.mjs. CSS var → value per profile.', profiles: exported }, null, 2) + '\n');
console.log(`profiles: ${profiles.map((p) => p.name).join(', ') || 'none'} → build/css/profiles.css, profiles.json`);
if (accepted.length) console.log(`  accepted deviations:\n    ${accepted.join('\n    ')}`);
if (problems.length) {
  console.error(`Profile problems:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
