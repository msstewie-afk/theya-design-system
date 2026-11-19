/**
 * Colour tokens and contrast, for the change review: the agent states a
 * contrast only after recomputing it here, from the design system's own CSS,
 * never from memory.
 *
 * resolveTokens(files, selectors) reads custom properties (--name: value)
 * from CSS files in order, keeping only declarations whose innermost rule
 * selector is one of `selectors` (later files and rules win), then resolves
 * var(--x[, fallback]) chains. A theme is a list of selectors: light
 * [':root', '@theme'], dark the same plus '[data-theme="dark"]'.
 *
 * Colours: #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba() (comma or space
 * syntax, % or 0–1 alpha), oklch(), transparent, and
 * color-mix(in srgb|oklab, A p%, B) — enough for token files. Anything else
 * is reported as unresolved instead of guessed.
 */
import fs from 'node:fs';

/** Custom properties declared directly in rules whose selector is in `selectors`. */
export function readCustomProperties(files, selectors) {
  const keep = new Set(selectors.map(norm));
  const vars = new Map();
  for (const file of files) {
    const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const stack = [];
    let buf = '';
    for (const ch of css) {
      if (ch === '{') {
        stack.push(norm(buf.trim()));
        buf = '';
      } else if (ch === '}') {
        declare(buf, stack, keep, vars);
        stack.pop();
        buf = '';
      } else if (ch === ';') {
        declare(buf, stack, keep, vars);
        buf = '';
      } else buf += ch;
    }
  }
  return vars;
}

const norm = (s) => s.replace(/\s+/g, ' ').replace(/'/g, '"');

function declare(text, stack, keep, vars) {
  const m = /^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(text);
  if (!m || !stack.length) return;
  // Selector lists ("a, b") count when any member is kept.
  const inner = stack[stack.length - 1].split(',').map((s) => s.trim());
  if (inner.some((s) => keep.has(s))) vars.set(m[1], m[2].replace(/\s*!important$/, ''));
}

/** A value with every var() replaced (fallbacks honoured), or throws on a cycle / missing var. */
export function resolveValue(value, vars, seen = []) {
  let out = '';
  let i = 0;
  while (i < value.length) {
    const at = value.indexOf('var(', i);
    if (at < 0) {
      out += value.slice(i);
      break;
    }
    out += value.slice(i, at);
    let depth = 0;
    let j = at + 3;
    for (; j < value.length; j++) {
      if (value[j] === '(') depth++;
      else if (value[j] === ')' && --depth === 0) break;
    }
    const inner = value.slice(at + 4, j);
    const comma = topLevelComma(inner);
    const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma < 0 ? null : inner.slice(comma + 1).trim();
    if (seen.includes(name)) throw new Error(`cycle: ${[...seen, name].join(' → ')}`);
    if (vars.has(name)) out += resolveValue(vars.get(name), vars, [...seen, name]);
    else if (fallback != null) out += resolveValue(fallback, vars, seen);
    else throw new Error(`${name} is not declared for this theme`);
    i = j + 1;
  }
  return out.trim();
}

function topLevelComma(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') depth--;
    else if (s[i] === ',' && depth === 0) return i;
  }
  return -1;
}

// ---- colours: { r, g, b } in 0–1 sRGB, a in 0–1 ----

export function parseColor(input) {
  const s = input.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (s === 'white') return { r: 1, g: 1, b: 1, a: 1 };
  if (s === 'black') return { r: 0, g: 0, b: 0, a: 1 };
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) throw new Error(`bad hex: ${input}`);
    const n = (k) => parseInt(h.slice(k, k + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
  }
  m = /^rgba?\((.+)\)$/.exec(s);
  if (m) {
    const [rgb, alpha] = splitAlpha(m[1]);
    const [r, g, b] = rgb.map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v) / 255));
    return { r, g, b, a: alphaOf(alpha) };
  }
  m = /^oklch\((.+)\)$/.exec(s);
  if (m) {
    const [[L, C, H], alpha] = splitAlpha(m[1]);
    const l = L.endsWith('%') ? parseFloat(L) / 100 : parseFloat(L);
    const c = C.endsWith('%') ? (parseFloat(C) / 100) * 0.4 : parseFloat(C);
    const h = (parseFloat(H) * Math.PI) / 180;
    return { ...oklabToSrgb(l, c * Math.cos(h), c * Math.sin(h)), a: alphaOf(alpha) };
  }
  m = /^color-mix\(\s*in\s+(srgb|oklab)\s*,(.+)\)$/.exec(s);
  if (m) {
    const parts = [];
    let rest = m[2];
    for (let k = topLevelComma(rest); ; k = topLevelComma(rest)) {
      parts.push((k < 0 ? rest : rest.slice(0, k)).trim());
      if (k < 0) break;
      rest = rest.slice(k + 1);
    }
    if (parts.length !== 2) throw new Error(`color-mix needs two colours: ${input}`);
    const [a, pa] = mixPart(parts[0]);
    const [b, pb] = mixPart(parts[1]);
    const p1 = pa ?? (pb != null ? 1 - pb : 0.5);
    const p2 = pb ?? 1 - p1;
    return mix(m[1], a, b, p1, p2);
  }
  throw new Error(`can't read colour: ${input}`);
}

function mixPart(part) {
  const m = /^(.*?)\s+([\d.]+)%$/.exec(part);
  return m ? [parseColor(m[1]), parseFloat(m[2]) / 100] : [parseColor(part), null];
}

// CSS color-mix: premultiplied interpolation; percentages summing under 100% scale alpha.
function mix(space, a, b, p1, p2) {
  const sum = p1 + p2;
  const w1 = p1 / sum;
  const w2 = p2 / sum;
  const alpha = a.a * w1 + b.a * w2;
  const to = space === 'oklab' ? srgbToOklab : (c) => [c.r, c.g, c.b];
  const ca = to(a).map((v) => v * a.a);
  const cb = to(b).map((v) => v * b.a);
  const m = ca.map((v, k) => (alpha ? (v * w1 + cb[k] * w2) / alpha : 0));
  const rgb = space === 'oklab' ? oklabToSrgb(...m) : { r: m[0], g: m[1], b: m[2] };
  return { ...rgb, a: alpha * Math.min(1, sum) };
}

function splitAlpha(body) {
  const slash = body.split('/');
  const main = slash[0].split(/[\s,]+/).filter(Boolean);
  if (slash.length > 1) return [main, slash[1].trim()];
  return main.length === 4 ? [main.slice(0, 3), main[3]] : [main, null];
}
const alphaOf = (a) => (a == null ? 1 : a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a));

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const fromLinear = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const clamp = (v) => Math.min(1, Math.max(0, v));

function oklabToSrgb(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: clamp(fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    g: clamp(fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    b: clamp(fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
  };
}

function srgbToOklab({ r, g, b }) {
  const [R, G, B] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** `top` painted over `under` (source-over). */
export function over(top, under) {
  const a = top.a + under.a * (1 - top.a);
  if (!a) return { r: 0, g: 0, b: 0, a: 0 };
  const ch = (k) => (top[k] * top.a + under[k] * under.a * (1 - top.a)) / a;
  return { r: ch('r'), g: ch('g'), b: ch('b'), a };
}

const luminance = ({ r, g, b }) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

/** WCAG contrast ratio of two opaque colours. */
export function ratio(x, y) {
  const [a, b] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (a + 0.05) / (b + 0.05);
}

export const hex = ({ r, g, b, a }) =>
  '#' + [r, g, b, ...(a < 1 ? [a] : [])].map((v) => Math.round(clamp(v) * 255).toString(16).padStart(2, '0')).join('');

/**
 * Contrast of `fg` on `bg` for one theme. Each argument is a colour or a
 * token (--name or name). Translucent colours are composited: bg over
 * `base` (default: the theme's page surface, config review.tokens.page),
 * then fg over that.
 */
export function contrast({ fg, bg, base, vars }) {
  const read = (x) => {
    const raw = /^[\d#]|^(rgb|oklch|color-mix|transparent|white|black)/i.test(x) ? x : `var(${x.startsWith('--') ? x : `--${x}`})`;
    const value = resolveValue(raw, vars);
    return { input: x, value, color: parseColor(value) };
  };
  const B0 = base ? read(base) : { input: 'white', value: '#ffffff', color: { r: 1, g: 1, b: 1, a: 1 } };
  const page = over(B0.color, { r: 1, g: 1, b: 1, a: 1 });
  const BG = read(bg);
  const back = over(BG.color, page);
  const FG = read(fg);
  const front = over(FG.color, back);
  return {
    ratio: ratio(front, back),
    fg: { ...FG, shown: hex(front) },
    bg: { ...BG, shown: hex(back) },
    base: B0.input,
  };
}
