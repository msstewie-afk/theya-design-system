#!/usr/bin/env node
/**
 * a11y-kit engine check (packages/a11y-kit/src/engine). Run from the design
 * system's package, where a11y-kit.config.mjs is: `a11y-kit auto …` or the
 * design system's own wrapper script.
 *
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
 * - 2.4.11 Focus Not Obscured (Minimum): in the same Tab pass, the element
 *   with focus must not be entirely hidden by something sticky or fixed (a
 *   sticky action bar, a header, a banner, a toast). Five points of its box
 *   are hit-tested; it fails only when every point lands on the same kind of
 *   cover: a sticky or fixed box that doesn't contain it.
 * - 1.4.12 Text Spacing: with the criterion's spacing applied (line-height
 *   1.5, paragraph spacing 2em, letter 0.12em, word 0.16em), no text may be
 *   cut off by a box that clips (overflow hidden/clip) — deliberate
 *   one-line truncation (text-overflow: ellipsis) is listed separately.
 * - 1.4.4 Resize Text: the same clipping check with the root font size at
 *   200% (text-only zoom; full-page zoom is covered by the 360px reflow run).
 * - 1.4.10 Reflow: a fresh load at a 320 CSS px viewport (the criterion's
 *   own width) must not scroll horizontally. Content that legitimately
 *   needs two dimensions is exempt when the overflow sits inside
 *   table / [role=grid] / [role=treegrid] / pre / [data-reflow-exempt].
 * - 3.2.1 On Focus: in the Tab pass, receiving focus alone must not change
 *   context — the URL must not change and no modal dialog may open or take
 *   focus. A non-modal popup that leaves focus on the field (search results)
 *   or one the focused control owns (aria-expanded="true") is new content. Only
 *   these two, deliberately: focus moving into a roving group or a popup
 *   opening with aria-expanded is normal behaviour, not a context change.
 * - Keyboard, Tab only (no story-specific keys):
 *   2.1.1 — every visible tab stop is reached by Tab, and nothing that looks
 *   clickable (cursor: pointer) is left without a keyboard way in (not
 *   focusable, no focusable inside or around it);
 *   2.1.2 — Tab never cycles inside part of the page without a way out
 *   (a modal is allowed when Escape releases it);
 *   2.4.3 — no positive tabindex and no CSS reordering (flex/grid order,
 *   row-reverse / column-reverse) around tab stops, which make the Tab
 *   order differ from what's on screen.
 *   A visually hidden control (an sr-only "Dismiss" button, 1px) is not
 *   "pointer only": nobody can point at it.
 * - Advisory (not a WCAG result, never fails a run): the axe-core rules that
 *   are experimental and so off unless switched on by name — p-as-heading,
 *   td-has-header, table-fake-caption (1.3.1), label-content-name-mismatch
 *   (2.5.3, cross-checks our own), css-orientation-lock (1.3.4). They may
 *   misfire, so their findings are listed for a person to judge (CI
 *   warnings, `advisory` in a11y/auto.json) and the matrix ignores them.
 *   The deprecated rules (audio-caption, aria-roledescription) aren't run.
 * - The keyboard model of popups, tabs and radio groups (APG) is
 *   scripts/a11y-states.mjs.
 *
 * Writes a11y/auto.json (per component: stories checked and failures per
 * criterion). scripts/build-a11y.mjs reads it as evidence.
 *
 *   node scripts/a11y-auto.mjs --url http://localhost:6008 [--only <title-substring>] [--workers 4]
 *   [--ci --shard 2/4]  (CI: check every 4th component, starting with the 2nd)
 *   (--only re-checks the matching stories and keeps the other components' results)
 *   node scripts/a11y-auto.mjs --url … --ci   (CI: writes nothing, fails on any failure or a story that didn't load)
 *   node scripts/a11y-auto.mjs --url … --fixtures   (calibration: only the stories tagged a11y-fixture;
 *     fails unless each reports exactly what its parameters.a11y.expect.auto lists)
 *   --group title   (another design system's Storybook: group stories by the
 *     last segment of their title instead of Theya's spec/index.json)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { context } from './context.mjs';

// The design system it runs in: its package, its Playwright and axe-core, where results go, title → component.
const { root: ROOT, require, outDir: OUT_DIR, componentTitles, config: KIT_CONFIG } = await context();
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const URL_BASE = arg('url', 'http://localhost:6008').replace(/\/$/, '');
const ONLY = arg('only', '');
// --theme dark / --brand <b>: the same checks with the design system's theme globals
// (Storybook URL globals, e.g. globals=theme:dark;brand:iris). Results go to
// auto-<brand>-<theme>.json, so the default run's auto.json stays the record.
const THEME = arg('theme', '');
const BRAND = arg('brand', '');
const GLOBALS = [THEME && `theme:${THEME}`, BRAND && `brand:${BRAND}`].filter(Boolean).join(';');
const VARIANT = [BRAND, THEME].filter(Boolean).join('-');
const WORKERS = Number(arg('workers', 4));
const CI = process.argv.includes('--ci');
const FIXTURES = process.argv.includes('--fixtures');
const GROUP_BY_TITLE = arg('group', '') === 'title';
const OUT = path.join(OUT_DIR, VARIANT ? `auto-${VARIANT}.json` : 'auto.json');
// The axe-core test-runner.ts runs (axe-playwright's copy), for the advisory rules.
const AXE_SOURCE = require.resolve('axe-core/axe.min.js', { paths: [path.dirname(require.resolve('axe-playwright'))] });
const ADVISORY_RULES = ['p-as-heading', 'td-has-header', 'table-fake-caption', 'label-content-name-mismatch', 'css-orientation-lock'];

// The Playwright that @storybook/test-runner ships with (same as CI).
const { chromium } = require(require.resolve('playwright', { paths: [path.dirname(require.resolve('@storybook/test-runner'))] }));

const index = await (await fetch(`${URL_BASE}/index.json`)).json();
// --shard i/n (CI only): this machine checks every n-th component, so CI can
// split the run across parallel jobs. Whole components go to one shard, so
// per-component rules see all of their stories. Locally a partial run would
// overwrite the full report, so it is refused without --ci.
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
// Fixtures are judged one story at a time; another Storybook by its titles.
const groupOf = (r) => (FIXTURES ? r.name : GROUP_BY_TITLE || !componentOf ? r.title.split('/').pop() : componentOf.get(r.title));

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

/** In the page: a cue other than colour that sets the link apart from `parentSel`'s text (underline, border, weight, background). */
function hasNonColorCue(el, parentSel) {
  const parent = (parentSel && document.querySelector(parentSel)) || el.parentElement;
  const cs = getComputedStyle(el);
  const ps = getComputedStyle(parent);
  const decorated = (s) => /underline|line-through|overline/.test(s.textDecorationLine);
  if (decorated(cs) && !decorated(ps)) return true;
  for (const n of [el, ...el.querySelectorAll('*')]) {
    const s = getComputedStyle(n);
    if (n !== el && decorated(s)) return true;
    if (parseFloat(s.borderBottomWidth) >= 1 && s.borderBottomStyle !== 'none' && !/rgba\(.*,\s*0\)|transparent/.test(s.borderBottomColor)) return true;
  }
  if (Math.abs(Number(cs.fontWeight) - Number(ps.fontWeight)) >= 200) return true; // 400 → 600 semibold reads as a different weight
  if (cs.fontStyle !== ps.fontStyle) return true;
  if (!/rgba\(.*,\s*0\)|transparent/.test(cs.backgroundColor) && cs.backgroundColor !== ps.backgroundColor) return true;
  // An icon inside the link (an external-link arrow) is a cue too.
  if (el.querySelector('svg, img')) return true;
  return false;
}

/** In the page: links in a run of text that only their colour sets apart (F73), and those at 3:1 that need a hover cue (G183). */
function linksByColorOnly() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const rgb = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
  };
  const lum = (c) => {
    const [r, g, b] = rgb(c).map((v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  const out = { fails: [], hoverCheck: [] };
  let i = 0;
  for (const el of document.querySelectorAll('#storybook-root a[href]')) {
    if (el.getAttribute('role') || !el.checkVisibility?.({ opacityProperty: true, visibilityProperty: true })) continue;
    const text = (el.textContent ?? '').trim();
    if (!text) continue;
    // In a run of text: words on the link's own line, in the same block — text nodes
    // and inline elements around it (a sentence with a link in it). A link whose
    // neighbours are separate blocks (a file name over its size, a label over a
    // value, a card title) is not in a run of text: F73 is about links in prose.
    let parent = el.parentElement;
    let around = '';
    const inline = (n) => n.nodeType === 3 || (n.nodeType === 1 && /^inline/.test(getComputedStyle(n).display) && !n.matches('a, button, [role], style, script, template, noscript, svg, img') && n.checkVisibility?.() !== false);
    for (let d = 0, child = el; parent && d < 3; d++, child = parent, parent = parent.parentElement) {
      if (parent.closest('nav, [role=navigation], [role=menu], [role=menubar], [role=tablist], [data-slot=breadcrumb], [data-slot=pagination]')) { parent = null; break; }
      around = [...parent.childNodes].filter((n) => n !== child && inline(n)).map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
      if (around.replace(/[^\p{L}\p{N}]/gu, '').length >= 3) break;
      around = '';
      // Climb only through inline wrappers (a <strong>, a <span> in the sentence).
      if (!/^inline/.test(getComputedStyle(parent).display)) { parent = null; break; }
    }
    if (!parent || !around) continue;
    // Only inline links: a link laid out as its own line or block is a different pattern.
    if (!/inline/.test(getComputedStyle(el).display)) continue;
    const tag = String(i++);
    el.setAttribute('data-theya-link', tag);
    parent.setAttribute('data-theya-link-parent', tag);
    const parentSel = `[data-theya-link-parent="${tag}"]`;
    // hasNonColorCue is passed in by name below (functions don't cross evaluate).
    if (window.__theyaHasCue(el, parentSel)) continue;
    const r = ratio(getComputedStyle(el).color, getComputedStyle(parent).color);
    const desc = `link "${text.slice(0, 30)}" in "${around.slice(0, 30)}…"`;
    if (r < 3) out.fails.push(`${desc}: told apart from the text around it by colour only (${r.toFixed(2)}:1, needs an underline or 3:1 with a hover cue)`);
    else out.hoverCheck.push({ i: tag, parent: parentSel, desc, ratio: r.toFixed(2) });
  }
  return out;
}

/** In the page: fields with nothing on screen that says what goes in them (3.3.2). */
function fieldsWithoutVisibleLabel() {
  const norm = (s) => (s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const shown = (n) => {
    if (!(n instanceof Element)) return false;
    const r = n.getBoundingClientRect();
    const cs = getComputedStyle(n);
    // sr-only: 1px and clipped.
    return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && !/rect\(0/.test(cs.clip) && n.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) !== false;
  };
  const visibleText = (n) => {
    if (!n) return '';
    const walker = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    let t = '';
    for (let x = walker.nextNode(); x; x = walker.nextNode()) if (x.parentElement && shown(x.parentElement) && !x.parentElement.closest('[aria-hidden=true]')) t += ` ${x.textContent}`;
    return norm(t);
  };
  const FIELDS = 'input:not([type=hidden], [type=submit], [type=button], [type=reset], [type=image]), textarea, select, [role=combobox], [role=textbox], [role=spinbutton], [role=searchbox], [contenteditable=true], [contenteditable=""]';
  const out = [];
  for (const el of document.querySelectorAll(`#storybook-root :is(${FIELDS})`)) {
    if (el.matches(':disabled') || el.closest('[aria-hidden=true], [inert]')) continue;
    // Invisible real inputs behind a custom control (InputOTP, a styled checkbox) are labelled through what is drawn.
    const target = shown(el) ? el : (el.closest('label, [data-slot], [role=group]') ?? el.parentElement);
    if (!shown(target)) continue;
    // A combobox button showing its value (a select) is labelled by what sits around it, read below.
    const ownText = el.matches('input, textarea, select, [contenteditable]') ? '' : visibleText(el);
    const names = [];
    for (const l of el.labels ?? []) names.push(visibleText(l));
    names.push(visibleText(el.closest('label')));
    for (const id of (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean)) names.push(visibleText(document.getElementById(id)));
    for (const id of (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)) names.push(visibleText(document.getElementById(id)));
    if (names.some((n) => n.replace(/ /g, '').length >= 2 && n !== ownText)) continue;
    // aria-label or title that also appears on screen nearby (a heading, a column header, a button next to it: G167).
    const label = norm(el.getAttribute('aria-label') ?? el.getAttribute('title') ?? '');
    let nearby = '';
    for (let n = el.parentElement, d = 0; n && d < 4 && n.id !== 'storybook-root'; n = n.parentElement, d++) nearby = visibleText(n);
    const nearbyWords = new Set(nearby.split(' '));
    if (label && label.split(' ').filter((w) => w.length > 2).some((w) => nearbyWords.has(w))) continue;
    // A field inside a fieldset or group whose legend / label is on screen (a date's day/month/year, an OTP's slots).
    const group = el.closest('fieldset, [role=group], [role=radiogroup]');
    if (group) {
      const legend = group.querySelector(':scope > legend');
      const gl = [visibleText(legend), ...(group.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean).map((id) => visibleText(document.getElementById(id)))];
      if (gl.some((t) => t.replace(/ /g, '').length >= 2)) continue;
    }
    const what = `${el.tagName.toLowerCase()}${el.getAttribute('type') ? `[type=${el.getAttribute('type')}]` : ''}${el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : ''}`;
    const placeholder = el.getAttribute('placeholder');
    out.push(
      placeholder
        ? `${what} placeholder "${placeholder.slice(0, 30)}": the only label is the placeholder, which disappears on input`
        : label
          ? `${what} "${label.slice(0, 30)}": named only by aria-label / title, nothing on screen says what goes in it`
          : `${what}: no label or instructions on screen`,
    );
  }
  return [...new Set(out)];
}

const STYLE_PROPS = ['outlineStyle', 'outlineWidth', 'outlineColor', 'boxShadow', 'borderTopColor', 'borderBottomColor', 'backgroundColor', 'color', 'textDecorationLine'];

async function checkStory(page, story) {
  // Start Tab from the top of the page. blur() alone isn't enough: the
  // browser keeps the last focused element as the starting point, so after
  // a play function the first Tab would skip everything before it.
  const fromTop = () =>
    page.evaluate(() => {
      let s = document.getElementById('theya-tab-start');
      if (!s) {
        s = document.createElement('span');
        s.id = 'theya-tab-start';
        s.tabIndex = -1;
        document.body.prepend(s);
      }
      s.focus();
    });
  const result = { id: story.id, title: story.title, name: story.name, '2.5.3': [], '2.4.7': [], '2.4.11': [], '1.4.12': [], '1.4.4': [], '1.4.10': [], '2.1.1': [], '2.1.2': [], '2.4.3': [], '3.2.1': [], '1.4.1': [], '3.3.2': [], truncated: [], advisory: [] };
  const load = async () => {
    await page.goto(`${URL_BASE}/iframe.html?id=${story.id}&viewMode=story${GLOBALS ? `&globals=${GLOBALS}` : ''}`, { waitUntil: 'load' });
    await page.waitForSelector('#storybook-root > *', { timeout: 10000 }).catch(() => {});
    // The preview runs the story's play function on load; check the state it
    // leaves, not one it is still changing (a dialog opening mid-Tab).
    await page
      .waitForFunction(() => ['finished', 'played', 'completed', 'errored', 'aborted'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase), null, { timeout: 15000 })
      .catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
  };
  await load();

  // Advisory: experimental axe rules, switched on by name. The a11y addon's
  // own axe may still be running after the play function: retry briefly.
  await page.addScriptTag({ path: AXE_SOURCE });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      result.advisory = await page.evaluate(async (rules) => {
        const r = await window.axe.run('#storybook-root', {
          runOnly: { type: 'rule', values: rules },
          rules: Object.fromEntries(rules.map((id) => [id, { enabled: true }])),
          resultTypes: ['violations'],
        });
        return r.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}${n.any[0]?.message ? ` (${n.any[0].message.slice(0, 80)})` : ''}`));
      }, ADVISORY_RULES);
      break;
    } catch (e) {
      if (!/already running/i.test(String(e)) || attempt === 2) throw e;
      await page.waitForTimeout(500);
    }
  }

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

  // 1.4.1 — links inside a run of text.
  await page.evaluate(`window.__theyaHasCue = ${hasNonColorCue.toString()}`);
  const links = await page.evaluate(linksByColorOnly);
  for (const l of links.fails) result['1.4.1'].push(l);
  for (const l of links.hoverCheck) {
    // 3:1 against the text around it is enough only with a cue on hover
    // (G183); focus is the 2.4.7 pass.
    const el = page.locator(`[data-theya-link="${l.i}"]`);
    const cue = await el.hover({ timeout: 2000 }).then(() => el.evaluate(hasNonColorCue, l.parent)).catch(() => null);
    if (cue === false) result['1.4.1'].push(`${l.desc}: told apart from the text around it by colour only (${l.ratio}:1) and nothing changes on hover`);
  }
  await page.mouse.move(0, 0);

  // 3.3.2 — every field shows a label or instructions on screen.
  result['3.3.2'] = await page.evaluate(fieldsWithoutVisibleLabel);

  // 2.4.7 — Tab through, up to 40 stops. Transitions off, so a style read
  // is the end state, not the first frame; a short wait after focus and
  // blur lets components that track focus in React state (InputOTP's
  // active slot) re-render first.
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
  await fromTop();
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
  // 2.4.11: the focused element is entirely under a sticky or fixed box.
  const hidden = () =>
    page.evaluate(() => {
      const el = window.__theyaFocus;
      const r = el.getBoundingClientRect();
      // Visually hidden (sr-only) controls have nothing to hide.
      if (r.width < 3 || r.height < 3) return null;
      const points = [[0.5, 0.5], [0.15, 0.2], [0.85, 0.2], [0.15, 0.8], [0.85, 0.8]]
        .map(([x, y]) => [r.left + r.width * x, r.top + r.height * y])
        .filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight);
      if (!points.length) return null;
      let cover = null;
      for (const [x, y] of points) {
        const hit = document.elementFromPoint(x, y);
        // Any point that shows the element (or its label around it) is enough.
        if (!hit || hit === el || el.contains(hit) || hit.contains(el)) return null;
        let c = hit;
        while (c && !['fixed', 'sticky'].includes(getComputedStyle(c).position)) c = c.parentElement;
        if (!c || c.contains(el)) return null;
        cover = c;
      }
      const what = (n) => `${n.tagName.toLowerCase()}${n.getAttribute('data-slot') ? `[data-slot=${n.getAttribute('data-slot')}]` : ''}${n.getAttribute('role') ? `[role=${n.getAttribute('role')}]` : ''}`;
      return `hidden under a ${getComputedStyle(cover).position} ${what(cover)}`;
    });
  const focusPass = async () => {
    const missing = [];
    const obscured = [];
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
      // Focus already taken back by a trap elsewhere (2.1.2 below): nothing to compare.
      if (!(await page.evaluate(() => document.activeElement === window.__theyaFocus))) continue;
      // Read twice, 250ms apart: a scroll still settling can cover it for a moment.
      if (await hidden()) {
        await page.waitForTimeout(250);
        const still = await hidden();
        if (still) obscured.push(`${info.desc}: ${still}`);
      }
      const focused = await look();
      await page.evaluate(() => window.__theyaFocus.blur());
      await page.waitForTimeout(60);
      // An element that takes focus back on blur (a trap: 2.1.2 below) can't be compared.
      if (await page.evaluate(() => document.activeElement === window.__theyaFocus)) continue;
      const blurred = await look();
      // Back to visible focus so the next Tab continues from here.
      await page.evaluate(() => window.__theyaFocus.focus({ focusVisible: true }));
      if (focused === blurred) {
        // Once more after a longer moment: a story still settling (a portal
        // mounting, a late state update) can mask the first read.
        await page.waitForTimeout(200);
        if ((await look()) === blurred) missing.push(info.desc);
      }
    }
    return { missing, obscured };
  };
  // A story whose play test just closed an overlay can still be settling on a
  // slow machine (Drawer's close on a CI runner): a miss counts only if a
  // second pass, after a pause and from the top again, misses it too.
  const first = await focusPass();
  if (first.missing.length || first.obscured.length) {
    await page.waitForTimeout(1500);
    await fromTop();
    const second = await focusPass();
    result['2.4.7'] = first.missing.filter((d) => second.missing.includes(d));
    result['2.4.11'] = [...new Set(first.obscured.filter((d) => second.obscured.includes(d)))];
  }

  // 2.1.1 / 2.1.2 / 2.4.3 — fresh load, Tab through everything.
  await load();
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
  // Move the starting point first: leaving a field can change what's on
  // screen (InlineEdit closes its editor on blur).
  await fromTop();
  await page.waitForTimeout(150);
  const plan = await page.evaluate(() => {
    const desc = (el) => `${el.tagName.toLowerCase()}${el.getAttribute('aria-label') ? ` "${el.getAttribute('aria-label')}"` : ` "${(el.textContent ?? '').trim().slice(0, 30)}"`}`;
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[aria-hidden=true], [inert]');
    };
    // Visually hidden (sr-only, 1px): nobody can point at it.
    const pointable = (el) => {
      const r = el.getBoundingClientRect();
      return visible(el) && r.width > 1 && r.height > 1;
    };
    const FOCUSABLE = 'a[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable=true], [contenteditable=""]';
    const root = document.getElementById('storybook-root');
    // A container that is a tab stop but holds focusable items (Radix's
    // roving-focus groups: radiogroup, toolbar, tablist) hands focus to an
    // item at once; the item is the stop to expect.
    // Not expected as stops: items of a roving-focus group (Radix collection
    // items — one stop per group, arrows inside), links inside editable text,
    // controls in a disabled fieldset.
    const tabbables = [...root.querySelectorAll(FOCUSABLE)].filter(
      (el) =>
        el.tabIndex >= 0 &&
        !el.matches(':disabled') &&
        el.type !== 'hidden' &&
        visible(el) &&
        !(el.matches('[tabindex]:not(a, button, input, select, textarea, iframe, summary)') && el.querySelector(FOCUSABLE)) &&
        !el.matches('[data-radix-collection-item]') &&
        !el.parentElement?.closest('[contenteditable=true], [contenteditable=""]'),
    );
    tabbables.forEach((el, i) => el.setAttribute('data-theya-tab', String(i)));
    const order = [];
    for (const el of tabbables) {
      if (el.tabIndex > 0) order.push(`${desc(el)} has tabindex=${el.tabIndex}`);
      for (let n = el; n && n !== root; n = n.parentElement) {
        const cs = getComputedStyle(n);
        const parent = n.parentElement && getComputedStyle(n.parentElement);
        if (cs.order !== '0' && parent && /flex|grid/.test(parent.display)) { order.push(`${desc(el)}: an ancestor has CSS order ${cs.order}`); break; }
        if (/reverse/.test(cs.flexDirection) && /flex/.test(cs.display) && n.querySelectorAll('[data-theya-tab]').length > 1) { order.push(`${desc(el)}: inside flex-direction ${cs.flexDirection}`); break; }
      }
    }
    // Looks clickable but has no keyboard way in.
    const mouseOnly = [];
    for (const el of root.querySelectorAll('*')) {
      if (!(el instanceof HTMLElement) || !pointable(el) || getComputedStyle(el).cursor !== 'pointer') continue;
      if (el.matches(FOCUSABLE) || el.closest(`${FOCUSABLE}, label`) || el.querySelector(FOCUSABLE)) continue;
      // A mouse shortcut that repeats a keyboard-reachable control next to it
      // (Stepper's step circle beside the step's label button).
      if (el.closest('[data-pointer-shortcut]')) continue;
      // Its parent shows the pointer too: report the outermost one only.
      if (el.parentElement && getComputedStyle(el.parentElement).cursor === 'pointer') continue;
      mouseOnly.push(desc(el));
    }
    return { count: tabbables.length, descs: tabbables.map(desc), order: [...new Set(order)], mouseOnly };
  });
  // A story can opt a criterion out with a reason:
  // parameters.a11y.auto = { skip: ['2.1.1'], reason: '…' }.
  const skip = await page.evaluate(() => window.__STORYBOOK_PREVIEW__?.currentRender?.story?.parameters?.a11y?.auto?.skip ?? []);
  result['2.4.3'] = plan.order;
  result['2.1.1'].push(...plan.mouseOnly.map((d) => `pointer only: ${d}`));
  if (plan.count) {
    await fromTop();
    // A short wait first: a trap that takes focus back on blur does it a
    // tick later (ACT 80af7b: setTimeout(() => this.focus(), 10)).
    const where = async () => {
      await page.waitForTimeout(40);
      return page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body || el === document.documentElement) return 'out';
        const i = el.getAttribute('data-theya-tab');
        return i ?? (el.closest('#storybook-root') ? 'other' : 'portal');
      });
    };
    const visited = new Set();
    const trail = [];
    let escaped = false;
    // 3.2.1: what counts as the context during this pass. Dialogs a story
    // renders open on load are part of it; only a NEW one, or a URL change,
    // caused by Tab alone is a change of context.
    const context = () =>
      page.evaluate(() => ({
        href: location.href,
        dialogs: [...document.querySelectorAll('[role=dialog], [role=alertdialog]')].filter((d) => d.checkVisibility()).length,
        // A modal, or a dialog that took focus, is a new context; a non-modal popup
        // that leaves focus on the field (search results under it) is new content.
        modal: [...document.querySelectorAll('[role=dialog][aria-modal=true], [role=alertdialog], dialog[open]')].filter((d) => d.checkVisibility()).length,
        inDialog: !!document.activeElement?.closest('[role=dialog], [role=alertdialog], dialog'),
        // A popup the focused control owns (a combobox's list, a picker's panel) is a change of content, not of context.
        owns: (() => {
          const el = document.activeElement;
          return el instanceof HTMLElement && (el.getAttribute('aria-expanded') === 'true' || (el.getAttribute('role') === 'combobox' && el.getAttribute('aria-expanded') !== 'false'));
        })(),
        active: (() => {
          const el = document.activeElement;
          if (!(el instanceof HTMLElement) || el === document.body) return 'the page';
          return `${el.tagName.toLowerCase()}${el.getAttribute('aria-label') ? ` "${el.getAttribute('aria-label')}"` : ` "${(el.textContent ?? '').trim().slice(0, 30)}"`}`;
        })(),
      }));
    let ctx = await context();
    for (let i = 0; i < Math.min(plan.count * 2 + 6, 90); i++) {
      await page.keyboard.press('Tab');
      const w = await where();
      const now = await context();
      if (now.href !== ctx.href) result['3.2.1'].push(`focusing ${now.active} changes the URL (${now.href.slice(now.href.length - 40)})`);
      else if (!now.owns && (now.modal > ctx.modal || (now.dialogs > ctx.dialogs && now.inDialog && !ctx.inDialog))) result['3.2.1'].push(`focusing ${now.active} opens a dialog`);
      ctx = now;
      if (w === 'out') { escaped = true; break; }
      trail.push(w);
      if (/^\d+$/.test(w)) visited.add(Number(w));
    }
    result['3.2.1'] = [...new Set(result['3.2.1'])];
    if (!escaped) {
      // Still inside after more Tabs than there are stops: a cycle. A modal
      // may hold focus as long as Escape lets it go; an editor that takes Tab
      // (CodeMirror) lets go after Escape, once per editor; and a cycle that
      // Shift+Tab leaves (Sonner sends focus back to where it came from when
      // Tab leaves the toasts) is not a trap.
      let freed = false;
      let last = trail.at(-1);
      for (let i = 0; i < plan.count * 2 + 8 && !freed; i++) {
        if (i === 0 || (await where()) === last) await page.keyboard.press('Escape');
        await page.keyboard.press('Tab');
        const w = await where();
        if (w === 'out') freed = true;
        if (/^\d+$/.test(w)) visited.add(Number(w));
        last = w;
      }
      if (!freed) {
        const cycle = new Set(trail.slice(-plan.count - 4));
        for (let i = 0; i < plan.count + 6 && !freed; i++) {
          await page.keyboard.press('Shift+Tab');
          const w = await where();
          if (w === 'out' || !cycle.has(w)) freed = true;
        }
        if (freed) escaped = true;
      }
      if (!freed) result['2.1.2'].push(`Tab cycles and neither Escape nor Shift+Tab leaves it (last stops: ${trail.slice(-4).join(', ')})`);
    }
    // Unreached stops count only when Tab got all the way out: inside a trap
    // the trap is the finding.
    // A control that disabled itself on the way (Scroll to bottom, once Tab
    // has scrolled the page to the end) has nothing left to do: not a miss.
    if (escaped) {
      const nowDisabled = new Set(
        await page.evaluate(() => [...document.querySelectorAll('[data-theya-tab]')].filter((el) => el.matches(':disabled')).map((el) => Number(el.getAttribute('data-theya-tab')))),
      );
      for (let i = 0; i < plan.count; i++) if (!visited.has(i) && !nowDisabled.has(i)) result['2.1.1'].push(`not reached by Tab: ${plan.descs[i]}`);
    }
  }

  for (const k of skip) result[k] = [];
  result.expect = FIXTURES ? await page.evaluate(() => window.__STORYBOOK_PREVIEW__?.currentRender?.story?.parameters?.a11y?.expect?.auto) : undefined;

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

  // 1.4.10 — fresh load at the criterion's own 320 CSS px viewport: the page
  // must not scroll horizontally. The page is shared across stories, so the
  // viewport is restored right after.
  if (!skip.includes('1.4.10')) {
    // Storybook's own padding (layout "padded", on #storybook-root and body)
    // isn't the component's, but full-bleed blocks bleed into it with negative
    // margins: keep it, and widen the viewport by it, so the component itself
    // gets exactly 320px, as it would in a product.
    const pad = await page.evaluate(() => {
      const side = (el) => (el ? parseFloat(getComputedStyle(el).paddingLeft) + parseFloat(getComputedStyle(el).paddingRight) : 0);
      return Math.round(side(document.getElementById('storybook-root')) + side(document.body));
    });
    await page.setViewportSize({ width: 320 + pad, height: 900 });
    await load();
    result['1.4.10'] = await page.evaluate(() => {
      const doc = document.documentElement;
      if (doc.scrollWidth <= doc.clientWidth + 1) return [];
      // Which boxes stick out — and are they all legitimately two-dimensional
      // content (a data table, a code block)?
      const EXEMPT = 'table, [role=table], [role=grid], [role=treegrid], pre, [data-reflow-exempt]';
      const offenders = [];
      let allExempt = true;
      for (const el of document.querySelectorAll('#storybook-root *')) {
        if (!(el instanceof HTMLElement)) continue;
        const r = el.getBoundingClientRect();
        if (r.width <= 1 || r.right <= doc.clientWidth + 1) continue;
        // Report the outermost offender only.
        if (el.parentElement?.closest('#storybook-root') && el.parentElement.getBoundingClientRect().right > doc.clientWidth + 1) continue;
        if (el.closest(EXEMPT)) continue;
        allExempt = false;
        offenders.push(`${el.tagName.toLowerCase()}${el.getAttribute('data-slot') ? `[data-slot=${el.getAttribute('data-slot')}]` : ''} ${Math.round(r.width)}px wide`);
      }
      if (allExempt) return [];
      return [`page scrolls horizontally at 320px (content ${doc.scrollWidth}px in ${doc.clientWidth}px): ${offenders.slice(0, 3).join('; ') || 'offender outside #storybook-root'}`];
    });
    await page.setViewportSize({ width: 1280, height: 900 });
  }
  return result;
}

const browser = await chromium.launch();
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    const open = async () => {
      const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await p.emulateMedia({ reducedMotion: 'reduce' });
      return p;
    };
    let page = await open();
    while (next < stories.length) {
      const story = stories[next++];
      try {
        results.push(await checkStory(page, story));
      } catch (e) {
        // A crashed page would fail the rest of this worker's stories: retry
        // this one once on a fresh page (CI runners have little memory).
        let error = e;
        if (/crash|closed/i.test(String(e))) {
          await page.close().catch(() => {});
          page = await open();
          try {
            results.push(await checkStory(page, story));
            continue;
          } catch (again) {
            error = again;
          }
        }
        results.push({ id: story.id, title: story.title, name: story.name, error: String(error).slice(0, 200) });
      }
    }
    await page.close();
  }),
);
await browser.close();

const byComponent = {};
for (const r of results.sort((a, b) => a.id.localeCompare(b.id))) {
  const name = groupOf(r);
  if (!name) continue;
  const c = (byComponent[name] ??= { stories: 0, errors: 0, '2.5.3': [], '2.4.7': [], '2.4.11': [], '1.4.12': [], '1.4.4': [], '1.4.10': [], '2.1.1': [], '2.1.2': [], '2.4.3': [], '3.2.1': [], '1.4.1': [], '3.3.2': [], truncated: [], advisory: [] });
  if (FIXTURES) c.expect = r.expect;
  c.stories += 1;
  if (r.error) {
    c.errors += 1;
    continue;
  }
  const at = FIXTURES ? '' : `${r.name}: `;
  for (const k of ['2.5.3', '2.4.7', '2.4.11', '1.4.12', '1.4.4', '1.4.10', '2.1.1', '2.1.2', '2.4.3', '3.2.1', '1.4.1', '3.3.2', 'truncated', 'advisory']) for (const f of r[k]) c[k].push(`${at}${f}`);
}
if (FIXTURES) {
  // Calibration: every expected finding reported, nothing else.
  let bad = 0;
  const KEYS = ['2.5.3', '2.4.7', '2.4.11', '1.4.12', '1.4.4', '1.4.10', '2.1.1', '2.1.2', '2.4.3', '3.2.1', '1.4.1', '3.3.2', 'advisory'];
  for (const [name, c] of Object.entries(byComponent).sort(([a], [b]) => a.localeCompare(b))) {
    const got = KEYS.flatMap((k) => c[k].map((f) => `${k}: ${f}`));
    const problems = c.errors ? ["story didn't load"] : [];
    if (!c.errors && !Array.isArray(c.expect)) problems.push('no parameters.a11y.expect.auto');
    else if (!c.errors) {
      for (const w of c.expect) if (!got.some((g) => g.includes(w))) problems.push(`missed: ${w}`);
      for (const g of got) if (!c.expect.some((w) => g.includes(w))) problems.push(`unexpected: ${g}`);
    }
    if (problems.length) bad++;
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${name}${problems.map((p) => `\n       ${p}`).join('')}`);
  }
  const n = Object.keys(byComponent).length;
  console.log(`a11y-auto fixtures: ${n - bad}/${n} as expected`);
  process.exit(bad || !n ? 1 : 0);
}
// --only re-checks some components and keeps the rest of the last full run.
const previous = ONLY && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')).components : {};
const merged = Object.fromEntries(Object.entries({ ...previous, ...byComponent }).sort(([a], [b]) => a.localeCompare(b)));
if (!CI) {
  fs.writeFileSync(
    OUT,
    JSON.stringify({ $comment: 'Generated by scripts/a11y-auto.mjs against a built Storybook. Do not edit.', date: new Date().toISOString().slice(0, 10), components: merged }, null, 2) + '\n',
  );
}
const fails = (k) => Object.values(byComponent).filter((c) => c[k].length).length;
console.log(`a11y-auto: ${results.length} stories, ${Object.keys(byComponent).length} components${CI ? '' : ' → a11y/auto.json'}`);
for (const k of ['2.5.3', '2.4.7', '2.4.11', '1.4.12', '1.4.4', '1.4.10', '2.1.1', '2.1.2', '2.4.3', '3.2.1', '1.4.1', '3.3.2']) console.log(`  ${k}: ${fails(k)} component(s) with failures`);
console.log(`  errors: ${results.filter((r) => r.error).length} stories`);
// Advisory findings: listed, never failing.
const advisory = Object.entries(byComponent).flatMap(([name, c]) => [...new Set(c.advisory)].map((f) => `- advisory **${name}** — ${f}`));
console.log(`  advisory (experimental axe rules, not failing): ${advisory.length}`);
if (CI) {
  const KEYS = ['2.5.3', '2.4.7', '2.4.11', '1.4.12', '1.4.4', '1.4.10', '2.1.1', '2.1.2', '2.4.3', '3.2.1', '1.4.1', '3.3.2'];
  // Known, tracked failures (config known: { criterion: { component: reason } }): still
  // in the results and the matrix, reported as warnings, so a fix someone else owns
  // doesn't turn every run red. Each entry names who fixes it and where it's tracked.
  const known = (k, name) => KIT_CONFIG?.known?.[k]?.[name];
  const lines = Object.entries(byComponent).flatMap(([name, c]) => KEYS.filter((k) => !known(k, name)).flatMap((k) => c[k].map((f) => `- ${k} **${name}** — ${f}`)));
  const tracked = Object.entries(byComponent).flatMap(([name, c]) => KEYS.filter((k) => known(k, name)).flatMap((k) => c[k].map((f) => `- ${k} **${name}** (known: ${known(k, name)}) — ${f}`)));
  for (const l of tracked) console.log(`::warning title=a11y-auto (known)::${l.replace(/[\r\n]+/g, ' ')}`);
  const errors = results.filter((r) => r.error);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### Browser a11y checks\n\n${results.length} stories, ${lines.length} failure(s), ${errors.length} story load error(s).\n\n${[...lines, ...errors.map((e) => `- error **${e.id}** — ${e.error}`)].join('\n')}\n${advisory.length ? `\n#### Advisory (experimental axe rules, not failing)\n\n${advisory.join('\n')}\n` : ''}`,
    );
  }
  // As GitHub annotations too: they show on the run page and in the API.
  for (const l of lines) console.log(`::error title=a11y-auto::${l.replace(/[\r\n]+/g, ' ')}`);
  for (const a of advisory) console.log(`::warning title=a11y-auto advisory::${a.replace(/[\r\n]+/g, ' ')}`);
  for (const e of errors) console.log(`::error title=a11y-auto (story didn't load)::${e.id}: ${e.error.replace(/[\r\n]+/g, ' ')}`);
  if (lines.length || errors.length) process.exitCode = 1;
}
