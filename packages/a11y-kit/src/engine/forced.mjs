#!/usr/bin/env node
/**
 * a11y-kit engine check (packages/a11y-kit/src/engine). Run from the design
 * system's package, where a11y-kit.config.mjs is: `a11y-kit forced …` or the
 * design system's own wrapper script.
 *
 * Forced colors (Windows High Contrast and other forced palettes), run
 * against a built Storybook in Chromium with `forced-colors: active`
 * emulated. In forced colors the browser replaces every color with a few
 * system colors and drops box-shadows and background images, so anything
 * drawn only with a fill or a shadow disappears. src/styles/forced-colors.css
 * and the components' `forced-colors:` classes put edges back; this script
 * checks the result on screen, from screenshots, per story:
 *
 * - invisible-control: a control (button, field, checkbox, radio, switch,
 *   slider, tab, option, combobox) whose box is one flat color: no edge, no
 *   text, no mark — nothing shows where it is (WCAG 1.4.11 in this mode);
 * - focus-invisible: Tab through the story; a stop that looks the same
 *   focused and blurred (2.4.7 in this mode);
 * - icon-lost: a CSS mask icon (mask-image painted with background-color)
 *   that comes out one flat color: the forced Canvas background erased it;
 * - checked-same: a checked checkbox, radio or switch that looks exactly
 *   like an unchecked one of the same role in the story (the state is lost).
 *
 * Not a WCAG criterion of its own: findings go to a11y/forced.json and the
 * matrix shows them per component next to its forced-colors CSS. A story can
 * opt out of a rule with a reason: parameters.a11y.forced = { skip: [...], reason }.
 *
 *   node scripts/a11y-forced.mjs --url http://localhost:6008 [--only <title-substring>] [--workers 4]
 *   node scripts/a11y-forced.mjs --url … --ci [--shard 2/4]   (writes nothing, fails on any finding or a story that didn't load)
 *   node scripts/a11y-forced.mjs --url … --fixtures   (calibration: parameters.a11y.expect.forced; none means it must stay clean)
 *   --group title   (another design system's Storybook: group by title)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { context } from './context.mjs';

// The design system it runs in: its package, its Playwright and axe-core, where results go, title → component.
const { root: ROOT, require, outDir: OUT_DIR, componentTitles } = await context();
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const URL_BASE = arg('url', 'http://localhost:6008').replace(/\/$/, '');
const ONLY = arg('only', '');
const WORKERS = Number(arg('workers', 4));
const CI = process.argv.includes('--ci');
const FIXTURES = process.argv.includes('--fixtures');
const GROUP_BY_TITLE = arg('group', '') === 'title';
const OUT = path.join(OUT_DIR, 'forced.json');
const RULES = ['invisible-control', 'focus-invisible', 'icon-lost', 'checked-same'];

// The Playwright that @storybook/test-runner ships with (same as CI), and the
// PNG decoder that comes with it (jest-image-snapshot).
const RUNNER = path.dirname(require.resolve('@storybook/test-runner'));
const { chromium } = require(require.resolve('playwright', { paths: [RUNNER] }));
const { PNG } = require(require.resolve('pngjs', { paths: [RUNNER] }));

const index = await (await fetch(`${URL_BASE}/index.json`)).json();
const SHARD = arg('shard', '');
if (SHARD && !CI) throw new Error('--shard only works with --ci (a partial run would overwrite the report)');
const [SHARD_I, SHARD_N] = SHARD ? SHARD.split('/').map(Number) : [1, 1];
const shardTitles = new Set(
  [...new Set(Object.values(index.entries).filter((e) => e.type === 'story').map((e) => e.title))]
    .sort()
    .filter((_, k) => k % SHARD_N === SHARD_I - 1),
);
const isFixture = (e) => (e.tags ?? []).includes('a11y-fixture');
const stories = Object.values(index.entries).filter(
  (e) => e.type === 'story' && shardTitles.has(e.title) && (!ONLY || e.title.includes(ONLY)) && isFixture(e) === FIXTURES,
);

// Title → component from the design system's adapter (a11y-kit.config.mjs componentTitles).
const componentOf = GROUP_BY_TITLE ? null : componentTitles;
const groupOf = (story) => (FIXTURES ? story.name : GROUP_BY_TITLE || !componentOf ? story.title.split('/').pop() : componentOf.get(story.title));

/** One flat color (every pixel within a small tolerance of the first). */
function flat(buffer) {
  const png = PNG.sync.read(buffer);
  const d = png.data;
  for (let i = 4; i < d.length; i += 4) {
    if (Math.abs(d[i] - d[0]) > 8 || Math.abs(d[i + 1] - d[1]) > 8 || Math.abs(d[i + 2] - d[2]) > 8) return false;
  }
  return true;
}

/** In the page: elements to check, tagged data-theya-fc="<n>". */
function collect() {
  const CONTROL =
    'button, input:not([type=hidden]), select, textarea, [role=button], [role=checkbox], [role=radio], [role=switch], [role=slider], [role=tab], [role=option], [role=combobox], [role=textbox], [role=spinbutton], [role=menuitem]';
  const desc = (el) => `${el.getAttribute('role') || (el.tagName === 'INPUT' ? `input[${el.type}]` : el.tagName.toLowerCase())} "${(el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.textContent || el.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 30)}"`;
  const usable = (el) => {
    if (el.closest('[aria-hidden=true], [inert]')) return false;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    const r = el.getBoundingClientRect();
    // Visually hidden (sr-only) and native inputs styled away under a label.
    if (r.width < 6 || r.height < 6 || r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth) return false;
    // Covered by something else (a sticky bar: 2.4.11's business, not a lost edge).
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && (hit === el || el.contains(hit) || hit.contains(el));
  };
  const scope = [...document.querySelectorAll('#storybook-root, [data-radix-popper-content-wrapper], [role=dialog]')];
  const inScope = (el) => scope.some((s) => s.contains(el));
  const out = { controls: [], icons: [], checked: [] };
  let n = 0;
  // One number per element, kept when a later list tags it again.
  const tag = (el) => {
    if (el.hasAttribute('data-theya-fc')) return Number(el.getAttribute('data-theya-fc'));
    el.setAttribute('data-theya-fc', String(n));
    return n++;
  };
  const FIELD = 'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]), textarea, [role=textbox], [role=combobox], [role=spinbutton]';
  const edged = (n) => {
    const cs = getComputedStyle(n);
    return (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) || (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0);
  };
  for (const el of document.querySelectorAll(CONTROL)) {
    if (!inScope(el) || !usable(el)) continue;
    // Faded on purpose by a mask around it (a wheel picker's far options): not an edge problem.
    let masked = false;
    for (let n = el.parentElement; n && !masked; n = n.parentElement) masked = getComputedStyle(n).maskImage !== 'none';
    if (masked) continue;
    if (out.controls.length >= 60) break;
    // A borderless field inside a bordered box (TagInput, FilterField): the box is its edge.
    let target = el;
    if (el.matches(FIELD) && !edged(el)) for (let n = el.parentElement, i = 0; n && i < 3; n = n.parentElement, i++) if (edged(n)) { target = n; break; }
    out.controls.push({ key: tag(target), desc: desc(el) });
  }
  for (const el of document.querySelectorAll('#storybook-root *')) {
    if (out.icons.length >= 30) break;
    const cs = getComputedStyle(el);
    if ((cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none')) {
      if (usable(el)) out.icons.push({ key: tag(el), desc: `${el.tagName.toLowerCase()}${el.getAttribute('data-slot') ? `[data-slot=${el.getAttribute('data-slot')}]` : ''}` });
    }
  }
  // Checked and unchecked of the same role: one pair per role.
  const isOn = (el) => el.getAttribute('aria-checked') === 'true' || el.checked === true || el.getAttribute('data-state') === 'checked';
  const isOff = (el) => el.getAttribute('aria-checked') === 'false' || el.checked === false || el.getAttribute('data-state') === 'unchecked';
  for (const role of ['checkbox', 'radio', 'switch']) {
    const all = [...document.querySelectorAll(`[role=${role}], input[type=${role === 'switch' ? 'x-none' : role}]`)].filter((el) => inScope(el) && usable(el));
    const on = all.find(isOn);
    // An unchecked one after the checked one: in a rating every star up to the
    // value is drawn filled, so the state shows on the ones after it.
    const same = (el) => isOff(el) && el.getBoundingClientRect().width === on?.getBoundingClientRect().width;
    const off = all.slice(all.indexOf(on) + 1).find(same) ?? all.find(same);
    if (on && off) out.checked.push({ on: tag(on), off: tag(off), desc: desc(on) });
  }
  return out;
}

async function checkStory(page, story) {
  const findings = [];
  const add = (rule, msg) => findings.push({ rule, msg: `${rule}: ${msg}` });
  await page.goto(`${URL_BASE}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'load' });
  await page.waitForSelector('#storybook-root > *', { timeout: 10000 }).catch(() => {});
  await page
    .waitForFunction(() => ['finished', 'played', 'completed', 'errored', 'aborted'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase), null, { timeout: 15000 })
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }' });
  await page.waitForTimeout(300);
  if (!(await page.evaluate(() => matchMedia('(forced-colors: active)').matches))) throw new Error('forced-colors emulation is not active');
  const params = await page.evaluate(() => window.__STORYBOOK_PREVIEW__?.currentRender?.story?.parameters?.a11y ?? {});
  const skip = params.forced?.skip ?? [];

  const shot = (key) => page.locator(`[data-theya-fc="${key}"]`).screenshot({ timeout: 3000, animations: 'disabled' }).catch(() => null);
  const found = await page.evaluate(collect);
  const flatControls = [];
  for (const c of found.controls) {
    const b = await shot(c.key);
    if (b && flat(b)) flatControls.push(c);
  }
  // Only what forced colors erased: a control that is flat in normal colors
  // too (an option turned edge-on in a wheel) is not this check's business.
  if (flatControls.length) {
    await page.emulateMedia({ forcedColors: 'none' });
    await page.waitForTimeout(150);
    const erased = [];
    for (const c of flatControls) {
      const b = await shot(c.key);
      if (b && !flat(b)) erased.push(c);
    }
    await page.emulateMedia({ forcedColors: 'active' });
    await page.waitForTimeout(150);
    for (const c of erased) add('invisible-control', `${c.desc} is one flat color in forced colors: no edge, text or mark shows it`);
  }
  for (const i of found.icons) {
    const b = await shot(i.key);
    if (b && flat(b)) add('icon-lost', `mask icon ${i.desc} disappears in forced colors (painted with background-color)`);
  }
  const sameChecked = [];
  for (const c of found.checked) {
    const [on, off] = [await shot(c.on), await shot(c.off)];
    if (on && off && on.equals(off)) sameChecked.push(c);
  }
  // Only what forced colors erased: a pair that looks the same in normal
  // colors too (a hover preview left by a play test) is not this check's business.
  if (sameChecked.length) {
    await page.emulateMedia({ forcedColors: 'none' });
    await page.waitForTimeout(150);
    const erased = [];
    for (const c of sameChecked) {
      const [on, off] = [await shot(c.on), await shot(c.off)];
      if (on && off && !on.equals(off)) erased.push(c);
    }
    await page.emulateMedia({ forcedColors: 'active' });
    await page.waitForTimeout(150);
    for (const c of erased) add('checked-same', `${c.desc}: checked looks the same as unchecked in forced colors`);
  }

  // Focus: Tab through, compare the focused element's area focused and blurred.
  await page.evaluate(() => {
    const s = document.createElement('span');
    s.tabIndex = -1;
    document.body.prepend(s);
    s.focus();
  });
  const seen = new Set();
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!(el instanceof HTMLElement) || el === document.body || !el.closest('#storybook-root, [data-radix-popper-content-wrapper], [role=dialog]')) return null;
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      // Too small, off screen or covered: there is nothing of it to see either way.
      const onScreen = r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth && !!hit && (hit === el || el.contains(hit) || hit.contains(el));
      // An iframe passes focus into its own document: what shows is the page inside it.
      if (r.width < 3 || r.height < 3 || !onScreen || el.tagName === 'IFRAME') return { key: el.outerHTML.slice(0, 120), small: true };
      window.__theyaFc = el;
      const desc = `${el.getAttribute('role') || el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30)}"`;
      return { key: el.outerHTML.slice(0, 120), desc, clip: { x: Math.max(0, r.left - 6), y: Math.max(0, r.top - 6), width: r.width + 12, height: r.height + 12 } };
    });
    if (!info || seen.has(info.key)) break;
    seen.add(info.key);
    if (info.small) continue;
    await page.waitForTimeout(60);
    // Focus already taken back by a keyboard trap elsewhere: nothing to compare.
    if (!(await page.evaluate(() => document.activeElement === window.__theyaFc))) continue;
    const focused = await page.screenshot({ clip: info.clip, animations: 'disabled' });
    await page.evaluate(() => window.__theyaFc.blur());
    await page.waitForTimeout(60);
    const blurred = await page.screenshot({ clip: info.clip, animations: 'disabled' });
    // An element that takes focus back on blur (a keyboard trap, a11y-auto's 2.1.2) can't be compared.
    const regained = await page.evaluate(() => document.activeElement === window.__theyaFc);
    await page.evaluate(() => window.__theyaFc.focus({ focusVisible: true }));
    if (!regained && focused.equals(blurred)) add('focus-invisible', `${info.desc} looks the same focused and blurred in forced colors`);
  }

  const dedupe = new Map();
  for (const f of findings) if (!skip.includes(f.rule)) dedupe.set(f.msg, f);
  return { findings: [...dedupe.values()].map((f) => f.msg), expect: params.expect?.forced };
}

const results = new Map();
const browser = await chromium.launch();
const queue = [...stories];
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    const open = async () => {
      const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await p.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
      return p;
    };
    let page = await open();
    for (let story = queue.shift(); story; story = queue.shift()) {
      const name = groupOf(story);
      if (!name) continue;
      const row = results.get(name) ?? { stories: 0, errors: 0, findings: [] };
      results.set(name, row);
      row.stories++;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await checkStory(page, story);
          row.findings.push(...r.findings.map((f) => (FIXTURES ? f : `${story.name}: ${f}`)));
          if (FIXTURES) row.expect = r.expect;
          break;
        } catch (error) {
          await page.close().catch(() => {});
          page = await open();
          if (attempt === 1) {
            row.errors++;
            console.error(`${story.id}: ${String(error).split('\n')[0]}`);
          }
        }
      }
    }
    await page.close();
  }),
);
await browser.close();

if (FIXTURES) {
  let bad = 0;
  for (const [name, r] of [...results].sort(([a], [b]) => a.localeCompare(b))) {
    const problems = r.errors ? ["story didn't load"] : [];
    // Fixtures written for the other scripts say nothing about forced colors: they must stay clean.
    const expect = r.expect ?? [];
    if (!r.errors) {
      for (const w of expect) if (!r.findings.some((g) => g.includes(w))) problems.push(`missed: ${w}`);
      for (const g of r.findings) if (!expect.some((w) => g.includes(w))) problems.push(`unexpected: ${g}`);
    }
    if (problems.length) bad++;
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${name}${problems.map((p) => `\n       ${p}`).join('')}`);
  }
  console.log(`a11y forced fixtures: ${results.size - bad}/${results.size} as expected`);
  process.exit(bad || !results.size ? 1 : 0);
}

if (!CI) {
  const prev = ONLY && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')).components : {};
  const components = { ...prev };
  for (const [name, row] of results) components[name] = row;
  const sorted = Object.fromEntries(Object.entries(components).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(OUT, JSON.stringify({ $comment: 'Generated by scripts/a11y-forced.mjs (forced-colors: active). Do not edit.', rules: RULES, date: new Date().toISOString().slice(0, 10), components: sorted }, null, 2) + '\n');
}
const failing = [...results].filter(([, r]) => r.findings.length);
const errors = [...results].reduce((n, [, r]) => n + r.errors, 0);
console.log(`a11y forced colors: ${stories.length} stories, ${results.size} components, ${failing.length} with findings, ${errors} load errors${CI ? '' : ' → a11y/forced.json'}`);
for (const [name, r] of failing) for (const f of r.findings) console.log(`  ${name} — ${f}`);
if (CI) {
  const lines = failing.flatMap(([name, r]) => r.findings.map((f) => `- **${name}** — ${f}`));
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Forced colors\n\n${stories.length} stories, ${failing.length} component(s) with findings, ${errors} story load error(s).\n\n${lines.join('\n')}\n`);
  }
  for (const l of lines) console.log(`::error title=a11y-forced::${l.replace(/[\r\n]+/g, ' ')}`);
  if (failing.length || errors) process.exitCode = 1;
}
