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
 *   button: VoiceOver reads the button's name).
 * - 1.3.1 Info and Relationships: every table has column or row headers,
 *   every radio is inside a radio group, every form field has a name (its
 *   label is associated).
 * - 3.3.1 Error Identification: every field marked aria-invalid points to a
 *   non-empty error text with aria-describedby or aria-errormessage (on the
 *   field or its group). A component counts as checked for 3.3.1 when at
 *   least one of its stories shows an error that way, or a field described
 *   by a shown error message (role=alert).
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
const OUT = path.join(ROOT, 'a11y/tree.json');
const TREE_DIR = path.join(ROOT, 'a11y/tree');

// The Playwright that @storybook/test-runner ships with (same as CI).
const { chromium } = require(require.resolve('playwright', { paths: [path.dirname(require.resolve('@storybook/test-runner'))] }));

const index = await (await fetch(`${URL_BASE}/index.json`)).json();
const stories = Object.values(index.entries).filter((e) => e.type === 'story' && (!ONLY || e.title.includes(ONLY)));

/** Component name per Storybook title, from spec/index.json (and patterns). */
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'spec/index.json'), 'utf8'));
const componentOf = new Map();
for (const c of spec.components) {
  const s = JSON.parse(fs.readFileSync(path.join(ROOT, c.spec), 'utf8'));
  if (s.storybook?.title) componentOf.set(s.storybook.title, c.name);
}
for (const f of fs.readdirSync(path.join(ROOT, 'src/components/blocks'), { recursive: true })) {
  if (!f.endsWith('.stories.tsx')) continue;
  const title = /\btitle:\s*'([^']+)'/.exec(fs.readFileSync(path.join(ROOT, 'src/components/blocks', f), 'utf8'))?.[1];
  if (title) componentOf.set(title, title.split('/').pop());
}

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
  return { snapshot, found: { ...found, '3.3.1': invalid.missing }, errorsShown: invalid.associated };
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
      const name = componentOf.get(story.title);
      if (!name) continue;
      const row = results.get(name) ?? { stories: 0, errors: 0, errorsShown: 0, '1.1.1': [], '1.3.1': [], '4.1.2': [], '3.3.1': [] };
      results.set(name, row);
      row.stories++;
      try {
        const r = await checkStory(page, story);
        for (const k of ['1.1.1', '1.3.1', '4.1.2', '3.3.1']) for (const f of r.found[k]) row[k].push(`${story.name}: ${f}`);
        row.errorsShown += r.errorsShown;
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
            for (const k of ['1.1.1', '1.3.1', '4.1.2', '3.3.1']) for (const f of r.found[k]) row[k].push(`${story.name}: ${f}`);
            row.errorsShown += r.errorsShown;
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
const failing = [...results].filter(([, r]) => ['1.1.1', '1.3.1', '4.1.2', '3.3.1'].some((k) => r[k].length));
console.log(`a11y tree: ${stories.length} stories, ${results.size} components, ${failing.length} with findings → a11y/tree.json`);
for (const [name, r] of failing) for (const k of ['1.1.1', '1.3.1', '4.1.2', '3.3.1']) for (const f of r[k]) console.log(`  ${k} ${name} — ${f}`);
