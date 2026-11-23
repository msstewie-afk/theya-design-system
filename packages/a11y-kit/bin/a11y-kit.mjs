#!/usr/bin/env node
/**
 * a11y-kit — accessibility checks for a design system and the products built on it.
 *
 *   a11y-kit registry [--check]        the list of checks and the coverage per WCAG 2.2 criterion
 *   a11y-kit compare <checklist.json>  another checklist ([{ "id", "sc"?, "where"? }]) against the registry
 *   a11y-kit calibrate-axe [rule…]     one known violation per axe rule, run the way CI runs axe → axeCalibrationOut
 *   a11y-kit tree|auto|states|forced --url <storybook> [--only <title>] [--ci] [--shard i/n] [--fixtures] [--group title]
 *                                      the engine checks against a built Storybook (see each file in src/engine)
 *   a11y-kit contrast <fg> <bg> [--base <surface>] [--theme light|dark|all] [--brand <b,…>|all]
 *                                      WCAG contrast of two colours or tokens, from the design system's CSS (review.tokens)
 *   a11y-kit tokens [--ci]                               every configured token pair (review.tokens.pairs) in every theme and brand → tokensOut
 *   a11y-kit review-diff <from> <to> --out <file>        the change under review, limited to review.paths
 *   a11y-kit review-context --out <file>                 what the review agent is given besides the diff
 *   a11y-kit review-post --findings <file> --change <label> (--sha <sha> | --pr <n>) [--repo owner/name] [--run <url>] [--always] [--no-issues] [--dry-run]
 *                                      checks the agent's findings, opens issues, posts one comment (needs gh)
 *   a11y-kit review-precision [--repo owner/name]        how often the agent was right, from closed review issues (needs gh)
 *   a11y-kit review-case --list | review-case <id>       calibration cases (review.cases): list ids, or commit one onto HEAD
 *   a11y-kit review-score <id> --findings <file> --out <file>   the agent's answer on a case against the expected one
 *   a11y-kit review-report <dir> [--ids <json>] [--out f] the scores in <dir> as a table
 *   a11y-kit audit-queue --out <file> [--only A,B] [--limit n] [--batch n --batch-dir <dir>]
 *                                      stale reviews and open matrix cells for the auditor (config audit)
 *   a11y-kit audit-post --queue <file> --answers <file> --out <records.json> [--repo o/n] [--run url] [--no-issues] [--dry-run]
 *                                      checks the auditor's answers, opens issues for broken/fail/unsure, writes records
 *   a11y-kit audit-apply <records.json>   writes the records into the hand-kept ones (config audit.apply)
 *   a11y-kit audit-sample [--n 10] [--seed s] [--by <name> [--wrong "C sc, …"]]   a sample of audit records to re-check; --by records the verdict (precision)
 *   The agents' methods: review/agent.md (change review), review/auditor.md (audit).
 *
 * Reads a11y-kit.config.mjs from the current directory (the design system's package):
 *   export default {
 *     calibrationStories: ['src/test/a11y-fixtures.stories.tsx'],  // stories the own checks are calibrated on
 *     registryOut: 'a11y/registry.json',                          // the merged registry, for other tools
 *     listOut: '../../docs/a11y-checks',                         // + .md and .ru.md
 *     axeCalibrationOut: 'a11y/axe-calibration.json',            // calibrate-axe's results (the default)
 *     axe: {                                                      // how CI runs axe, for calibrate-axe
 *       tags: ['wcag2a', 'wcag2aa'],                              // runOnly tags; omit for every enabled rule
 *       enable: ['target-size'],                                  // rules switched on by name
 *       failImpacts: ['serious', 'critical'],                     // impacts that fail the build (default: all)
 *       root: '#storybook-root',                                  // the scan root ('document' for whole pages)
 *     },
 *     review: {                                                   // the change review (review/agent.md)
 *       paths: ['src/components', ':!*.stories.tsx'],             // git pathspecs (from the package) a change must touch
 *       read: ['../../CONTRIBUTING.md'],                          // documents the agent reads first
 *       notes: (root) => '…',                                     // accepted deviations and rules, as markdown
 *       tokens: { files: ['…/variables.css'], light: [':root'], dark: [':root', '[data-theme="dark"]'], page: 'background' },
 *     },
 *   }
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { buildRegistry, compareList } from '../src/registry.mjs';
import { renderList, renderCompare } from '../src/render.mjs';
import { calibrateAxe, writeCalibration } from '../src/calibrate-axe.mjs';
import { execFileSync } from 'node:child_process';
import { readCustomProperties, contrast } from '../src/tokens.mjs';
import { auditQueue, batches, checkAudit, auditRecords, sample, auditIssueBody, renderAudit } from '../src/audit.mjs';
import { renderContext, checkFindings, renderComment, issueBody, fingerprint, precision, KINDS, applyEdits, scoreCase, renderCalibration } from '../src/review.mjs';

// --cwd <dir>: run as if from the design system's package (the review agent calls the kit from the repository root).
{
  const i = process.argv.indexOf('--cwd');
  if (i > -1) {
    process.chdir(process.argv[i + 1]);
    process.argv.splice(i, 2);
  }
}

// The engine checks run on their own: `a11y-kit tree|auto|states|forced --url … [--only …] [--ci] [--fixtures]`.
const ENGINE = ['tree', 'auto', 'states', 'forced', 'code'];
if (ENGINE.includes(process.argv[2])) {
  const which = process.argv.splice(2, 1)[0];
  await import(`../src/engine/${which}.mjs`);
} else {
  await main();
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const CHECK = args.includes('--check');
  const cwd = process.cwd();
  const configFile = path.join(cwd, 'a11y-kit.config.mjs');
  const config = fs.existsSync(configFile) ? (await import(pathToFileURL(configFile).href)).default : {};
  const at = (p) => path.resolve(cwd, p);

  const axeCalibration = at(config.axeCalibrationOut ?? 'a11y/axe-calibration.json');
  const opt = (name) => {
    const i = args.indexOf(`--${name}`);
    return i > -1 ? args[i + 1] : undefined;
  };
  const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--check', '--dry-run', '--always', '--no-issues', '--list'].includes(args[i - 1])));

  // The review commands run in CI without installing dependencies: they read the committed registry.
  if (cmd?.startsWith('audit')) return audit(cmd, { config, cwd, at, opt, positional, DRY: args.includes('--dry-run'), NO_ISSUES: args.includes('--no-issues') });
  if (cmd?.startsWith('review') || cmd === 'contrast' || cmd === 'tokens') return review(cmd, { config, cwd, at, opt, positional, DRY: args.includes('--dry-run'), ALWAYS: args.includes('--always'), NO_ISSUES: args.includes('--no-issues') });

  const reg = buildRegistry({ from: cwd, calibrationStories: (config.calibrationStories ?? []).map(at), axeCalibration });

  if (cmd === 'registry') {
    const outputs = [];
    if (config.registryOut) outputs.push([at(config.registryOut), JSON.stringify({ $comment: 'Generated by a11y-kit registry. Do not edit.', axeVersion: reg.axeVersion, checks: reg.checks, coverage: reg.coverage }, null, 2) + '\n']);
    if (config.listOut) {
      outputs.push([at(`${config.listOut}.md`), renderList(reg, 'en')]);
      outputs.push([at(`${config.listOut}.ru.md`), renderList(reg, 'ru')]);
    }
    let stale = 0;
    for (const [file, text] of outputs) {
      if (CHECK) {
        if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) {
          console.error(`${path.relative(cwd, file)} is stale — run \`a11y-kit registry\``);
          stale++;
        }
      } else fs.writeFileSync(file, text);
    }
    const auto = reg.coverage.filter((c) => c.automation === 'automated').length;
    const part = reg.coverage.filter((c) => c.automation === 'partly').length;
    console.log(`a11y-kit registry: ${reg.checks.length} checks (axe-core ${reg.axeVersion}), ${reg.coverage.length} criteria: ${auto} automated, ${part} partly, ${reg.coverage.length - auto - part} manual${CHECK ? ' (checked)' : ''}`);
    for (const p of reg.problems) console.error(`  problem: ${p}`);
    if (stale || reg.problems.length) process.exit(1);
  } else if (cmd === 'compare') {
    const file = args.find((a) => !a.startsWith('--'));
    if (!file) throw new Error('a11y-kit compare <checklist.json>');
    console.log(renderCompare(compareList(reg, JSON.parse(fs.readFileSync(at(file), 'utf8')))));
  } else if (cmd === 'calibrate-axe') {
    const only = args.filter((a) => !a.startsWith('--'));
    const result = await calibrateAxe({ from: cwd, axe: config.axe, only });
    const file = writeCalibration(result, axeCalibration, only.length > 0);
    const by = {};
    for (const [id, r] of Object.entries(result.rules)) (by[r.result] ??= []).push(id);
    console.log(`a11y-kit calibrate-axe: axe-core ${result.axeVersion}, ${Object.keys(result.rules).length} rules → ${path.relative(cwd, file)}`);
    for (const [k, ids] of Object.entries(by)) console.log(`  ${k}: ${ids.length}${k === 'caught' ? '' : ` — ${ids.join(', ')}`}`);
    console.log('Run `a11y-kit registry` to put the results in the list of checks.');
  } else {
    console.log('a11y-kit registry [--check] | compare <checklist.json> | calibrate-axe [rule…] | tree|auto|states|forced … | contrast <fg> <bg> | review-diff | review-context | review-post | review-precision');
    process.exit(cmd ? 1 : 0);
  }
}

async function review(cmd, { config, cwd, at, opt, positional, DRY, ALWAYS, NO_ISSUES }) {
  const rc = config.review ?? {};
  const top = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' }).trim();
  const fromTop = (p) => path.relative(top, at(p)) || '.';
  const gh = (ghArgs, input) => execFileSync('gh', ghArgs, { cwd, encoding: 'utf8', input, maxBuffer: 64 << 20 });
  // owner/name: --repo, else the Actions environment, else the origin remote.
  const repoOf = () =>
    opt('repo') ??
    process.env.GITHUB_REPOSITORY ??
    /github\.com[:/]([^/]+\/[^/]+?)(\.git)?$/.exec(execFileSync('git', ['remote', 'get-url', 'origin'], { cwd, encoding: 'utf8' }).trim())?.[1];
  const registry = () => {
    const file = at(config.registryOut ?? 'a11y/registry.json');
    if (!fs.existsSync(file)) throw new Error(`${path.relative(cwd, file)} not found — run \`a11y-kit registry\` first`);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  };
  const write = (file, text) => {
    if (!file) throw new Error('--out <file> is required');
    fs.writeFileSync(path.resolve(file), text);
  };

  if (cmd === 'contrast') {
    const [fg, bg] = positional;
    if (!fg || !bg || !rc.tokens) throw new Error('a11y-kit contrast <fg> <bg> [--base <surface>] [--theme light|dark|all] [--brand <b>|all] (needs review.tokens in a11y-kit.config.mjs)');
    const themes = (opt('theme') ?? 'all') === 'all' ? ['light', 'dark'] : [opt('theme')];
    // Brands (product profiles): review.tokens.brands { list, light, dark } with {brand} in the selectors.
    const tb = rc.tokens.brands;
    const want = opt('brand');
    const brands = !want ? [null] : want === 'all' ? [null, ...(tb?.list ?? [])] : want.split(',');
    if (want && !tb) throw new Error('--brand needs review.tokens.brands in a11y-kit.config.mjs');
    for (const b of brands) {
      if (b && !tb.list.includes(b)) throw new Error(`unknown brand ${b} (${tb.list.join(', ')})`);
      for (const theme of themes) {
        const selectors = [...rc.tokens[theme], ...(b ? tb[theme].map((s) => s.replaceAll('{brand}', b)) : [])];
        const vars = readCustomProperties(rc.tokens.files.map(at), selectors);
        const label = `${b ?? rc.tokens.name ?? 'default'} ${theme}`;
        try {
          const r = contrast({ fg, bg, base: opt('base') ?? rc.tokens.page, vars });
          console.log(`${label}: ${r.ratio.toFixed(2)}:1 — ${fg} = ${r.fg.value} (shown ${r.fg.shown}) on ${bg} = ${r.bg.value} (shown ${r.bg.shown}, over ${r.base})`);
        } catch (e) {
          console.log(`${label}: unresolved — ${e.message}. Measure it rendered instead.`);
          process.exitCode = 2;
        }
      }
    }
  } else if (cmd === 'tokens') {
    // Token pairs × themes × brands, deterministic: the contrast every component inherits.
    const tk = rc.tokens;
    if (!tk?.pairs?.length) throw new Error('a11y-kit tokens: set review.tokens.pairs in a11y-kit.config.mjs');
    const CI = process.argv.includes('--ci');
    const variants = [null, ...(tk.brands?.list ?? [])].flatMap((b) => ['light', 'dark'].map((theme) => ({ b, theme })));
    const rows = [];
    for (const { b, theme } of variants) {
      const vars = readCustomProperties(tk.files.map(at), [...tk[theme], ...(b ? tk.brands[theme].map((s) => s.replaceAll('{brand}', b)) : [])]);
      for (const pair of tk.pairs.filter((x) => !x.theme || x.theme === theme))
        for (const bg of [].concat(pair.bg)) {
          const brand = b ?? tk.name ?? 'default';
          try {
            const r = contrast({ fg: pair.fg, bg, base: pair.base ?? tk.page, vars });
            rows.push({ brand, theme, what: pair.what, fg: pair.fg, bg, need: pair.need, ratio: Math.round(r.ratio * 100) / 100, fgValue: r.fg.shown, bgValue: r.bg.shown, pass: r.ratio >= pair.need });
          } catch (e) {
            rows.push({ brand, theme, what: pair.what, fg: pair.fg, bg, need: pair.need, error: e.message, pass: false });
          }
        }
    }
    const known = (r) => tk.known?.[`${r.fg} on ${r.bg}`]?.[r.brand]?.includes(r.theme);
    const fails = rows.filter((r) => !r.pass);
    const open = fails.filter((r) => !known(r));
    for (const r of fails) console.log(`${known(r) ? 'known ' : 'FAIL  '} ${r.brand} ${r.theme}: ${r.what} — ${r.fg} on ${r.bg} ${r.error ?? `${r.ratio.toFixed(2)}:1 < ${r.need}:1 (${r.fgValue} on ${r.bgValue})`}`);
    console.log(`a11y-kit tokens: ${rows.length} pairs in ${variants.length} theme variants — ${rows.length - fails.length} pass, ${fails.length - open.length} known, ${open.length} failing`);
    if (CI) {
      for (const r of open) console.log(`::error title=a11y-kit tokens::${r.brand} ${r.theme}: ${r.what} ${r.fg} on ${r.bg} ${r.ratio?.toFixed(2) ?? r.error}:1 < ${r.need}:1`);
      if (open.length) process.exitCode = 1;
    } else if (tk.out) {
      fs.writeFileSync(at(tk.out), JSON.stringify({ $comment: 'Generated by a11y-kit tokens. Do not edit.', rows }, null, 2) + '\n');
      console.log(`→ ${tk.out}`);
    }
  } else if (cmd === 'review-diff') {
    const [from, to] = positional;
    if (!from || !to) throw new Error('a11y-kit review-diff <from> <to> --out <file>');
    const diff = execFileSync('git', ['diff', '--find-renames', `${from}..${to}`, '--', ...(rc.paths ?? ['.'])], { cwd, encoding: 'utf8', maxBuffer: 64 << 20 });
    write(opt('out'), diff);
    const files = (diff.match(/^diff --git /gm) ?? []).length;
    console.log(files ? `${files} file(s) to review` : 'nothing to review');
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `files=${files}\n`);
  } else if (cmd === 'review-context') {
    const bin = path.relative(top, fileURLToPath(import.meta.url));
    const tokens = rc.tokens && { files: rc.tokens.files.map(fromTop), page: rc.tokens.page, command: `node ${bin} contrast <fg> <bg> [--base <surface>] [--theme light|dark|all]${rc.tokens.brands ? ' [--brand all]' : ''} --cwd ${fromTop('.')}`, brands: rc.tokens.brands?.list };
    write(opt('out'), renderContext({ reg: registry(), notes: rc.notes?.(cwd) ?? '', read: (rc.read ?? []).map(fromTop), tokens }));
    console.log(`review context → ${opt('out')}`);
  } else if (cmd === 'review-post') {
    const repo = repoOf();
    const reg = registry();
    const file = opt('findings');
    const change = opt('change') ?? opt('sha') ?? `#${opt('pr')}`;
    let data;
    try {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      data = { summary: `The agent left no readable findings (${e.message}).`, findings: [] };
    }
    const { kept, dropped } = checkFindings(data, reg);
    const issues = {};
    const toFile = kept.filter((f) => f.kind !== 'run');
    if (toFile.length && !DRY && !NO_ISSUES) {
      for (const [name, color] of [['a11y-review', '5319e7'], ...Object.keys(KINDS).map((k) => [`a11y-review:${k}`, 'd4c5f9'])])
        gh(['label', 'create', name, '--color', color, '--force', '-R', repo]);
      const open = JSON.parse(gh(['issue', 'list', '-R', repo, '--label', 'a11y-review', '--state', 'open', '--limit', '500', '--json', 'number,body']));
      for (const i of open) {
        const fp = /<!-- a11y-review:([0-9a-f]{12}) -->/.exec(i.body ?? '')?.[1];
        if (fp) issues[fp] = i.number;
      }
      for (const f of toFile) {
        const fp = fingerprint(f);
        if (issues[fp]) continue;
        const url = gh(['issue', 'create', '-R', repo, '--title', `a11y: ${f.sc} ${f.title}`.slice(0, 250), '--label', 'a11y-review', '--label', `a11y-review:${f.kind}`, '--body-file', '-'], issueBody(f, change)).trim();
        issues[fp] = url.split('/').pop();
      }
    }
    const body = renderComment({ change, kept, dropped, issues, summary: data.summary ?? '', run: opt('run') });
    if (DRY) console.log(body);
    else if (kept.length || dropped.length || ALWAYS) {
      const target = opt('pr') ? `repos/${repo}/issues/${opt('pr')}/comments` : `repos/${repo}/commits/${opt('sha')}/comments`;
      gh(['api', target, '-F', 'body=@-'], body);
    }
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, body + '\n');
    console.log(`a11y-kit review: ${kept.length} kept (${Object.keys(KINDS).map((k) => `${kept.filter((f) => f.kind === k).length} ${k}`).join(', ')}), ${dropped.length} dropped${DRY ? ' (dry run)' : ''}`);
  } else if (cmd === 'review-case') {
    const cases = JSON.parse(fs.readFileSync(at(rc.cases ?? 'a11y/review-cases.json'), 'utf8'));
    if (opt('list') !== undefined || process.argv.includes('--list')) {
      console.log(JSON.stringify(cases.map((c) => c.id)));
      return;
    }
    const c = cases.find((x) => x.id === positional[0]);
    if (!c) throw new Error(`no case ${positional[0]}`);
    const read = (f) => fs.readFileSync(at(f), 'utf8');
    const write = (f, text) => fs.writeFileSync(at(f), text);
    const git = (...a) => execFileSync('git', a, { cwd, encoding: 'utf8' }).trim();
    // Neutral messages: the agent reads git log, and a message must not give the answer away.
    const commit = (edits) => {
      for (const f of new Set(edits.map((e) => e.file))) git('add', f);
      git('-c', 'user.name=a11y-kit', '-c', 'user.email=a11y-kit@users.noreply.github.com', 'commit', '-q', '-m', `update ${[...new Set(edits.map((e) => path.basename(e.file)))].join(', ')}`);
    };
    if (c.setup?.length) {
      applyEdits(c.setup, read, write);
      commit(c.setup);
    }
    const from = git('rev-parse', 'HEAD');
    applyEdits(c.edits, read, write);
    commit(c.edits);
    const to = git('rev-parse', 'HEAD');
    console.log(`case ${c.id}: ${from.slice(0, 7)}..${to.slice(0, 7)}`);
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `from=${from}\nto=${to}\n`);
  } else if (cmd === 'review-score') {
    const cases = JSON.parse(fs.readFileSync(at(rc.cases ?? 'a11y/review-cases.json'), 'utf8'));
    const c = cases.find((x) => x.id === positional[0]);
    if (!c) throw new Error(`no case ${positional[0]}`);
    let result;
    try {
      const { kept } = checkFindings(JSON.parse(fs.readFileSync(opt('findings'), 'utf8')), registry());
      result = scoreCase(c, kept);
    } catch (e) {
      result = { id: c.id, expect: c.expect.none ? 'nothing' : c.expect.sc.join(' or '), verdict: 'error', error: e.message.slice(0, 80) };
    }
    write(opt('out'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result));
  } else if (cmd === 'review-report') {
    const dir = path.resolve(positional[0] ?? '.');
    const files = fs.readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith('.json'));
    const results = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, String(f)), 'utf8')));
    // Cases that never produced a score (the job failed before scoring) count as errors, not as absent.
    for (const id of opt('ids') ? JSON.parse(opt('ids')) : []) if (!results.some((r) => r.id === id)) results.push({ id, expect: '', verdict: 'error', error: 'no score (job failed)' });
    results.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
    const table = renderCalibration(results);
    console.log(table);
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, table);
    if (opt('out')) write(opt('out'), JSON.stringify({ $comment: 'Generated by a11y-kit review-report from a calibration run. Do not edit.', results }, null, 2) + '\n');
  } else if (cmd === 'review-precision') {
    const repo = repoOf();
    const all = JSON.parse(gh(['issue', 'list', '-R', repo, '--label', 'a11y-review', '--state', 'all', '--limit', '1000', '--json', 'number,state,stateReason,labels']));
    const p = precision(all.map((i) => ({ state: i.state.toLowerCase(), state_reason: i.stateReason?.toLowerCase(), labels: i.labels })));
    console.log(`a11y-kit review precision: ${p.precision == null ? 'nothing decided yet' : `${(p.precision * 100).toFixed(0)}%`} — ${p.right} right, ${p.wrong} wrong, ${p.open} open (${p.total} issues)`);
    for (const [k, v] of Object.entries(p.byKind)) console.log(`  ${k}: ${v.right} right, ${v.wrong} wrong, ${v.open} open`);
  } else throw new Error(`unknown command ${cmd}`);
}

async function audit(cmd, { config, cwd, at, opt, positional, DRY, NO_ISSUES }) {
  const ac = config.audit;
  if (!ac) throw new Error('a11y-kit audit: set `audit` in a11y-kit.config.mjs (reviews, files, open, apply)');
  const git = (...a) => execFileSync('git', a, { cwd, encoding: 'utf8', maxBuffer: 64 << 20 });
  const today = new Date().toISOString().slice(0, 10);
  if (cmd === 'audit-queue') {
    const files = await ac.files(cwd);
    const MAX_DIFF = 12000;
    const lastChange = (src, date) => {
      // Strictly after the review's day: a change made that day is what the review looked at.
      const log = git('log', '--format=%H %cs', `--after=${date}T23:59:59`, '--', ...src).trim().split('\n').filter(Boolean);
      if (!log.length) return null;
      const oldest = log[log.length - 1].split(' ')[0];
      let diff = git('diff', `${oldest}~1`, 'HEAD', '--', ...src);
      if (diff.length > MAX_DIFF) diff = diff.slice(0, MAX_DIFF) + `\n… (truncated: ${diff.length} characters; read the files)`;
      return { date: log[0].split(' ')[1], diff };
    };
    const only = opt('only')?.split(',').map((s) => s.trim());
    const queue = auditQueue({ reviews: await ac.reviews(cwd), files: (c) => files.get(c)?.map((f) => path.relative(cwd, f)), lastChange, open: await ac.open(cwd), only, limit: Number(opt('limit') ?? Infinity) });
    if (opt('out')) fs.writeFileSync(path.resolve(opt('out')), JSON.stringify(queue, null, 2) + '\n');
    const stale = queue.filter((i) => i.kind === 'stale').length;
    console.log(`a11y-kit audit-queue: ${queue.length} items (${stale} stale reviews, ${queue.length - stale} open cells) in ${new Set(queue.map((i) => i.component)).size} components`);
    if (opt('batch')) {
      const dir = path.resolve(opt('batch-dir') ?? 'audit-batches');
      fs.mkdirSync(dir, { recursive: true });
      const list = batches(queue, Number(opt('batch')));
      list.forEach((b, i) => fs.writeFileSync(path.join(dir, `batch-${String(i + 1).padStart(3, '0')}.json`), JSON.stringify(b, null, 2) + '\n'));
      const ids = list.map((_, i) => String(i + 1).padStart(3, '0'));
      console.log(`  ${list.length} batches → ${path.relative(cwd, dir)}`);
      if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `batches=${JSON.stringify(ids)}\n`);
    }
  } else if (cmd === 'audit-post') {
    const queue = JSON.parse(fs.readFileSync(path.resolve(opt('queue')), 'utf8'));
    let answers;
    try {
      answers = JSON.parse(fs.readFileSync(path.resolve(opt('answers')), 'utf8'));
    } catch {
      answers = { items: [] };
    }
    const result = checkAudit(answers, queue);
    const records = auditRecords(result.kept, today);
    if (opt('out')) fs.writeFileSync(path.resolve(opt('out')), JSON.stringify(records, null, 2) + '\n');
    const toPerson = result.kept.filter((a) => ['broken', 'fail', 'unsure'].includes(a.verdict));
    if (toPerson.length && !DRY && !NO_ISSUES) {
      const repo = opt('repo') ?? process.env.GITHUB_REPOSITORY;
      const gh = (a, input) => execFileSync('gh', a, { cwd, encoding: 'utf8', input });
      gh(['label', 'create', 'a11y-audit', '--color', '0e8a16', '--force', '-R', repo]);
      const open = JSON.parse(gh(['issue', 'list', '-R', repo, '--label', 'a11y-audit', '--state', 'open', '--limit', '500', '--json', 'body']));
      const have = new Set(open.map((i) => /<!-- a11y-audit:([0-9a-f]{12}) -->/.exec(i.body ?? '')?.[1]).filter(Boolean));
      for (const a of toPerson) {
        const body = auditIssueBody(a, opt('run'));
        if (have.has(/<!-- a11y-audit:([0-9a-f]{12}) -->/.exec(body)[1])) continue;
        gh(['issue', 'create', '-R', repo, '--title', `a11y audit: ${a.item.component} ${a.item.sc} — ${a.verdict}`, '--label', 'a11y-audit', '--body-file', '-'], body);
      }
    }
    const text = renderAudit(result);
    console.log(text);
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
  } else if (cmd === 'audit-apply') {
    // records.json, or a downloaded log of the audit's post job (the records sit between markers).
    let text = fs.readFileSync(path.resolve(positional[0]), 'utf8');
    const m = /A11Y-AUDIT-RECORDS-BEGIN\s*\n([\s\S]*?)\n[^\n]*A11Y-AUDIT-RECORDS-END/.exec(text);
    if (m) text = m[1].split('\n').map((l) => l.replace(/^\d{4}-\d\d-\d\dT[\d:.]+Z /, '')).join('\n');
    const records = JSON.parse(text);
    const n = await ac.apply(cwd, records);
    console.log(`a11y-kit audit-apply: ${n} record(s) written`);
  } else if (cmd === 'audit-sample') {
    const list = sample(await ac.reviews(cwd), Number(opt('n') ?? 10), opt('seed') ?? today);
    const checksFile = at(ac.checksFile ?? 'a11y/audit-checks.json');
    if (opt('by')) {
      // A person's verdict on this sample: --by <name> [--wrong "Component sc, …"].
      const wrong = (opt('wrong') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
      const log = fs.existsSync(checksFile) ? JSON.parse(fs.readFileSync(checksFile, 'utf8')) : { $comment: 'Samples of audit records a person re-checked (a11y-kit audit-sample --by). The auditor\'s precision.', samples: [] };
      log.samples.push({ date: today, seed: opt('seed') ?? today, by: opt('by'), checked: list.map((r) => `${r.component} ${r.sc}`), wrong });
      fs.writeFileSync(checksFile, JSON.stringify(log, null, 2) + '\n');
    }
    if (fs.existsSync(checksFile)) {
      const all = JSON.parse(fs.readFileSync(checksFile, 'utf8')).samples;
      const n = all.reduce((s, x) => s + x.checked.length, 0);
      const bad = all.reduce((s, x) => s + x.wrong.length, 0);
      if (opt('by')) console.log(`recorded. Auditor precision: ${n - bad} of ${n} re-checked records right (${Math.round((100 * (n - bad)) / n)}%), ${all.length} sample(s).`);
    }
    if (!opt('by')) {
      for (const r of list) console.log(`- ${r.component} ${r.sc}: ${r.result} — ${r.note}`);
      console.log(`\n${list.length} audit record(s). Check each against the code, then: a11y-kit audit-sample --n ${list.length} --seed ${opt('seed') ?? today} --by <name> [--wrong "Component sc, …"]`);
    }
  } else throw new Error(`unknown command ${cmd}`);
}
