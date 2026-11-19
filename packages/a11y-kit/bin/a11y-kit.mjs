#!/usr/bin/env node
/**
 * a11y-kit — accessibility checks for a design system and the products built on it.
 *
 *   a11y-kit registry [--check]        the list of checks and the coverage per WCAG 2.2 criterion
 *   a11y-kit compare <checklist.json>  another checklist ([{ "id", "sc"?, "where"? }]) against the registry
 *   a11y-kit calibrate-axe [rule…]     one known violation per axe rule, run the way CI runs axe → axeCalibrationOut
 *   a11y-kit tree|auto|states|forced --url <storybook> [--only <title>] [--ci] [--shard i/n] [--fixtures] [--group title]
 *                                      the engine checks against a built Storybook (see each file in src/engine)
 *   a11y-kit contrast <fg> <bg> [--base <surface>] [--theme light|dark|all]
 *                                      WCAG contrast of two colours or tokens, from the design system's CSS (review.tokens)
 *   a11y-kit review-diff <from> <to> --out <file>        the change under review, limited to review.paths
 *   a11y-kit review-context --out <file>                 what the review agent is given besides the diff
 *   a11y-kit review-post --findings <file> --change <label> (--sha <sha> | --pr <n>) [--repo owner/name] [--run <url>] [--always] [--no-issues] [--dry-run]
 *                                      checks the agent's findings, opens issues, posts one comment (needs gh)
 *   a11y-kit review-precision [--repo owner/name]        how often the agent was right, from closed review issues (needs gh)
 *   The agent's method: review/agent.md.
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
import { renderContext, checkFindings, renderComment, issueBody, fingerprint, precision, KINDS } from '../src/review.mjs';

// --cwd <dir>: run as if from the design system's package (the review agent calls the kit from the repository root).
{
  const i = process.argv.indexOf('--cwd');
  if (i > -1) {
    process.chdir(process.argv[i + 1]);
    process.argv.splice(i, 2);
  }
}

// The engine checks run on their own: `a11y-kit tree|auto|states|forced --url … [--only …] [--ci] [--fixtures]`.
const ENGINE = ['tree', 'auto', 'states', 'forced'];
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
  const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--check', '--dry-run', '--always', '--no-issues'].includes(args[i - 1])));

  // The review commands run in CI without installing dependencies: they read the committed registry.
  if (cmd?.startsWith('review') || cmd === 'contrast') return review(cmd, { config, cwd, at, opt, positional, DRY: args.includes('--dry-run'), ALWAYS: args.includes('--always'), NO_ISSUES: args.includes('--no-issues') });

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
    if (!fg || !bg || !rc.tokens) throw new Error('a11y-kit contrast <fg> <bg> [--base <surface>] [--theme light|dark|all] (needs review.tokens in a11y-kit.config.mjs)');
    const themes = (opt('theme') ?? 'all') === 'all' ? ['light', 'dark'] : [opt('theme')];
    for (const theme of themes) {
      const vars = readCustomProperties(rc.tokens.files.map(at), rc.tokens[theme]);
      try {
        const r = contrast({ fg, bg, base: opt('base') ?? rc.tokens.page, vars });
        console.log(`${theme}: ${r.ratio.toFixed(2)}:1 — ${fg} = ${r.fg.value} (shown ${r.fg.shown}) on ${bg} = ${r.bg.value} (shown ${r.bg.shown}, over ${r.base})`);
      } catch (e) {
        console.log(`${theme}: unresolved — ${e.message}. Measure it rendered instead.`);
        process.exitCode = 2;
      }
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
    const tokens = rc.tokens && { files: rc.tokens.files.map(fromTop), page: rc.tokens.page, command: `node ${bin} contrast <fg> <bg> [--base <surface>] [--theme light|dark|all] --cwd ${fromTop('.')}` };
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
  } else if (cmd === 'review-precision') {
    const repo = repoOf();
    const all = JSON.parse(gh(['issue', 'list', '-R', repo, '--label', 'a11y-review', '--state', 'all', '--limit', '1000', '--json', 'number,state,stateReason,labels']));
    const p = precision(all.map((i) => ({ state: i.state.toLowerCase(), state_reason: i.stateReason?.toLowerCase(), labels: i.labels })));
    console.log(`a11y-kit review precision: ${p.precision == null ? 'nothing decided yet' : `${(p.precision * 100).toFixed(0)}%`} — ${p.right} right, ${p.wrong} wrong, ${p.open} open (${p.total} issues)`);
    for (const [k, v] of Object.entries(p.byKind)) console.log(`  ${k}: ${v.right} right, ${v.wrong} wrong, ${v.open} open`);
  } else throw new Error(`unknown command ${cmd}`);
}
