#!/usr/bin/env node
/**
 * Accessibility-tree check: what a screen reader gets from every story,
 * without a screen reader. Run against a built Storybook in Chromium.
 *
 * For each story it records Playwright's accessibility snapshot (roles,
 * names, states, in the order a screen reader walks them) to
 * a11y/tree/<Component>.yml, so a change in what assistive tech gets shows
 * up as a diff in review, and checks it:
 *
 * - 4.1.2 Name, Role, Value: every control (button, link, text field,
 *   checkbox, radio, switch, combobox, slider, tab, menu item, option…) has
 *   an accessible name.
 * - 1.1.1 Non-text Content: no exposed image without a name, unless it sits
 *   inside a control or link that has its own name (the icon of a named
 *   button: VoiceOver reads the button's name). And that icon must still be
 *   hidden in the DOM (aria-hidden on the svg or a wrapper inside the
 *   control): Chromium drops it from the tree, but Safari exposes it as an
 *   image, the control becomes a group VoiceOver steps into, and VO + Space
 *   stops pressing it (the FAQ accordion, 2026-11-08). An svg with its own
 *   aria-label or <title> is meaningful and is left alone.
 * - 1.3.1 Info and Relationships: every table has column or row headers,
 *   every radio is inside a radio group, every form field has a name (its
 *   label is associated).
 * - 3.3.1 Error Identification: every field marked aria-invalid points to a
 *   non-empty error text with aria-describedby or aria-errormessage (on the
 *   field or its group). A component counts as checked for 3.3.1 when at
 *   least one of its stories shows an error that way, or a field described
 *   by a shown error message (role=alert).
 *
 * - 4.1.2, states and roles (in the DOM, 2026-11-12: calibrated on another
 *   design system's Combobox, where the tree alone missed them):
 *   aria-expanded must match what's shown — "true" with its popup
 *   (aria-controls) hidden or missing, or "false" with it shown, is a
 *   finding (for "false", only popups: a "Show more" button's text is
 *   shown clamped); an expanded combobox must name its popup with aria-controls (a
 *   loading popup too); aria-controls / aria-activedescendant of an expanded
 *   widget must point to elements that exist; aria-haspopup must match the
 *   popup's role; and an element that takes focus and handles keys itself
 *   (a chip reached with the arrow keys) must have a role — a focusable <span> or
 *   <div> without one is announced as plain text.
 *
 * 1.3.2 Meaningful Sequence is read by scripts/build-a11y.mjs: the snapshot
 * order is the DOM order; it counts when the component's source has no CSS
 * reordering (order-*, *-reverse, col/row-start) or a manual review of the
 * reordering passed.
 *
 * Writes a11y/tree.json (per component: stories checked, failures per
 * criterion, errors shown) and a11y/tree/*.yml. build-a11y.mjs reads them
 * as "tree" evidence. Decided 2026-10-29: the tree plus code review stands
 * in for a per-component screen-reader pass; VoiceOver is spot-checked
 * (a11y/screen-reader-checklist.md, a11y/voiceover).
 *
 *   node scripts/a11y-tree.mjs --url http://localhost:6008 [--only <title-substring>] [--workers 4]
 *   node scripts/a11y-tree.mjs --url … --ci   (CI: writes nothing, fails on any finding or a story that didn't load)
 *   node scripts/a11y-tree.mjs --url … --ci --shard 2/4   (CI: every 4th component, starting with the 2nd)
 *   node scripts/a11y-tree.mjs --url … --fixtures   (calibration: only the stories tagged a11y-fixture;
 *     fails unless each reports exactly what its parameters.a11y.expect.tree lists)
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
const OUT = path.join(ROOT, 'a11y/tree.json');
const TREE_DIR = path.join(ROOT, 'a11y/tree');

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

const CONTROLS = new Set(['button', 'link', 'textbox', 'searchbox', 'checkbox', 'radio', 'switch', 'combobox', 'slider', 'spinbutton', 'tab', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'treeitem', 'listbox', 'menu', 'tree', 'grid', 'radiogroup', 'tablist', 'dialog', 'alertdialog']);
/** Composite widgets whose name ARIA doesn't require (their items carry the names). */
const OPTIONAL_NAME = new Set(['menu', 'tree', 'grid', 'tablist', 'radiogroup']);
const FIELDS = new Set(['textbox', 'searchbox', 'combobox', 'slider', 'spinbutton']);
/** Toasts' landmark (Sonner) is on every page; not part of a story. */
const NOISE = /^- region "Notifications[^"]*"$/;

/** Parse an aria snapshot into { depth, role, name } lines. */
function parse(snapshot) {
  const out = [];
  for (const raw of snapshot.split('\n')) {
    const m = /^(\s*)- ([a-z]+)(?: "((?:[^"\\]|\\.)*)")?/.exec(raw) ?? /^(\s*)- '([a-z]+) "((?:[^"\\]|\\.)*)"/.exec(raw);
    if (!m) continue;
    out.push({ depth: m[1].length / 2, role: m[2], name: m[3] ?? '' });
  }
  return out;
}

function checkTree(lines) {
  const found = { '4.1.2': [], '1.1.1': [], '1.3.1': [] };
  const stack = [];
  lines.forEach((l, i) => {
    while (stack.length && stack[stack.length - 1].depth >= l.depth) stack.pop();
    // A named control, link or image above makes its content presentational
    // for VoiceOver: the icon of a named button, the plot inside a named chart.
    const namedAbove = stack.some((a) => (CONTROLS.has(a.role) || a.role === 'img') && a.name);
    if (CONTROLS.has(l.role) && !l.name && !OPTIONAL_NAME.has(l.role)) found['4.1.2'].push(`unnamed ${l.role}`);
    if (FIELDS.has(l.role) && !l.name) found['1.3.1'].push(`${l.role} without a label`);
    if (l.role === 'img' && !l.name && !namedAbove) {
      const next = lines[i + 1];
      found['1.1.1'].push(`image without a name${next ? ` (before ${next.role}${next.name ? ` "${next.name.slice(0, 40)}"` : ''})` : ''}`);
    }
    if (l.role === 'radio' && !stack.some((a) => a.role === 'radiogroup' || a.role === 'group')) found['1.3.1'].push(`radio "${l.name}" outside a radio group`);
    if (l.role === 'table') {
      const inside = [];
      for (let j = i + 1; j < lines.length && lines[j].depth > l.depth; j++) inside.push(lines[j].role);
      if (inside.includes('cell') && !inside.includes('columnheader') && !inside.includes('rowheader')) found['1.3.1'].push(`table "${l.name}" without headers`);
    }
    stack.push(l);
  });
  for (const k of Object.keys(found)) found[k] = [...new Set(found[k])];
  return found;
}

/** In the page: fields marked invalid, and whether their error text is associated. */
function invalidFields() {
  const out = { associated: 0, missing: [] };
  for (const el of document.querySelectorAll('[aria-invalid="true"]')) {
    if (!(el instanceof HTMLElement) || el.closest('[aria-hidden="true"]')) continue;
    // The error can sit on the field or on its group (a checkbox group's
    // fieldset describes all its boxes).
    const holders = [el, el.closest('fieldset, [role=group], [role=radiogroup]')].filter(Boolean);
    const ids = holders.flatMap((h) => `${h.getAttribute('aria-describedby') ?? ''} ${h.getAttribute('aria-errormessage') ?? ''}`.split(/\s+/)).filter(Boolean);
    const text = ids.map((id) => document.getElementById(id)?.textContent?.trim() ?? '').join(' ').trim();
    if (text) out.associated++;
    else out.missing.push(`${el.tagName.toLowerCase()}${el.getAttribute('aria-label') ? ` "${el.getAttribute('aria-label')}"` : el.id ? `#${el.id}` : ''} is invalid with no associated error text`);
  }
  // A field that put a bad value back (ColorPicker's hex) isn't invalid any
  // more, but its error message (role=alert) is still attached and shown.
  for (const el of document.querySelectorAll('[aria-describedby]:not([aria-invalid="true"])')) {
    if (el.closest('[aria-hidden="true"]')) continue;
    const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    if (ids.some((id) => { const t = document.getElementById(id); return t?.getAttribute('role') === 'alert' && t.textContent?.trim(); })) out.associated++;
  }
  return out;
}

/** Runs in the page: svgs inside controls and links not hidden from AT. */
function unhiddenIcons() {
  const sel = 'button, a[href], summary, [role=button], [role=link], [role=tab], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], [role=checkbox], [role=radio], [role=switch]';
  const hiddenWithin = (n, stop) => {
    for (; n && n !== stop.parentElement; n = n.parentElement) {
      if (n.getAttribute('aria-hidden') === 'true' || ['presentation', 'none'].includes(n.getAttribute('role') ?? '')) return true;
    }
    return false;
  };
  const out = [];
  for (const c of document.querySelectorAll(sel)) {
    if (c.closest('[aria-hidden="true"], [inert]')) continue;
    for (const svg of c.querySelectorAll('svg')) {
      if (svg.parentElement?.closest('svg')) continue; // nested svg: judged by the outer one
      if (hiddenWithin(svg, c) || svg.getAttribute('aria-label') || svg.getAttribute('aria-labelledby') || svg.querySelector(':scope > title')) continue;
      const name = (c.getAttribute('aria-label') || c.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      out.push(`icon not aria-hidden inside ${c.getAttribute('role') || c.tagName.toLowerCase()} "${name}"`);
      break;
    }
  }
  return [...new Set(out)];
}

/**
 * Runs in the page: ARIA states that don't match what's on screen, and
 * elements that take focus or keys without a role (4.1.2).
 */
function ariaStates() {
  const out = [];
  const rendered = (el) => {
    if (!el || !el.isConnected || el.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
    if (!el.getClientRects().length) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0;
  };
  // Shown = rendered and bigger than a visually hidden box (an sr-only popup
  // isn't "shown" to a sighted user either).
  const shown = (el) => {
    if (!rendered(el)) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const text = (el) => (el?.textContent ?? '').trim().replace(/\s+/g, ' ');
  const nameOf = (el) => {
    const by = el.getAttribute('aria-labelledby');
    if (by) return by.split(/\s+/).map((id) => text(document.getElementById(id))).join(' ').trim();
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').trim();
    if (el.labels?.length) return [...el.labels].map(text).join(' ');
    return text(el);
  };
  const NATIVE_ROLE = { BUTTON: 'button', A: 'link', SELECT: 'combobox', TEXTAREA: 'textbox', SUMMARY: 'button' };
  const roleOf = (el) => el.getAttribute('role') || NATIVE_ROLE[el.tagName] || (el.tagName === 'INPUT' ? 'textbox' : el.tagName.toLowerCase());
  const label = (el) => `${roleOf(el)} "${nameOf(el).slice(0, 40)}"`;
  const ids = (el, attr) => (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean);

  for (const el of document.querySelectorAll('[aria-expanded]')) {
    if (!rendered(el)) continue;
    const expanded = el.getAttribute('aria-expanded');
    const combobox = roleOf(el) === 'combobox';
    const controls = ids(el, 'aria-controls');
    const targets = controls.map((id) => [id, document.getElementById(id)]);
    if (expanded === 'true') {
      if (!controls.length) {
        // A disclosure may leave aria-controls out; a combobox's popup must be named.
        if (combobox) out.push(`${label(el)} is expanded but has no aria-controls (its popup isn't linked)`);
        continue;
      }
      const missing = targets.filter(([, t]) => !t).map(([id]) => `#${id}`);
      if (missing.length) out.push(`${label(el)}: aria-controls points to ${missing.join(', ')}, which doesn't exist`);
      const present = targets.filter(([, t]) => t);
      if (present.length && !present.some(([, t]) => shown(t))) out.push(`${label(el)} is aria-expanded="true" but its popup ${present.map(([id]) => `#${id}`).join(', ')} is hidden`);
      // aria-haspopup names the popup's role (true = menu); a wrapper may hold it.
      const has = el.getAttribute('aria-haspopup') ?? (combobox ? 'listbox' : '');
      const want = has === 'true' ? 'menu' : has;
      if (['menu', 'listbox', 'tree', 'grid', 'dialog'].includes(want) && el.hasAttribute('aria-haspopup')) {
        const popups = present.map(([, t]) => t).filter(shown);
        const roleIn = (t) => roleOf(t) === want || (want === 'dialog' && roleOf(t) === 'alertdialog') || t.querySelector(`[role=${want}]`);
        if (popups.length && !popups.some(roleIn)) out.push(`${label(el)} has aria-haspopup="${has}" but its popup is a ${roleOf(popups[0])}`);
      }
    } else if (expanded === 'false') {
      // Popups only: a "Show more" button controls text that is shown clamped,
      // a sidebar toggle a rail that stays on screen collapsed.
      const popupTrigger = combobox || (el.hasAttribute('aria-haspopup') && el.getAttribute('aria-haspopup') !== 'false');
      const POPUP_ROLES = ['listbox', 'menu', 'dialog', 'alertdialog', 'grid', 'tree', 'tooltip'];
      const open = targets.filter(([, t]) => t && shown(t) && (popupTrigger || POPUP_ROLES.includes(roleOf(t)))).map(([id]) => `#${id}`);
      if (open.length) out.push(`${label(el)} is aria-expanded="false" but its popup ${open.join(', ')} is shown`);
    }
  }
  for (const el of document.querySelectorAll('[aria-activedescendant]')) {
    if (!rendered(el)) continue;
    const id = el.getAttribute('aria-activedescendant');
    if (id && !document.getElementById(id)) out.push(`${label(el)}: aria-activedescendant points to #${id}, which doesn't exist`);
  }

  // Takes focus or handles keys, but has no role: a chip, a card, a row made
  // focusable. React keeps handlers in a props object on the node; any other
  // library's show as on* attributes.
  const INTERACTIVE = 'a[href], button, input, select, textarea, summary, iframe, audio, video, [contenteditable=true], [contenteditable=""]';
  const handlers = (el) => {
    const key = Object.keys(el).find((k) => k.startsWith('__reactProps$'));
    const props = key ? el[key] : {};
    return ['onKeyDown', 'onKeyUp', 'onKeyPress'].some((h) => typeof props[h] === 'function') || el.hasAttribute('onkeydown');
  };
  for (const el of document.querySelectorAll('body [tabindex]')) {
    if (!(el instanceof HTMLElement) || el.matches(INTERACTIVE) || el.hasAttribute('role') || !rendered(el)) continue;
    if (!['DIV', 'SPAN', 'LI', 'P', 'I', 'B', 'EM', 'STRONG', 'LABEL'].includes(el.tagName)) continue;
    // (Key handlers on a plain wrapper without tabindex usually catch keys
    // bubbling up from a real control inside it: not counted.)
    // A scrollable box is made focusable so keyboard users can scroll it
    // (axe's scrollable-region-focusable): fine without a role.
    const cs = getComputedStyle(el);
    if (/(auto|scroll)/.test(cs.overflowY + cs.overflowX)) continue;
    // Without its own key handling it's a focus target (a panel focus moves
    // to, truncated text that shows its tooltip on focus, a toast): announced
    // by its content, fine. With it, it is a widget — and needs a role.
    if (!handlers(el)) continue;
    out.push(`focusable ${el.tagName.toLowerCase()} "${text(el).slice(0, 40)}" has no role`);
  }
  return [...new Set(out)];
}

async function checkStory(page, story) {
  await page.goto(`${URL_BASE}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'load' });
  await page.waitForSelector('#storybook-root > *', { timeout: 10000 }).catch(() => {});
  await page
    .waitForFunction(() => ['finished', 'played', 'completed', 'errored', 'aborted'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase), null, { timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(300);
  const snapshot = (await page.locator('body').ariaSnapshot({ timeout: 15000 }))
    .split('\n')
    .filter((l) => !NOISE.test(l))
    .join('\n');
  const found = checkTree(parse(snapshot));
  const invalid = await page.evaluate(invalidFields);
  found['1.1.1'].push(...(await page.evaluate(unhiddenIcons)));
  found['4.1.2'].push(...(await page.evaluate(ariaStates)));
  const expect = FIXTURES ? await page.evaluate(() => window.__STORYBOOK_PREVIEW__?.currentRender?.story?.parameters?.a11y?.expect?.tree) : undefined;
  return { snapshot, found: { ...found, '3.3.1': invalid.missing }, errorsShown: invalid.associated, expect };
}

const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { components: {} };
const results = new Map();
const snapshots = new Map();
const browser = await chromium.launch();
const queue = [...stories];
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    const open = () => browser.newPage({ viewport: { width: 1200, height: 800 } });
    let page = await open();
    for (let story = queue.shift(); story; story = queue.shift()) {
      const name = groupOf(story);
      if (!name) continue;
      const row = results.get(name) ?? { stories: 0, errors: 0, errorsShown: 0, '1.1.1': [], '1.3.1': [], '4.1.2': [], '3.3.1': [] };
      if (FIXTURES) row.id = story.id;
      results.set(name, row);
      row.stories++;
      try {
        const r = await checkStory(page, story);
        for (const k of ['1.1.1', '1.3.1', '4.1.2', '3.3.1']) for (const f of r.found[k]) row[k].push(FIXTURES ? f : `${story.name}: ${f}`);
        row.errorsShown += r.errorsShown;
        row.expect = r.expect;
        const list = snapshots.get(name) ?? [];
        list.push({ id: story.id, name: story.name, snapshot: r.snapshot });
        snapshots.set(name, list);
      } catch (error) {
        // A crashed page takes the rest of this worker's queue with it: retry
        // the story once on a fresh page.
        if (/crash|closed/i.test(String(error))) {
          await page.close().catch(() => {});
          page = await open();
          try {
            const r = await checkStory(page, story);
            for (const k of ['1.1.1', '1.3.1', '4.1.2', '3.3.1']) for (const f of r.found[k]) row[k].push(FIXTURES ? f : `${story.name}: ${f}`);
            row.errorsShown += r.errorsShown;
            row.expect = r.expect;
            const list = snapshots.get(name) ?? [];
            list.push({ id: story.id, name: story.name, snapshot: r.snapshot });
            snapshots.set(name, list);
            continue;
          } catch (again) {
            error = again;
          }
        }
        row.errors++;
        console.error(`${story.id}: ${String(error).split('\n')[0]}`);
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
    const got = ['1.1.1', '1.3.1', '4.1.2', '3.3.1'].flatMap((k) => r[k].map((f) => `${k}: ${f}`));
    const want = r.expect;
    const problems = [];
    if (r.errors) problems.push("story didn't load");
    if (!Array.isArray(want)) problems.push('no parameters.a11y.expect.tree');
    else {
      for (const w of want) if (!got.some((g) => g.includes(w))) problems.push(`missed: ${w}`);
      for (const g of got) if (!want.some((w) => g.includes(w))) problems.push(`unexpected: ${g}`);
    }
    if (problems.length) bad++;
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${name}${problems.map((p) => `\n       ${p}`).join('')}`);
  }
  console.log(`a11y tree fixtures: ${results.size - bad}/${results.size} as expected`);
  if (bad || !results.size) process.exitCode = 1;
}
if (!CI && !FIXTURES) {
  fs.mkdirSync(TREE_DIR, { recursive: true });
  for (const [name, list] of snapshots) {
    list.sort((a, b) => a.id.localeCompare(b.id));
    const body = list.map((s) => `# ${s.name} (${s.id})\n${s.snapshot}\n`).join('\n');
    fs.writeFileSync(path.join(TREE_DIR, `${name}.yml`), `# Accessibility tree per story. Generated by scripts/a11y-tree.mjs. Do not edit.\n\n${body}`);
  }
  const components = ONLY ? { ...prev.components } : {};
  for (const [name, row] of [...results].sort(([a], [b]) => a.localeCompare(b))) components[name] = row;
  fs.writeFileSync(
    OUT,
    JSON.stringify({ $comment: 'Generated by scripts/a11y-tree.mjs. Do not edit.', date: new Date().toISOString().slice(0, 10), components }, null, 2) + '\n',
  );
}
if (FIXTURES) process.exit();
const failing = [...results].filter(([, r]) => ['1.1.1', '1.3.1', '4.1.2', '3.3.1'].some((k) => r[k].length));
console.log(`a11y tree: ${stories.length} stories, ${results.size} components, ${failing.length} with findings${CI ? '' : ' → a11y/tree.json'}`);
for (const [name, r] of failing) for (const k of ['1.1.1', '1.3.1', '4.1.2', '3.3.1']) for (const f of r[k]) console.log(`  ${k} ${name} — ${f}`);
if (CI) {
  const errors = [...results].reduce((n, [, r]) => n + r.errors, 0);
  const lines = failing.flatMap(([name, r]) => ['1.1.1', '1.3.1', '4.1.2', '3.3.1'].flatMap((k) => r[k].map((f) => `- ${k} **${name}** — ${f}`)));
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### Accessibility tree\n\n${stories.length} stories, ${failing.length} component(s) with findings, ${errors} story load error(s).\n\n${lines.join('\n')}\n`,
    );
  }
  // As GitHub annotations too: they show on the run page and in the API.
  for (const l of lines) console.log(`::error title=a11y-tree::${l.replace(/[\r\n]+/g, ' ')}`);
  if (failing.length || errors) process.exitCode = 1;
}
