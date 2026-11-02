#!/usr/bin/env node
/**
 * Text contrast scan over every story, light and dark (WCAG 1.4.3).
 *
 * axe's color-contrast rule skips text that is aria-hidden (a count inside a
 * named badge, a decorative label) and gives up on translucent backgrounds.
 * This scan measures what a sighted user sees instead: every visible text
 * node, its color composited with the element's opacity, against the
 * background built up from every translucent layer below it down to an
 * opaque one (or the page). Text 24px+ (or 18.66px+ at weight 700+) needs
 * 3:1, the rest 4.5:1.
 *
 * Skipped, as WCAG exempts them or they can't be measured from CSS:
 * disabled controls and their labels (:disabled, aria-disabled, a disabled
 * fieldset, a <label> whose control is disabled), inert content (inactive
 * carousel slides), pure decoration (a lone separator character), text over
 * an image, video, canvas or gradient, sr-only text, placeholders. Pages are
 * measured once their animations have finished.
 *
 *   node scripts/contrast-scan.mjs --url http://localhost:6008 [--only <title-substring>] [--workers 6] [--themes light,dark] [--out report.json]
 *
 * --nontext: WCAG 1.4.11 instead — the parts of controls and indicators that
 * carry their state, each against what is next to it (3:1):
 * - progressbar / meter / slider: the filled part against its track;
 * - switch: the track against the surface (unless it has a 3:1 border), the thumb against the track;
 * - checkbox / radio (unchecked): the border against the surface;
 * - text fields, textareas, select / combobox triggers: the border against the surface.
 * The focus ring is not measured: its contrast is a library-wide accepted deviation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// The Playwright the test runner uses, so its installed Chromium is found (same as a11y-auto.mjs).
const { chromium } = require(require.resolve('playwright', { paths: [path.dirname(require.resolve('@storybook/test-runner'))] }));

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const URL_BASE = arg('url', 'http://localhost:6008');
const ONLY = arg('only', '');
const WORKERS = Number(arg('workers', '4'));
const THEMES = arg('themes', 'light,dark').split(',');
const OUT = arg('out', '');
const NONTEXT = process.argv.includes('--nontext');

const index = await (await fetch(`${URL_BASE}/index.json`)).json();
const stories = Object.values(index.entries).filter((e) => e.type === 'story' && (!ONLY || e.title.includes(ONLY)));

/** Runs in the page: every low-contrast text run (or, with nontext, control part) in #storybook-root. */
function scan(nontext) {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const over = (top, under) => ({
    r: top.r * top.a + under.r * (1 - top.a),
    g: top.g * top.a + under.g * (1 - top.a),
    b: top.b * top.a + under.b * (1 - top.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (x) => {
      x /= 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const pageBg = parse(getComputedStyle(document.body).backgroundColor);
  const base = pageBg && pageBg.a === 1 ? pageBg : parse(getComputedStyle(document.documentElement).backgroundColor) ?? { r: 255, g: 255, b: 255, a: 1 };

  /** Background under el: translucent layers composited down to the first opaque one. */
  const backgroundOf = (el) => {
    const layers = [];
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== 'none') return null;
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a === 1) break;
      }
    }
    let bg = layers.length && layers[layers.length - 1].a === 1 ? layers.pop() : base;
    while (layers.length) bg = over(layers.pop(), bg);
    return bg;
  };
  const hiddenSr = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.clip === 'rect(0px, 0px, 0px, 0px)' || cs.clipPath === 'inset(50%)') return true;
      if (cs.visibility === 'hidden' || cs.display === 'none') return true;
    }
    return false;
  };
  const opacityOf = (el) => {
    let o = 1;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
    return o;
  };
  const out = [];
  const root = document.getElementById('storybook-root');
  if (!root) return out;
  if (nontext) {
    const visible = (el) => { const b = el.getBoundingClientRect(); return b.width > 1 && b.height > 1 && !hiddenSr(el); };
    const inactive = (el) => !!el.closest(':disabled, [aria-disabled="true"], fieldset:disabled, [data-disabled], [inert]');
    const colorOf = (c, el) => { const p = parse(c); if (!p || p.a === 0) return null; return over({ ...p, a: p.a * opacityOf(el) }, backgroundOf(el.parentElement) ?? base); };
    const fillOf = (el) => { const p = parse(getComputedStyle(el).backgroundColor); if (!p || p.a === 0) return null; return over({ ...p, a: p.a * opacityOf(el) }, backgroundOf(el.parentElement) ?? base); };
    const borderOf = (el) => { const cs = getComputedStyle(el); return parseFloat(cs.borderTopWidth) >= 1 && cs.borderTopStyle !== 'none' ? colorOf(cs.borderTopColor, el) : null; };
    const report = (el, what, a, b) => {
      const r = ratio(a, b);
      if (r + 0.005 < 3) out.push({ text: what, ratio: Math.round(r * 100) / 100, need: 3, fg: hex(a), bg: hex(b), hidden: false, path: [el.getAttribute('role') ?? el.tagName.toLowerCase(), el.getAttribute('data-slot') ?? el.closest('[data-slot]')?.getAttribute('data-slot') ?? ''].filter(Boolean).join(' in ') });
    };
    const surfaceOf = (el) => backgroundOf(el.parentElement) ?? base;
    for (const el of root.querySelectorAll('[role=progressbar], [role=meter], [role=slider]')) {
      if (!visible(el) || inactive(el)) continue;
      // The track is the element (or, for a slider thumb, its track's parent); the fill is a descendant with a different color.
      // Radix Slider: the thumb sits in a wrapper inside the root, next to the track.
      const track = el.getAttribute('role') === 'slider' ? el.parentElement?.parentElement ?? null : el;
      if (!track) continue;
      // Every track inside (one bar, or one per segment) is a box with a fill of its own whose child has another fill.
      for (const t of [track, ...track.querySelectorAll('*')]) {
        if (!visible(t) || !fillOf(t)) continue;
        const fill = [...t.children].find((n) => visible(n) && fillOf(n) && hex(fillOf(n)) !== hex(fillOf(t)));
        if (fill) report(el, 'fill against its track', fillOf(fill), fillOf(t));
      }
    }
    for (const el of root.querySelectorAll('[role=switch]')) {
      if (!visible(el) || inactive(el)) continue;
      const trackColor = fillOf(el) ?? surfaceOf(el);
      const border = borderOf(el);
      if (!(border && ratio(border, surfaceOf(el)) >= 3)) report(el, 'track against the surface', trackColor, surfaceOf(el));
      const thumb = [...el.querySelectorAll('*')].find((n) => visible(n) && fillOf(n));
      if (thumb) report(el, 'thumb against the track', fillOf(thumb), trackColor);
    }
    for (const el of root.querySelectorAll('[role=checkbox], [role=radio], input[type=checkbox], input[type=radio]')) {
      if (!visible(el) || inactive(el) || el.getAttribute('aria-checked') === 'true' || el.getAttribute('data-state') === 'checked' || el.checked) continue;
      // Card-like options (a whole row is the radio) are judged by review, not here.
      const b = el.getBoundingClientRect();
      if (b.width > 32 || b.height > 32) continue;
      const border = borderOf(el);
      if (border) report(el, 'unchecked border against the surface', border, surfaceOf(el));
    }
    for (const el of root.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=range]), textarea, button[role=combobox], [data-slot=select-trigger]')) {
      if (!visible(el) || inactive(el)) continue;
      // The visible box can be a wrapper (InputGroup, a field with icons): measure the nearest bordered box.
      let box = el;
      for (let i = 0; i < 3 && box && !borderOf(box); i++) box = box.parentElement;
      if (!box || box === root) continue;
      const border = borderOf(box);
      const surface = surfaceOf(box);
      const field = fillOf(box);
      // A filled field whose fill already stands out at 3:1 doesn't need the border.
      if (field && ratio(field, surface) >= 3) continue;
      if (border) report(el, 'field border against the surface', border, surface);
    }
    return out;
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const text = t.textContent.trim();
    const el = t.parentElement;
    if (!text || !el || seen.has(el)) continue;
    seen.add(el);
    if (el.closest(':disabled, [aria-disabled="true"], fieldset:disabled, [data-disabled], [inert]')) continue;
    // Sonner fades toasts in and out on its own timers, and dims the ones
    // stacked under the front toast: only a settled, front toast is measured.
    const toast = el.closest('[data-sonner-toast]');
    if (toast && (toast.getAttribute('data-removed') === 'true' || toast.getAttribute('data-mounted') !== 'true' || (toast.getAttribute('data-front') !== 'true' && toast.getAttribute('data-expanded') !== 'true'))) continue;
    const label = el.closest('label');
    const control = label?.control;
    if (control && (control.disabled || control.getAttribute('aria-disabled') === 'true' || control.hasAttribute('data-disabled'))) continue;
    // A block whose every control is disabled (a disabled Dropzone or InputOTP):
    // its text belongs to an inactive component.
    let box = el;
    for (let i = 0; i < 6 && box && !box.querySelector('input, button, select, textarea, [role=button]'); i++) box = box.parentElement;
    if (box && box.querySelector(':disabled, [aria-disabled="true"]') && !box.querySelector('input:not(:disabled), button:not(:disabled), select:not(:disabled), textarea:not(:disabled)')) continue;
    // Color specimens on Foundations, excluded from axe the same way.
    if (el.closest('[data-swatch-label]')) continue;
    // A lone separator glyph (Breadcrumb "/", DotSeparator "·") is decoration.
    if (/^[·•/|—–\-]$/.test(text)) continue;
    if (el.closest('svg, script, style, template')) continue;
    const range = document.createRange();
    range.selectNodeContents(t);
    const rect = range.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2 || hiddenSr(el)) continue;
    const cs = getComputedStyle(el);
    const o = opacityOf(el);
    if (o < 0.05) continue;
    const bg = backgroundOf(el);
    if (!bg) continue;
    // Text laid over a picture: its real background is pixels, not CSS.
    const overMedia = [...root.querySelectorAll('img, video, canvas, picture')].some((m) => {
      const b = m.getBoundingClientRect();
      return b.width > 0 && b.left < rect.right && b.right > rect.left && b.top < rect.bottom && b.bottom > rect.top && !m.contains(el);
    });
    if (overMedia) continue;
    const fg0 = parse(cs.color);
    if (!fg0) continue;
    const fg = over({ ...fg0, a: fg0.a * o }, bg);
    const r = ratio(fg, bg);
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
    const need = large ? 3 : 4.5;
    if (r + 0.005 < need) {
      out.push({
        text: text.slice(0, 40),
        ratio: Math.round(r * 100) / 100,
        need,
        fg: hex(fg),
        bg: hex(bg),
        hidden: !!el.closest('[aria-hidden="true"]'),
        path: [el.tagName.toLowerCase(), el.getAttribute('data-slot') ?? el.closest('[data-slot]')?.getAttribute('data-slot') ?? ''].filter(Boolean).join(' in '),
      });
    }
  }
  return out;
}

const browser = await chromium.launch();
const results = [];
const queue = THEMES.flatMap((theme) => stories.map((s) => ({ s, theme })));
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    let page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    for (let job = queue.shift(); job; job = queue.shift()) {
      const { s, theme } = job;
      // A crashed page stays dead: open a fresh one and give the story one more try.
      if (page.isClosed()) page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      try {
        await page.goto(`${URL_BASE}/iframe.html?id=${s.id}&viewMode=story&globals=theme:${theme}`, { waitUntil: 'load', timeout: 20000 });
        await page.waitForSelector('#storybook-root > *', { timeout: 8000 }).catch(() => {});
        // Let play functions and entrance animations settle: wait for every
        // finite animation to finish (infinite ones, like a shimmer, are skipped).
        // Twice: a play function's clicks can start new transitions after the first wait.
        const settle = () =>
          page
            .evaluate(() =>
              Promise.race([
                Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {}))),
                new Promise((r) => setTimeout(r, 3000)),
              ]),
            )
            .catch(() => {});
        await page.waitForTimeout(400);
        await settle();
        await page.waitForTimeout(600);
        await settle();
        // A toast still sliding in after its mount (Sonner sets data-mounted first).
        await page.waitForTimeout(400);
        const found = await page.evaluate(scan, NONTEXT);
        for (const f of found) results.push({ story: s.id, title: s.title, theme, ...f });
      } catch (e) {
        if (/crashed|closed/i.test(String(e)) && !job.retried) {
          await page.close().catch(() => {});
          page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
          queue.push({ ...job, retried: true });
          continue;
        }
        results.push({ story: s.id, title: s.title, theme, error: String(e).slice(0, 160) });
      }
    }
    await page.close();
  }),
);
await browser.close();

const issues = results.filter((r) => !r.error);
// One line per distinct color pair and component: the same badge in ten stories is one finding.
const groups = new Map();
for (const r of issues) {
  const key = `${r.title} | ${r.theme} | ${r.fg} on ${r.bg}`;
  const g = groups.get(key) ?? { ...r, stories: 0, samples: new Set() };
  g.stories += 1;
  g.samples.add(r.text);
  groups.set(key, g);
}
const lines = [...groups.values()].sort((a, b) => a.ratio - b.ratio);
for (const g of lines) {
  console.log(`${g.ratio.toFixed(2)} < ${g.need}  ${g.theme.padEnd(5)}  ${g.title}  ${g.fg} on ${g.bg}${g.hidden ? '  (aria-hidden)' : ''}  "${[...g.samples].slice(0, 3).join('", "')}"  [${g.path}]`);
}
const errors = results.filter((r) => r.error).length;
console.log(`\ncontrast-scan${NONTEXT ? ' (non-text, 1.4.11)' : ''}: ${stories.length} stories × ${THEMES.length} themes, ${lines.length} finding(s), ${errors} load error(s)`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ findings: lines.map((g) => ({ ...g, samples: [...g.samples] })), errors: results.filter((r) => r.error) }, null, 2) + '\n');
process.exitCode = lines.length ? 1 : 0;
