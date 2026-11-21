/**
 * The audit: an agent re-checks what the matrix takes on trust. It never
 * changes code; it proposes records, and a person decides on what it can't
 * settle. Two kinds of work, both found deterministically here:
 *
 * - stale reviews: a manual review ("pass", "n/a" … with a date) of a
 *   criterion for a component whose source changed after that date. The
 *   agent reads the change since the review and says whether the review
 *   still holds.
 * - open cells: criteria the matrix marks untested or partial. The agent
 *   reviews the component's code for them.
 *
 * Its answers (audit.json) are checked by checkAudit(): an item it was not
 * given, an unknown verdict, a missing reason or a "broken" without
 * evidence is dropped. applyAudit() writes the surviving answers into the
 * hand-kept records (config audit.apply), dated and signed "Claude (audit)",
 * so the matrix shows them; "broken" and "unsure" go to a person as issues.
 * sample() picks applied records for a person to re-check: that is the
 * auditor's measured precision.
 */
import crypto from 'node:crypto';

export const VERDICTS = {
  holds: 'The review still holds',
  broken: 'No longer holds',
  pass: 'Passes',
  fail: 'Fails',
  unsure: 'Needs a person or a run',
};

/**
 * The work queue. `reviews`: { component: { sc: { result, date, by, note } } };
 * `lastChange(files, since)`: { date, diff } of the files after `since`, or
 * null when nothing changed; `files(component)`: its source files;
 * `open`: [{ component, sc, status }] from the matrix.
 */
export function auditQueue({ reviews, files, lastChange, open = [], only = null, limit = Infinity }) {
  const items = [];
  for (const [component, byCriterion] of Object.entries(reviews)) {
    if (only && !only.includes(component)) continue;
    const src = files(component);
    if (!src?.length) continue;
    for (const [sc, r] of Object.entries(byCriterion)) {
      if (!r?.date) continue;
      const change = lastChange(src, r.date);
      if (!change) continue;
      items.push({ id: `${component}:${sc}:review`, kind: 'stale', component, sc, files: src, review: r, changedOn: change.date, diff: change.diff });
    }
  }
  for (const o of open) {
    if (only && !only.includes(o.component)) continue;
    items.push({ id: `${o.component}:${o.sc}:${o.status}`, kind: 'open', component: o.component, sc: o.sc, status: o.status, files: files(o.component) ?? [] });
  }
  // Components together, so one agent run reads one component once.
  items.sort((a, b) => a.component.localeCompare(b.component) || a.sc.localeCompare(b.sc, 'en', { numeric: true }));
  return items.slice(0, limit);
}

/** Split a queue into batches of whole components, at most `size` items each (a component bigger than that is its own batch). */
export function batches(items, size) {
  const out = [];
  let cur = [];
  for (const [, group] of Object.entries(Object.groupBy(items, (i) => i.component))) {
    if (cur.length && cur.length + group.length > size) {
      out.push(cur);
      cur = [];
    }
    cur.push(...group);
  }
  if (cur.length) out.push(cur);
  return out;
}

const NEEDS = {
  holds: ['reason'],
  broken: ['reason', 'evidence'],
  pass: ['reason', 'evidence'],
  fail: ['reason', 'evidence'],
  unsure: ['reason'],
};

/** The agent's answers against the queue it was given. */
export function checkAudit(data, queue) {
  const byId = new Map(queue.map((i) => [i.id, i]));
  const kept = [];
  const dropped = [];
  const seen = new Set();
  for (const a of Array.isArray(data?.items) ? data.items : []) {
    const item = byId.get(a.id);
    if (!item) dropped.push({ ...a, why: 'not an item it was given' });
    else if (seen.has(a.id)) dropped.push({ ...a, why: 'answered twice' });
    else if (!NEEDS[a.verdict]) dropped.push({ ...a, why: `unknown verdict "${a.verdict}"` });
    else if (item.kind === 'stale' && !['holds', 'broken', 'unsure'].includes(a.verdict)) dropped.push({ ...a, why: `a stale review is holds, broken or unsure, not ${a.verdict}` });
    else if (item.kind === 'open' && !['pass', 'fail', 'unsure'].includes(a.verdict)) dropped.push({ ...a, why: `an open cell is pass, fail or unsure, not ${a.verdict}` });
    else if (NEEDS[a.verdict].some((k) => !String(a[k] ?? '').trim())) dropped.push({ ...a, why: `${a.verdict} needs ${NEEDS[a.verdict].join(' and ')}` });
    else {
      seen.add(a.id);
      kept.push({ ...a, item });
    }
  }
  const unanswered = queue.filter((i) => !seen.has(i.id)).map((i) => i.id);
  return { kept, dropped, unanswered };
}

/**
 * New hand-kept records from the kept answers: holds → the old result,
 * re-dated; pass → "pass"; fail and broken → "fail". unsure is not written
 * (it becomes an issue). Returns { component: { sc: record } }.
 */
export function auditRecords(kept, today) {
  const out = {};
  for (const a of kept) {
    if (a.verdict === 'unsure') continue;
    const result = a.verdict === 'holds' ? a.item.review.result : a.verdict === 'pass' ? 'pass' : 'fail';
    const prefix = a.verdict === 'holds' ? `Re-checked against the changes since ${a.item.review.date}: ` : '';
    (out[a.item.component] ??= {})[a.item.sc] = { result, date: today, by: 'Claude (audit)', note: `${prefix}${a.reason}${a.evidence ? ` ${a.evidence}` : ''}`.trim() };
  }
  return out;
}

/** Deterministic sample (seeded by `seed`) of `n` audit records for a person to re-check. */
export function sample(records, n, seed) {
  const all = Object.entries(records).flatMap(([component, bySc]) => Object.entries(bySc).filter(([, r]) => r.by === 'Claude (audit)').map(([sc, r]) => ({ component, sc, ...r })));
  const key = (r) => crypto.createHash('sha1').update(`${seed}|${r.component}|${r.sc}`).digest('hex');
  return all.sort((a, b) => key(a).localeCompare(key(b))).slice(0, n);
}

export function auditIssueBody(a, run) {
  return [
    `**${a.item.sc}** · ${a.item.component} · ${VERDICTS[a.verdict]}`,
    '',
    a.item.kind === 'stale' ? `Recorded: ${a.item.review.result} on ${a.item.review.date} (${a.item.review.by}): ${a.item.review.note ?? ''}` : `Matrix: ${a.item.status}.`,
    '',
    a.reason,
    a.evidence ? `\n${a.evidence}` : '',
    a.check ? `\nRun: \`${a.check}\`` : '',
    '',
    'Close as **completed** if the auditor was right, **not planned** if it was wrong.',
    run ? `\n[Audit run](${run})` : '',
    '',
    `<!-- a11y-audit:${crypto.createHash('sha1').update(a.id).digest('hex').slice(0, 12)} -->`,
  ].join('\n');
}

export function renderAudit({ kept, dropped, unanswered }) {
  const count = (v) => kept.filter((a) => a.verdict === v).length;
  const lines = [
    `### Accessibility audit — ${kept.length} answered: ${Object.keys(VERDICTS).map((v) => `${count(v)} ${v}`).join(', ')}; ${dropped.length} dropped, ${unanswered.length} unanswered`,
    '',
  ];
  for (const v of ['broken', 'fail', 'unsure']) {
    const list = kept.filter((a) => a.verdict === v);
    if (!list.length) continue;
    lines.push(`**${VERDICTS[v]}** (${list.length})`, '');
    for (const a of list) lines.push(`- **${a.item.component} ${a.item.sc}** — ${a.reason}`);
    lines.push('');
  }
  if (dropped.length) lines.push('<details><summary>Dropped</summary>', '', ...dropped.map((d) => `- ${d.id ?? '?'} — ${d.why}`), '', '</details>', '');
  return lines.join('\n');
}
