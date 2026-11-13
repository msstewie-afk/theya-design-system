#!/usr/bin/env node
/**
 * What to pass with a screen reader next (docs/pipelines/screen-reader-pass.md).
 * Reads spec/a11y.json (the matrix) and git history, prints three lists:
 *
 * 1. Required: a matrix cell that only a recorded screen-reader pass can
 *    verify (4.1.3 Status Messages) is untested or partial.
 * 2. Stale: the component has a pass, but lines of its accessibility tree
 *    (a11y/tree/<Component>.yml) changed or went away after the pass date —
 *    what the screen reader says may have changed with them. Lines only
 *    added (new stories) don't count.
 * 3. Recommended: composite widgets and overlays with no pass at all. The
 *    tree covers their names and roles; only a person hears whether the
 *    announcements make sense.
 *
 * Each line names the checklist to follow: a11y/checklist/<Component>.md.
 *
 *   node scripts/a11y-sr-queue.mjs            (all three lists)
 *   node scripts/a11y-sr-queue.mjs --limit 10 (at most 10 per list)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const LIMIT = Number(arg('limit', Infinity));

const matrix = JSON.parse(fs.readFileSync(path.join(ROOT, 'spec/a11y.json'), 'utf8'));
const criteria = JSON.parse(fs.readFileSync(path.join(ROOT, 'a11y/criteria.json'), 'utf8')).criteria;
// Criteria whose evidence is a screen-reader pass and nothing else.
const SR_ONLY = criteria.filter((c) => (c.evidence ?? []).some((e) => e === 'screenReader')).map((c) => c.id);

/**
 * Lines of a tree file changed or removed since the end of `date` (added
 * lines are new stories: nothing a past pass heard has changed). 0 when the
 * file is new since then or unchanged.
 */
const changedSince = (file, date) => {
  try {
    const base = execFileSync('git', ['rev-list', '-1', `--before=${date} 23:59:59`, 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
    if (!base) return 0;
    const stat = execFileSync('git', ['diff', '--numstat', base, 'HEAD', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
    return stat ? Number(stat.split(/\s+/)[1]) || 0 : 0;
  } catch {
    return 0;
  }
};

const required = [];
const stale = [];
const recommended = [];
for (const c of [...matrix.components, ...(matrix.patterns ?? [])]) {
  const passes = (c.screenReader ?? []).filter((p) => p.result === 'pass');
  const lastPass = passes.map((p) => p.date).sort().at(-1) ?? '';
  const cells = SR_ONLY.filter((id) => ['untested', 'partial'].includes(c.wcag?.[id]));
  const checklist = `a11y/checklist/${c.name}.md`;
  if (cells.length) required.push(`${c.name} — ${cells.join(', ')} ${c.wcag[cells[0]]} → ${checklist}`);
  if (lastPass) {
    const changed = changedSince(`a11y/tree/${c.name}.yml`, lastPass);
    if (changed) stale.push(`${c.name} — passed ${lastPass}, ${changed} line(s) of its tree changed since → ${checklist}`);
  } else if (!cells.length && (c.traits ?? []).some((t) => ['composite', 'overlay', 'status'].includes(t))) {
    recommended.push(`${c.name} (${(c.traits ?? []).filter((t) => ['composite', 'overlay', 'status'].includes(t)).join(', ')}) → ${checklist}`);
  }
}

const print = (title, list, note) => {
  console.log(`\n${title}: ${list.length}${note ? ` (${note})` : ''}`);
  for (const line of list.slice(0, LIMIT)) console.log(`  ${line}`);
  if (list.length > LIMIT) console.log(`  … and ${list.length - LIMIT} more`);
};
print('Required', required, `cells only a screen-reader pass verifies: ${SR_ONLY.join(', ')}`);
print('Stale', stale, 'the accessibility tree changed after the last pass');
print('Recommended', recommended, 'composite widgets, overlays, status messages with no pass');
