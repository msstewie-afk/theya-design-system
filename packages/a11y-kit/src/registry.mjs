/**
 * The check registry: every check the kit knows, from every layer, with the
 * WCAG 2.2 criteria it gives evidence for, how deep it goes and what it is
 * calibrated on. One source for the "list of checks" a team reads, the
 * coverage per criterion, and the comparison with any other checklist.
 *
 * Sources:
 * - registry/wcag22.json: the 55 A/AA criteria and where each is judged.
 * - registry/checks.json: the kit's own checks (scripts, the code reader,
 *   people), hand-maintained.
 * - axe-core's own rule metadata (the version the design system runs): every
 *   rule tagged with a WCAG 2.x A/AA criterion, with its WCAG tags (all of
 *   them), whether it runs by default, its ACT rule ids.
 * - the design system's axe calibration (written by `a11y-kit calibrate-axe`,
 *   config `axeCalibrationOut`): did each axe rule catch its known violation
 *   the way that design system's CI runs axe.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

/** axe-core as the project runs it: resolved from `from` (the design system's package), else the kit's own. */
export function loadAxe(from) {
  const req = createRequire(path.join(from ?? KIT, 'package.json'));
  for (const spec of ['axe-playwright', '@axe-core/playwright', null]) {
    try {
      const base = spec ? path.dirname(req.resolve(spec)) : from ?? KIT;
      const file = req.resolve('axe-core/axe.js', { paths: [base] });
      return { axe: req(file), file };
    } catch {}
  }
  const file = createRequire(path.join(KIT, 'package.json')).resolve('axe-core/axe.js');
  return { axe: createRequire(path.join(KIT, 'package.json'))(file), file };
}

/** "wcag412" → "4.1.2"; level tags (wcag2a, wcag21aa…) are not criteria. */
const scOf = (tags) =>
  tags
    .map((t) => /^wcag(\d)(\d)(\d+)$/.exec(t))
    .filter(Boolean)
    .map((m) => `${m[1]}.${m[2]}.${m[3]}`);

export function buildRegistry({ from, calibrationStories = [], axeCalibration } = {}) {
  const wcag = read(path.join(KIT, 'registry/wcag22.json')).criteria;
  const inScope = new Set(wcag.map((c) => c.id));
  const own = read(path.join(KIT, 'registry/checks.json')).checks;
  const { axe } = loadAxe(from);
  const cal = axeCalibration && fs.existsSync(axeCalibration) ? read(axeCalibration) : null;

  const axeChecks = axe._audit.rules
    .map((r) => {
      const sc = scOf(r.tags).filter((s) => inScope.has(s));
      if (!sc.length) return null;
      const runs = r.tags.includes('experimental') ? 'experimental' : r.tags.includes('deprecated') ? 'deprecated' : r.enabled === false ? 'off by default' : 'default';
      const meta = axe.getRules([r.id])[0] ?? axe.getRules().find((x) => x.ruleId === r.id);
      // A rule that only sees the whole page (calibration says so) belongs to a product's page scan.
      const pageLevel = r.pageLevel || cal?.rules?.[r.id]?.result === 'page level';
      return {
        id: `axe.${r.id}`,
        tool: `axe-core ${axe.version}`,
        stage: pageLevel ? 'page' : 'component',
        sc,
        depth: 'part',
        where: pageLevel ? 'product' : 'ds',
        how: meta?.help ?? r.id,
        runs,
        impact: r.impact ?? null,
        act: r.actIds ?? [],
        calibration: cal?.rules?.[r.id] ?? null,
      };
    })
    .filter(Boolean);

  // Own checks: their calibration must name stories that exist.
  const storyNames = calibrationStories.flatMap((f) =>
    fs.existsSync(f) ? [...fs.readFileSync(f, 'utf8').matchAll(/\bname:\s*(['"])(.+?)\1/g)].map((m) => m[2]) : [],
  );
  const problems = [];
  for (const c of own) {
    for (const s of c.sc) if (!inScope.has(s) && s !== '2.3.3') problems.push(`${c.id}: ${s} is not a WCAG 2.2 A/AA criterion`);
    if (storyNames.length) for (const p of c.calibration) if (!storyNames.some((n) => n.startsWith(p))) problems.push(`${c.id}: no calibration story named "${p}…"`);
  }

  const checks = [...own, ...axeChecks];
  const coverage = wcag.map((c) => {
    const by = checks.filter((k) => k.sc.includes(c.id));
    const auto = by.filter((k) => k.stage !== 'manual' && k.stage !== 'pr' && k.depth !== 'advisory' && (k.runs ?? 'default') !== 'deprecated');
    const calibrated = auto.filter((k) => (k.id.startsWith('axe.') ? k.calibration?.result === 'caught' : k.calibration.length > 0));
    const level = auto.some((k) => k.depth === 'full') ? 'automated' : auto.length ? 'partly' : 'manual';
    return { ...c, checks: by.map((k) => k.id), automation: level, calibrated: calibrated.map((k) => k.id), uncalibrated: auto.filter((k) => !calibrated.includes(k)).map((k) => k.id) };
  });
  return { axeVersion: axe.version, wcag, checks, coverage, problems };
}

/** Another team's checklist ([{ id, sc?, where? }]): what maps to the registry, what doesn't, which criteria it leaves out. */
export function compareList(reg, list) {
  const byAxe = new Map(reg.checks.filter((c) => c.id.startsWith('axe.')).map((c) => [c.id.slice(4), c]));
  const rows = list.map((row) => {
    // "1.4.3-color-contrast" or "color-contrast": the axe rule id after an optional criterion prefix.
    const rule = row.id.replace(/^\d\.\d+\.\d+-/, '');
    const hit = byAxe.get(rule) ?? reg.checks.find((c) => c.id === row.id || c.id.endsWith(`.${rule}`));
    const sc = row.sc ?? (/^(\d\.\d+\.\d+)-/.exec(row.id) ? [/^(\d\.\d+\.\d+)-/.exec(row.id)[1]] : []);
    // A criterion-level row ("2.1.2-tab-trap"): which registry checks cover the same criteria.
    const cover = hit ? [] : reg.checks.filter((c) => c.sc.some((x) => sc.includes(x))).map((c) => c.id);
    return { ...row, sc, match: hit?.id ?? null, cover, missingSc: hit ? hit.sc.filter((s) => !sc.includes(s)) : [], runs: hit?.runs ?? null, calibration: hit?.calibration ?? null };
  });
  const listSc = new Set(rows.flatMap((r) => r.sc));
  return {
    rows,
    unmatched: rows.filter((r) => !r.match),
    notDefault: rows.filter((r) => r.runs && r.runs !== 'default'),
    lostSc: rows.filter((r) => r.missingSc.length),
    criteriaMissing: reg.wcag.filter((c) => !listSc.has(c.id)).map((c) => `${c.id} ${c.name}`),
    registryOnly: reg.checks.filter((c) => !rows.some((r) => r.match === c.id) && c.stage !== 'manual').map((c) => c.id),
  };
}
