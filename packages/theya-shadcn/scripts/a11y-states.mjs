#!/usr/bin/env node
/**
 * ARIA states and keyboard behaviour after interaction, run against a built
 * Storybook in Chromium. a11y-tree.mjs and a11y-auto.mjs look at a story as
 * it first renders; most ARIA defects only show once a popup opens, a value
 * is typed or a key is pressed. This script drives every popup trigger,
 * combobox, tab list, radio group and open dialog of a story through its
 * WAI-ARIA APG keyboard pattern, each on a fresh load, and checks the ARIA
 * state after every step (as rendered, open, after typing, after Escape).
 *
 * ARIA state rules (4.1.2), in every state:
 * - expanded-without-controls: an expanded combobox has no aria-controls
 *   (its popup, a loading one too, isn't linked);
 * - expanded-but-hidden: aria-expanded="true" but its popup is hidden
 *   (an empty list, 0px tall while it loads, is open, just empty; a
 *   display:contents wrapper is judged by its children);
 * - collapsed-but-shown: aria-expanded="false" but its popup shows (popups
 *   only: a "Show more" button's text is shown clamped);
 * - haspopup-role: aria-haspopup doesn't match the popup's role;
 * - idref: aria-controls (expanded), aria-labelledby, aria-describedby,
 *   aria-errormessage or aria-activedescendant points to nothing;
 * - unnamed-popup: a shown listbox, menu, dialog, grid or tree has no name
 *   (a name through aria-labelledby counts the target's aria-label: Radix
 *   names a menu by its icon button);
 * - name-on-generic: aria-label on a div or span with no role (ARIA forbids
 *   it; screen readers drop the name);
 * - focusable-generic: a div or span that takes focus and handles keys
 *   itself (a chip reached with the arrow keys) has no role. A focus target
 *   without its own key handling (a panel focus moves to, truncated text
 *   that shows a tooltip, a scroll area) is announced by its content: fine;
 * - focusable-in-hidden: a tab stop inside aria-hidden. Not while a modal
 *   dialog (Radix sets no aria-modal: any shown dialog outside aria-hidden)
 *   or a popup that holds focus is open: the rest of the page is hidden on
 *   purpose then;
 * - nested-control: a control inside another control (a button inside a
 *   menu item): the inner one is lost to screen readers. Links in editable
 *   text are content, not nested controls, and a tree nests its items.
 *
 * Keyboard (APG), on a fresh load per widget:
 * - combobox (closed): ArrowDown opens it (keyboard-open; an editable one
 *   may wait for a typed letter), the next ArrowDown moves to an option
 *   (keyboard-option: aria-activedescendant or focus), Escape closes it
 *   (keyboard-escape) with focus still on it (focus-return), a second
 *   Escape keeps focus there (not inside a dialog: that Escape closes the
 *   dialog); then a value with no match is typed and the states re-checked;
 * - a button with aria-haspopup (closed, not inside an open popup — a
 *   submenu is its menu's business — and not the chevron of a combobox):
 *   Enter opens it (keyboard-open; "opens on click but not on Enter" when
 *   only a click does), focus moves into a menu or dialog it opens or onto
 *   a field that drives it (focus-into-popup), Escape closes it
 *   (keyboard-escape) and focus goes back to the button, or stays on that
 *   field (focus-return);
 * - tablist / radiogroup: the arrow key along its orientation moves focus
 *   to another item (keyboard-arrows);
 * - a dialog open on load: Escape closes it (keyboard-escape).
 * State is polled for up to 1.5s after each key (a drawer's close outlasts
 * reduced motion), not read after a fixed pause.
 *
 * Criteria: keyboard-* → 2.1.1, focus-* → 2.4.3, the rest → 4.1.2. The
 * conformance matrix (build-a11y.mjs) reads a11y/states.json: a finding
 * fails the cell.
 *
 * Also writes a11y/checklist/<Component>.md: for every story, what a screen
 * reader should announce as rendered and after each opening step, read from
 * Chromium's accessibility tree, plus the script's findings. A VoiceOver /
 * NVDA pass (a11y/screen-reader-checklist.md) then confirms the
 * announcements are accurate and helpful instead of hunting for broken ARIA.
 *
 * A story can opt out of a rule (or of all keyboard steps) with a reason:
 *   parameters.a11y.states = { skip: ['focusable-generic' | 'keyboard'], reason: '…' }
 *
 *   node scripts/a11y-states.mjs --url http://localhost:6008 [--only <title-substring>] [--workers 4]
 *   node scripts/a11y-states.mjs --url … --ci [--shard 2/4]   (writes nothing, fails on any finding or a story that didn't load)
 *   node scripts/a11y-states.mjs --url … --fixtures   (calibration: only the stories tagged a11y-fixture;
 *     fails unless each reports exactly what its parameters.a11y.expect.states lists)
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
const OUT = path.join(ROOT, 'a11y/states.json');
const CHECKLIST_DIR = path.join(ROOT, 'a11y/checklist');
const NO_MATCH = 'zqxjv';
const KEYS = ['4.1.2', '2.1.1', '2.4.3'];
const criterionOf = (rule) => (rule.startsWith('keyboard-') ? '2.1.1' : rule.startsWith('focus-') ? '2.4.3' : '4.1.2');

// The Playwright that @storybook/test-runner ships with (same as CI).
const { chromium } = require(require.resolve('playwright', { paths: [path.dirname(require.resolve('@storybook/test-runner'))] }));

const index = await (await fetch(`${URL_BASE}/index.json`)).json();
// --shard i/n (CI only): this machine checks every n-th component; whole
// components go to one shard. A partial local run would overwrite the report.
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

/** Component name per Storybook title, from spec/index.json (and patterns). */
const componentOf = new Map();
if (!GROUP_BY_TITLE) {
  const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'spec/index.json'), 'utf8'));
  for (const c of spec.components) {
    const s = JSON.parse(fs.readFileSync(path.join(ROOT, c.spec), 'utf8'));
    if (s.storybook?.title) componentOf.set(s.storybook.title, c.name);
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'src/components/blocks'), { recursive: true })) {
    if (!f.endsWith('.stories.tsx')) continue;
    const title = /\btitle:\s*'([^']+)'/.exec(fs.readFileSync(path.join(ROOT, 'src/components/blocks', f), 'utf8'))?.[1];
    if (title) componentOf.set(title, title.split('/').pop());
  }
}
// Fixtures are judged one story at a time; another Storybook by its titles.
const groupOf = (story) => (FIXTURES ? story.name : GROUP_BY_TITLE ? story.title.split('/').pop() : componentOf.get(story.title));

/* ---------- in the page ---------- */

/** Runs in the page after each load: helpers on window.__theyaStates. */
function install() {
  const FOCUSABLE = 'a[href], button, input:not([type=hidden]), select, textarea, summary, iframe, [tabindex], [contenteditable=""], [contenteditable=true]';
  const CONTROL =
    'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=radio], [role=switch], [role=tab], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], [role=combobox], [role=slider], [role=spinbutton], [role=textbox], [role=searchbox], [role=treeitem]';
  const POPUP_ROLES = ['listbox', 'menu', 'dialog', 'alertdialog', 'grid', 'tree'];
  const POPUP = POPUP_ROLES.map((r) => `[role=${r}]`).join(', ');
  const NATIVE_ROLE = { BUTTON: 'button', A: 'link', SELECT: 'combobox', TEXTAREA: 'textbox', SUMMARY: 'button', INPUT: 'textbox' };

  const inHidden = (el) => !!el.closest('[hidden], [inert]');
  const ariaHidden = (el) => !!el.closest('[aria-hidden="true"]');
  const contents = (el) => getComputedStyle(el).display === 'contents';
  // Shown: on screen and bigger than a visually hidden 1px box.
  const shown = (el) => {
    if (!el || !el.isConnected || inHidden(el)) return false;
    if (contents(el)) return [...el.children].some(shown);
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  // Has a box at all: an empty list 0px tall is open, just empty.
  const hasBox = (el) => {
    if (!el || !el.isConnected || inHidden(el)) return false;
    if (contents(el)) return [...el.children].some(hasBox);
    if (!el.checkVisibility({ visibilityProperty: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 || r.height > 1;
  };
  const text = (el) => (el?.textContent ?? '').trim().replace(/\s+/g, ' ');
  const roleOf = (el) => el.getAttribute('role') || NATIVE_ROLE[el.tagName] || el.tagName.toLowerCase();
  const ids = (el, attr) => (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean);
  /** Accessible name, close enough to Chromium's for these rules. */
  const accName = (el) => {
    const by = ids(el, 'aria-labelledby')
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((t) => (t.getAttribute('aria-label') || text(t)).trim())
      .join(' ')
      .trim();
    if (by) return by;
    if (el.getAttribute('aria-label')?.trim()) return el.getAttribute('aria-label').trim();
    if (el.labels?.length) return [...el.labels].map(text).join(' ').trim();
    return (el.getAttribute('title') ?? '').trim();
  };
  const desc = (el) => `${roleOf(el)} "${(accName(el) || text(el)).slice(0, 40)}"`;
  const handlesKeys = (el) => {
    const key = Object.keys(el).find((k) => k.startsWith('__reactProps$'));
    const props = key ? el[key] : {};
    return ['onKeyDown', 'onKeyUp', 'onKeyPress'].some((h) => typeof props[h] === 'function') || el.hasAttribute('onkeydown');
  };
  const popups = () => [...document.querySelectorAll(POPUP)].filter((p) => shown(p) && !ariaHidden(p));

  window.__theyaStates = {
    /** Every ARIA-state finding in the page as it is now: [{ rule, msg }]. */
    check() {
      const out = [];
      const add = (rule, msg) => out.push({ rule, msg });
      for (const el of document.querySelectorAll('[aria-expanded]')) {
        if (ariaHidden(el) || !shown(el)) continue;
        const expanded = el.getAttribute('aria-expanded');
        const combobox = roleOf(el) === 'combobox';
        const controls = ids(el, 'aria-controls');
        const targets = controls.map((id) => [id, document.getElementById(id)]);
        if (expanded === 'true') {
          if (!controls.length) {
            // A disclosure may leave aria-controls out; a combobox's popup must be named.
            if (combobox) add('expanded-without-controls', `${desc(el)} is expanded but has no aria-controls (its popup isn't linked)`);
            continue;
          }
          for (const [id, t] of targets) if (!t) add('idref', `${desc(el)}: aria-controls="${id}" points to nothing`);
          const present = targets.filter(([, t]) => t);
          if (present.length && present.every(([, t]) => !hasBox(t))) add('expanded-but-hidden', `${desc(el)} is aria-expanded="true" but its ${roleOf(present[0][1])} is hidden`);
          const has = el.getAttribute('aria-haspopup');
          const want = has === 'true' ? 'menu' : has;
          if (has && POPUP_ROLES.includes(want)) {
            const open = present.map(([, t]) => t).filter(shown);
            const matches = (t) => roleOf(t) === want || (want === 'dialog' && roleOf(t) === 'alertdialog') || t.querySelector(`[role=${want}]`);
            if (open.length && !open.some(matches)) add('haspopup-role', `${desc(el)} has aria-haspopup="${has}" but its popup is a ${roleOf(open[0])}`);
          }
        } else if (expanded === 'false') {
          const popupTrigger = combobox || (el.hasAttribute('aria-haspopup') && el.getAttribute('aria-haspopup') !== 'false');
          if (targets.some(([, t]) => t && shown(t) && (popupTrigger || POPUP_ROLES.includes(roleOf(t))))) add('collapsed-but-shown', `${desc(el)} is aria-expanded="false" but its popup is shown`);
        }
      }
      for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-errormessage', 'aria-activedescendant']) {
        for (const el of document.querySelectorAll(`[${attr}]`)) {
          if (ariaHidden(el) || !hasBox(el)) continue;
          for (const id of ids(el, attr)) if (!document.getElementById(id)) add('idref', `${desc(el)}: ${attr}="${id}" points to nothing`);
        }
      }
      for (const el of popups()) if (!accName(el)) add('unnamed-popup', `shown ${roleOf(el)} has no name`);
      for (const el of document.querySelectorAll('div[aria-label], span[aria-label], div[aria-labelledby], span[aria-labelledby]')) {
        if (ariaHidden(el) || el.hasAttribute('role') || !shown(el)) continue;
        add('name-on-generic', `${el.tagName.toLowerCase()} "${(accName(el) || text(el)).slice(0, 40)}" has a name but no role: screen readers drop the name`);
      }
      for (const el of document.querySelectorAll('div[tabindex], span[tabindex], li[tabindex], p[tabindex]')) {
        if (ariaHidden(el) || el.hasAttribute('role') || !shown(el) || el.id === 'theya-tab-start') continue;
        const cs = getComputedStyle(el);
        if (/(auto|scroll)/.test(cs.overflowY + cs.overflowX)) continue;
        if (!handlesKeys(el)) continue;
        add('focusable-generic', `focusable ${el.tagName.toLowerCase()} "${text(el).slice(0, 40)}" handles keys but has no role`);
      }
      // A modal dialog, or a popup that holds focus (Radix Select, a modal
      // DropdownMenu), hides the rest of the page on purpose.
      const active = document.activeElement;
      const holding = active && !ariaHidden(active) && popups().some((p) => p.contains(active));
      // Radix dialogs don't set aria-modal: a shown dialog outside every
      // aria-hidden subtree is the modal the rest of the page is hidden for.
      const modal = [...document.querySelectorAll('[aria-modal=true], [role=dialog], [role=alertdialog]')].find((d) => shown(d) && !ariaHidden(d));
      if (!holding) {
        for (const el of document.querySelectorAll('[aria-hidden="true"]')) {
          if (modal && !el.contains(modal)) continue;
          for (const f of el.querySelectorAll(FOCUSABLE)) {
            if (f.tabIndex >= 0 && !f.matches(':disabled') && shown(f)) add('focusable-in-hidden', `${desc(f)} is focusable inside aria-hidden`);
          }
        }
      }
      for (const el of document.querySelectorAll(CONTROL)) {
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) || el.matches('[role=textbox], [role=searchbox], [contenteditable=true], [contenteditable=""]')) continue;
        if (ariaHidden(el) || !shown(el)) continue;
        // A tree nests its items (treeitem > group > treeitem): that's the pattern.
        const inner = [...el.querySelectorAll(CONTROL)].find((n) => shown(n) && !ariaHidden(n) && !(roleOf(el) === 'treeitem' && roleOf(n) === 'treeitem'));
        if (inner) add('nested-control', `${desc(inner)} sits inside ${desc(el)}`);
      }
      const seen = new Set();
      return out.filter((f) => !seen.has(f.msg) && seen.add(f.msg));
    },

    /** Widgets to drive, marked data-theya-key="<n>" (the same order on every load). */
    widgets() {
      const enabled = (el) => !el.matches(':disabled, [aria-disabled="true"], [readonly], [aria-readonly="true"]') && !el.closest('fieldset:disabled');
      const openPopups = popups();
      const inOpenPopup = (el) => openPopups.some((p) => p !== el && p.contains(el));
      const out = [];
      const add = (kind, el) => {
        el.setAttribute('data-theya-key', String(out.length));
        out.push({ kind, key: out.length, desc: desc(el), editable: el.matches('input, textarea, [contenteditable=true]'), inDialog: !!el.closest('[role=dialog], [role=alertdialog]') });
      };
      const pick = (sel, test, n) => [...document.querySelectorAll(sel)].filter((el) => shown(el) && !ariaHidden(el) && test(el)).slice(0, n);
      // Closed ones only: a combobox open on load (Command's inline list) is
      // not a popup to open and close.
      const combos = pick('[role=combobox]', (el) => enabled(el) && el.getAttribute('aria-expanded') === 'false' && !inOpenPopup(el), 2);
      combos.forEach((el) => add('combobox', el));
      const chevronOf = (el) => !!el.parentElement?.querySelector('[role=combobox]');
      pick('[aria-haspopup]:not([aria-haspopup=false]):not([role=combobox])', (el) => enabled(el) && el.getAttribute('aria-expanded') !== 'true' && !inOpenPopup(el) && !chevronOf(el), 3).forEach((el) => add('trigger', el));
      const items = (g, role) => [...g.querySelectorAll(`[role=${role}]`)].filter((el) => shown(el) && enabled(el) && el.closest(`[role=${g.getAttribute('role')}]`) === g);
      pick('[role=tablist]', (g) => items(g, 'tab').length > 1, 1).forEach((el) => add('tablist', el));
      pick('[role=radiogroup]', (g) => items(g, 'radio').length > 1, 1).forEach((el) => add('radiogroup', el));
      pick('[role=dialog], [role=alertdialog]', () => true, 1).forEach((el) => add('dialog', el));
      return out;
    },

    /** State of widget <key> and of the popups on screen. */
    state(key) {
      const el = document.querySelector(`[data-theya-key="${key}"]`);
      const open = popups();
      const active = document.activeElement;
      const role = el?.getAttribute('role');
      const item = role === 'tablist' ? 'tab' : role === 'radiogroup' ? 'radio' : '';
      const drives = (p) => active !== el && ids(active ?? document.body, 'aria-controls').some((id) => p.contains(document.getElementById(id)));
      return {
        exists: !!el?.isConnected,
        shown: !!el && shown(el),
        expanded: el?.getAttribute('aria-expanded') ?? null,
        haspopup: el?.getAttribute('aria-haspopup') ?? '',
        activedescendant: el?.getAttribute('aria-activedescendant') ?? '',
        focusOnEl: !!el && active === el,
        focusOnDriver: !!active?.hasAttribute('data-theya-driver') && active !== el,
        focusInPopup: open.some((p) => (p.contains(active) && p !== el && !p.contains(el)) || drives(p)),
        focusOnOption: !!active?.closest('[role=option], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=gridcell], [role=treeitem]'),
        focusItem: item && active?.getAttribute('role') === item && active.closest(`[role=${role}]`) === el ? [...el.querySelectorAll(`[role=${item}]`)].indexOf(active) : -1,
        popups: open.length,
        options: open.reduce((n, p) => n + p.querySelectorAll('[role=option]').length, 0),
        rtl: el ? getComputedStyle(el).direction === 'rtl' : false,
        vertical: el?.getAttribute('aria-orientation') === 'vertical',
        horizontal: el?.getAttribute('aria-orientation') === 'horizontal' || el?.getAttribute('data-orientation') === 'horizontal',
        active: !active || active === document.body ? 'the page' : desc(active),
      };
    },

    /** Focus widget <key> (a group: its selected item, or the first if that's the last). */
    focus(key) {
      const el = document.querySelector(`[data-theya-key="${key}"]`);
      const role = el.getAttribute('role');
      let target = el;
      if (role === 'tablist' || role === 'radiogroup') {
        const item = role === 'tablist' ? 'tab' : 'radio';
        const all = [...el.querySelectorAll(`[role=${item}]`)].filter((n) => n.closest(`[role=${role}]`) === el && !n.matches(':disabled, [aria-disabled="true"]') && shown(n));
        const on = all.findIndex((n) => n.getAttribute('aria-selected') === 'true' || n.getAttribute('aria-checked') === 'true');
        target = all[on > -1 && on < all.length - 1 ? on : 0];
      } else if (role === 'dialog' || role === 'alertdialog') {
        if (el.contains(document.activeElement)) return;
        target = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? el;
      }
      target.focus({ focusVisible: true });
    },

    /** Marks the focused element as a field driving the open popup (outside it). */
    markDriver() {
      const a = document.activeElement;
      if (a && a !== document.body && !a.closest(POPUP)) a.setAttribute('data-theya-driver', '');
    },
  };
}

/* ---------- driver ---------- */

async function load(page, story) {
  await page.goto(`${URL_BASE}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'load' });
  await page.waitForSelector('#storybook-root > *', { timeout: 10000 }).catch(() => {});
  // The preview runs the story's play function on load; check the state it leaves.
  await page
    .waitForFunction(() => ['finished', 'played', 'completed', 'errored', 'aborted'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase), null, { timeout: 15000 })
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.evaluate(install);
}

const NOISE = /^\s*- region "Notifications[^"]*"$/;
const snap = async (page) =>
  (await page.locator('body').ariaSnapshot({ timeout: 15000 }))
    .split('\n')
    .filter((l) => !NOISE.test(l))
    .join('\n');

/** One widget's keyboard pattern on the current (fresh) page. */
async function drive(page, w, record, steps, finding) {
  const state = () => page.evaluate((k) => window.__theyaStates.state(k), w.key);
  // Press, then poll until `done(state)` holds (up to 1.5s) and return the last state.
  const press = async (key, done = () => false, ms = 1500) => {
    await page.keyboard.press(key);
    let s;
    for (const until = Date.now() + ms; ; ) {
      await page.waitForTimeout(100);
      s = await state();
      if (done(s) || Date.now() > until) return s;
    }
  };
  const settle = async (done, ms = 1000) => {
    let s;
    for (const until = Date.now() + ms; ; ) {
      await page.waitForTimeout(100);
      s = await state();
      if (done(s) || Date.now() > until) return s;
    }
  };
  await page.evaluate((k) => window.__theyaStates.focus(k), w.key);
  await page.waitForTimeout(100);
  const before = await state();

  if (w.kind === 'combobox') {
    let s = await press('ArrowDown', (x) => x.expanded === 'true');
    if (s.expanded !== 'true') {
      // An editable combobox may have no popup until you type (suggestions
      // for a query); a select-only one must open on ArrowDown.
      if (!w.editable) return finding('keyboard-open', `${w.desc}: ArrowDown doesn't open it (aria-expanded stays "${s.expanded}")`);
      await page.keyboard.type('a');
      s = await settle((x) => x.expanded === 'true');
      if (s.expanded !== 'true') return;
    }
    await record(`${w.desc} open`);
    steps.push({ step: `Focus ${w.desc}, press ArrowDown`, tree: await snap(page) });
    if (s.options && !s.activedescendant && !s.focusOnOption) {
      s = await press('ArrowDown', (x) => x.activedescendant || x.focusOnOption);
      if (!s.activedescendant && !s.focusOnOption) finding('keyboard-option', `${w.desc}: ArrowDown doesn't move to an option (no aria-activedescendant, focus stays)`);
    }
    s = await press('Escape', (x) => x.expanded !== 'true' && x.popups <= before.popups && x.focusOnEl);
    if (s.expanded === 'true' || s.popups > before.popups) finding('keyboard-escape', `${w.desc}: Escape doesn't close the popup`);
    else if (!s.focusOnEl) finding('focus-return', `${w.desc}: after Escape focus is on ${s.active}, not on the combobox`);
    await record(`${w.desc} after Escape`);
    if (!w.inDialog && s.focusOnEl) {
      s = await press('Escape', () => false, 300);
      if (!s.focusOnEl) finding('focus-return', `${w.desc}: a second Escape (popup closed) moves focus to ${s.active}; APG keeps it in the field`);
    }
    if (w.editable) {
      await page.evaluate((k) => window.__theyaStates.focus(k), w.key);
      await page.keyboard.type(NO_MATCH, { delay: 20 });
      await settle(() => false, 500);
      await record(`${w.desc} after typing "${NO_MATCH}" (no match)`);
      steps.push({ step: `Type "${NO_MATCH}" (no match)`, tree: await snap(page) });
    }
  } else if (w.kind === 'trigger') {
    // A popup already open elsewhere (a menubar story with a menu open)
    // changes what Enter does: not driven.
    if (before.popups) return;
    let s = await press('Enter', (x) => x.expanded === 'true' && (x.focusInPopup || !!x.activedescendant));
    if (s.expanded !== 'true') {
      await page.locator(`[data-theya-key="${w.key}"]`).click({ timeout: 3000 }).catch(() => {});
      s = await settle((x) => x.expanded === 'true');
      if (s.expanded === 'true') finding('keyboard-open', `${w.desc}: opens on click but not on Enter`);
      else return; // opens something without aria-expanded: nothing to compare
    }
    await record(`${w.desc} open`);
    steps.push({ step: `Focus ${w.desc}, press Enter`, tree: await snap(page) });
    if (['menu', 'true', 'dialog'].includes(s.haspopup) && !s.focusInPopup && !s.activedescendant) finding('focus-into-popup', `${w.desc}: focus stays on ${s.active}, not in the ${s.haspopup === 'dialog' ? 'dialog' : 'menu'} it opens`);
    // Focus that went to a field driving the popup (outside it) may stay there.
    await page.evaluate(() => window.__theyaStates.markDriver());
    s = await press('Escape', (x) => x.expanded !== 'true' && (x.focusOnEl || x.focusOnDriver));
    if (s.expanded === 'true') finding('keyboard-escape', `${w.desc}: Escape doesn't close its popup`);
    else if (!s.focusOnEl && !s.focusOnDriver) finding('focus-return', `${w.desc}: after Escape focus is on ${s.active}, not back on the trigger`);
    await record(`${w.desc} after Escape`);
  } else if (w.kind === 'tablist' || w.kind === 'radiogroup') {
    // Along the group's orientation: Radix ignores the other axis once
    // orientation is set. A radiogroup without one takes ArrowDown.
    const along = w.kind === 'tablist' ? !before.vertical : before.horizontal;
    const key = along ? (before.rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const s = await press(key, (x) => x.focusItem > -1 && x.focusItem !== before.focusItem);
    if (s.focusItem < 0 || s.focusItem === before.focusItem) finding('keyboard-arrows', `${w.desc}: ${key} doesn't move focus to another ${w.kind === 'tablist' ? 'tab' : 'radio'}`);
    await record(`${w.desc} after ${key}`);
  } else if (w.kind === 'dialog') {
    const s = await press('Escape', (x) => !x.exists || !x.shown);
    if (s.exists && s.shown) finding('keyboard-escape', `${w.desc}: Escape doesn't close it`);
  }
}

async function checkStory(page, story) {
  const raw = [];
  const steps = [];
  const record = async (where) => {
    for (const f of await page.evaluate(() => window.__theyaStates.check())) raw.push({ ...f, where });
  };
  const finding = (rule, msg) => raw.push({ rule, msg, where: 'keyboard' });
  await load(page, story);
  const params = await page.evaluate(() => window.__STORYBOOK_PREVIEW__?.currentRender?.story?.parameters?.a11y ?? {});
  const skip = params.states?.skip ?? [];
  await record('as rendered');
  steps.push({ step: 'As rendered', tree: await snap(page) });
  if (!skip.includes('keyboard')) {
    const widgets = await page.evaluate(() => window.__theyaStates.widgets());
    for (const [i, w] of widgets.entries()) {
      if (i > 0) {
        await load(page, story);
        await page.evaluate(() => window.__theyaStates.widgets());
      }
      await drive(page, w, record, steps, finding);
    }
  }
  // One line per defect: the same rule on the same kind of element, in any
  // step, is one finding ("span … has no role", 27 chips → "and 26 more").
  const groups = new Map();
  for (const f of raw) {
    if (skip.includes(f.rule) || (skip.includes('keyboard') && f.where === 'keyboard')) continue;
    const key = `${f.rule}|${f.msg.replace(/"[^"]*"/g, '…')}`;
    const g = groups.get(key) ?? { rule: f.rule, where: f.where, msg: f.msg, n: new Set() };
    g.n.add(f.msg);
    groups.set(key, g);
  }
  const findings = [...groups.values()].map((g) => ({ rule: g.rule, msg: `${g.rule}: ${g.where === 'keyboard' ? '' : `${g.where}: `}${g.msg}${g.n.size > 1 ? ` (and ${g.n.size - 1} more like it)` : ''}` }));
  return { findings, steps, expect: params.expect?.states };
}

/* ---------- screen-reader checklist ---------- */

const ROLES =
  /^(\s*)- (button|link|textbox|searchbox|checkbox|radio|switch|combobox|slider|spinbutton|tab|menuitem|menuitemcheckbox|menuitemradio|option|treeitem|listbox|menu|dialog|alertdialog|grid|tree|radiogroup|tablist|toolbar|group|status|alert|generic)(?: "((?:[^"\\]|\\.)*)")?(.*)$/;
const SAY = {
  button: 'button', link: 'link', textbox: 'edit text', searchbox: 'search text field', checkbox: 'checkbox', radio: 'radio button', switch: 'switch',
  combobox: 'combo box', slider: 'slider', spinbutton: 'stepper', tab: 'tab', menuitem: 'menu item', menuitemcheckbox: 'menu item checkbox',
  menuitemradio: 'menu item radio', option: 'option', treeitem: 'tree item', listbox: 'list box', menu: 'menu', dialog: 'dialog',
  alertdialog: 'alert dialog', grid: 'grid', tree: 'tree', radiogroup: 'radio group', tablist: 'tab list', toolbar: 'toolbar', group: 'group',
  status: 'status (polite announcement)', alert: 'alert (announced at once)', generic: 'no role',
};
/** Roles whose name a screen reader needs. */
const NEEDS_NAME = new Set(['button', 'link', 'textbox', 'searchbox', 'checkbox', 'radio', 'switch', 'combobox', 'slider', 'spinbutton', 'tab', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'treeitem', 'listbox', 'dialog', 'alertdialog']);
function expectations(tree) {
  const out = [];
  for (const line of tree.split('\n')) {
    const textLine = /^\s*- text: (.+)$/.exec(line);
    if (textLine) {
      out.push(`- "${textLine[1].replace(/^"|"$/g, '')}", plain text (no role)`);
      continue;
    }
    const m = ROLES.exec(line);
    if (!m) continue;
    const [, , role, name = '', rest] = m;
    if ((role === 'generic' || role === 'group' || role === 'toolbar') && !name) continue;
    if ((role === 'status' || role === 'alert') && !name && !/:\s*\S/.test(rest)) continue; // empty live region: nothing to hear yet
    const states = [...rest.matchAll(/\[([a-z]+)(?:=([^\]]+))?\]/g)].map(([, k, v]) => (v ? `${k} ${v}` : k));
    if (role === 'combobox' && !states.includes('expanded')) states.push('collapsed');
    const inline = /:\s*(.+)$/.exec(rest)?.[1]?.replace(/^"|"$/g, '');
    const label = name || inline || '(no name)';
    const missing = !name && !inline && NEEDS_NAME.has(role);
    out.push(`- **${label}**, ${SAY[role]}${states.length ? `, ${states.join(', ')}` : ''}${missing ? ' — **no name: check**' : ''}`);
  }
  return [...new Set(out)];
}
function checklist(name, list) {
  const body = list
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => {
      const steps = s.steps.map((st) => `#### ${st.step}\n\n${expectations(st.tree).join('\n') || '- (nothing announced)'}\n`).join('\n');
      const issues = s.findings.length ? `\n> Script findings in this story (fix first, or confirm with the screen reader):\n${s.findings.map((f) => `> - ${f.msg}`).join('\n')}\n` : '';
      return `### ${s.name}\n\nStory: \`${s.id}\`\n${issues}\n${steps}`;
    })
    .join('\n');
  return `# ${name}: screen-reader checklist

Generated by scripts/a11y-states.mjs from Chromium's accessibility tree. Do not edit.

For each step, do it with the keyboard in **VoiceOver + Safari** (and NVDA + Chrome when available) and confirm, as in a11y/screen-reader-checklist.md:

1. Each control is announced with the name, role and state listed (wording differs by screen reader; the meaning must match).
2. The name is the one a user needs, not just a value or an icon label.
3. Changes are announced: opening, closing, selection, errors, loading.
4. Nothing extra is announced: hidden content, duplicate names, decorative text.

Record the pass in a11y/manual.json (screenReader: screen reader, browser, date, result).

${body}`;
}

/* ---------- run ---------- */

const results = new Map();
const perStory = new Map();
const browser = await chromium.launch();
const queue = [...stories];
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    const open = async () => {
      const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await p.emulateMedia({ reducedMotion: 'reduce' });
      return p;
    };
    let page = await open();
    for (let story = queue.shift(); story; story = queue.shift()) {
      const name = groupOf(story);
      if (!name) continue;
      const row = results.get(name) ?? { stories: 0, errors: 0, '4.1.2': [], '2.1.1': [], '2.4.3': [] };
      results.set(name, row);
      row.stories++;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await checkStory(page, story);
          for (const f of r.findings) row[criterionOf(f.rule)].push(FIXTURES ? f.msg : `${story.name}: ${f.msg}`);
          if (FIXTURES) row.expect = r.expect;
          const list = perStory.get(name) ?? [];
          list.push({ id: story.id, name: story.name, steps: r.steps, findings: r.findings });
          perStory.set(name, list);
          break;
        } catch (error) {
          // A crashed or stuck page: retry the story once on a fresh one.
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
  // Calibration: every expected finding reported, nothing else.
  let bad = 0;
  for (const [name, r] of [...results].sort(([a], [b]) => a.localeCompare(b))) {
    const got = KEYS.flatMap((k) => r[k].map((f) => `${k}: ${f}`));
    const problems = r.errors ? ["story didn't load"] : [];
    if (!r.errors && !Array.isArray(r.expect)) problems.push('no parameters.a11y.expect.states');
    else if (!r.errors) {
      for (const w of r.expect) if (!got.some((g) => g.includes(w))) problems.push(`missed: ${w}`);
      for (const g of got) if (!r.expect.some((w) => g.includes(w))) problems.push(`unexpected: ${g}`);
    }
    if (problems.length) bad++;
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${name}${problems.map((p) => `\n       ${p}`).join('')}`);
  }
  console.log(`a11y states fixtures: ${results.size - bad}/${results.size} as expected`);
  process.exit(bad || !results.size ? 1 : 0);
}

if (!CI) {
  fs.mkdirSync(CHECKLIST_DIR, { recursive: true });
  for (const [name, list] of perStory) fs.writeFileSync(path.join(CHECKLIST_DIR, `${name}.md`), checklist(name, list));
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { components: {} };
  const components = ONLY ? { ...prev.components } : {};
  for (const [name, row] of [...results].sort(([a], [b]) => a.localeCompare(b))) components[name] = row;
  const sorted = Object.fromEntries(Object.entries(components).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(OUT, JSON.stringify({ $comment: 'Generated by scripts/a11y-states.mjs. Do not edit.', date: new Date().toISOString().slice(0, 10), components: sorted }, null, 2) + '\n');
}
const failing = [...results].filter(([, r]) => KEYS.some((k) => r[k].length));
console.log(`a11y states: ${stories.length} stories, ${results.size} components, ${failing.length} with findings${CI ? '' : ' → a11y/states.json, a11y/checklist/'}`);
for (const [name, r] of failing) for (const k of KEYS) for (const f of r[k]) console.log(`  ${k} ${name} — ${f}`);
if (CI) {
  const errors = [...results].reduce((n, [, r]) => n + r.errors, 0);
  const lines = failing.flatMap(([name, r]) => KEYS.flatMap((k) => r[k].map((f) => `- ${k} **${name}** — ${f}`)));
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### ARIA states and keyboard\n\n${stories.length} stories, ${failing.length} component(s) with findings, ${errors} story load error(s).\n\n${lines.join('\n')}\n`);
  }
  for (const l of lines) console.log(`::error title=a11y-states::${l.replace(/[\r\n]+/g, ' ')}`);
  if (failing.length || errors) process.exitCode = 1;
}
