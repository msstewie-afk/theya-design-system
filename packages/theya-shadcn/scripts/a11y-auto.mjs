#!/usr/bin/env node
/**
 * Automated checks for WCAG criteria axe doesn't cover, run against a built
 * Storybook in a real browser. One pass per story:
 *
 * - 2.5.3 Label in Name: a control with visible text and an aria-label /
 *   aria-labelledby must have its label text inside its accessible name.
 *   The label text is the first visible text in it (a title before its
 *   description or time). Pickers that show their current value
 *   (role=combobox, aria-haspopup listbox / dialog / grid) are skipped:
 *   their visible text is the value, and the label sits outside.
 * - 2.4.7 Focus Visible: Tab through the story; every element that takes
 *   focus must look different focused (outline, box-shadow, border,
 *   background, color, text-decoration on itself, its ::before/::after, or
 *   one of its five nearest ancestors — a field or an editor draws the
 *   ring on its wrapper with :focus-within — or something next to it:
 *   InputOTP's one real input is invisible and the active slot shows the
 *   focus).
 * - 1.4.12 Text Spacing: with the criterion's spacing applied (line-height
 *   1.5, paragraph spacing 2em, letter 0.12em, word 0.16em), no text may be
 *   cut off by a box that clips (overflow hidden/clip) — deliberate
 *   one-line truncation (text-overflow: ellipsis) is listed separately.
 * - 1.4.4 Resize Text: the same clipping check with the root font size at
 *   200% (text-only zoom; full-page zoom is covered by the 360px reflow run).
 *
 * Writes a11y/auto.json (per component: stories checked and failures per
 * criterion). scripts/build-a11y.mjs reads it as evidence.
 *
 *   node scripts/a11y-auto.mjs --url http://localhost:6008 [--only <title-substring>] [--workers 4]
 *   (--only re-checks the matching stories and keeps the other components' results)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const URL_BASE = arg('url', 'http://localhost:6008').replace(/\/$/, '');
const ONLY = arg('only', '');
const WORKERS = Number(arg('workers', 4));
const OUT = path.join(ROOT, 'a11y/auto.json');

// The Playwright that @storybook/test-runner ships with (same as CI).
const { chromium } = require(require.resolve('playwright', { paths: [path.dirname(require.resolve('@storybook/test-runner'))] }));

const index = await (await fetch(`${URL_BASE}/index.json`)).json();
const stories = Object.values(index.entries).filter((e) => e.type === 'story' && (!ONLY || e.title.includes(ONLY)));

/** Component name per Storybook title, from spec/index.json. */
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'spec/index.json'), 'utf8'));
const componentOf = new Map();
for (const c of spec.components) {
  const s = JSON.parse(fs.readFileSync(path.join(ROOT, c.spec), 'utf8'));
  if (s.storybook?.title) componentOf.set(s.storybook.title, c.name);
}

const SPACING_CSS = `
  *, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-bottom: 2em !important; }
`;

/** In the page: elements whose text a clipping box cuts off. */
function clippedText() {
  const out = { clipped: [], truncated: [] };
  const describe = (el) => `${el.tagName.toLowerCase()}${el.getAttribute('data-slot') ? `[data-slot=${el.getAttribute('data-slot')}]` : ''} "${(el.textContent ?? '').trim().slice(0, 40)}"`;
  for (const el of document.querySelectorAll('#storybook-root *')) {
    if (!(el instanceof HTMLElement) || !el.offsetParent) continue;
    const cs = getComputedStyle(el);
    const clipsX = cs.overflowX === 'hidden' || cs.overflowX === 'clip';
    const clipsY = cs.overflowY === 'hidden' || cs.overflowY === 'clip';
    if (!clipsX && !clipsY) continue;
    // Only boxes that hold text directly.
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const overX = clipsX && el.scrollWidth > el.clientWidth + 1;
    const overY = clipsY && el.scrollHeight > el.clientHeight + 1;
    if (!overX && !overY) continue;
    // Visually hidden text (sr-only) is meant to be clipped.
    if (el.clientWidth <= 1 || el.clientHeight <= 1) continue;
    if (cs.textOverflow === 'ellipsis' || cs.webkitLineClamp !== 'none') out.truncated.push(describe(el));
    else out.clipped.push(describe(el));
  }
  return out;
}

const STYLE_PROPS = ['outlineStyle', 'outlineWidth', 'outlineColor', 'boxShadow', 'borderTopColor', 'borderBottomColor', 'backgroundColor', 'color', 'textDecorationLine'];

async function checkStory(page, story) {
  const result = { id: story.id, title: story.title, name: story.name, '2.5.3': [], '2.4.7': [], '1.4.12': [], '1.4.4': [], truncated: [] };
  const load = async () => {
    await page.goto(`${URL_BASE}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'load' });
    await page.waitForSelector('#storybook-root > *', { timeout: 10000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
  };
  await load();

  // 2.5.3
  result['2.5.3'] = await page.evaluate(() => {
    const out = [];
    const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const controls = document.querySelectorAll('#storybook-root :is(button, a[href], [role=button], [role=link], [role=tab], [role=menuitem], [role=checkbox], [role=radio], [role=switch], [role=option])');
    for (const el of controls) {
      if (el.getAttribute('role') === 'combobox' || ['listbox', 'dialog', 'grid'].includes(el.getAttribute('aria-haspopup') ?? '')) continue;
      const labelledby = el.getAttribute('aria-labelledby');
      const label = labelledby
        ? labelledby.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ')
        : el.getAttribute('aria-label');
      if (!label) continue;
      // Visible text only: skip text inside aria-hidden or sr-only bits.
      // First visible text node, in document order.
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let visible = '';
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const p = n.parentElement;
        if (!n.textContent.trim() || !p || p.closest('[aria-hidden=true]') || p.getBoundingClientRect().width <= 1 || getComputedStyle(p).visibility === 'hidden') continue;
        visible = n.textContent;
        break;
      }
      const v = norm(visible);
      // Two letters or fewer: avatar initials, a glyph — not a label.
      if (!v || v.replace(/ /g, '').length < 3) continue;
      if (!norm(label).includes(v)) out.push(`"${visible.trim().slice(0, 30)}" not in name "${label.slice(0, 50)}"`);
    }
    return out;
  });

  // 2.4.7 — Tab through, up to 40 stops. Transitions off, so a style read
  // is the end state, not the first frame; a short wait after focus and
  // blur lets components that track focus in React state (InputOTP's
  // active slot) re-render first.
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  // Styles of the focused element, its five nearest ancestors, and what sits
  // next to it (two levels up): InputOTP's real input is invisible and the
  // active slot beside it shows the focus.
  const look = () =>
    page.evaluate((props) => {
      const el = window.__theyaFocus;
      const pick = (cs) => props.map((p) => cs[p]).join('|');
      const nodes = [];
      for (let n = el; n && nodes.length < 6; n = n.parentElement) nodes.push(n);
      const around = el.parentElement?.parentElement ?? el.parentElement;
      if (around) nodes.push(...[...around.querySelectorAll('*')].slice(0, 60));
      return nodes.map((n) => [pick(getComputedStyle(n)), pick(getComputedStyle(n, '::before')), pick(getComputedStyle(n, '::after'))].join('#')).join('@');
    }, STYLE_PROPS);
  const seen = new Set();
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!(el instanceof HTMLElement) || el === document.body || !el.closest('#storybook-root, [data-radix-popper-content-wrapper], [role=dialog]')) return null;
      window.__theyaFocus = el;
      return { key: el.outerHTML.slice(0, 120), desc: `${el.tagName.toLowerCase()}${el.getAttribute('aria-label') ? ` "${el.getAttribute('aria-label')}"` : ` "${(el.textContent ?? '').trim().slice(0, 30)}"`}` };
    });
    if (!info || seen.has(info.key)) break;
    seen.add(info.key);
    await page.waitForTimeout(60);
    const focused = await look();
    await page.evaluate(() => window.__theyaFocus.blur());
    await page.waitForTimeout(60);
    const blurred = await look();
    // Back to visible focus so the next Tab continues from here.
    await page.evaluate(() => window.__theyaFocus.focus({ focusVisible: true }));
    if (focused === blurred) {
      // Once more after a longer moment: a story still settling (a portal
      // mounting, a late state update) can mask the first read.
      await page.waitForTimeout(200);
      if ((await look()) === blurred) result['2.4.7'].push(info.desc);
    }
  }

  // 1.4.12 and 1.4.4 — fresh load each, spacing / 200% text.
  for (const [crit, css] of [
    ['1.4.12', SPACING_CSS],
    ['1.4.4', 'html { font-size: 200% !important; }'],
  ]) {
    await load();
    const before = await page.evaluate(clippedText);
    await page.addStyleTag({ content: css });
    await page.waitForTimeout(150);
    const after = await page.evaluate(clippedText);
    // Only what the change caused: boxes that were fine before.
    result[crit] = after.clipped.filter((d) => !before.clipped.includes(d));
    result.truncated.push(...after.truncated.filter((d) => !before.truncated.includes(d)).map((d) => `${crit}: ${d}`));
  }
  return result;
}

const browser = await chromium.launch();
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    while (next < stories.length) {
      const story = stories[next++];
      try {
        results.push(await checkStory(page, story));
      } catch (e) {
        results.push({ id: story.id, title: story.title, name: story.name, error: String(e).slice(0, 200) });
      }
    }
    await page.close();
  }),
);
await browser.close();

const byComponent = {};
for (const r of results.sort((a, b) => a.id.localeCompare(b.id))) {
  const name = componentOf.get(r.title);
  if (!name) continue;
  const c = (byComponent[name] ??= { stories: 0, errors: 0, '2.5.3': [], '2.4.7': [], '1.4.12': [], '1.4.4': [], truncated: [] });
  c.stories += 1;
  if (r.error) {
    c.errors += 1;
    continue;
  }
  for (const k of ['2.5.3', '2.4.7', '1.4.12', '1.4.4', 'truncated']) for (const f of r[k]) c[k].push(`${r.name}: ${f}`);
}
// --only re-checks some components and keeps the rest of the last full run.
const previous = ONLY && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')).components : {};
const merged = Object.fromEntries(Object.entries({ ...previous, ...byComponent }).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(
  OUT,
  JSON.stringify({ $comment: 'Generated by scripts/a11y-auto.mjs against a built Storybook. Do not edit.', date: new Date().toISOString().slice(0, 10), components: merged }, null, 2) + '\n',
);
const fails = (k) => Object.values(byComponent).filter((c) => c[k].length).length;
console.log(`a11y-auto: ${results.length} stories, ${Object.keys(byComponent).length} components → a11y/auto.json`);
for (const k of ['2.5.3', '2.4.7', '1.4.12', '1.4.4']) console.log(`  ${k}: ${fails(k)} component(s) with failures`);
console.log(`  errors: ${results.filter((r) => r.error).length} stories`);
