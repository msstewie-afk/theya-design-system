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
 * - Keyboard model (2.1.1, "keys:", APG; added 2026-11-12 after another
 *   design system's Combobox showed Tab-only checks miss it). Each widget is
 *   tested on a fresh load:
 *   combobox (closed): ArrowDown opens it (aria-expanded="true"), the next
 *   ArrowDown moves to an option (aria-activedescendant or focus), Escape
 *   closes it and focus stays on the combobox;
 *   a button with aria-haspopup (closed): Enter opens it, focus moves into a
 *   menu or dialog, Escape closes it and focus is back on the button;
 *   tablist / radiogroup: the arrow key moves focus to another item;
 *   a dialog open on load: Escape closes it.
 *   Opt out per story: parameters.a11y.auto = { skip: ['keys'], reason }.
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

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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
const OUT = path.join(ROOT, 'a11y/auto.json');

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

/** Component name per Storybook title, from spec/index.json. */
const componentOf = new Map();
if (!GROUP_BY_TITLE) {
  const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'spec/index.json'), 'utf8'));
  for (const c of spec.components) {
    const s = JSON.parse(fs.readFileSync(path.join(ROOT, c.spec), 'utf8'));
    if (s.storybook?.title) componentOf.set(s.storybook.title, c.name);
  }
  // Patterns too: their story title's last segment is the name build-a11y.mjs uses.
  for (const f of fs.readdirSync(path.join(ROOT, 'src/components/blocks'), { recursive: true })) {
    if (!f.endsWith('.stories.tsx')) continue;
    const title = /\btitle:\s*'([^']+)'/.exec(fs.readFileSync(path.join(ROOT, 'src/components/blocks', f), 'utf8'))?.[1];
    if (title) componentOf.set(title, title.split('/').pop());
  }
}
// Fixtures are judged one story at a time; another Storybook by its titles.
const groupOf = (r) => (FIXTURES ? r.name : GROUP_BY_TITLE ? r.title.split('/').pop() : componentOf.get(r.title));

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

/**
 * In the page: widgets with a keyboard model to test, marked
 * data-theya-key="<n>" (the same order on every load).
 */
function keyWidgets() {
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && !el.closest('[aria-hidden="true"], [inert], [hidden]');
  };
  const enabled = (el) => !el.matches(':disabled, [aria-disabled="true"], [readonly], [aria-readonly="true"]') && !el.closest('fieldset:disabled');
  const text = (el) => (el?.textContent ?? '').trim().replace(/\s+/g, ' ');
  const nameOf = (el) => {
    const by = el.getAttribute('aria-labelledby');
    if (by) return by.split(/\s+/).map((id) => text(document.getElementById(id))).join(' ').trim();
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').trim();
    if (el.labels?.length) return [...el.labels].map(text).join(' ');
    return text(el);
  };
  const out = [];
  const add = (kind, el, role) => {
    el.setAttribute('data-theya-key', String(out.length));
    out.push({ kind, key: out.length, desc: `${role} "${nameOf(el).slice(0, 40)}"` });
  };
  const pick = (sel, test, n) => [...document.querySelectorAll(sel)].filter((el) => shown(el) && test(el)).slice(0, n);
  for (const el of pick('[role=combobox]', (el) => enabled(el) && el.getAttribute('aria-expanded') === 'false', 2)) add('combobox', el, 'combobox');
  for (const el of pick('[aria-haspopup]:not([aria-haspopup=false]):not([role=combobox]):is(button, [role=button])', (el) => enabled(el) && el.getAttribute('aria-expanded') === 'false', 2)) add('trigger', el, el.getAttribute('role') ?? 'button');
  const items = (g, role) => [...g.querySelectorAll(`[role=${role}]`)].filter((el) => shown(el) && enabled(el) && el.closest(`[role=${g.getAttribute('role')}]`) === g);
  for (const el of pick('[role=tablist]', (g) => items(g, 'tab').length > 1, 1)) add('tablist', el, 'tablist');
  for (const el of pick('[role=radiogroup]', (g) => items(g, 'radio').length > 1, 1)) add('radiogroup', el, 'radiogroup');
  for (const el of pick('[role=dialog], [role=alertdialog]', () => true, 1)) add('dialog', el, el.getAttribute('role'));
  return out;
}

/** In the page: the state of widget <key> and of the popups on screen. */
function keyState(key) {
  const el = document.querySelector(`[data-theya-key="${key}"]`);
  const shown = (n) => {
    if (!n || !n.isConnected) return false;
    const r = n.getBoundingClientRect();
    const cs = getComputedStyle(n);
    return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && !n.closest('[aria-hidden="true"], [inert], [hidden]');
  };
  const POPUP = '[role=listbox], [role=menu], [role=dialog], [role=alertdialog], [role=grid], [role=tree]';
  const popups = [...document.querySelectorAll(POPUP)].filter(shown);
  const active = document.activeElement;
  const role = el?.getAttribute('role');
  const item = role === 'tablist' ? 'tab' : role === 'radiogroup' ? 'radio' : '';
  return {
    exists: Boolean(el?.isConnected),
    shown: shown(el),
    expanded: el?.getAttribute('aria-expanded') ?? null,
    activedescendant: el?.getAttribute('aria-activedescendant') ?? '',
    focusOnEl: active === el,
    focusOnDriver: Boolean(active?.hasAttribute('data-theya-driver') && active !== el),
    focusInEl: Boolean(el && el.contains(active)),
    // Focus in the popup, or on a field that drives it (aria-controls into
    // it: FilterField's "Add filter" opens a list its input navigates).
    focusInPopup: popups.some(
      (p) => (p.contains(active) && p !== el && !p.contains(el)) || (active !== el && (active?.getAttribute('aria-controls') ?? '').split(/\s+/).some((id) => id && p.contains(document.getElementById(id)))),
    ),
    focusOnOption: Boolean(active?.closest('[role=option], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=gridcell], [role=treeitem]')),
    // Which item has focus, by position (items can't be told apart by markup).
    focusItem: item && active?.getAttribute('role') === item && active.closest(`[role=${role}]`) === el ? [...el.querySelectorAll(`[role=${item}]`)].indexOf(active) : -1,
    editable: Boolean(el?.matches('input, textarea, [contenteditable=true]')),
    focusInToolbarEditor: Boolean(el?.closest('[role=toolbar]') && active?.matches('[contenteditable=true], [role=textbox], textarea')),
    popups: popups.length,
    options: popups.reduce((n, p) => n + p.querySelectorAll('[role=option]').length, 0),
    rtl: el ? getComputedStyle(el).direction === 'rtl' : false,
    vertical: el?.getAttribute('aria-orientation') === 'vertical',
    horizontal: el?.getAttribute('aria-orientation') === 'horizontal' || el?.getAttribute('data-orientation') === 'horizontal',
  };
}

/** In the page: focus widget <key> (a group: its selected item, or the first if that's the last). */
function keyFocus(key) {
  const el = document.querySelector(`[data-theya-key="${key}"]`);
  const role = el.getAttribute('role');
  let target = el;
  if (role === 'tablist' || role === 'radiogroup') {
    const item = role === 'tablist' ? 'tab' : 'radio';
    const all = [...el.querySelectorAll(`[role=${item}]`)].filter((n) => n.closest(`[role=${role}]`) === el && !n.matches(':disabled, [aria-disabled="true"]') && n.getBoundingClientRect().width > 1);
    const on = all.findIndex((n) => n.getAttribute('aria-selected') === 'true' || n.getAttribute('aria-checked') === 'true');
    target = all[on > -1 && on < all.length - 1 ? on : 0];
  } else if (role === 'dialog' || role === 'alertdialog') {
    if (el.contains(document.activeElement)) return;
    target = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? el;
  }
  target.focus({ focusVisible: true });
}

/** Runs one widget's keyboard model on the current (fresh) page; returns findings. */
async function keyModel(page, w) {
  const state = () => page.evaluate(keyState, w.key);
  // Press, then wait until `done(state)` holds (up to 1.5s: a drawer's
  // close can outlast reduced motion) and return the last state.
  const press = async (k, done = () => false) => {
    await page.keyboard.press(k);
    let s;
    for (const until = Date.now() + 1500; ; ) {
      await page.waitForTimeout(100);
      s = await state();
      if (done(s) || Date.now() > until) return s;
    }
  };
  await page.evaluate(keyFocus, w.key);
  await page.waitForTimeout(100);
  const before = await state();
  const out = [];
  if (w.kind === 'combobox') {
    let s = await press('ArrowDown', (x) => x.expanded === 'true');
    if (s.expanded !== 'true') {
      // An editable combobox may have no popup until you type (suggestions
      // for a query): try a letter. A select-only one must open on ArrowDown.
      if (!before.editable) return [`${w.desc}: ArrowDown doesn't open it (aria-expanded stays "${s.expanded}")`];
      await page.keyboard.type('a');
      for (const until = Date.now() + 1000; s.expanded !== 'true' && Date.now() < until; ) {
        await page.waitForTimeout(100);
        s = await state();
      }
      if (s.expanded !== 'true') return [];
    }
    if (s.options && !s.activedescendant && !s.focusOnOption) {
      s = await press('ArrowDown', (x) => x.activedescendant || x.focusOnOption);
      if (!s.activedescendant && !s.focusOnOption) out.push(`${w.desc}: ArrowDown doesn't move to an option (no aria-activedescendant, focus stays)`);
    }
    s = await press('Escape', (x) => x.expanded !== 'true' && x.popups <= before.popups && x.focusOnEl);
    if (s.expanded === 'true' || s.popups > before.popups) out.push(`${w.desc}: Escape doesn't close the popup`);
    else if (!s.focusOnEl) out.push(`${w.desc}: focus is not on the combobox after Escape`);
  } else if (w.kind === 'trigger') {
    // A popup already open elsewhere on the page (a menubar story with one
    // menu open) changes what Enter does: not tested.
    if (before.popups) return [];
    let s = await press('Enter', (x) => x.expanded === 'true' && (x.focusInPopup || x.activedescendant));
    if (s.expanded !== 'true') return [`${w.desc}: Enter doesn't open its popup (aria-expanded stays "${s.expanded}")`];
    const popupRole = await page.evaluate((key) => document.querySelector(`[data-theya-key="${key}"]`).getAttribute('aria-haspopup'), w.key);
    if (['menu', 'true', 'dialog'].includes(popupRole) && !s.focusInPopup && !s.activedescendant) out.push(`${w.desc}: focus doesn't move into the ${popupRole === 'dialog' ? 'dialog' : 'menu'} it opens`);
    // Focus that went to a field driving the popup (outside it) may stay there.
    await page.evaluate(() => {
      const a = document.activeElement;
      if (a && !a.closest('[role=dialog], [role=menu], [role=listbox], [role=alertdialog]')) a.setAttribute('data-theya-driver', '');
    });
    s = await press('Escape', (x) => x.expanded !== 'true' && (x.focusOnEl || x.focusInToolbarEditor || x.focusOnDriver));
    if (s.expanded === 'true') out.push(`${w.desc}: Escape doesn't close its popup`);
    // A toolbar button of a text editor may hand focus back to the text
    // (RichTextEditor's link and text-style pickers): the user goes on typing.
    else if (!s.focusOnEl && !s.focusInToolbarEditor && !s.focusOnDriver) out.push(`${w.desc}: focus is not back on the trigger after Escape`);
  } else if (w.kind === 'tablist' || w.kind === 'radiogroup') {
    // Along the group's orientation: Radix ignores the other axis once
    // orientation is set. A radiogroup without one takes ArrowDown.
    const along = w.kind === 'tablist' ? !before.vertical : before.horizontal;
    const key = along ? (before.rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const s = await press(key, (x) => x.focusItem > -1 && x.focusItem !== before.focusItem);
    if (s.focusItem < 0 || s.focusItem === before.focusItem) out.push(`${w.desc}: ${key} doesn't move focus to another ${w.kind === 'tablist' ? 'tab' : 'radio'}`);
  } else if (w.kind === 'dialog') {
    const s = await press('Escape', (x) => !x.exists || !x.shown);
    if (s.exists && s.shown) out.push(`${w.desc}: Escape doesn't close it`);
  }
  return out;
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
  const result = { id: story.id, title: story.title, name: story.name, '2.5.3': [], '2.4.7': [], '1.4.12': [], '1.4.4': [], '2.1.1': [], '2.1.2': [], '2.4.3': [], keys: [], truncated: [] };
  const load = async () => {
    await page.goto(`${URL_BASE}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'load' });
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
  const focusPass = async () => {
    const missing = [];
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
        if ((await look()) === blurred) missing.push(info.desc);
      }
    }
    return missing;
  };
  // A story whose play test just closed an overlay can still be settling on a
  // slow machine (Drawer's close on a CI runner): a miss counts only if a
  // second pass, after a pause and from the top again, misses it too.
  const first = await focusPass();
  if (first.length) {
    await page.waitForTimeout(1500);
    await fromTop();
    const second = await focusPass();
    result['2.4.7'] = first.filter((d) => second.includes(d));
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
    const where = () =>
      page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body || el === document.documentElement) return 'out';
        const i = el.getAttribute('data-theya-tab');
        return i ?? (el.closest('#storybook-root') ? 'other' : 'portal');
      });
    const visited = new Set();
    const trail = [];
    let escaped = false;
    for (let i = 0; i < Math.min(plan.count * 2 + 6, 90); i++) {
      await page.keyboard.press('Tab');
      const w = await where();
      if (w === 'out') { escaped = true; break; }
      trail.push(w);
      if (/^\d+$/.test(w)) visited.add(Number(w));
    }
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

  // Keyboard model: each widget on a fresh load (one test leaves popups open).
  if (!skip.includes('keys')) {
    await load();
    const widgets = await page.evaluate(keyWidgets);
    for (const [i, w] of widgets.entries()) {
      if (i > 0) {
        await load();
        await page.evaluate(keyWidgets);
      }
      result.keys.push(...(await keyModel(page, w)));
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
  const c = (byComponent[name] ??= { stories: 0, errors: 0, '2.5.3': [], '2.4.7': [], '1.4.12': [], '1.4.4': [], '2.1.1': [], '2.1.2': [], '2.4.3': [], truncated: [] });
  if (FIXTURES) c.expect = r.expect;
  c.stories += 1;
  if (r.error) {
    c.errors += 1;
    continue;
  }
  const at = FIXTURES ? '' : `${r.name}: `;
  for (const k of ['2.5.3', '2.4.7', '1.4.12', '1.4.4', '2.1.1', '2.1.2', '2.4.3', 'truncated']) for (const f of r[k]) c[k].push(`${at}${f}`);
  for (const f of r.keys) c['2.1.1'].push(`${at}keys: ${f}`);
}
if (FIXTURES) {
  // Calibration: every expected finding reported, nothing else.
  let bad = 0;
  const KEYS = ['2.5.3', '2.4.7', '1.4.12', '1.4.4', '2.1.1', '2.1.2', '2.4.3'];
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
for (const k of ['2.5.3', '2.4.7', '1.4.12', '1.4.4', '2.1.1', '2.1.2', '2.4.3']) console.log(`  ${k}: ${fails(k)} component(s) with failures`);
console.log(`  errors: ${results.filter((r) => r.error).length} stories`);
if (CI) {
  const KEYS = ['2.5.3', '2.4.7', '1.4.12', '1.4.4', '2.1.1', '2.1.2', '2.4.3'];
  const lines = Object.entries(byComponent).flatMap(([name, c]) => KEYS.flatMap((k) => c[k].map((f) => `- ${k} **${name}** — ${f}`)));
  const errors = results.filter((r) => r.error);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### Browser a11y checks\n\n${results.length} stories, ${lines.length} failure(s), ${errors.length} story load error(s).\n\n${[...lines, ...errors.map((e) => `- error **${e.id}** — ${e.error}`)].join('\n')}\n`,
    );
  }
  // As GitHub annotations too: they show on the run page and in the API.
  for (const l of lines) console.log(`::error title=a11y-auto::${l.replace(/[\r\n]+/g, ' ')}`);
  for (const e of errors) console.log(`::error title=a11y-auto (story didn't load)::${e.id}: ${e.error.replace(/[\r\n]+/g, ' ')}`);
  if (lines.length || errors.length) process.exitCode = 1;
}
